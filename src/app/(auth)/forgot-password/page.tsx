"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { AuthLayout } from "@/components/auth/auth-layout"
import { AuthHeader } from "@/components/auth/auth-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setEmailSent(true)
    }, 1000)
  }

  const handleBackToLogin = () => {
    router.push("/sign-in")
  }

  const handleResendEmail = () => {
    setEmail("")
    setEmailSent(false)
  }

  return (
    <AuthLayout>
      {!emailSent ? (
        <>
          <AuthHeader title="Forgot Password" subtitle="Enter your email to reset your password" />

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-2 uppercase tracking-wider">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/[0.05] border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 transition-all duration-200 font-medium backdrop-blur-sm"
              />
            </div>

            <p className="text-xs text-white/60 text-center">
              We'll send you an email with instructions to reset your password.
            </p>

            <form onSubmit={handleSubmit}>
              <Button
                type="submit"
                disabled={isLoading || !email}
                className="w-full bg-gradient-to-r from-blue-500 via-cyan-400 to-green-500 hover:from-blue-600 hover:via-cyan-500 hover:to-green-600 text-white font-bold py-3 rounded-lg transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-base"
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>

            <p className="text-center text-sm text-white/70 font-medium">
              Remember your password?{" "}
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="text-white font-semibold hover:text-white/80 transition-colors bg-transparent border-none cursor-pointer"
              >
                Sign in
              </button>
            </p>
          </div>
        </>
      ) : (
        <>
          <AuthHeader title="Check Your Email" subtitle="Password reset link sent successfully" />

          <div className="space-y-4">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-500/20 border border-green-500/40 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            <div className="text-center space-y-2 mb-6">
              <p className="text-white/80">
                We've sent a password reset link to
              </p>
              <p className="font-semibold text-white">{email}</p>
              <p className="text-xs text-white/60">
                Check your email and follow the instructions to reset your password. The link will expire in 24 hours.
              </p>
            </div>

            <Button
              onClick={handleBackToLogin}
              className="w-full bg-gradient-to-r from-blue-500 via-cyan-400 to-green-500 hover:from-blue-600 hover:via-cyan-500 hover:to-green-600 text-white font-bold py-3 rounded-lg transition-all duration-200 active:scale-95 text-base"
            >
              Back to Sign In Page
            </Button>

            <p className="text-center text-sm text-white/70 font-medium">
              Didn't receive the email?{" "}
              <button
                onClick={handleResendEmail}
                className="text-white font-semibold hover:text-white/80 transition-colors bg-transparent border-none cursor-pointer"
              >
                Try again
              </button>
            </p>
          </div>
        </>
      )}
    </AuthLayout>
  )
}