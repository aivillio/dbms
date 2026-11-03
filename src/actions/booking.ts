"use server";

import pool from "@/lib/db-mysql";
import { getMongoDb } from "@/lib/db-mongo";
import { revalidatePath } from "next/cache";

export interface CreateBookingInput {
  userId: number;
  venueId: number;
  deptId: number;
  startTime: string; // 'YYYY-MM-DD HH:mm:ss'
  endTime: string;   // 'YYYY-MM-DD HH:mm:ss'
  resourceId?: number;
  resourceQty?: number;
}

export async function createBookingAction(input: CreateBookingInput) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Pessimistic Lock: Check for overlapping bookings for the requested venue
    const [collisions]: any = await connection.query(
      `SELECT booking_id FROM BOOKINGS 
       WHERE venue_id = ? 
         AND status IN ('APPROVED', 'PENDING') 
         AND (start_time < ? AND end_time > ?) 
       FOR UPDATE`,
      [input.venueId, input.endTime, input.startTime]
    );

    if (collisions.length > 0) {
      await connection.rollback();

      // Log collision into MongoDB unstructured telemetry store
      try {
        const mongo = await getMongoDb();
        if (!mongo) throw new Error('MongoDB unavailable');
        await mongo.collection("system_audit_documents").insertOne({
          event_type: "CONFLICT_DETECTED",
          context_payload: {
            requested_venue_id: input.venueId,
            start_time: input.startTime,
            end_time: input.endTime,
            colliding_booking_id: collisions[0].booking_id,
          },
          created_at: new Date(),
        });
      } catch (mErr) {
        console.warn("MongoDB telemetry insertion error:", mErr);
      }

      return {
        success: false,
        error: "Venue is already booked during this time window. Collision prevented.",
      };
    }

    // 2. Hardware Resource Inventory Check (if requested)
    if (input.resourceId && input.resourceQty && input.resourceQty > 0) {
      const [resRows]: any = await connection.query(
        `SELECT (r.total_quantity - COALESCE(SUM(br.quantity_allocated), 0)) AS available_qty
         FROM RESOURCES r
         LEFT JOIN BOOKING_RESOURCES br ON r.resource_id = br.resource_id
         LEFT JOIN BOOKINGS b ON br.booking_id = b.booking_id 
             AND b.status IN ('APPROVED', 'PENDING')
             AND (b.start_time < ? AND b.end_time > ?)
         WHERE r.resource_id = ?
         GROUP BY r.resource_id, r.total_quantity
         FOR UPDATE`,
        [input.endTime, input.startTime, input.resourceId]
      );

      const available = resRows[0] ? Number(resRows[0].available_qty) : 0;
      if (available < input.resourceQty) {
        await connection.rollback();
        return {
          success: false,
          error: `Insufficient equipment inventory. Only ${available} available during requested slot.`,
        };
      }
    }

    // 3. Check venue approval requirements
    const [venueRows]: any = await connection.query(
      `SELECT requires_approval FROM VENUES WHERE venue_id = ?`,
      [input.venueId]
    );
    const initialStatus = venueRows[0]?.requires_approval ? "PENDING" : "APPROVED";

    // 4. Insert Master Booking
    const [bookingResult]: any = await connection.query(
      `INSERT INTO BOOKINGS (user_id, venue_id, dept_id, start_time, end_time, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [input.userId, input.venueId, input.deptId, input.startTime, input.endTime, initialStatus]
    );
    const newBookingId = bookingResult.insertId;

    // 5. Insert Resource Allocation
    if (input.resourceId && input.resourceQty && input.resourceQty > 0) {
      await connection.query(
        `INSERT INTO BOOKING_RESOURCES (booking_id, resource_id, quantity_allocated) 
         VALUES (?, ?, ?)`,
        [newBookingId, input.resourceId, input.resourceQty]
      );
    }

    await connection.commit();
    revalidatePath("/bookings");
    revalidatePath("/dashboard");

    return {
      success: true,
      bookingId: newBookingId,
      status: initialStatus,
      message:
        initialStatus === "PENDING"
          ? "Reservation submitted and queued for departmental admin approval."
          : "Reservation instantly confirmed!",
    };
  } catch (error: any) {
    await connection.rollback();
    return {
      success: false,
      error: error.message || "An unexpected database error occurred.",
    };
  } finally {
    connection.release();
  }
}
