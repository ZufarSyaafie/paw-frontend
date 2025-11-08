"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AuthLayout } from "@/components/auth/auth-layout"
import { AuthHeader } from "@/components/auth/auth-header"
import { AuthDivider } from "@/components/auth/auth-divider"
import { GoogleButton } from "@/components/auth/google-button"
import { Button } from "@/components/ui/button"
import { Mail, Lock } from "lucide-react"

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

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
                {/* Email Input */}
                <div>
                    <label className="text-sm font-semibold text-white/80 block mb-2">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all placeholder-white/40 text-white"
                            required
                        />
                    </div>
                </div>

                {/* Password Input */}
                <div>
                    <label className="text-sm font-semibold text-white/80 block mb-2">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all placeholder-white/40 text-white"
                            required
                        />
                    </div>
                </div>

                {/* Forgot Password */}
                <div className="text-right">
                    <a href="/forgot-password" className="text-sm text-cyan-300 hover:text-cyan-200 transition-colors">
                        Forgot Password?
                    </a>
                </div>

                {/* Sign In Button */}
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold py-3 rounded-lg hover:shadow-lg hover:shadow-cyan-400/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? "Signing in..." : "Sign In"}
                </Button>
            </form>

            <AuthDivider />

            {/* Google Button */}
            <GoogleButton disabled={isLoading} onClick={handleGoogleSignIn} isLoading={isLoading} />

            {/* Sign Up Link */}
            <p className="text-center text-sm text-white/70 mt-6">
                Don't have an account?{" "}
                <a href="/signup" className="text-cyan-300 font-semibold hover:text-cyan-200 transition-colors">
                    Create one
                </a>
            </p>
        </AuthLayout>
    )
}