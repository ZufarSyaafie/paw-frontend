"use client"

import { useState, useEffect, useMemo } from "react"
import AnnouncementCard from "@/components/announcements/announcement-card"
import { Search, Filter, X, Loader2, AlertCircle, Bell } from "lucide-react"
import { typography } from "@/styles/typography"
import { colors } from "@/styles/colors"
import type { Announcement } from "@/types"
import { getAuthToken } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL

const sampleAnnouncements: Announcement[] = []

export default function AnnouncementsPage() {
	const [announcements, setAnnouncements] = useState<Announcement[]>(sampleAnnouncements)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const [searchQuery, setSearchQuery] = useState("")
    
    const [startDate, setStartDate] = useState(''); 
    const [endDate, setEndDate] = useState(''); 

	const [showFilters, setShowFilters] = useState(false)
    
	useEffect(() => {
		const fetchAnnouncements = async () => {
			const token = getAuthToken()

			setIsLoading(true)
			setError(null)

			try {
				const headers: HeadersInit = {};
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

				const response = await fetch(`${API_URL}/api/announcements`, {
					headers: headers, 
				})

				if (!response.ok) {
					const errorData = await response.json()
					if (response.status === 401 || response.status === 403) {
						throw new Error("Login required to view announcements, even though they are public list.");
					}
					throw new Error(errorData.message || "Failed to fetch announcements.")
				}

				const data = await response.json()
				setAnnouncements(data || []) 
			} catch (err: any) {
				console.error("Fetch Announcements Error:", err)
				setError("Failed to load announcements. Please check backend status and log in.")
				setAnnouncements([])
			} finally {
				setIsLoading(false)
			}
		}

		fetchAnnouncements()
	}, [])

    const hasActiveFilters = searchQuery !== "" || startDate !== "" || endDate !== "";
    
    const filteredAnnouncements = useMemo(() => {
        return announcements.filter((a) => {
            const safeTitle = (a.title || a.bookTitle || "") as string; 
            const safeSnippet = (a.message || a.snippet || "") as string;

            // filter Text
            const textMatches = (
                safeTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                safeSnippet.toLowerCase().includes(searchQuery.toLowerCase())
            );

            // filter Date
            const announcementDate = new Date(a.createdAt || a.date || 0);
            let matchesDate = true;
            
            if (startDate) {
                const start = new Date(startDate);
                // compare timestamp
                matchesDate = matchesDate && announcementDate.getTime() >= start.getTime();
            }
            
            if (endDate) {
                const end = new Date(endDate);
                // Tambah satu hari biar inklusif (sampai akhir hari yang dipilih)
                end.setDate(end.getDate() + 1); 
                matchesDate = matchesDate && announcementDate.getTime() < end.getTime();
            }

            return textMatches && matchesDate;
        }).sort((a, b) => new Date(b.createdAt || b.date || 0).getTime() - new Date(a.createdAt || a.date || 0).getTime());
    }, [announcements, searchQuery, startDate, endDate]);
    
    const handleClearFilters = () => {
        setSearchQuery("");
        setStartDate(''); // Clear date filters
        setEndDate('');
    };

	return (
		<div className="min-h-screen" style={{ backgroundColor: colors.bgPrimary }}>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				
				<div className="py-6 space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h1 className={`${typography.h1}`} style={{ color: colors.textPrimary }}>
                                Announcements
                            </h1>
                            <p className={`${typography.bodySmall} mt-1`} style={{ color: colors.textSecondary }}>
                                {filteredAnnouncements.length} latest updates from the library.
                            </p>
                        </div>
					</div>
					
                    {/* SEARCH INPUT & FILTER BUTTONS */}
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
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full sm:w-64 pl-10 pr-4 py-2.5 rounded-lg border transition-all focus:outline-none focus:ring-2 text-sm"
                                    style={{
                                        backgroundColor: colors.bgPrimary,
                                        borderColor: "#cbd5e1",
                                        color: colors.textPrimary,
                                    }}
                                />
                            </div>

                            {/* Filter Button */}
                            <button
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
                            </button>

                            {/* Clear Button */}
                            {hasActiveFilters && (
                                <button
                                    onClick={handleClearFilters}
                                    className="px-3 py-2.5 rounded-lg font-semibold flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap transition-all text-sm"
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
                    
                    {showFilters && (
                        <div className="rounded-lg p-4 border bg-gray-50 space-y-4">
                            <h3 className="font-semibold text-gray-700 text-sm mb-2">Filter by Date</h3>
                            <div className="grid grid-cols-2 gap-4 max-w-lg">
                                {/* Input From Date */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">From Date</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500"
                                        style={{ backgroundColor: colors.bgPrimary }}
                                    />
                                </div>
                                {/* Input To Date */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">To Date</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500"
                                        style={{ backgroundColor: colors.bgPrimary }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>				

				{/* Content based on state */}
				{isLoading ? (
					<div className="flex justify-center items-center h-48">
						<Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
						<p className="ml-3 text-gray-600 font-medium">Loading announcements...</p>
					</div>
				) : error ? (
					<div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center flex flex-col items-center">
						<AlertCircle className="w-8 h-8 text-red-600 mb-3" />
						<h3 className="font-semibold text-red-800 mb-1">Error Loading Data</h3>
						<p className="text-sm text-red-700">{error}</p>
					</div>
				) : filteredAnnouncements.length > 0 ? (
					<div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2">
						{filteredAnnouncements.map((announcement) => (
							<AnnouncementCard 
								key={(announcement.id || announcement._id) as string} 
								id={(announcement.id || announcement._id) as string}
                                // Fallback logic (priority: title > bookTitle)
								title={(announcement.title || announcement.bookTitle || "New Update") as string}
								snippet={(announcement.message || announcement.snippet || "") as string}
								date={(announcement.createdAt || announcement.date || "") as string}
							/>
						))}
					</div>
				) : (
					<div className="text-center py-16">
						<Bell className="w-12 h-12 mx-auto mb-4" style={{ color: colors.textTertiary }} />
						<h3 className={`${typography.h3} mb-2`} style={{ color: colors.textSecondary }}>
							No new announcements
						</h3>
						<p className={typography.bodySmall} style={{ color: colors.textTertiary }}>
							The library currently has no active announcements.
						</p>
					</div>
				)}
			</div>
		</div>
	)
}