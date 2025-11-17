"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PublicHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 pt-4 px-4 sm:px-6 lg:px-8">
      <div
        className="max-w-7xl mx-auto rounded-xl shadow-lg ring-1 ring-white/10"
        style={{
          background: "rgba(150, 150, 150, 0.1)",
          backdropFilter: "blur(6px)",
          border: "1px solid rgba(150, 150, 150, 0.2)",
        }}
      >
        <div className="relative flex items-center justify-between h-16 px-4 sm:px-6">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-3 p-2">
              <img src="/logo-warna.png" alt="Naratama" className="h-10 w-auto" />
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Button
              asChild
              size="sm"
              className="h-9 px-3 text-xs rounded-md bg-slate-200 border border-slate-300
                         !text-slate-900 hover:bg-slate-500 hover:border-slate-600 hover:!text-slate-900
                         shadow-sm hover:shadow-md transition-colors"
            >
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="h-9 px-4 text-xs rounded-md bg-cyan-600 hover:bg-cyan-700 text-white
                         shadow-sm hover:shadow-md transition-colors"
            >
              <Link href="/sign-up">Join Now</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}