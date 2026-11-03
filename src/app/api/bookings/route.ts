import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db-mysql";

export async function GET() {
  try {
    const [rows]: any = await pool.query(
      `SELECT b.booking_id, b.start_time, b.end_time, b.status,
              v.name as venue_name, u.full_name as requester_name
       FROM BOOKINGS b
       JOIN VENUES v ON b.venue_id = v.venue_id
       JOIN USERS u ON b.user_id = u.user_id
       ORDER BY b.start_time DESC`
    );
    return NextResponse.json({ bookings: rows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
