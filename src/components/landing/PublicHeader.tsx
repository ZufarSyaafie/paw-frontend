"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PublicHeader() {
  return (
    // lebih ramping di mobile: pt-2 px-2, naik bertahap di sm+ dan lg
    <header className="fixed top-0 left-0 right-0 z-50 pt-2 px-2 sm:pt-3 sm:px-4 lg:px-8">
      <div
        className="max-w-7xl mx-auto rounded-lg shadow-md ring-1 ring-slate-200/50 border border-slate-200
                   bg-white/95 backdrop-blur-xl"
        style={{ background: "rgba(255,255,255,0.96)", backdropFilter: "blur(14px)" }}
      >
        {/* tinggi bar diperkecil: h-12 di mobile, h-14 di sm+; padding juga diperkecil */}
        <div className="relative flex items-center justify-between h-12 px-2 sm:h-14 sm:px-5">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2 p-1 sm:gap-3 sm:p-2">
              <img src="/logo-warna.png" alt="Naratama" className="h-8 w-auto sm:h-9" />
              <span className="font-bold text-base text-slate-700 hidden sm:inline"></span>
            </Link>
          </div>
          {/* gap diperkecil agar tampak ramping */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Sign In: lebih gelap sedikit, teks benar-benar center */}
            <Button
              asChild
              size="sm"
              className="h-8 px-2 text-[11px] sm:h-9 sm:px-3 sm:text-xs md:h-10 md:px-4
             inline-flex items-center justify-center leading-none
             whitespace-nowrap rounded-md md:rounded-lg
             bg-slate-200 border border-slate-300
             !text-slate-900 hover:bg-slate-500 hover:border-slate-600 hover:!text-slate-900
             shadow-sm hover:shadow-md
             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2
             transition-colors"
            >
              <Link href="/sign-in" aria-label="Sign in">Sign In</Link>
            </Button>
            {/* Join Now: primary, tetap compact */}
            <Button
              asChild
              size="sm"
              className="h-8 px-2 text-[11px] sm:h-9 sm:px-3 sm:text-xs md:h-10 md:px-5
                         inline-flex items-center justify-center leading-none
                         whitespace-nowrap rounded-md md:rounded-lg
                         bg-cyan-600 hover:bg-cyan-700 text-white shadow-sm hover:shadow-md transition-colors"
            >
              <Link href="/sign-up" aria-label="Join now">Join Now</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}