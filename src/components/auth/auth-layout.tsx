"use client"

import type React from "react"
import { colors } from "@/styles/colors"
import { ChevronLeft } from "lucide-react"
// import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"


export function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  return (
    <div
      style={{ background: colors.authBg }}
      className="min-h-screen flex flex-col justify-center items-center px-4"
    >
    {/* GLOBAL HEADER  */}
    <div className="pt-10 pb-8 w-full flex flex-col items-center">
      <div className="relative flex items-center justify-center">

        {/* BLUR BG BEHIND LOGO */}
        <div
          className="absolute w-[240px] h-[140px] rounded-3xl
          bg-white/10 backdrop-blur-xl blur-2xl opacity-30 -z-10"
        />

        {/* LOGO */}
        <Image
          src="/logo.png"
          alt="Naratama Logo"
          width={200}
          height={240}
          className="drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
        />
      </div>

      <p className="text-xs text-white/60 uppercase tracking-[0.3em] mt-1">
        Digital Library
      </p>
    </div>

      <div className="flex flex-col w-full max-w-md px-4">

        {/* BACK BUTTON */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-white/70 hover:text-white transition mb-3"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="font-medium text-sm">Back</span>
        </button>

        {/* MAIN CARD */}
        <div className="bg-white/[0.08] backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
          {children}
        </div>

        {/* FOOTNOTE */}
        <p className="text-center text-xs text-white/60 mt-6 mb-20">
          By continuing, you agree to our{" "}
          <a href="#" className="text-white/80 hover:text-white transition-colors">
            Terms and Conditions
          </a>{" "}
          and{" "}
          <a href="#" className="text-white/80 hover:text-white transition-colors">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  )
}
