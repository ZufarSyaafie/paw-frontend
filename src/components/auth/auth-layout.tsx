import type React from "react"
import { colors } from "@/styles/colors"

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: colors.authBg }} className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-white/[0.08] backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
          {children}
        </div>
        <p className="text-center text-xs text-white/60 mt-6">
          By continuing, you agree to our{" "}
          <a href="#" className="text-white/80 hover:text-white transition-colors">
            Terms and Conditions
          </a>
          {" "}as well as our{" "}
          <a href="#" className="text-white/80 hover:text-white transition-colors">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  )
}