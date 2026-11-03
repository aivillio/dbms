"use client";

import { useState } from "react";
import { Search, Sparkles, Building2, Users, CheckCircle, ShieldAlert, AlertTriangle } from "lucide-react";
import { createBookingAction } from "@/actions/booking";

export default function SemanticSearchPage() {
  const [prompt, setPrompt] = useState("Find me a quiet room with a projector for 40 students");
  const [minCapacity, setMinCapacity] = useState(20);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Booking modal state
  const [bookingVenue, setBookingVenue] = useState<any | null>(null);
  const [startTime, setStartTime] = useState("2026-11-10 10:00:00");
  const [endTime, setEndTime] = useState("2026-11-10 12:00:00");
  const [submitting, setSubmitting] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/venues/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, minCapacity }),
      });
      const data = await res.json();
      if (data.results) {
        setResults(data.results);
      }
    } catch (err: any) {
      setMessage("Failed to search venues. Ensure MongoDB and MySQL are running.");
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    if (!bookingVenue) return;
    setSubmitting(true);
    setMessage(null);

    const res = await createBookingAction({
      userId: 1, // Angelo CS062
      venueId: bookingVenue.venue_id,
      deptId: bookingVenue.dept_id || 1,
      startTime,
      endTime,
      resourceId: 1,
      resourceQty: 1,
    });

    setSubmitting(false);
    if (res.success) {
      setMessage(`Success: ${res.message} (Booking #${res.bookingId})`);
      setBookingVenue(null);
    } else {
      setMessage(`Collision / Error: ${res.error}`);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-blue-600" /> Natural Language Venue Discovery
        </h1>
        <p className="text-sm text-slate-500">
          Powered by 768-dimensional dense vector embeddings with MongoDB HNSW Approximate Nearest Neighbor Search.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearch} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
            Describe your event or facility needs:
          </label>
          <div className="relative">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Auditorium with stage lighting and dolby sound for symposium..."
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>Minimum Capacity:</span>
            <input
              type="number"
              value={minCapacity}
              onChange={(e) => setMinCapacity(Number(e.target.value))}
              className="w-20 px-2 py-1 border border-slate-300 rounded text-sm text-center"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm shadow transition disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? "Embedding & Searching..." : "Vector Search"}
          </button>
        </div>
      </form>

      {/* Feedback Message */}
      {message && (
        <div
          className={`p-4 rounded-lg text-sm flex items-start gap-3 ${
            message.startsWith("Success")
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          {message.startsWith("Success") ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-600" />
          )}
          <span>{message}</span>
        </div>
      )}

      {/* Results List */}
      <div className="space-y-4">
        {results.map((venue) => (
          <div
            key={venue.venue_id}
            className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-blue-300 transition"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">{venue.name}</h3>
                {venue.semanticRelevance && (
                  <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-mono font-medium">
                    Score: {venue.semanticRelevance}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">{venue.location} • {venue.dept_name || "Campus Facility"}</p>
              <div className="flex items-center gap-4 text-xs text-slate-600 pt-1">
                <span className="flex items-center gap-1 font-medium">
                  <Users className="w-3.5 h-3.5 text-slate-400" /> {venue.capacity} Seats
                </span>
                <span className="flex items-center gap-1">
                  {venue.requires_approval ? (
                    <span className="text-amber-600 flex items-center gap-1 font-medium">
                      <ShieldAlert className="w-3.5 h-3.5" /> Requires Approval
                    </span>
                  ) : (
                    <span className="text-emerald-600 flex items-center gap-1 font-medium">
                      <CheckCircle className="w-3.5 h-3.5" /> Instant Confirmation
                    </span>
                  )}
                </span>
              </div>
            </div>

            <button
              onClick={() => setBookingVenue(venue)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition"
            >
              Reserve Slot
            </button>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {bookingVenue && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              Reserve {bookingVenue.name}
            </h3>
            <p className="text-xs text-slate-500">
              Transaction locks the venue in MySQL and checks for time overlaps.
            </p>

            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Start Time (YYYY-MM-DD HH:mm:ss)</label>
                <input
                  type="text"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">End Time (YYYY-MM-DD HH:mm:ss)</label>
                <input
                  type="text"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600 space-y-1">
                <p>• Requester: Angelo (PES2UG24CS062) [STUDENT]</p>
                <p>• Requested Asset: 4K Projector (Qty: 1)</p>
                <p>• Lock Mode: Pessimistic Row Lock (SELECT ... FOR UPDATE)</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setBookingVenue(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleBook}
                className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-500 transition disabled:opacity-50"
              >
                {submitting ? "Committing..." : "Confirm & Lock"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
