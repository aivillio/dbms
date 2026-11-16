import pool from "@/lib/db-mysql";
import { getMongoDb } from "@/lib/db-mongo";
import { BarChart3, Users, Building, AlertTriangle, ShieldCheck, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  // 1. Execute Query 7.1: Departmental Asset & Booking Aggregations
  let deptMetrics: any[] = [];
  try {
    const [rows]: any = await pool.query(`
      SELECT 
          d.dept_name,
          d.code,
          COUNT(DISTINCT v.venue_id) AS total_venues,
          COALESCE(SUM(v.capacity), 0) AS total_seating_capacity,
          COUNT(b.booking_id) AS total_bookings_received
      FROM DEPARTMENTS d
      LEFT JOIN VENUES v ON d.dept_id = v.dept_id
      LEFT JOIN BOOKINGS b ON d.dept_id = b.dept_id
      GROUP BY d.dept_id, d.dept_name, d.code
      ORDER BY total_bookings_received DESC
    `);
    deptMetrics = rows;
  } catch (err) {
    console.error("Error running Query 7.1:", err);
  }

  // 2. Execute Query 7.4: Correlated Subquery for Active Power Users
  let powerUsers: any[] = [];
  try {
    const [rows]: any = await pool.query(`
      SELECT u.user_id, u.full_name, u.role, u.email, d.code AS dept_code
      FROM USERS u
      LEFT JOIN DEPARTMENTS d ON u.dept_id = d.dept_id
      WHERE (
          SELECT COUNT(*) 
          FROM BOOKINGS b 
          WHERE b.user_id = u.user_id
      ) > (
          SELECT AVG(user_booking_count)
          FROM (
              SELECT COUNT(b2.booking_id) AS user_booking_count
              FROM USERS u2
              LEFT JOIN BOOKINGS b2 ON u2.user_id = b2.user_id
              WHERE u2.dept_id = u.dept_id
              GROUP BY u2.user_id
          ) AS dept_averages
      )
    `);
    powerUsers = rows;
  } catch (err) {
    console.error("Error running Query 7.4:", err);
  }

  // 3. Execute Query 7.5: Nested Subquery for Venues with 100% Approval Rate
  let pristineVenues: any[] = [];
  try {
    const [rows]: any = await pool.query(`
      SELECT v.venue_id, v.name, v.location, v.capacity
      FROM VENUES v
      WHERE v.venue_id NOT IN (
          SELECT DISTINCT b.venue_id 
          FROM BOOKINGS b 
          WHERE b.status = 'REJECTED'
      )
    `);
    pristineVenues = rows;
  } catch (err) {
    console.error("Error running Query 7.5:", err);
  }

  // 4. Query MongoDB for Concurrency Collision Telemetry
  let collisionLogs: any[] = [];
  try {
    const mongo = await getMongoDb();
    if (mongo) {
      collisionLogs = await mongo
        .collection("system_audit_documents")
        .find()
        .sort({ created_at: -1 })
        .limit(5)
        .toArray();
    }
  } catch (err) {
    console.error("Error reading MongoDB collision logs:", err);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg text-blue-900">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Administrative Analytics & SQL Reports</h1>
            <p className="text-sm text-gray-600">
              Live execution of Chapter 7 Analytical Queries (Aggregates, Correlated & Nested Subqueries) + MongoDB Telemetry
            </p>
          </div>
        </div>
      </div>

      {/* Query 7.1: Department Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-800" />
            <h2 className="font-semibold text-gray-900">Query 7.1: Departmental Resource & Demand Metrics</h2>
          </div>
          <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full">
            GROUP BY + Aggregates
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">Department</th>
                <th className="px-6 py-3 text-left font-semibold">Code</th>
                <th className="px-6 py-3 text-center font-semibold">Venues Owned</th>
                <th className="px-6 py-3 text-center font-semibold">Seating Capacity</th>
                <th className="px-6 py-3 text-center font-semibold">Bookings Received</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {deptMetrics.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No department metrics found.
                  </td>
                </tr>
              ) : (
                deptMetrics.map((dm) => (
                  <tr key={dm.code} className="hover:bg-blue-50/50 transition">
                    <td className="px-6 py-4 font-medium text-gray-900">{dm.dept_name}</td>
                    <td className="px-6 py-4 text-gray-600 font-mono text-xs">{dm.code}</td>
                    <td className="px-6 py-4 text-center text-gray-800 font-semibold">{dm.total_venues}</td>
                    <td className="px-6 py-4 text-center text-gray-800">{Number(dm.total_seating_capacity).toLocaleString()}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                        {dm.total_bookings_received}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid: Correlated Query (7.4) + Nested Query (7.5) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Query 7.4: Power Users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-700" />
              <h2 className="font-semibold text-gray-900">Query 7.4: High-Activity Users</h2>
            </div>
            <span className="text-xs font-mono bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
              Correlated Subquery
            </span>
          </div>
          <div className="p-4">
            <p className="text-xs text-gray-500 mb-3">
              Users who submitted more bookings than their respective department's average:
            </p>
            <div className="space-y-3">
              {powerUsers.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No above-average users detected.</p>
              ) : (
                powerUsers.map((u) => (
                  <div key={u.user_id} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between border border-gray-100">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{u.full_name}</p>
                      <p className="text-xs text-gray-500">{u.email} • {u.dept_code || 'General'}</p>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {u.role}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Query 7.5: 100% Approval Venues */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-700" />
              <h2 className="font-semibold text-gray-900">Query 7.5: Zero-Rejection Venues</h2>
            </div>
            <span className="text-xs font-mono bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
              Nested Subquery (NOT IN)
            </span>
          </div>
          <div className="p-4">
            <p className="text-xs text-gray-500 mb-3">
              Venues that have never received an administrative rejection:
            </p>
            <div className="space-y-3">
              {pristineVenues.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">All venues have historical rejections.</p>
              ) : (
                pristineVenues.map((v) => (
                  <div key={v.venue_id} className="p-3 bg-green-50/50 rounded-lg flex items-center justify-between border border-green-100">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{v.name}</p>
                      <p className="text-xs text-gray-500">{v.location} • Capacity: {v.capacity}</p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-800 rounded">
                      100% Clean Record
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MongoDB Concurrency Telemetry Sink */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-200 bg-amber-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-700" />
            <h2 className="font-semibold text-gray-900">MongoDB Telemetry: Concurrency Collisions Prevented</h2>
          </div>
          <span className="text-xs font-mono bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full">
            NoSQL Event Sink
          </span>
        </div>
        <div className="p-5">
          <p className="text-xs text-gray-600 mb-4">
            Events logged into MongoDB when MySQL InnoDB row locks (<code className="bg-gray-100 px-1 py-0.5 rounded">SELECT ... FOR UPDATE</code>) blocked double-bookings in real-time:
          </p>
          {collisionLogs.length === 0 ? (
            <p className="text-sm text-gray-500 italic py-2">No collisions recorded yet. Try booking overlapping slots to see events stream here live!</p>
          ) : (
            <div className="space-y-3 font-mono text-xs">
              {collisionLogs.map((log, idx) => (
                <div key={idx} className="p-3 bg-gray-900 text-green-400 rounded-lg overflow-x-auto">
                  <span className="text-amber-400 font-bold">[{log.event_type}]</span> - {new Date(log.created_at).toLocaleString()}
                  <pre className="mt-1 text-gray-300">
                    {JSON.stringify(log.context_payload, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
