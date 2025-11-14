"use client"
import { useRouter } from "next/navigation"
import { removeAuthToken } from "@/lib/auth"

// Cookie-based auth: backend sets/clears httpOnly cookie. These helpers just navigate and hit logout API.
export function useAuth() {
  const router = useRouter()

  const login = () => {
    router.push("/dashboard")
  }

  const logout = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL
      await fetch(`${API_URL}/api/auth/logout`, { method: "POST", credentials: "include" })
    } catch {}
    // clear stored token for header-based requests
    removeAuthToken()
    router.push("/sign-in")
  }

  // For now, rely on protected routes or server checks; returning true by default.
  const isAuthenticated = () => true

  return { login, logout, isAuthenticated }
}