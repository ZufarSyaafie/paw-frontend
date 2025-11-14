"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PublicHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 pt-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-md rounded-xl shadow-lg ring-1 ring-black/5" style={{ border: `1px solid #e2e8f0` }}>
        <div className="relative flex items-center justify-between h-16 px-4 sm:px-6">
          {/* Kiri: Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-3 p-2">
              <img src="/logo.png" alt="Naratama" className="h-10 w-auto" />
              <span className="font-bold text-lg text-slate-800"></span>
            </Link>
          </div>
          
          {/* Kanan: Tombol Auth */}
          <div className="flex items-center gap-3">
            <Button asChild variant="secondary">
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button asChild variant="primary">
              <Link href="/sign-up">Join Now</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}