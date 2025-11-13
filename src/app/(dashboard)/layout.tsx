"use client"

import { useEffect, useState } from "react"
import DashboardHeader from "@/components/common/dashboard-header"
import Footer from "@/components/common/Footer"
import { getAuthToken, setAuthToken } from "@/lib/auth"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    if (!getAuthToken()) {
      setAuthToken("demo-token-" + Date.now())
    }
  }, [])

  if (!isMounted) return <div className="flex justify-center items-center h-screen">Loading...</div>

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />
      <main className="flex-grow pt-20">{children}</main>
      <Footer />
    </div>
  )
}
