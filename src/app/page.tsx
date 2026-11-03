import Link from "next/link";
import { Database, Search, CalendarCheck, ShieldAlert, Cpu, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#002060] to-slate-900 rounded-2xl text-white p-8 md:p-12 shadow-xl">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-200 text-xs font-semibold uppercase tracking-wider">
            PES University • UE23CS351A DBMS Project
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Smart Campus Event & Resource Booking System
          </h1>
          <p className="text-slate-300 text-base md:text-lg leading-relaxed">
            Enterprise-level facility reservation platform with transactional non-overlap guarantees in 
            <span className="text-blue-300 font-semibold"> MySQL 8.0</span> and natural language semantic discovery powered by 
            <span className="text-emerald-300 font-semibold"> MongoDB Vector Search</span>.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Link
              href="/search"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium flex items-center gap-2 shadow-lg transition"
            >
              <Search className="w-4 h-4" /> Try Semantic Search
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg font-medium flex items-center gap-2 transition"
            >
              Open Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Architecture Highlights */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-lg text-slate-900">ACID Relational Core</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            MySQL 8.0 InnoDB engine with 7 normalized tables, cascading constraints, and 
            <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">FOR UPDATE</code> pessimistic locks preventing double-booking anomalies.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-lg text-slate-900">Vector Search Discovery</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            768-dimensional dense vector embeddings with HNSW cosine similarity search. Pre-filters by headcount and queries venue attributes in free-form English.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-lg text-slate-900">Role-Based Governance</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Multi-tier access control (Student, Faculty Organizer, Dept Admin, Super Admin) with immutable audit logging and collision telemetry.
          </p>
        </div>
      </section>

      {/* Project Credits Card */}
      <section className="bg-slate-100 rounded-xl p-6 border border-slate-300/70 text-slate-700 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-slate-900">Developed By</h4>
          <p className="text-sm">Angelo (PES2UG24CS062) & Aditya (PES2UG24CS031)</p>
          <p className="text-xs text-slate-500">Guided by Dr. Shilpa S, Assistant Professor, PES University</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/approvals"
            className="text-xs font-semibold px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition"
          >
            Review Admin Approvals
          </Link>
        </div>
      </section>
    </div>
  );
}
