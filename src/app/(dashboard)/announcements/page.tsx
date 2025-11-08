"use client"

import { useState } from "react"
import AnnouncementCard from "@/components/announcements/announcement-card"
import { Search, Filter, X } from "lucide-react"
import { typography } from "@/styles/typography"
import { colors } from "@/styles/colors"
import type { Announcement } from "@/types"

const SAMPLE_ANNOUNCEMENTS: Announcement[] = [
	{
		id: 1,
		title: "Library System Maintenance",
		snippet:
			"The library system will undergo scheduled maintenance on Saturday, November 15th from 10 PM to 2 AM.",
		fullContent:
			"The library system will undergo scheduled maintenance on Saturday, November 15th from 10 PM to 2 AM. Services will be temporarily unavailable during this time.\n\nDuring this period:\n• Online book catalog will not be accessible\n• Room booking system will be offline\n• Digital resources will be unavailable\n• Physical library access will remain open\n\nWe apologize for any inconvenience and appreciate your patience as we work to improve our services. If you have any questions, please contact our support team at support@naratama.com.",
		date: "2024-11-10",
	},
]

const SORT_OPTIONS = ["Newest First", "Oldest First"]

export default function AnnouncementsPage() {
	const [searchQuery, setSearchQuery] = useState("")
	const [sortBy, setSortBy] = useState("Newest First")
	const [showFilters, setShowFilters] = useState(false)

	const filteredAnnouncements = SAMPLE_ANNOUNCEMENTS.filter(
		(announcement) =>
			announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			announcement.snippet.toLowerCase().includes(searchQuery.toLowerCase())
	)

	const hasActiveFilters = searchQuery !== ""

	return (
		<div
			className="min-h-screen"
			style={{ backgroundColor: colors.bgPrimary }}
		>
			{/* Main Content */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Title Section */}
				<div
					className="py-8 border-b"
					style={{ borderBottomColor: "#e2e8f0" }}
				>
					<h1
						className={typography.h1}
						style={{ color: colors.textPrimary }}
					>
						Announcements
					</h1>
					<p
						className={`${typography.bodySmall} mt-2`}
						style={{ color: colors.textSecondary }}
					>
						{filteredAnnouncements.length} result
						{filteredAnnouncements.length !== 1 ? "s" : ""} found
					</p>
				</div>

				{/* Search & Filters */}
				<div className="py-6 space-y-4">
					{/* Search Bar & Action Buttons */}
					<div className="flex flex-row items-center justify-between gap-2 sm:gap-3">
						{/* Search Input */}
						<div className="relative flex-1 min-w-0">
							<Search
								className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 flex-shrink-0"
								style={{ color: colors.textTertiary }}
							/>
							<input
								type="text"
								placeholder="Search announcements..."
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
							{/* Filter Button */}
							<button
								onClick={() => setShowFilters(!showFilters)}
								className="px-3 sm:px-4 py-2.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap text-sm sm:text-base"
								style={{
									backgroundColor: showFilters
										? colors.info
										: colors.bgPrimary,
									color: showFilters ? "white" : colors.textSecondary,
									border: `1px solid ${
										showFilters ? colors.info : "#cbd5e1"
									}`,
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
									onClick={() => setSearchQuery("")}
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
							<div>
								<p
									className={`${typography.labelSmall} uppercase mb-3 sm:mb-4 font-bold`}
									style={{ color: colors.textPrimary }}
								>
									Sort By
								</p>
								<select
									value={sortBy}
									onChange={(e) => setSortBy(e.target.value)}
									className="w-full px-3 sm:px-4 py-2 rounded-lg border font-medium focus:outline-none focus:ring-2 transition-all text-sm sm:text-base"
									style={{
										backgroundColor: colors.bgSecondary,
										borderColor: "#cbd5e1",
										color: colors.textPrimary,
										borderWidth: "1px",
									}}
								>
									{SORT_OPTIONS.map((option) => (
										<option key={option} value={option}>
											{option}
										</option>
									))}
								</select>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Announcements List */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{filteredAnnouncements.length > 0 ? (
					<div className="space-y-4">
						{filteredAnnouncements.map((announcement) => (
							<AnnouncementCard key={announcement.id} {...announcement} />
						))}
					</div>
				) : (
					<EmptyState />
				)}
			</div>
		</div>
	)
}

function EmptyState() {
	return (
		<div className="text-center py-16">
			<Filter
				className="w-12 h-12 mx-auto mb-4"
				style={{ color: colors.textTertiary }}
			/>
			<h3
				className={`${typography.h3} mb-2`}
				style={{ color: colors.textSecondary }}
			>
				No announcements found
			</h3>
			<p
				className={typography.bodySmall}
				style={{ color: colors.textTertiary }}
			>
				Try adjusting your search
			</p>
		</div>
	)
}