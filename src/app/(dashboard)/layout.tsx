"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardHeader from "@/components/common/dashboard-header"
import Footer from "@/components/common/Footer"
import { getAuthToken } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    let alive = true

    const checkSession = async () => {
      try {
        // cek token localstorage
        const token = getAuthToken()
        const headers: HeadersInit = {}
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }

        // fetch api
        const res = await fetch(`${API_URL}/api/users/me`, {
          headers, 
          credentials: "include"
        })

        if (!alive) return

        if (res.ok) {
          setAuthorized(true)
        } else {
          setAuthorized(false)
          router.replace('/sign-in')
        }
      } catch (error) {
        if (alive) {
          setAuthorized(false)
          router.replace('/sign-in')
        }
      } finally {
        if (alive) setChecking(false)
      }
    }

    checkSession()
    
    return () => { alive = false }
  }, [router])

  if (checking) return (
    <div className="flex justify-center items-center h-screen">Loading...</div>
  )
  
  if (!authorized) return null

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />
      <main className="flex-grow pt-20">{children}</main>
      <Footer />
    </div>
  )
}