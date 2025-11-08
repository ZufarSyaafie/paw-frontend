"use client"
import { useRouter } from "next/navigation"
import { getAuthToken, removeAuthToken, setAuthToken } from "@/lib/auth"

export function useAuth() {
  const router = useRouter()

  const login = (token: string) => {
    setAuthToken(token)
    router.push("/dashboard")
  }

  const logout = () => {
    removeAuthToken()
    router.push("/login")
  }

  const isAuthenticated = () => !!getAuthToken()

  return { login, logout, isAuthenticated }
}