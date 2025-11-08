"use client"

import { useState, useMemo } from "react"
import RoomCard from "@/components/rooms/room-card"
import { Search, Filter, X } from "lucide-react"
import { typography } from "@/styles/typography"
import { colors } from "@/styles/colors"
import type { Room } from "@/types"

const SAMPLE_ROOMS: Room[] = [
    {
        id: "1",
        name: "Discussion Room A",
        description: "A quiet room perfect for group study",
        capacity: 6,
        image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop",
        features: ["Whiteboard", "Projector", "WiFi", "Sound System"],
        status: "available",
    },
]

const FILTER_OPTIONS = {
    capacities: ["All", "6"],
    statuses: ["All", "available"],
}

export default function RoomsPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCapacity, setSelectedCapacity] = useState("All")
    const [selectedStatus, setSelectedStatus] = useState("All")
    const [showFilters, setShowFilters] = useState(false)

    const filteredRooms = useMemo(() => {
        return SAMPLE_ROOMS.filter((room) => {
            const matchesSearch =
                room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                room.description.toLowerCase().includes(searchQuery.toLowerCase())

            const matchesCapacity =
                selectedCapacity === "All" || room.capacity === parseInt(selectedCapacity)

            const matchesStatus =
                selectedStatus === "All" || room.status === selectedStatus

            return matchesSearch && matchesCapacity && matchesStatus
        })
    }, [searchQuery, selectedCapacity, selectedStatus])

    const hasActiveFilters =
        selectedCapacity !== "All" || selectedStatus !== "All" || searchQuery !== ""

    const handleResetFilters = () => {
        setSearchQuery("")
        setSelectedCapacity("All")
        setSelectedStatus("All")
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: colors.bgPrimary }}>
            {/* Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Title Section */}
                <div className="py-8 border-b" style={{ borderBottomColor: "#e2e8f0" }}>
                    <h1 className={`${typography.h1}`} style={{ color: colors.textPrimary }}>
                        Available Rooms
                    </h1>
                    <p
                        className={`${typography.bodySmall} mt-2`}
                        style={{ color: colors.textSecondary }}
                    >
                        {filteredRooms.length} result
                        {filteredRooms.length !== 1 ? "s" : ""} found
                    </p>
                </div>

                {/* Search & Filters */}
                <div className="py-6 space-y-4">
                    {/* Search Bar & Action Buttons */}
                    <div className="flex flex-row items-center justify-between gap-2 sm:gap-3">
                        {/* Search Input - Flexible width */}
                        <div className="relative flex-1 min-w-0">
                            <Search
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 flex-shrink-0"
                                style={{ color: colors.textTertiary }}
                            />
                            <input
                                type="text"
                                placeholder="Search by name or description..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full max-w-sm pl-12 pr-4 py-2.5 rounded-lg border transition-all focus:outline-none focus:ring-2 text-sm sm:text-base"
                                style={{
                                    backgroundColor: colors.bgPrimary,
                                    borderColor: "#cbd5e1",
                                    color: colors.textPrimary,
                                    minWidth: "120px",
                                }}
                            />
                        </div>

                        {/* Button Group - Compact on mobile, normal on desktop */}
                        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                            {/* Filter Button */}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="px-3 sm:px-4 py-2.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap text-sm sm:text-base"
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
                            </button>

                            {/* Clear Button */}
                            {hasActiveFilters && (
                                <button
                                    onClick={handleResetFilters}
                                    className="px-3 sm:px-4 py-2.5 rounded-lg font-semibold flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap transition-all text-sm sm:text-base"
                                    style={{
                                        backgroundColor: colors.bgPrimary,
                                        color: colors.danger,
                                        border: `1px solid #fecaca`,
                                        minHeight: "42px",
                                        padding: "10px 12px",
                                    }}
                                >
                                    <X className="w-5 h-5 flex-shrink-0" />
                                    <span className="hidden sm:inline">Clear</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Filters Panel */}
                    {showFilters && (
                        <div
                            className="rounded-lg p-4 sm:p-6 border space-y-4 sm:space-y-6 overflow-x-auto"
                            style={{
                                backgroundColor: colors.bgPrimary,
                                borderColor: "#e2e8f0",
                            }}
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                {/* Capacity Filter */}
                                <div>
                                    <p
                                        className={`${typography.labelSmall} uppercase mb-3 sm:mb-4 font-bold`}
                                        style={{ color: colors.textPrimary }}
                                    >
                                        Capacity
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {FILTER_OPTIONS.capacities.map((capacity) => (
                                            <button
                                                key={capacity}
                                                onClick={() => setSelectedCapacity(capacity)}
                                                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all border whitespace-nowrap"
                                                style={{
                                                    backgroundColor:
                                                        selectedCapacity === capacity
                                                            ? colors.info
                                                            : colors.bgSecondary,
                                                    color:
                                                        selectedCapacity === capacity
                                                            ? "white"
                                                            : colors.textSecondary,
                                                    borderColor:
                                                        selectedCapacity === capacity
                                                            ? colors.info
                                                            : "#cbd5e1",
                                                    borderWidth: "1px",
                                                }}
                                            >
                                                {capacity}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Status Filter */}
                                <div>
                                    <p
                                        className={`${typography.labelSmall} uppercase mb-3 sm:mb-4 font-bold`}
                                        style={{ color: colors.textPrimary }}
                                    >
                                        Status
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {FILTER_OPTIONS.statuses.map((status) => (
                                            <button
                                                key={status}
                                                onClick={() => setSelectedStatus(status)}
                                                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all border whitespace-nowrap capitalize"
                                                style={{
                                                    backgroundColor:
                                                        selectedStatus === status
                                                            ? colors.info
                                                            : colors.bgSecondary,
                                                    color:
                                                        selectedStatus === status
                                                            ? "white"
                                                            : colors.textSecondary,
                                                    borderColor:
                                                        selectedStatus === status
                                                            ? colors.info
                                                            : "#cbd5e1",
                                                    borderWidth: "1px",
                                                }}
                                            >
                                                {status === "All"
                                                    ? "All"
                                                    : status.charAt(0).toUpperCase() + status.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Rooms Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {filteredRooms.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredRooms.map((room) => (
                            <RoomCard key={room.id} {...room} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <Filter className="w-12 h-12 mx-auto mb-4" style={{ color: colors.textTertiary }} />
                        <h3 className={`${typography.h3} mb-2`} style={{ color: colors.textSecondary }}>
                            No rooms found
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