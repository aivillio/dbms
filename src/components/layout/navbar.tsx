import Link from "next/link";
import { Calendar, Search, ShieldCheck, Home } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-[#002060] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white text-[#002060] font-black flex items-center justify-center text-sm shadow">
            PES
          </div>
          <div>
            <Link href="/" className="font-bold text-lg tracking-tight hover:text-blue-100 transition">
              Smart Campus Booking
            </Link>
            <p className="text-xs text-blue-200">DBMS Hybrid System (MySQL + MongoDB)</p>
          </div>
        </div>

        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/dashboard" className="flex items-center gap-1.5 hover:text-blue-200 transition">
            <Home className="w-4 h-4" /> Dashboard
          </Link>
          <Link href="/search" className="flex items-center gap-1.5 hover:text-blue-200 transition">
            <Search className="w-4 h-4" /> Semantic Search
          </Link>
          <Link href="/bookings" className="flex items-center gap-1.5 hover:text-blue-200 transition">
            <Calendar className="w-4 h-4" /> Bookings
          </Link>
          <Link href="/admin/approvals" className="flex items-center gap-1.5 hover:text-blue-200 transition">
            <ShieldCheck className="w-4 h-4" /> Approvals
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <span className="text-xs bg-blue-900 border border-blue-400 px-2.5 py-1 rounded-full text-blue-200">
            Angelo & Aditya
          </span>
        </div>
      </div>
    </header>
  );
}
