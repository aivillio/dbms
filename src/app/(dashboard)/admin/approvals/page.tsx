import pool from "@/lib/db-mysql";
import { ShieldCheck, History } from "lucide-react";
import { processApprovalAction } from "@/actions/approvals";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function AdminApprovalsPage() {
  let pendingBookings: any[] = [];
  let auditLogs: any[] = [];

  try {
    const [pRows]: any = await pool.query(
      `SELECT b.booking_id, b.start_time, b.end_time, v.name as venue_name, u.full_name as requester_name, d.code as dept_code
       FROM BOOKINGS b
       JOIN VENUES v ON b.venue_id = v.venue_id
       JOIN USERS u ON b.user_id = u.user_id
       JOIN DEPARTMENTS d ON b.dept_id = d.dept_id
       WHERE b.status = 'PENDING'
       ORDER BY b.start_time ASC`
    );
    pendingBookings = pRows;

    const [logRows]: any = await pool.query(
      `SELECT al.log_id, al.booking_id, al.action_status, al.comments, al.timestamp,
              u.full_name as approver_name
       FROM APPROVAL_LOGS al
       JOIN USERS u ON al.approver_id = u.user_id
       ORDER BY al.timestamp DESC
       LIMIT 10`
    );
    auditLogs = logRows;
  } catch (err) {
    console.warn("MySQL not connected for approvals", err);
  }

  async function handleApprove(formData: FormData) {
    "use server";
    const bookingId = Number(formData.get("bookingId"));
    const comments = String(formData.get("comments") || "Approved by Department Administrator.");
    await processApprovalAction(bookingId, 3, "APPROVED", comments);
    revalidatePath("/admin/approvals");
  }

  async function handleReject(formData: FormData) {
    "use server";
    const bookingId = Number(formData.get("bookingId"));
    const comments = String(formData.get("comments") || "Rejected due to institutional schedule constraints.");
    await processApprovalAction(bookingId, 3, "REJECTED", comments);
    revalidatePath("/admin/approvals");
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-blue-600" /> Administrative Approval Pipeline
        </h1>
        <p className="text-sm text-slate-500">
          Role-Based Access Control (RBAC): Department Admins (Dr. CS HOD) review pending venue requests.
        </p>
      </div>

      {/* Pending Queue */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900">Pending Review Requests ({pendingBookings.length})</h2>
          <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200 font-medium">
            Requires Sign-Off
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {pendingBookings.length > 0 ? (
            pendingBookings.map((b) => (
              <div key={b.booking_id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-600">Booking #{b.booking_id}</span>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
                      {b.dept_code}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{b.venue_name}</h3>
                  <p className="text-xs text-slate-500">
                    Requested by <span className="font-medium text-slate-700">{b.requester_name}</span> for slot:
                  </p>
                  <p className="text-xs font-mono text-slate-600">
                    {new Date(b.start_time).toLocaleString()} → {new Date(b.end_time).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <form action={handleReject}>
                    <input type="hidden" name="bookingId" value={b.booking_id} />
                    <input type="hidden" name="comments" value="Rejected by Department Admin." />
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold rounded-lg transition"
                    >
                      Reject
                    </button>
                  </form>
                  <form action={handleApprove}>
                    <input type="hidden" name="bookingId" value={b.booking_id} />
                    <input type="hidden" name="comments" value="Approved for academic event." />
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition"
                    >
                      Approve & Log
                    </button>
                  </form>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-slate-400 text-sm">
              All departmental booking requests have been reviewed and approved!
            </div>
          )}
        </div>
      </div>

      {/* Immutable Audit Trail */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <History className="w-4 h-4 text-slate-500" />
          <h2 className="font-bold text-slate-900">Immutable Audit Trail (`APPROVAL_LOGS`)</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500 tracking-wider">
                <th className="py-3 px-6">Log ID</th>
                <th className="py-3 px-6">Booking</th>
                <th className="py-3 px-6">Approver</th>
                <th className="py-3 px-6">Action</th>
                <th className="py-3 px-6">Comments</th>
                <th className="py-3 px-6">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
              {auditLogs.length > 0 ? (
                auditLogs.map((log) => (
                  <tr key={log.log_id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-6 font-mono text-slate-400">#{log.log_id}</td>
                    <td className="py-3 px-6 font-mono font-bold text-slate-800">#{log.booking_id}</td>
                    <td className="py-3 px-6 font-medium">{log.approver_name}</td>
                    <td className="py-3 px-6">
                      <span
                        className={`inline-block px-2 py-0.5 rounded font-semibold text-[11px] ${
                          log.action_status === "APPROVED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {log.action_status}
                      </span>
                    </td>
                    <td className="py-3 px-6 max-w-xs truncate text-slate-500">{log.comments || "-"}</td>
                    <td className="py-3 px-6 font-mono text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    No approval decisions recorded yet.
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
