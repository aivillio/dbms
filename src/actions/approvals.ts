"use server";

import pool from "@/lib/db-mysql";
import { revalidatePath } from "next/cache";

export async function processApprovalAction(
  bookingId: number,
  approverId: number,
  actionStatus: "APPROVED" | "REJECTED",
  comments: string
) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Update booking status
    await connection.query(
      `UPDATE BOOKINGS SET status = ? WHERE booking_id = ?`,
      [actionStatus, bookingId]
    );

    // 2. Insert immutable approval log
    await connection.query(
      `INSERT INTO APPROVAL_LOGS (booking_id, approver_id, action_status, comments, timestamp)
       VALUES (?, ?, ?, ?, NOW())`,
      [bookingId, approverId, actionStatus, comments]
    );

    await connection.commit();
    revalidatePath("/admin/approvals");
    revalidatePath("/bookings");
    return { success: true };
  } catch (error: any) {
    await connection.rollback();
    return { success: false, error: error.message };
  } finally {
    connection.release();
  }
}
