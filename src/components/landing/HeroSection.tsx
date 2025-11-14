"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-24">
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
        {/* Left Content */}
        <div className="space-y-6 sm:space-y-8">
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Selamat Datang di
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent block">
                Perpustakaan Naratama
              </span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-white/70 leading-relaxed max-w-md">
              Platform terpadu untuk peminjaman buku, booking ruangan, manajemen anggota, dan notifikasi otomatis. Difasilitasi agar layanan perpustakaan lebih cepat, aman, dan nyaman.
            </p>
          </div>

          <Button asChild className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-lg transition-all duration-200">
            <Link href="/sign-up">
              Join Now, Gratis!
            </Link>
          </Button>
        </div>

        {/* Right Image */}
        <div className="hidden lg:flex items-center justify-center">
          <img 
            src="/hero-illustration.png" 
            alt="Naratama" 
            className="w-full max-w-md lg:max-w-lg"
          />
        </div>
      </div>
    </section>
  )
}