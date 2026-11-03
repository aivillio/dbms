import type { Metadata } from "next";
import Navbar from "@/components/layout/navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Campus Event & Resource Booking System",
  description: "Hybrid Relational & Vector-Augmented Database Architecture (PES University DBMS Project)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
