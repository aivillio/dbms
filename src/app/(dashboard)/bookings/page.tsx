import pool from "@/lib/db-mysql";
import { CalendarCheck2, Clock, CheckCircle, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BookingsPage() {
  let bookings: any[] = [];
  try {
    const [rows]: any = await pool.query(
      `SELECT b.booking_id, b.start_time, b.end_time, b.status,
              v.name as venue_name, v.location,
              u.full_name as requester_name,
              d.dept_name
       FROM BOOKINGS b
       JOIN VENUES v ON b.venue_id = v.venue_id
       JOIN USERS u ON b.user_id = u.user_id
       JOIN DEPARTMENTS d ON b.dept_id = d.dept_id
       ORDER BY b.start_time DESC`
    );
    bookings = rows;
  } catch (err) {
    console.warn("Could not query bookings directly from MySQL", err);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <CalendarCheck2 className="w-6 h-6 text-blue-600" /> Campus Reservations
        </h1>
        <p className="text-sm text-slate-500">
          All active and historical booking requests managed across university venues.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500 tracking-wider">
                <th className="py-3.5 px-6">ID</th>
                <th className="py-3.5 px-6">Venue & Location</th>
                <th className="py-3.5 px-6">Department</th>
                <th className="py-3.5 px-6">Requester</th>
                <th className="py-3.5 px-6">Time Window</th>
                <th className="py-3.5 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {bookings.length > 0 ? (
                bookings.map((b) => (
                  <tr key={b.booking_id} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-6 font-mono text-xs text-slate-500">#{b.booking_id}</td>
                    <td className="py-4 px-6">
                      <p className="font-semibold text-slate-900">{b.venue_name}</p>
                      <p className="text-xs text-slate-500">{b.location}</p>
                    </td>
                    <td className="py-4 px-6 text-xs">{b.dept_name}</td>
                    <td className="py-4 px-6 text-xs font-medium">{b.requester_name}</td>
                    <td className="py-4 px-6 text-xs font-mono">
                      {new Date(b.start_time).toLocaleString()} <br />
                      <span className="text-slate-400">to</span> {new Date(b.end_time).toLocaleString()}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full ${
                          b.status === "APPROVED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : b.status === "PENDING"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {b.status === "APPROVED" && <CheckCircle className="w-3.5 h-3.5" />}
                        {b.status === "PENDING" && <Clock className="w-3.5 h-3.5" />}
                        {b.status === "REJECTED" && <XCircle className="w-3.5 h-3.5" />}
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No reservations found in MySQL. Execute `sql/seed.sql` to populate initial demo data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
