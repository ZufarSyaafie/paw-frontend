"use client"

import { Button } from "@/components/ui/button"
import { Plus, Search, Loader2, Calendar, AlertCircle, Filter, X } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { BookingCard } from "@/components/bookings/BookingCard"
import type { Booking } from "@/types"
import { getAuthToken } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { colors } from "@/styles/colors"
import { typography } from "@/styles/typography"

const API_URL = process.env.NEXT_PUBLIC_API_URL

const checkIfCompleted = (booking: Booking): boolean => {
    if (booking.status !== 'confirmed') return false;
    
    const bookingEndDateTime = new Date(booking.date);
    const [hours, minutes] = booking.endTime.split(':').map(Number);
    bookingEndDateTime.setHours(hours, minutes, 0, 0);

    return new Date().getTime() > bookingEndDateTime.getTime();
};

export default function BookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState<"all" | "confirmed" | "pending" | "cancelled" | "completed">("all")
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<"dateDesc" | "dateAsc">("dateDesc")

  useEffect(() => {
    let cancelled = false

    const fetchMyBookings = async (showLoading = true) => {
      if (showLoading) setIsLoading(true)
      if (!showLoading) setError(null)

      const token = getAuthToken()
      if (!token) {
        if (!cancelled) {
             setError("Authentication required. Please login.")
             setIsLoading(false)
        }
        return
      }

      try {
        const endpoints = [
          `${API_URL}/api/rooms/bookings/my`,
          `${API_URL}/api/rooms/bookings/list?mine=true`,
          `${API_URL}/api/rooms/bookings/user/me`
        ]

        let data: Booking[] | null = null

        for (const ep of endpoints) {
          try {
            const res = await fetch(ep, { headers: { Authorization: `Bearer ${token}` } })
            if (!res.ok) continue

            const body = await res.json()

            if (Array.isArray(body)) {
              data = body
              break
            }

            if (body && Array.isArray(body.data)) {
              data = body.data
              break
            }
          } catch {}
        }

        if (!data) {
          throw new Error("Failed to fetch user bookings")
        }

        if (!cancelled) {
          setBookings(data)
        }
      } catch (err: any) {
        if (!cancelled && showLoading) setError(err?.message || "Failed to load bookings")
      } finally {
        if (!cancelled && showLoading) setIsLoading(false)
      }
    }

    fetchMyBookings(true)

    const onFocus = () => {
      fetchMyBookings(false)
    }
    window.addEventListener("focus", onFocus)

    const interval = setInterval(() => {
      fetchMyBookings(false)
    }, 5000)

    return () => {
      window.removeEventListener("focus", onFocus)
      clearInterval(interval)
      cancelled = true
    }
  }, [])

  const filteredBookings = useMemo(() => {
    let list = bookings.map(b => ({
        ...b,
        status: checkIfCompleted(b) ? 'completed' : b.status 
    })) as any[];

    if (filter !== "all") {
      list = list.filter((booking) => {
        if (filter === "confirmed") return booking.status === "confirmed"
        if (filter === "pending") return booking.status === "pending_payment"
        if (filter === "cancelled") return booking.status === "cancelled"
        if (filter === "completed") return booking.status === "completed" 
        return false
      })
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase()
      list = list.filter((booking) => (booking.room?.name || "").toLowerCase().includes(q))
    }

    return list
  }, [bookings, filter, searchTerm])

  const sortedBookings = useMemo(() => {
    const copy = [...filteredBookings]
    copy.sort((a, b) => {
      const dateA = new Date(a.date || a.createdAt || 0).getTime()
      const dateB = new Date(b.date || b.createdAt || 0).getTime()
      if (sortBy === "dateDesc") return dateB - dateA
      return dateA - dateB
    })
    return copy
  }, [filteredBookings, sortBy])

  const hasActiveFilters = filter !== "all" || searchTerm !== ""

  const handleClearFilters = () => {
    setSearchTerm("")
    setFilter("all")
    setSortBy("dateDesc")
  }

  const filterOptions = [
    { label: "All", value: "all" },
    { label: "Confirmed", value: "confirmed" },
    { label: "Pending Payment", value: "pending" },
    { label: "Cancelled", value: "cancelled" },
    { label: "Completed", value: "completed" },
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.bgPrimary }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="py-8 border-b flex items-start sm:items-center justify-between gap-4" style={{ borderBottomColor: "#e2e8f0" }}>
          <div>
            <h1 className={`${typography.h1}`} style={{ color: colors.textPrimary }}>
              My Room Bookings
            </h1>
            <p className={`${typography.bodySmall} mt-2`} style={{ color: colors.textSecondary }}>
              {sortedBookings.length} booking{sortedBookings.length !== 1 ? "s" : ""} found
            </p>
          </div>
          <Button
            onClick={() => router.push("/rooms")}
            className="flex-shrink-0 px-3 sm:px-4 py-2.5 rounded-lg font-semibold transition-all flex items-center gap-2 whitespace-nowrap text-sm"
            style={{
              backgroundColor: colors.info,
              color: "white",
              minHeight: "42px",
              padding: "10px 12px",
            }}
          >
            <Plus className="w-5 h-5 flex-shrink-0" />
            <span className="hidden sm:inline">Book Room</span>
            <span className="sm:hidden">Book</span>
          </Button>
        </div>

        {/* Search & Filters */}
        <div className="py-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-stretch sm:justify-end justify-center gap-4 w-full">
            <div className="flex w-full sm:w-auto items-center gap-2 sm:gap-3 flex-shrink-0">
              {/* Search bar */}
              <div className="relative flex-1 min-w-0 sm:flex-auto">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 flex-shrink-0"
                  style={{ color: colors.textTertiary }}
                />
                <input
                  type="text"
                  placeholder="Search room name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64 pl-10 pr-4 py-2.5 rounded-lg border transition-all focus:outline-none focus:ring-2 text-sm"
                  style={{
                    backgroundColor: colors.bgPrimary,
                    borderColor: "#cbd5e1",
                    color: colors.textPrimary,
                  }}
                />
              </div>

              {/* Filter button */}
              <Button
                onClick={() => setShowFilters(!showFilters)}
                className="px-3 sm:px-4 py-2.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap text-sm"
                style={{
                  backgroundColor: showFilters ? colors.info : colors.bgPrimary,
                  color: showFilters ? "white" : colors.textSecondary,
                  border: `1px solid ${showFilters ? colors.info : "#cbd5e1"}`,
                  minHeight: "42px",
                  padding: "10px 12px",
                }}
              >
                <Filter className="w-5 h-5 flex-shrink-0" />
                <span className="hidden sm:inline">Filters</span>
              </Button>

              {/* Clear button */}
              {hasActiveFilters && (
                <Button
                  onClick={handleClearFilters}
                  className="px-3 py-2.5 rounded-lg font-semibold flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap transition-all text-sm"
                  style={{
                    backgroundColor: colors.bgPrimary,
                    color: colors.danger,
                    border: "1px solid #fecaca",
                    minHeight: "42px",
                    padding: "10px 12px",
                  }}
                >
                  <X className="w-5 h-5 flex-shrink-0" />
                  <span className="hidden sm:inline">Clear</span>
                </Button>
              )}
            </div>
          </div>

          {showFilters && (
            <div
              className="rounded-lg p-4 sm:p-6 border space-y-4 sm:space-y-6 overflow-x-auto"
              style={{
                backgroundColor: colors.bgPrimary,
                borderColor: "#e2e8f0",
              }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <p className={`${typography.labelSmall} uppercase mb-3 sm:mb-4 font-bold`} style={{ color: colors.textPrimary }}>
                    Status
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {filterOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setFilter(option.value as any)}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all border whitespace-nowrap capitalize"
                        style={{
                          backgroundColor: filter === option.value ? colors.info : colors.bgSecondary,
                          color: filter === option.value ? "white" : colors.textSecondary,
                          borderColor: filter === option.value ? colors.info : "#cbd5e1",
                          borderWidth: "1px",
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className={`${typography.labelSmall} uppercase mb-3 sm:mb-4 font-bold`} style={{ color: colors.textPrimary }}>
                    Sort By
                  </p>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full px-3 sm:px-4 py-2 rounded-lg border font-medium focus:outline-none focus:ring-2 transition-all text-sm sm:text-base"
                    style={{
                      backgroundColor: colors.bgSecondary,
                      borderColor: "#cbd5e1",
                      color: colors.textPrimary,
                      borderWidth: "1px",
                    }}
                  >
                    <option value="dateDesc">Booking Date (Newest)</option>
                    <option value="dateAsc">Booking Date (Oldest)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content - Separate Wrapper */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
            <p className="ml-3 text-gray-600 font-medium">Loading bookings...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center flex flex-col items-center">
            <AlertCircle className="w-8 h-8 text-red-600 mb-3" />
            <h3 className="font-semibold text-red-800 mb-1">Error Loading Data</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        ) : sortedBookings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedBookings.map((booking) => (
              <BookingCard key={(booking.id || (booking as any)._id) as string} booking={booking} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Calendar className="w-12 h-12 mx-auto mb-4" style={{ color: colors.textTertiary }} />
            <h3 className={`${typography.h3} mb-2`} style={{ color: colors.textSecondary }}>
              No Bookings Found
            </h3>
            <p className={typography.bodySmall} style={{ color: colors.textTertiary }}>
              Try adjusting your search or filter options
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
