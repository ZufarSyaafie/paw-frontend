"use client"

import { useEffect, useState } from "react"
import DashboardHeader from "@/components/common/dashboard-header"
import Footer from "@/components/common/Footer"
import { getAuthToken } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    let alive = true

    const timer = setTimeout(async () => {
        const token = getAuthToken()

        if (!token) {
          if (alive) {
            setAuthorized(false)
            setChecking(false)
            window.location.href = '/sign-in'
          }
          return
        }

        try {
          const res = await fetch(`${API_URL}/api/users/me`, {
            headers: {
              Authorization: `Bearer ${token}`
            },
            credentials: "include",
            cache: "no-store"
          })

          if (!alive) return

          if (res.ok) {
            setAuthorized(true)
          } else {
            setAuthorized(false)
            localStorage.removeItem("authToken") // Bersihin sekalian
            window.location.href = '/sign-in'
          }
        } catch (err) {
          if (alive) {
            setAuthorized(false)
            window.location.href = '/sign-in'
          }
        } finally {
          if (alive) setChecking(false)
        }
    }, 150) 

    return () => { 
        alive = false 
        clearTimeout(timer)
    }
  }, [])

  if (checking) {
    return (
        <div className="flex justify-center items-center h-screen flex-col gap-2">
             <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
             <p className="text-slate-500 text-sm font-medium">Verifying session...</p>
        </div>
    )
  }

  if (!authorized) return null

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />
      <main className="flex-grow pt-20">{children}</main>
      <Footer />
    </div>
  )
}