"use client"

import { Button } from "@/components/ui/button"
import { Plus, Search, Filter, Loader2, BookOpen, AlertCircle } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { typography } from "@/styles/typography"
import { LoanCard } from "@/components/loans/LoanCard" 
import type { Loan } from "@/types"
import { getAuthToken } from "@/lib/auth" 
import { useRouter } from "next/navigation"

const API_URL = process.env.NEXT_PUBLIC_API_URL

type FrontendLoan = Loan & { status: "borrowed" | "returned" | "overdue" };

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
        depositAmount: 25000, paymentStatus: "paid", refundStatus: "pending", midtransOrderId: "loan-xxx",
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
        depositAmount: 25000, paymentStatus: "paid", refundStatus: "refunded", midtransOrderId: "loan-yyy",
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
    const [filter, setFilter] = useState("all") // 'all', 'borrowed', 'returned', 'overdue'

    useEffect(() => {
        const fetchLoans = async () => {
            const token = getAuthToken()
            if (!token) {
                setError("Authentication required. Please log in again.")
                setIsLoading(false)
                return
            }
            setIsLoading(true)

            try {
                const response = await fetch(`${API_URL}/api/loans/my`, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                })
                
                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.message || "Failed to fetch loan history.")
                }

                const data = await response.json()
                setLoans(data || []) 
            } catch (err: any) {
                console.error("Fetch Loans Error:", err)
                setError(err.message || "Failed to load loan history.")
            } finally {
                setIsLoading(false)
            }
        }

        fetchLoans()
    }, [])

    const filteredLoans = useMemo(() => {
        let list = loans.map(loan => {
            let status = loan.status as "borrowed" | "returned" | "overdue";
            
            const isOverdue = status === "borrowed" && new Date(loan.dueDate) < new Date()
            if (isOverdue) {
                status = "overdue"
            }

            return { ...loan, status: status } as FrontendLoan 
        })

        if (filter !== "all") {
            list = list.filter(loan => {
                const loanStatus = loan.status;

                if (filter === "borrowed") return loanStatus === "borrowed"
                if (filter === "returned") return loanStatus === "returned"
                if (filter === "overdue") return loanStatus as string === "overdue" 
                return false
            })
        }

        if (searchTerm) {
            list = list.filter(loan =>
                loan.book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                loan.book.author.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }
        return list
    }, [loans, filter, searchTerm])

    const filterOptions = [
        { label: "All", value: "all" },
        { label: "Borrowed", value: "borrowed" },
        { label: "Returned", value: "returned" },
        { label: "Overdue", value: "overdue" },
    ]

    return (
        <div className="space-y-8 p-4 sm:p-6 lg:p-8">
            <header className="flex justify-between items-center">
                <h1 className={typography.h1}>My Loans</h1>
                <Button
                    onClick={() => router.push('/books')}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Borrow Book
                </Button>
            </header>

            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search book title or author..."
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
                    <p className="ml-3 text-gray-600 font-medium">Loading loan history...</p>
                </div>
            ) : error ? (
                <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center flex flex-col items-center">
                    <AlertCircle className="w-8 h-8 text-red-600 mb-3" />
                    <h3 className="font-semibold text-red-800 mb-1">Error Loading Data</h3>
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            ) : filteredLoans.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredLoans.map(loan => (
                        <LoanCard key={loan.id} loan={loan as Loan} />
                    ))}
                </div>
            ) : (
                <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
                    <BookOpen className="w-8 h-8 text-gray-500 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-800 mb-1">No Loans Found</h3>
                    <p className="text-sm text-gray-600">You currently have no loans matching the filter.</p>
                </div>
            )}
        </div>
    )
}