"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Search, Filter, X, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import BookCard from "@/components/books/book-card"
import { typography } from "@/styles/typography"
import { colors } from "@/styles/colors"
import type { Book } from "@/types"
import { getAuthToken } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function BooksPage() {
    const [books, setBooks] = useState<Book[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [categories, setCategories] = useState<string[]>(["All"])
    const [searchQuery, setSearchQuery] = useState("")
    const [activeSearch, setActiveSearch] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("All")
    const [selectedStatus, setSelectedStatus] = useState("All")
    const [sortBy, setSortBy] = useState<"title" | "author" | "year">("title")
    const [showFilters, setShowFilters] = useState(false)

    const fetchBooks = useCallback(async () => {
        const token = getAuthToken()
        setIsLoading(true)
        setError(null)

        const queryParams = new URLSearchParams()
        if (activeSearch) queryParams.append("search", activeSearch)
        if (selectedCategory !== "All") queryParams.append("category", selectedCategory)
        if (selectedStatus !== "All") queryParams.append("status", selectedStatus)

        try {
            const headers: HeadersInit = {}
            if (token) headers["Authorization"] = `Bearer ${token}`

            const response = await fetch(`${API_URL}/api/books?${queryParams.toString()}`, { headers })
            if (!response.ok) {
                let errorMessage = "Failed to fetch books."
                try {
                    const errorData = await response.json()
                    errorMessage = errorData.message || errorMessage
                } catch {
                    errorMessage = `Server Error (${response.status}).`
                }
                throw new Error(errorMessage)
            }

            const data = await response.json()
            setBooks(data.data || data || [])
        } catch (err: any) {
            console.error("Fetch Books Error:", err)
            setError(err.message || "Failed to load books. Please check backend status.")
            setBooks([])
        } finally {
            setIsLoading(false)
        }
    }, [activeSearch, selectedCategory, selectedStatus])

    useEffect(() => {
        const fetchCategories = async () => {
            const token = getAuthToken()
            const headers: HeadersInit = {}
            if (token) headers["Authorization"] = `Bearer ${token}`

            try {
                const resp = await fetch(`${API_URL}/api/books/categories/top?limit=10`, { headers })
                if (resp.ok) {
                    const data = await resp.json()
                    if (Array.isArray(data) && data.length > 0) {
                        const cats = data.map((c: any) => (typeof c === "string" ? c : c.category || c.name)).filter(Boolean)
                        setCategories(["All", ...Array.from(new Set(cats)).slice(0, 10)])
                        return
                    }
                }
            } catch {
            }

            try {
                const resp = await fetch(`${API_URL}/api/books/categories`, { headers })
                if (resp.ok) {
                    const data = await resp.json()
                    if (Array.isArray(data) && data.length > 0) {
                        setCategories(["All", ...Array.from(new Set(data)).slice(0, 10)])
                        return
                    }
                }
            } catch {
            }

            try {
                const resp = await fetch(`${API_URL}/api/books?limit=1000`, { headers })
                if (resp.ok) {
                    const result = await resp.json()
                    const allBooks: Book[] = result.data || []
                    const counts: Record<string, number> = {}
                    allBooks.forEach((b: any) => {
                        if (Array.isArray(b.categories)) {
                            b.categories.forEach((c: string) => {
                                if (c) counts[c] = (counts[c] || 0) + 1
                            })
                        } else if (b.category) {
                            counts[b.category] = (counts[b.category] || 0) + 1
                        }
                    })
                    const sorted = Object.entries(counts)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 10)
                        .map(([cat]) => cat)
                    if (sorted.length > 0) {
                        setCategories(["All", ...sorted])
                        return
                    }
                }
            } catch {
            }

            setCategories(["All"])
        }

        fetchCategories()
    }, [])

    useEffect(() => {
        fetchBooks()
    }, [selectedCategory, selectedStatus, activeSearch, fetchBooks])

    // const handleSearchSubmit = (e: React.FormEvent) => {
    //     e.preventDefault()
    //     setActiveSearch(searchQuery)
    // }

    const handleClearFilters = () => {
        setSearchQuery("")
        setActiveSearch("")
        setSelectedCategory("All")
        setSelectedStatus("All")
    }

    const sortedBooks = useMemo(() => {
        return [...books].sort((a, b) => {
            if (sortBy === "title") return (a.title || "").localeCompare(b.title || "")
            if (sortBy === "author") return (a.author || "").localeCompare(b.author || "")
            return (b.year || 0) - (a.year || 0)
        })
    }, [books, sortBy])

    const hasActiveFilters = selectedCategory !== "All" || selectedStatus !== "All" || activeSearch !== ""

    return (
        <div className="min-h-screen" style={{ backgroundColor: colors.bgPrimary }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="py-8 border-b" style={{ borderBottomColor: "#e2e8f0" }}>
                    <h1 className={`${typography.h1}`} style={{ color: colors.textPrimary }}>
                        Books
                    </h1>
                    <p className={`${typography.bodySmall} mt-2`} style={{ color: colors.textSecondary }}>
                        {sortedBooks.length} results found
                    </p>
                </div>

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
									placeholder="Search book..."
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
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                                <div>
                                    <p className={`${typography.labelSmall} uppercase mb-3 sm:mb-4 font-bold`} style={{ color: colors.textPrimary }}>
                                        Category
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map((cat) => (
                                            <button
                                                key={cat}
                                                onClick={() => setSelectedCategory(cat)}
                                                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all border whitespace-nowrap"
                                                style={{
                                                    backgroundColor: selectedCategory === cat ? colors.info : colors.bgSecondary,
                                                    color: selectedCategory === cat ? "white" : colors.textSecondary,
                                                    borderColor: selectedCategory === cat ? colors.info : "#cbd5e1",
                                                    borderWidth: "1px",
                                                }}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <p className={`${typography.labelSmall} uppercase mb-3 sm:mb-4 font-bold`} style={{ color: colors.textPrimary }}>
                                        Status
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {["All", "available", "unavailable"].map((status) => (
                                            <button
                                                key={status}
                                                onClick={() => setSelectedStatus(status)}
                                                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all border whitespace-nowrap capitalize"
                                                style={{
                                                    backgroundColor: selectedStatus === status ? colors.info : colors.bgSecondary,
                                                    color: selectedStatus === status ? "white" : colors.textSecondary,
                                                    borderColor: selectedStatus === status ? colors.info : "#cbd5e1",
                                                    borderWidth: "1px",
                                                }}
                                            >
                                                {status === "All" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
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

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {isLoading ? (
                    <div className="flex justify-center items-center h-48">
                        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
                        <p className="ml-3 text-gray-600 font-medium">Loading books...</p>
                    </div>
                ) : error ? (
                    <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center flex flex-col items-center">
                        <AlertCircle className="w-8 h-8 text-red-600 mb-3" />
                        <h3 className="font-semibold text-red-800 mb-1">Error Loading Data</h3>
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                ) : sortedBooks.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {sortedBooks.map((book) => (
                            <BookCard
                                key={(book.id || book._id) as string}
                                id={(book.id || book._id) as string}
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
