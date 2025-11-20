"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import DashboardHeader from "@/components/common/dashboard-header"
import Footer from "@/components/common/Footer"
import { getAuthToken, removeAuthToken } from "@/lib/auth"
import { Loader2, AlertCircle } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ""

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    let isMounted = true
    let retries = 0
    const MAX_RETRIES = 3

    const checkAuth = async () => {
      try {
        const token = getAuthToken()
        console.log("🔍 Token from storage:", token ? "✓ Found" : "✗ Not found")

        if (!token) {
          if (retries < MAX_RETRIES) {
            retries++
            console.log(`⏳ Retry ${retries}/${MAX_RETRIES}...`)
            setTimeout(checkAuth, 300)
            return
          }

          console.log("No token after retries, redirecting to signin")
          if (isMounted) {
            setError("No authentication token found")
            setAuthorized(false)
            setIsLoading(false)
            router.replace("/sign-in")
          }
          return
        }

        console.log("Verifying token with API...")
        const res = await fetch(`${API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        })

        if (!isMounted) return

        console.log(`📡 API Response: ${res.status}`)

        if (res.ok) {
          const user = await res.json()
          console.log("Auth successful! User:", user)

          // Check if admin
          if (user.role === "admin") {
            console.log("Admin detected, redirecting...")
            router.replace("/admin/dashboard")
            return
          }

          if (isMounted) {
            setAuthorized(true)
            setError(null)
            setIsLoading(false)
          }
        } else if (res.status === 401 || res.status === 403) {
          console.log("🔐 Token expired/invalid")
          removeAuthToken()
          if (isMounted) {
            router.replace("/sign-in")
          }
        } else {
          throw new Error(`API returned ${res.status}`)
        }
      } catch (err: any) {
        console.error("Auth check failed:", err)
        if (isMounted) {
          setError(err.message)
          setAuthorized(false)
          setIsLoading(false)
        }
      }
    }

    checkAuth()

    return () => {
      isMounted = false
    }
  }, [router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
        <p className="text-slate-500 text-sm">Verifying session...</p>
        {/* <p className="text-xs text-slate-400">Check Console (F12) for details</p> */}
      </div>
    )
  }

  if (error || !authorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 p-4">
        <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-lg">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-600 mb-2 text-center">Auth Failed!</h1>
          <p className="text-gray-700 mb-4 text-center text-sm">
            {error || "Authorization failed. Please check console for details."}
          </p>
          <p className="text-xs text-gray-600 mb-6 p-3 bg-gray-50 rounded border border-gray-200">
            {/* 💡 <strong>Debug:</strong> Open DevTools (F12) → Console tab to see what went wrong */}
          </p>
          <button 
            onClick={() => {
              removeAuthToken()
              window.location.href = '/sign-in'
            }}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />
      <main className="flex-grow pt-20">{children}</main>
      <Footer />
    </div>
  )
}