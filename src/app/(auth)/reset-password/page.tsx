"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AuthLayout } from "@/components/auth/auth-layout"
import { AuthHeader } from "@/components/auth/auth-header"
import { Button } from "@/components/ui/button"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Lock, KeyRound } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function ResetPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // extra states for OTP verification flow
  const [isVerifying, setIsVerifying] = useState(false)
  const [verified, setVerified] = useState(false)
  const [verifyWarning, setVerifyWarning] = useState("") 

  useEffect(() => {
    const storedEmail = typeof window !== "undefined" ? localStorage.getItem("resetEmail") : null
    if (storedEmail) {
      setEmail(storedEmail)
    } else {
      router.replace("/forgot-password")
    }
  }, [router])

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setError("")
    setVerifyWarning("")

    if (!email) {
      setError("Email not found. Please go back to Forgot Password.")
      return
    }
    if (otp.length !== 6) {
      setError("Please enter the 6-digit OTP.")
      return
    }

    setIsVerifying(true)
    try {
      const res = await fetch(`${API_URL}/api/auth/verify-reset-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
        credentials: "include",
      })

      if (res.status === 404) {
        setVerifyWarning(
          "Server does not expose a verify-only endpoint — the server will validate the OTP when submitting the reset request."
        )
        setVerified(true)
        return
      }

      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || "Invalid OTP.")
      // verified
      setVerified(true)
    } catch (err: any) {
      setError(err?.message || "Verification failed. Please try again.")
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    setError("")
    if (!email) {
      setError("Email not found.")
      return
    }
    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        credentials: "include",
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || "Failed to resend OTP.")
    //   if (data?.demoOtp) {
    //     alert(`DEMO MODE: your new OTP is ${data.demoOtp}`)
    //   } else {
    //     alert("A new OTP has been sent.")
    //   }
    } catch (err: any) {
      setError(err?.message || "Failed to resend OTP.")
    }
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match!")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password.")
      }

      alert("Password updated! Please sign in with your new password.")
      localStorage.removeItem("resetEmail")
      router.push("/sign-in")
    } catch (err: any) {
      setError(err.message || "Failed to reset password.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <AuthHeader title="Reset Password" />

      <div className="space-y-6">
        <div className="text-center">
          <p className="text-white/60 text-sm">
            Enter the 6-digit code sent to <span className="text-white font-bold">{email}</span>
          </p>
        </div>

        {/* OTP area (visible until verified) */}
        <div className="flex justify-center mb-2">
          <InputOTP maxLength={6} value={otp} onChange={setOtp}>
            <InputOTPGroup className="flex-nowrap justify-center gap-1 sm:gap-3 max-w-[220px] sm:max-w-none">
              {Array.from({ length: 6 }).map((_, index) => (
                <InputOTPSlot
                  key={index}
                  index={index}
                  className="h-8 w-8 sm:h-12 sm:w-12
                             rounded-md sm:rounded-lg
                             border border-white/20 bg-white/[0.05]
                             text-[13px] sm:text-lg font-semibold text-white text-center
                             placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50
                             focus:border-blue-400 focus:bg-white/[0.08]
                             transition-all duration-200 backdrop-blur-sm
                             after:content-['·'] after:text-white/30 after:text-2xl
                             data-[has-value=true]:after:content-none"
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        {/* verify / resend buttons */}
        {!verified ? (
          <div className="space-y-2">
            {error && <p className="text-center text-red-400 text-sm">{error}</p>}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleVerifyOtp}
                disabled={isVerifying || otp.length !== 6 || !email}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold py-2 rounded-lg"
              >
                {isVerifying ? "Verifying..." : "Verify Code"}
              </Button>

              <Button
                onClick={handleResend}
                disabled={!email}
                variant="outline"
                className="w-full border border-white/10 text-white"
                type="button"
              >
                Resend
              </Button>
            </div>
            {verifyWarning && <p className="text-yellow-300 text-center text-sm">{verifyWarning}</p>}
          </div>
        ) : (
          <p className="text-center text-blue-300 text-sm">
            OTP verified!<br />
            Please enter your new password below.
          </p>
        )}

        {/* global error after verification */}
        {error && verified && <p className="text-center text-red-400 text-sm">{error}</p>}

        {/* Password form: visible only when verified */}
        {verified && (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-white/80 block mb-2">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="password"
                  placeholder="Min. 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all placeholder-white/40 text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-white/80 block mb-2">Confirm Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all placeholder-white/40 text-white"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || otp.length !== 6 || !newPassword}
              className="w-full mt-4 bg-gradient-to-r from-blue-500 via-cyan-400 hover:from-blue-600 hover:via-cyan-500 text-white font-bold py-3 rounded-lg transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Processing..." : "Reset Password"}
            </Button>
          </form>
        )}
      </div>
    </AuthLayout>
  )
}