"use client"
import { useState } from "react"

export function useApi<T>(url: string) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch(url, { credentials: "include" })
      const result = await response.json()
      setData(result)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, error, fetchData }
}