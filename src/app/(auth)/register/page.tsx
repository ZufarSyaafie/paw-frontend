"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { AuthLayout } from "@/components/auth/auth-layout"
import { AuthHeader } from "@/components/auth/auth-header"
import { AuthDivider } from "@/components/auth/auth-divider"
import { GoogleButton } from "@/components/auth/google-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Ganti XXXX dengan port backend Anda (dari file .env backend)
const API_URL = "http://localhost:XXXX"

export default function RegisterPage() {
  const [username, setUsername] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("") // <-- TAMBAHKAN state untuk error
  const router = useRouter()

  // --- MODIFIKASI DIMULAI DARI SINI ---
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("") // <-- Reset error setiap kali submit

    try {
      // Panggil API backend Anda
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Pastikan nama field ini (username, phone)
          // sesuai dengan yang diharapkan backend Anda
          username: username,
          phone: phone,
          email: email,
          password: password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Jika backend mengembalikan error, tangkap pesannya
        throw new Error(data.message || "Registrasi gagal. Silakan coba lagi.")
      }

      // SUKSES! Simpan email di localStorage untuk halaman OTP
      localStorage.setItem("registrationEmail", email)

      // Arahkan ke halaman OTP
      router.push("/otp")

    } catch (err: any) {
      // Tangkap dan tampilkan error
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = () => {
    setIsLoading(true)
    // Alur OAuth yang benar adalah mengarahkan browser ke endpoint backend
    // Backend akan menangani autentikasi Google dan me-redirect kembali ke frontend
    window.location.href = `${API_URL}/auth/google`
  }
  // --- MODIFIKASI SELESAI ---

  const isFormValid = username && phone && email && password

  return (
    <AuthLayout>
      <AuthHeader title="Create Account" subtitle="Join NARATAMA today" />

      <div className="space-y-4">
        {/* Username Input */}
        <div>
          <label className="block text-xs font-semibold text-white/80 mb-2 uppercase tracking-wider">Username</label>
          <Input
            type="text"
            placeholder="Choose your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full px-4 py-3 bg-white/[0.05] border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 transition-all duration-200 font-medium backdrop-blur-sm"
          />
        </div>

        {/* Phone Number Input */}
        <div>
          <label className="block text-xs font-semibold text-white/80 mb-2 uppercase tracking-wider">
            Phone Number
          </label>
          <Input
            type="tel"
            placeholder="Your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="w-full px-4 py-3 bg-white/[0.05] border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 transition-all duration-200 font-medium backdrop-blur-sm"
          />
        </div>

        {/* Email Input */}
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

        {/* Password Input */}
        <div>
          <label className="block text-xs font-semibold text-white/80 mb-2 uppercase tracking-wider">Password</label>
          <Input
            type="password"
            placeholder="Create a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 bg-white/[0.05] border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 transition-all duration-200 font-medium backdrop-blur-sm"
          />
        </div>

        {/* Tampilkan Error di sini */}
        {error && (
          <p className="text-center text-red-400 text-sm">{error}</p>
        )}

        {/* Register Button */}
        <form onSubmit={handleRegister}>
          <Button
            type="submit"
            disabled={isLoading || !isFormValid}
            className="w-full bg-gradient-to-r from-blue-500 via-cyan-400 to-green-500 hover:from-blue-600 hover:via-cyan-500 hover:to-green-600 text-white font-bold py-3 rounded-lg transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-base"
          >
            {isLoading ? "Processing..." : "Create Account"}
          </Button>
        </form>

        {/* Divider */}
        <AuthDivider />

        {/* Google Sign-Up Button */}
        <GoogleButton 
          disabled={isLoading} 
          onClick={handleGoogleSignUp} 
          isLoading={isLoading} 
        />

        {/* Login Link */}
        <p className="text-center text-sm text-white/70 font-medium">
          Already have an account?{" "}
          <a href="/login" className="text-white font-semibold hover:text-white/80 transition-colors">
            Sign in
          </a>
        </p>
      </div>
    </AuthLayout>
  )
}