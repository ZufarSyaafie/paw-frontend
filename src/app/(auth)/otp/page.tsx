"use client"

import type React from "react"
import { useState, useEffect } from "react" // Import useEffect
import { useRouter } from "next/navigation"
import { AuthLayout } from "@/components/common/auth-layout"
import { AuthHeader } from "@/components/common/auth-header"
import { Button } from "@/components/ui/button"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
// HAPUS: import { setAuthToken } from "@/lib/auth" (kita tidak set token di sini)

// Ganti XXXX dengan port backend Anda (dari file .env backend)
const API_URL = "http://localhost:XXXX" 

export default function OTPPage() {
  const router = useRouter()
  const [otp, setOtp] = useState("")
  const [email, setEmail] = useState("") // Kita butuh email untuk dikirim
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState("")

  // PENTING: Ambil email dari localStorage saat halaman dimuat
  useEffect(() => {
    const storedEmail = localStorage.getItem("registrationEmail")
    if (storedEmail) {
      setEmail(storedEmail)
    } else {
      // Jika tidak ada email, user tidak seharusnya ada di halaman ini
      setError("Sesi tidak ditemukan. Silakan daftar kembali.")
      // Opsional: redirect kembali ke register
      // router.push("/register")
    }
  }, []) // [] = hanya jalan sekali

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!email) {
      setError("Email tidak ditemukan. Silakan daftar kembali.")
      setIsLoading(false)
      return
    }

    try {
      // 1. Ganti simulasi dengan API call sungguhan
      const response = await fetch(`${API_URL}/auth/verify-registration-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, otp: otp }),
      })

      const data = await response.json()

      if (!response.ok) {
        // 2. Ambil pesan error dari backend
        throw new Error(data.message || "Kode OTP tidak valid")
      }

      // 3. SUKSES!
      // Hapus email dari localStorage karena sudah terverifikasi
      localStorage.removeItem("registrationEmail")

      // 4. Arahkan ke halaman sign-in (sesuai permintaan Anda)
      alert("Verifikasi berhasil! Silakan login.") // Opsional: beri notifikasi
      router.push("/sign-in")

    } catch (err: any) {
      setError(err.message || "Verifikasi gagal. Silakan coba lagi.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    setIsResending(true)
    setError("")

    if (!email) {
      setError("Email tidak ditemukan. Silakan daftar kembali.")
      setIsResending(false)
      return
    }

    try {
      // API call sungguhan untuk kirim ulang OTP
      const response = await fetch(`${API_URL}/auth/resend-registration-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || "Gagal mengirim ulang kode")
      }
      
      // Beri tahu user bahwa OTP terkirim
      alert("Kode OTP baru telah dikirim ke email Anda.")

    } catch (err: any) {
      setError(err.message || "Gagal mengirim ulang kode. Silakan coba lagi.")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <AuthLayout hideFooter>
      <AuthHeader
        title="Check Your Email"
        subtitle={`We sent a 6-digit verification code to ${email || "your email address"}.`}
      />

      <div className="space-y-6">
        {/* OTP Input */}
        <div className="flex justify-center">
          <InputOTP maxLength={6} value={otp} onChange={setOtp}>
            <InputOTPGroup className="gap-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <InputOTPSlot
                  key={index}
                  index={index}
                  className="h-12 w-12 border border-white/20 bg-white/[0.05] rounded-lg text-lg font-semibold text-white 
                             placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50 
                             focus:border-blue-400 focus:bg-white/[0.08] transition-all duration-200 
                             backdrop-blur-sm text-center"
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        {/* Error Message */}
        {error && <p className="text-center text-red-400 text-sm">{error}</p>}

        {/* Verify Button */}
        <form onSubmit={handleVerify}>
          <Button
            type="submit"
            disabled={isLoading || otp.length !== 6 || !email}
            className="w-full bg-gradient-to-r from-blue-500 via-cyan-400 to-green-500 hover:from-blue-600 hover:via-cyan-500 hover:to-green-600 text-white font-bold py-3 rounded-lg transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-base"
          >
            {isLoading ? "Verifying..." : "Verify Code"}
          </Button>
        </form>

        {/* Resend Link */}
        <div className="text-center pt-2">
          <p className="text-sm text-white/70 font-medium">
            Didn't get a code?{" "}
            <button
              onClick={handleResend}
              disabled={isResending || !email}
              className="text-white font-semibold hover:text-white/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? "Resending..." : "Resend"}
            </button>
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}