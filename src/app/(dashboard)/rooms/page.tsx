"use client"

import { useState, useMemo, useEffect } from "react"
import { RoomCard } from "@/components/rooms/room-card"
import { Search, Filter, X, Loader2, AlertCircle, Users } from "lucide-react" // Import Users
import { typography } from "@/styles/typography"
import { colors } from "@/styles/colors"
import type { Room } from "@/types"
import { getAuthToken } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL

const FILTER_OPTIONS = {
    statuses: ["All", "available", "booked"],
}

export default function RoomsPage() {
    const [rooms, setRooms] = useState<Room[]>([]) 
    const [isLoading, setIsLoading] = useState(true) 
    const [error, setError] = useState<string | null>(null)

    const [searchQuery, setSearchQuery] = useState("")
    
    const [minCapacity, setMinCapacity] = useState("");
    const [maxCapacity, setMaxCapacity] = useState("");

    const [selectedStatus, setSelectedStatus] = useState("All")
    const [showFilters, setShowFilters] = useState(false)

    useEffect(() => {
        const fetchRooms = async () => {
            const token = getAuthToken()
            
             setIsLoading(true)
			setError(null)
            
            try {
                const response = await fetch(`${API_URL}/api/rooms`, {
                    headers: { "Authorization": `Bearer ${token}` },
                })
                
                if (!response.ok) {
                     const errorData = await response.json()
                    throw new Error(errorData.message || "Failed to fetch rooms.")
                }

                const data = await response.json()
                setRooms(data || []) 
            } catch (err: any) {
                console.error("Fetch Rooms Error:", err)
                setError(err.message || "Failed to load rooms.")
                setRooms([]) // Set kosong kalo error
            } finally {
                 setIsLoading(false)
            }
        }

        fetchRooms()
    }, [])

    const filteredRooms = useMemo(() => {
        
        const min = parseInt(minCapacity) || 0; 
        const max = parseInt(maxCapacity) || Infinity; 

        return rooms.filter((room) => {
             const matchesSearch =
                room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (room.description || "").toLowerCase().includes(searchQuery.toLowerCase())

            const matchesCapacity =
                room.capacity >= min && room.capacity <= max;

             const matchesStatus =
                selectedStatus === "All" ||
                room.status === selectedStatus

            return matchesSearch && matchesCapacity && matchesStatus
        })
    }, [rooms, searchQuery, minCapacity, maxCapacity, selectedStatus])

    const hasActiveFilters =
        minCapacity !== "" ||
        maxCapacity !== "" ||
        selectedStatus !== "All" || 
        searchQuery !== ""

    const handleResetFilters = () => {
        setSearchQuery("")
        setMinCapacity("") 
        setMaxCapacity("")
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
                       
                        {/* Search Input */}
                         <div className="relative flex-1 min-w-0">
                            <Search
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 
                                 h-5 flex-shrink-0"
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

                        {/* Button Group */}
                         <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
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
           
                                {/* RANGE */}
                                <div>
                                    <p
                                        className={`${typography.labelSmall} uppercase mb-3 sm:mb-4 font-bold`}
                                         style={{ color: colors.textPrimary }}
                                    >
                                         Capacity Range
                                    </p>
                                     <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-slate-500" />
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={minCapacity}
                                            onChange={(e) => setMinCapacity(e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg border font-medium focus:outline-none focus:ring-2 transition-all text-sm"
                                            style={{
                                                backgroundColor: colors.bgSecondary,
                                                borderColor: "#cbd5e1",
                                                color: colors.textPrimary,
                                                maxWidth: "100px"
                                            }}
                                        />
                                        <span className="font-semibold text-slate-500">-</span>
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            value={maxCapacity}
                                            onChange={(e) => setMaxCapacity(e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg border font-medium focus:outline-none focus:ring-2 transition-all text-sm"
                                            style={{
                                                backgroundColor: colors.bgSecondary,
                                                borderColor: "#cbd5e1",
                                                color: colors.textPrimary,
                                                maxWidth: "100px"
                                            }}
                                        />
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
                {isLoading ? (
					<div className="flex justify-center items-center h-48">
						<Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
						<p className="ml-3 text-gray-600 font-medium">Loading rooms...</p>
					</div>
				) : error ? (
					<div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center flex flex-col items-center">
						<AlertCircle className="w-8 h-8 text-red-600 mb-3" />
						<h3 className="font-semibold text-red-800 mb-1">Error Loading Data</h3>
						<p className="text-sm text-red-700">{error}</p>
					</div>
				) : filteredRooms.length > 0 ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{filteredRooms.map((room) => {
                            const roomId = (room._id || room.id) as string;
                            return (
                                <RoomCard 
                                    key={roomId}
                                    id={roomId}
                                    name={room.name}
                                    description={room.description} 
                                    capacity={room.capacity}
                                    photos={room.photos} 
                                    facilities={room.facilities} 
                                    status={room.status}
                                />
                            );
                        })}
					</div>
				) : (
                    <div className="text-center py-16">
                        <Filter className="w-12 h-12 mx-auto mb-4" style={{ color: colors.textTertiary }} 
                            />
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