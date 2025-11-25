"use client"

import { Button } from "@/components/ui/button"
import { Plus, Search, Filter, Loader2, BookOpen, AlertCircle, X } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { typography } from "@/styles/typography"
import { LoanCard } from "@/components/loans/LoanCard"
import type { Loan } from "@/types"
import { getAuthToken } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { colors } from "@/styles/colors"

const API_URL = process.env.NEXT_PUBLIC_API_URL

const MOCK_LOANS: Loan[] = [
  {
    id: "L-001",
    user: { id: "U-001", email: "user@test.com" },
    book: {
      id: "B-001",
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      image: "https://images.unsplash.com/photo-1544947953-cd827b594b2a?w=400&h=600&fit=crop",
      cover: "https://images.unsplash.com/photo-1544947953-cd827b594b2a?w=400&h=600&fit=crop",
    },
    depositAmount: 25000,
    paymentStatus: "paid",
    refundStatus: "pending",
    midtransOrderId: "loan-xxx",
    borrowDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    returnDate: undefined,
    status: "borrowed",
    createdAt: new Date().toISOString(),
  },
  {
    id: "L-002",
    user: { id: "U-001", email: "user@test.com" },
    book: {
      id: "B-002",
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      image: "https://images.unsplash.com/photo-1549227092-1c2543d234a5?w=400&h=600&fit=crop",
      cover: "https://images.unsplash.com/photo-1549227092-1c2543d234a5?w=400&h=600&fit=crop",
    },
    depositAmount: 25000,
    paymentStatus: "paid",
    refundStatus: "refunded",
    midtransOrderId: "loan-yyy",
    borrowDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    returnDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: "returned",
    createdAt: new Date().toISOString(),
  },
]

export default function LoansPage() {
  const router = useRouter()
  const [loans, setLoans] = useState<Loan[]>(MOCK_LOANS)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState("dueDateDesc")

  useEffect(() => {
    let cancelled = false
    let activeController: AbortController | null = null

    const fetchLoans = async (showLoading = false) => {
      if (showLoading) setIsLoading(true)

      try {
        if (activeController) activeController.abort()
        const controller = new AbortController()
        activeController = controller

        const token = getAuthToken()
        const headers: Record<string, string> = {}
        if (token) headers["Authorization"] = `Bearer ${token}`

        const res = await fetch(`${API_URL}/api/loans/my`, {
          headers,
          credentials: "include",
          signal: controller.signal,
        })

        if (!res.ok) {
          const errData = await res.json().catch(() => null)
          throw new Error(errData?.message || "failed to fetch loan history")
        }

        const data = await res.json()
        if (!cancelled) {
          setLoans(data || [])
          setError(null)
        }
      } catch (err: any) {
        if (!cancelled) {
          if (err.name === "AbortError") {
            // ignore abort
          } else {
            setError(err.message || "failed to load loan history.")
          }
        }
      } finally {
        if (!cancelled && showLoading) setIsLoading(false)
      }
    }

    fetchLoans(true)

    const onFocus = () => fetchLoans(false)
    const onVisibility = () => {
      if (document.visibilityState === "visible") fetchLoans(false)
    }

    window.addEventListener("focus", onFocus)
    document.addEventListener("visibilitychange", onVisibility)

    const interval = setInterval(() => fetchLoans(false), 5000)

    return () => {
      cancelled = true
      if (activeController) activeController.abort()
      window.removeEventListener("focus", onFocus)
      document.removeEventListener("visibilitychange", onVisibility)
      clearInterval(interval)
    }
  }, [])

  const filteredLoans = useMemo(() => {
    let list = loans.map((loan) => {
      let status = loan.status as "borrowed" | "returned" | "overdue"
      const isOverdue = status === "borrowed" && new Date(loan.dueDate) < new Date()
      if (isOverdue) status = "overdue"
      return { ...loan, status }
    })
    if (filter !== "all") {
      list = list.filter((loan) => {
        if (filter === "borrowed") return loan.status === "borrowed"
        if (filter === "returned") return loan.status === "returned"
        if (filter === "overdue") return loan.status === "overdue"
        return false
      })
    }
    if (searchTerm) {
      list = list.filter(
        (loan) =>
          loan.book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (loan.book.author || "").toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    return list
  }, [loans, filter, searchTerm])

  const sortedLoans = useMemo(() => {
    return [...filteredLoans].sort((a, b) => {
      const dateA = new Date(a.dueDate).getTime()
      const dateB = new Date(b.dueDate).getTime()
      const borrowA = new Date(a.borrowDate).getTime()
      const borrowB = new Date(b.borrowDate).getTime()
      if (sortBy === "dueDateDesc") return dateB - dateA
      if (sortBy === "dueDateAsc") return dateA - dateB
      if (sortBy === "borrowDate") return borrowB - borrowA
      return 0
    })
  }, [filteredLoans, sortBy])

  const hasActiveFilters = filter !== "all" || searchTerm !== ""
  const handleClearFilters = () => {
    setSearchTerm("")
    setFilter("all")
    setSortBy("dueDateDesc")
  }

  const filterOptions = [
    { label: "All", value: "all" },
    { label: "Borrowed", value: "borrowed" },
    { label: "Returned", value: "returned" },
    { label: "Overdue", value: "overdue" },
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.bgPrimary }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="py-8 border-b flex items-start sm:items-center justify-between gap-4" style={{ borderBottomColor: "#e2e8f0" }}>
          <div>
            <h1 className={`${typography.h1}`} style={{ color: colors.textPrimary }}>
              My Book Loans
            </h1>
            <p className={`${typography.bodySmall} mt-2`} style={{ color: colors.textSecondary }}>
              {sortedLoans.length} loan{sortedLoans.length !== 1 ? "s" : ""} found
            </p>
          </div>
          <Button
            onClick={() => router.push("/books")}
            className="flex-shrink-0 px-3 sm:px-4 py-2.5 rounded-lg font-semibold transition-all flex items-center gap-2 whitespace-nowrap text-sm"
            style={{
              backgroundColor: colors.info,
              color: "white",
              minHeight: "42px",
              padding: "10px 12px",
            }}
          >
            <Plus className="w-5 h-5 flex-shrink-0" />
            <span className="hidden sm:inline">Borrow Book</span>
            <span className="sm:hidden">Borrow</span>
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
                  placeholder="Search title, author..."
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
                        onClick={() => setFilter(option.value)}
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
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 rounded-lg border font-medium focus:outline-none focus:ring-2 transition-all text-sm sm:text-base"
                    style={{
                      backgroundColor: colors.bgSecondary,
                      borderColor: "#cbd5e1",
                      color: colors.textPrimary,
                      borderWidth: "1px",
                    }}
                  >
                    <option value="dueDateDesc">Due Date (Farthest)</option>
                    <option value="dueDateAsc">Due Date (Soonest)</option>
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
            <p className="ml-3 text-gray-600 font-medium">Loading loan history...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center flex flex-col items-center">
            <AlertCircle className="w-8 h-8 text-red-600 mb-3" />
            <h3 className="font-semibold text-red-800 mb-1">Error Loading Data</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        ) : sortedLoans.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedLoans.map((loan) => (
              <LoanCard key={loan.id || (loan._id as string)} loan={loan as Loan} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 mx-auto mb-4" style={{ color: colors.textTertiary }} />
            <h3 className={`${typography.h3} mb-2`} style={{ color: colors.textSecondary }}>
              No Loans Found
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
