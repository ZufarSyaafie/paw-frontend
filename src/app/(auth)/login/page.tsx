"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { AuthLayout } from "@/components/auth/auth-layout"
import { AuthHeader } from "@/components/auth/auth-header"
import { AuthDivider } from "@/components/auth/auth-divider"
import { GoogleButton } from "@/components/auth/google-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      router.push("/dashboard")
    }, 1000)
  }

  const handleGoogleSignIn = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      router.push("/dashboard")
    }, 1000)
  }

  return (
    <AuthLayout>
      <AuthHeader title="Welcome Back" subtitle="Sign in to your account to continue" />

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

        <div>
          <label className="block text-xs font-semibold text-white/80 mb-2 uppercase tracking-wider">Password</label>
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 bg-white/[0.05] border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 transition-all duration-200 font-medium backdrop-blur-sm"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => router.push("/forgot-password")}
            className="text-xs text-white/70 font-medium hover:text-white/90 transition-colors bg-transparent border-none cursor-pointer"
          >
            Forgot Password?
          </button>
        </div>

        <form onSubmit={handleLogin}>
          <Button
            type="submit"
            disabled={isLoading || !email || !password}
            className="w-full bg-gradient-to-r from-blue-500 via-cyan-400 to-green-500 hover:from-blue-600 hover:via-cyan-500 hover:to-green-600 text-white font-bold py-3 rounded-lg transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-base"
          >
            {isLoading ? "Processing..." : "Sign In"}
          </Button>
        </form>

        <AuthDivider />

        <GoogleButton disabled={isLoading} onClick={handleGoogleSignIn} isLoading={isLoading} />

        <p className="text-center text-sm text-white/70 font-medium">
          Don't have an account?{" "}
          <a href="/register" className="text-white font-semibold hover:text-white/80 transition-colors">
            Create one
          </a>
        </p>
      </div>
    </AuthLayout>
  )
}