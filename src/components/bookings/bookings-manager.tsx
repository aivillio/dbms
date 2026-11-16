"use client";

import { useState } from "react";
import { 
  CalendarCheck2, Plus, Trash2, Ban, CheckCircle, Clock, XCircle, 
  AlertTriangle, Search, Filter, ShieldAlert
} from "lucide-react";
import { createBookingAction, cancelBookingAction, deleteBookingAction } from "@/actions/booking";

interface BookingItem {
  booking_id: number;
  venue_name: string;
  location: string;
  dept_name: string;
  requester_name: string;
  start_time: string;
  end_time: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
}

interface VenueOption {
  venue_id: number;
  name: string;
  location: string;
  capacity: number;
  requires_approval: boolean | number;
  dept_id: number;
}

interface ResourceOption {
  resource_id: number;
  resource_name: string;
  total_quantity: number;
}

interface Props {
  initialBookings: BookingItem[];
  venues: VenueOption[];
  resources: ResourceOption[];
}

export default function BookingsManager({ initialBookings, venues, resources }: Props) {
  const [filter, setFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form State for CREATE operation
  const [selectedVenueId, setSelectedVenueId] = useState<number>(venues[0]?.venue_id || 1);
  const [startTime, setStartTime] = useState("2026-11-12 10:00:00");
  const [endTime, setEndTime] = useState("2026-11-12 12:00:00");
  const [selectedResourceId, setSelectedResourceId] = useState<number>(resources[0]?.resource_id || 1);
  const [resourceQty, setResourceQty] = useState<number>(1);
  const [createSubmitting, setCreateSubmitting] = useState(false);

  // Filter Bookings
  const filteredBookings = initialBookings.filter((b) => {
    const matchesFilter = filter === "ALL" || b.status === filter;
    const matchesSearch = 
      b.venue_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.requester_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.dept_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.booking_id.toString().includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  // Handle CREATE
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateSubmitting(true);
    setFeedback(null);

    const venue = venues.find((v) => v.venue_id === Number(selectedVenueId));
    const res = await createBookingAction({
      userId: 1, // Angelo CS062
      venueId: Number(selectedVenueId),
      deptId: venue?.dept_id || 1,
      startTime,
      endTime,
      resourceId: Number(selectedResourceId),
      resourceQty: Number(resourceQty),
    });

    setCreateSubmitting(false);
    if (res.success) {
      setFeedback({
        type: "success",
        text: `Success: Booking #${res.bookingId} created (${res.message})`,
      });
      setIsModalOpen(false);
    } else {
      setFeedback({
        type: "error",
        text: `Error: ${res.error}`,
      });
    }
  };

  // Handle UPDATE (Cancel - Query 7.2)
  const handleCancel = async (bookingId: number) => {
    if (!confirm(`Are you sure you want to cancel Booking #${bookingId}? (SQL: UPDATE BOOKINGS SET status='CANCELLED')`)) {
      return;
    }
    setActionLoadingId(bookingId);
    setFeedback(null);
    const res = await cancelBookingAction(bookingId);
    setActionLoadingId(null);

    if (res.success) {
      setFeedback({ type: "success", text: res.message || `Booking #${bookingId} cancelled.` });
    } else {
      setFeedback({ type: "error", text: res.error || "Failed to cancel booking." });
    }
  };

  // Handle DELETE (Purge - Query 7.3)
  const handleDelete = async (bookingId: number) => {
    if (!confirm(`Permanently delete Booking #${bookingId} from the database? (SQL: DELETE FROM BOOKINGS WHERE booking_id=${bookingId})`)) {
      return;
    }
    setActionLoadingId(bookingId);
    setFeedback(null);
    const res = await deleteBookingAction(bookingId);
    setActionLoadingId(null);

    if (res.success) {
      setFeedback({ type: "success", text: res.message || `Booking #${bookingId} deleted.` });
    } else {
      setFeedback({ type: "error", text: res.error || "Failed to delete booking." });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header with Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarCheck2 className="w-6 h-6 text-blue-600" /> Interactive Campus Reservations (CRUD Hub)
          </h1>
          <p className="text-sm text-slate-500">
            Full database lifecycle: <strong>C</strong>reate reservations, <strong>R</strong>ead active schedules, <strong>U</strong>pdate status (Cancel), and <strong>D</strong>elete records.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" /> New Reservation
        </button>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm flex items-start justify-between gap-3 ${
            feedback.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2 font-medium">
            {feedback.type === "success" ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-xs hover:underline opacity-70">
            Dismiss
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by venue, requester, department, or ID..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 text-xs font-medium overflow-x-auto">
          <span className="text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {["ALL", "PENDING", "APPROVED", "CANCELLED", "REJECTED"].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-lg transition ${
                filter === st
                  ? "bg-blue-600 text-white font-semibold shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table with Full CRUD Controls */}
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
                <th className="py-3.5 px-6 text-right">Actions (CRUD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((b) => (
                  <tr key={b.booking_id} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-6 font-mono text-xs font-bold text-slate-500">#{b.booking_id}</td>
                    <td className="py-4 px-6">
                      <p className="font-semibold text-slate-900">{b.venue_name}</p>
                      <p className="text-xs text-slate-500">{b.location}</p>
                    </td>
                    <td className="py-4 px-6 text-xs">{b.dept_name}</td>
                    <td className="py-4 px-6 text-xs font-medium text-slate-800">{b.requester_name}</td>
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
                            : b.status === "CANCELLED"
                            ? "bg-gray-100 text-gray-700 border border-gray-300"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {b.status === "APPROVED" && <CheckCircle className="w-3.5 h-3.5" />}
                        {b.status === "PENDING" && <Clock className="w-3.5 h-3.5" />}
                        {b.status === "CANCELLED" && <Ban className="w-3.5 h-3.5" />}
                        {b.status === "REJECTED" && <XCircle className="w-3.5 h-3.5" />}
                        {b.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* UPDATE: Cancel Booking (Query 7.2) */}
                        {b.status !== "CANCELLED" && b.status !== "REJECTED" && (
                          <button
                            disabled={actionLoadingId === b.booking_id}
                            onClick={() => handleCancel(b.booking_id)}
                            title="Update Status: Cancel this reservation (SQL Query 7.2)"
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded text-xs font-medium transition disabled:opacity-50"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            {actionLoadingId === b.booking_id ? "..." : "Cancel"}
                          </button>
                        )}

                        {/* DELETE: Purge Record (Query 7.3) */}
                        <button
                          disabled={actionLoadingId === b.booking_id}
                          onClick={() => handleDelete(b.booking_id)}
                          title="Delete: Permanently delete record (SQL Query 7.3)"
                          className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded text-xs font-medium transition disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="sr-only sm:not-sr-only">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No reservations match your search or filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE Modal (Query / Transaction Insert) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" /> Create New Reservation (Atomic INSERT)
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-sm">
              {/* Venue Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Select Venue</label>
                <select
                  value={selectedVenueId}
                  onChange={(e) => setSelectedVenueId(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  {venues.map((v) => (
                    <option key={v.venue_id} value={v.venue_id}>
                      {v.name} ({v.capacity} Seats - {v.location})
                    </option>
                  ))}
                </select>
              </div>

              {/* Time Window */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Start Time</label>
                  <input
                    type="text"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    placeholder="YYYY-MM-DD HH:mm:ss"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">End Time</label>
                  <input
                    type="text"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    placeholder="YYYY-MM-DD HH:mm:ss"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    required
                  />
                </div>
              </div>

              {/* Hardware Resource Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Equipment Resource</label>
                  <select
                    value={selectedResourceId}
                    onChange={(e) => setSelectedResourceId(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    {resources.map((r) => (
                      <option key={r.resource_id} value={r.resource_id}>
                        {r.resource_name} (Stock: {r.total_quantity})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={resourceQty}
                    onChange={(e) => setResourceQty(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    required
                  />
                </div>
              </div>

              {/* Database Execution Badge */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 space-y-1">
                <p className="font-semibold">⚡ Database Execution Under the Hood:</p>
                <p>• Locks venue via <code className="bg-white px-1 py-0.5 rounded font-mono">SELECT ... FOR UPDATE</code></p>
                <p>• Validates equipment stock in <code className="bg-white px-1 py-0.5 rounded font-mono">RESOURCES</code></p>
                <p>• Inserts into <code className="bg-white px-1 py-0.5 rounded font-mono">BOOKINGS</code> and <code className="bg-white px-1 py-0.5 rounded font-mono">BOOKING_RESOURCES</code></p>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow transition disabled:opacity-50"
                >
                  {createSubmitting ? "Locking & Inserting..." : "Submit Reservation (CREATE)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
