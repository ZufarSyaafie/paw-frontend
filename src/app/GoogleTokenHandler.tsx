"use client"

import { useEffect } from "react"
// import { useRouter } from "next/navigation"
import { setAuthToken } from "@/lib/auth"

export function GoogleTokenHandler() {
  // const router = useRouter()

  useEffect(() => {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    const token = params.get("token")
    const username = params.get('username')

    if (!token || token === "undefined") return

    try { 
      setAuthToken(token) 
      if (username) localStorage.setItem('username', username)
    } catch (e) { 
      console.error('Failed to save token to local storage:', e)
    }

    params.delete("token")
    const cleanUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '')
    window.location.replace(cleanUrl || '/dashboard')
    // const clean = window.location.pathname + (params.toString() ? "?" + params.toString() : "")
    // window.history.replaceState({}, "", clean)

    // router.replace("/dashboard")
  }, [])

  return null
}
