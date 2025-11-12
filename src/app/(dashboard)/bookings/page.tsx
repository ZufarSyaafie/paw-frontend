"use client"

import { Button } from "@/components/ui/button"
import { Search, Loader2, Calendar, AlertCircle, Filter } from "lucide-react" // <-- Tambah Filter
import { useState, useEffect, useMemo } from "react"
import { typography } from "@/styles/typography"
import { BookingCard } from "@/components/bookings/BookingCard" // <-- Ganti path sesuai struktur lu
import type { Booking } from "@/types"
import { getAuthToken } from "@/lib/auth" // <-- Import helper untuk token

const API_URL = process.env.NEXT_PUBLIC_API_URL

const MOCK_BOOKINGS: Booking[] = [
    {
        id: "BKG-001",
        user: { id: "U-001", name: "John Doe", email: "user@test.com" },
        room: { id: "R-001", name: "Discussion Room A", capacity: 6, image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop" },
        date: "2024-11-20T00:00:00.000Z",
        startTime: "09:00",
        endTime: "11:00",
        durationHours: 2,
        totalPrice: 100000,
        status: "confirmed", 
        paymentStatus: "paid",
        phone: "081234567890",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: "BKG-002",
        user: { id: "U-001", name: "John Doe", email: "user@test.com" },
        room: { id: "R-002", name: "Meeting Hall B", capacity: 20, image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400&h=300&fit=crop" },
        date: "2024-11-25T00:00:00.000Z",
        startTime: "14:00",
        endTime: "15:00",
        durationHours: 1,
        totalPrice: 0,
        status: "pending_payment", 
        paymentStatus: "unpaid",
        phone: "081234567890",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
]

export default function BookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS) // Gunakan MOCK_BOOKINGS
    const [isLoading, setIsLoading] = useState(false) // Set false agar bisa lihat mock
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [filter, setFilter] = useState("all") // 'all', 'confirmed', 'pending', 'cancelled'

    useEffect(() => {
        const fetchBookings = async () => {
            const token = getAuthToken()
            if (!token) {
                setError("Authentication required. Please log in again.")
                setIsLoading(false)
                return
            }
            setIsLoading(true)

            try {
                const response = await fetch(`${API_URL}/api/rooms/bookings/list`, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
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
            list = list.filter(booking => {
                if (filter === "confirmed") return booking.status === "confirmed"
                if (filter === "pending") return booking.status === "pending_payment" // <-- Status yang benar
                if (filter === "cancelled") return booking.status === "cancelled"
                return false
            })
        }

        if (searchTerm) {
            list = list.filter(booking =>
                booking.room.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }
        return list
    }, [bookings, filter, searchTerm])

    const filterOptions = [
        { label: "All", value: "all" },
        { label: "Confirmed", value: "confirmed" },
        { label: "Pending Payment", value: "pending" },
        { label: "Cancelled", value: "cancelled" },
    ]

    return (
        <div className="space-y-8 p-4 sm:p-6 lg:p-8">
            <header className="flex justify-between items-center">
                <h1 className={typography.h1}>My Bookings</h1>
            </header>

            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search room name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                    />
                </div>
                
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    {filterOptions.map(option => (
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
            ) : filteredBookings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBookings.map(booking => (
                        <BookingCard key={booking.id} booking={booking} />
                    ))}
                </div>
            ) : (
                <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
                    <Calendar className="w-8 h-8 text-gray-500 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-800 mb-1">No Bookings Found</h3>
                    <p className="text-sm text-gray-600">You currently have no room bookings matching the filter.</p>
                </div>
            )}
        </div>
    )
}