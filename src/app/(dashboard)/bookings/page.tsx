"use client"

import { Button } from "@/components/ui/button"
import { Plus, Search, Loader2, Calendar, AlertCircle, Filter, X } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { typography } from "@/styles/typography"
import { BookingCard } from "@/components/bookings/BookingCard"
import type { Booking } from "@/types"
import { getAuthToken } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { colors } from "@/styles/colors"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function BookingsPage() {
    const router = useRouter();
    const [bookings, setBookings] = useState<Booking[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [filter, setFilter] = useState("all")
    const [showFilters, setShowFilters] = useState(false)
    const [sortBy, setSortBy] = useState("dateDesc")

    useEffect(() => {
        const fetchBookings = async () => {
            const token = getAuthToken()

            setIsLoading(true)
            try {
                const headers: HeadersInit = {}
                if (token) headers["Authorization"] = `Bearer ${token}`
                const response = await fetch(`${API_URL}/api/rooms/bookings/list`, {
                    headers,
                    credentials: "include",
                })

                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.message || "Failed to fetch bookings.")
                }

                const data = await response.json()
                setBookings(data || [])
            } catch (err: any) {
                console.error("Fetch Bookings Error:", err)
                setError(err.message || "Failed to load booking history.")
            } finally {
                setIsLoading(false)
            }
        }

        fetchBookings()
    }, [])

    const filteredBookings = useMemo(() => {
        let list = bookings

        if (filter !== "all") {
            list = list.filter((booking) => {
                if (filter === "confirmed") return booking.status === "confirmed"
                if (filter === "pending") return booking.status === "pending_payment"
                if (filter === "cancelled") return booking.status === "cancelled"
                return false
            })
        }

        if (searchTerm) {
            list = list.filter((booking) =>
                booking.room.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        return list
    }, [bookings, filter, searchTerm])

    const sortedBookings = useMemo(() => {
        return [...filteredBookings].sort((a, b) => {
            const dateA = new Date(a.date).getTime()
            const dateB = new Date(b.date).getTime()

            if (sortBy === "dateDesc") return dateB - dateA
            if (sortBy === "dateAsc") return dateA - dateB
            return 0
        })
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
    ]

    return (
        <div className="space-y-8 p-4 sm:p-6 lg:p-8">
            <header className="flex justify-between items-center">
                <h1 className={`${typography.h1} text-gray-900`}>My Bookings</h1>
                <Button
                    onClick={() => router.push("/rooms")}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Book Room
                </Button>
            </header>

            {/* Search & Filter bar */}
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

            {/* Filter Panel */}
            {showFilters && (
                <div className="p-4 sm:p-6 rounded-lg border border-gray-200 bg-gray-50 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Filter by Status */}
                        <div>
                            <p className="text-sm font-semibold text-gray-700 mb-3">Filter by Status</p>
                            <div className="flex flex-wrap gap-2">
                                {filterOptions.map((option) => (
                                    <Button
                                        key={option.value}
                                        onClick={() => setFilter(option.value)}
                                        variant="outline"
                                        className={`transition-colors text-sm font-medium ${
                                            filter === option.value
                                                ? "bg-cyan-500 text-white border-cyan-500 hover:bg-cyan-600"
                                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                        }`}
                                    >
                                        {option.label}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Sort By */}
                        <div>
                            <p className="text-sm font-semibold text-gray-700 mb-3">Sort By</p>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full max-w-xs px-3 py-2 rounded-lg border border-gray-300 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all text-sm"
                            >
                                <option value="dateDesc">Booking Date (Newest)</option>
                                <option value="dateAsc">Booking Date (Oldest)</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            {isLoading ? (
                <div className="flex justify-center items-center h-48">
                    <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
                    <p className="ml-3 text-gray-600 font-medium">Loading booking history...</p>
                </div>
            ) : error ? (
                <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center flex flex-col items-center">
                    <AlertCircle className="w-8 h-8 text-red-600 mb-3" />
                    <h3 className="font-semibold text-red-800 mb-1">Error Loading Data</h3>
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            ) : sortedBookings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedBookings.map((booking) => (
                        <BookingCard key={(booking.id || booking._id) as string} booking={booking} />
                    ))}
                </div>
            ) : (
                <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
                    <Calendar className="w-8 h-8 text-gray-500 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-800 mb-1">No Bookings Found</h3>
                    <p className="text-sm text-gray-600">
                        You currently have no room bookings matching the filter.
                    </p>
                </div>
            )}
        </div>
    )
}
