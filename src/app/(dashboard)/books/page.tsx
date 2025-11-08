"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import BookCard from "@/components/books/book-card"
import { Search, Filter, X } from "lucide-react"
import { typography } from "@/styles/typography"
import { colors } from "@/styles/colors"
import { spacing } from "@/styles/spacing"
import type { Book } from "@/types"

// Sample books data - hanya 1 buku yang sesuai dengan book detail
const sampleBooks: Book[] = [
	{
		id: "1",
		title: "The Great Gatsby",
		author: "F. Scott Fitzgerald",
		cover: "https://images.unsplash.com/photo-1543002588-d83cedbc4d60?w=400&h=600&fit=crop",
		stock: 5,
		status: "available",
		isbn: "978-0743273565",
		category: "Fiction",
		year: 1925,
		description: "A classic American novel set in the Jazz Age.",
	},
]

const categories = ["All", "Fiction"]
const statuses = ["All", "available"]

export default function BooksPage() {
	const [searchQuery, setSearchQuery] = useState("")
	const [selectedCategory, setSelectedCategory] = useState("All")
	const [selectedStatus, setSelectedStatus] = useState("All")
	const [sortBy, setSortBy] = useState<"title" | "author" | "year">("title")
	const [showFilters, setShowFilters] = useState(false)

	// Filter and search books
	const filteredBooks = useMemo(() => {
		return sampleBooks
			.filter((book) => {
				const matchesSearch =
					book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
					book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
					book.isbn.includes(searchQuery)

				const matchesCategory = selectedCategory === "All" || book.category === selectedCategory
				const matchesStatus = selectedStatus === "All" || book.status === selectedStatus

				return matchesSearch && matchesCategory && matchesStatus
			})
			.sort((a, b) => {
				if (sortBy === "title") {
					return a.title.localeCompare(b.title)
				} else if (sortBy === "author") {
					return a.author.localeCompare(b.author)
				} else {
					return b.year - a.year
				}
			})
	}, [searchQuery, selectedCategory, selectedStatus, sortBy])

	const hasActiveFilters = selectedCategory !== "All" || selectedStatus !== "All" || searchQuery !== ""

	return (
		<div className="min-h-screen" style={{ backgroundColor: colors.bgPrimary }}>
			{/* Header */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Title Section */}
				<div className="py-8 border-b" style={{ borderBottomColor: "#e2e8f0" }}>
					<h1 className={`${typography.h1}`} style={{ color: colors.textPrimary }}>
						Books
					</h1>
					<p className={`${typography.bodySmall} mt-2`} style={{ color: colors.textSecondary }}>
						{filteredBooks.length} results found
					</p>
				</div>

				{/* Search & Filters */}
				<div className="py-6 space-y-4">
					{/* Search Bar & Action Buttons - SELALU SAMPING SAMPINGAN */}
					<div className="flex flex-row items-center justify-between gap-2 sm:gap-3">
						{/* Search Input - Flexible width */}
						<div className="relative flex-1 min-w-0">
							<Search
								className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 flex-shrink-0"
								style={{ color: colors.textTertiary }}
							/>
							<input
								type="text"
								placeholder="Search by title, author, or ISBN..."
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
									onClick={() => {
										setSearchQuery("")
										setSelectedCategory("All")
										setSelectedStatus("All")
									}}
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
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
								{/* Category Filter */}
								<div>
									<p
										className={`${typography.labelSmall} uppercase mb-3 sm:mb-4 font-bold`}
										style={{ color: colors.textPrimary }}
									>
										Category
									</p>
									<div className="flex flex-wrap gap-2">
										{categories.map((cat) => (
											<button
												key={cat}
												onClick={() => setSelectedCategory(cat)}
												className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all border whitespace-nowrap"
												style={{
													backgroundColor:
														selectedCategory === cat
															? colors.info
															: colors.bgSecondary,
													color:
														selectedCategory === cat
															? "white"
															: colors.textSecondary,
													borderColor:
														selectedCategory === cat
															? colors.info
															: "#cbd5e1",
													borderWidth: "1px",
												}}
											>
												{cat}
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
										{statuses.map((status) => (
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

								{/* Sort Filter */}
								<div>
									<p
										className={`${typography.labelSmall} uppercase mb-3 sm:mb-4 font-bold`}
										style={{ color: colors.textPrimary }}
									>
										Sort By
									</p>
									<select
										value={sortBy}
										onChange={(e) => setSortBy(e.target.value as "title" | "author" | "year")}
										className="w-full px-3 sm:px-4 py-2 rounded-lg border font-medium focus:outline-none focus:ring-2 transition-all text-sm sm:text-base"
										style={{
											backgroundColor: colors.bgSecondary,
											borderColor: "#cbd5e1",
											color: colors.textPrimary,
											borderWidth: "1px",
										}}
									>
										<option value="title">Title (A-Z)</option>
										<option value="author">Author (A-Z)</option>
										<option value="year">Year (Newest)</option>
									</select>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Books Grid */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{filteredBooks.length > 0 ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{filteredBooks.map((book) => (
							<BookCard
								key={book.id}
								id={book.id}
								title={book.title}
								author={book.author}
								cover={book.cover}
								stock={book.stock}
							/>
						))}
					</div>
				) : (
					<div className="text-center py-16">
						<Filter className="w-12 h-12 mx-auto mb-4" style={{ color: colors.textTertiary }} />
						<h3 className={`${typography.h3} mb-2`} style={{ color: colors.textSecondary }}>
							No books found
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