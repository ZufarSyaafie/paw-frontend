"use client"

import { Button } from "@/components/ui/button"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Check, X, Clock, Loader2, AlertCircle } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { getAuthToken } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ""

const STATUS_CONFIG_LOAN = {
  available: { label: "Available", icon: Check, color: "text-green-700 border-green-200", buttonColor: "bg-cyan-500 hover:bg-cyan-600" },
  unavailable: { label: "Unavailable", icon: X, color: "text-red-700 border-red-200", buttonColor: "bg-gray-400 cursor-not-allowed" },
  pending: { label: "Pending Payment", icon: Clock, color: "text-amber-700 border-amber-200", buttonColor: "bg-gray-400 cursor-not-allowed" },
  borrowed: { label: "Rented (Active)", icon: Clock, color: "text-cyan-700 border-cyan-200", buttonColor: "bg-gray-400 cursor-not-allowed" },
  overdue: { label: "Overdue", icon: X, color: "text-red-700 border-red-200", buttonColor: "bg-gray-400 cursor-not-allowed" },
} as const

const MOCK_BOOK: any = {
  id: "MOCK-123",
  title: "The Great Gatsby (Mock Fallback)",
  author: "F. Scott Fitzgerald",
  cover: "https://images.unsplash.com/photo-1543002588-d83cedbc4d60?w=400&h=600&fit=crop",
  category: "Fiction",
  year: 1925,
  synopsis: "A classic American novel set in the Jazz Age.",
  publisher: "Scribner",
  location: "Rak A-1",
  isbn: "978-0123456789",
  status: "available",
  stock: 5,
}

type DisplayStatusKey = keyof typeof STATUS_CONFIG_LOAN

export default function BookDetailPage() {
  const router = useRouter()
  const params = useParams()
  const bookId = params?.id as string

  const [book, setBook] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isBorrowing, setIsBorrowing] = useState(false)
  const [displayStatusKey, setDisplayStatusKey] = useState<DisplayStatusKey>("unavailable")

  const fetchBookAndLoanStatus = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    const token = getAuthToken()
    if (!token) {
      setError("Authentication required.")
      setBook(MOCK_BOOK)
      setDisplayStatusKey("unavailable")
      setIsLoading(false)
      return
    }

    try {
      if (!bookId) throw new Error("Book ID is required.")
      const bookRes = await fetch(`${API_URL}/api/books/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!bookRes.ok) {
        throw new Error("Book not found.")
      }
      const bookData = await bookRes.json()
      let finalStatusKey: DisplayStatusKey
      const loanRes = await fetch(`${API_URL}/api/loans/status?bookId=${bookId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (loanRes.ok) {
        const loanData = await loanRes.json()
        if (loanData.status === "overdue") {
          finalStatusKey = "overdue"
        } else if (loanData.paymentStatus === "unpaid") {
          finalStatusKey = "pending"
        } else {
          finalStatusKey = "borrowed"
        }
      } else {
        finalStatusKey = bookData.stock > 0 ? "available" : "unavailable"
      }
      bookData.status = bookData.stock > 0 ? "available" : "unavailable"
      setBook(bookData)
      setDisplayStatusKey(finalStatusKey)
    } catch (err: any) {
      console.error(err)
      setError(err?.message || "Failed to load book details.")
      setBook(MOCK_BOOK)
      setDisplayStatusKey(MOCK_BOOK.stock > 0 ? "available" : "unavailable")
    } finally {
      setIsLoading(false)
    }
  }, [bookId])

  useEffect(() => {
    if (bookId) fetchBookAndLoanStatus()
    else {
      setError("Invalid book ID.")
      setIsLoading(false)
    }
  }, [bookId, fetchBookAndLoanStatus])

  const handleBorrow = async () => {
    if (displayStatusKey !== "available") return
    setIsBorrowing(true)
    setError(null)
    const token = getAuthToken()
    if (!token) {
      alert("Authentication required.")
      setIsBorrowing(false)
      return
    }
    try {
      const response = await fetch(`${API_URL}/api/books/${bookId}/borrow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data?.message || "Borrowing failed.")
      }
      if (data?.payment_url) {
        alert("Borrow request created. Redirecting to payment.")
        window.location.href = data.payment_url
      } else {
        alert("Borrow request successful. Checking loans page.")
        router.push("/loans")
      }
    } catch (err: any) {
      console.error(err)
      setError(err?.message || "Failed to process borrowing.")
      alert(`Borrow failed: ${err?.message || "Unknown error"}`)
    } finally {
      setIsBorrowing(false)
      fetchBookAndLoanStatus()
    }
  }

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
        <p className="ml-3 text-gray-600 font-medium">Loading book details...</p>
      </div>
    )

  if (error || !book)
    return (
      <div className="p-12 text-center">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <h3 className="font-semibold text-red-800 mb-1">Error</h3>
        <p className="text-sm text-red-700">{error || `Book with ID ${bookId} not found.`}</p>
      </div>
    )

  const statusInfo = STATUS_CONFIG_LOAN[displayStatusKey] || STATUS_CONFIG_LOAN.unavailable
  const StatusIcon = statusInfo.icon || X

  return (
    <div className="min-h-screen bg-white">
            <button
                onClick={() => router.back()}
                className="fixed top-24 left-[calc(theme(spacing.4)+1rem)] sm:left-[calc(theme(spacing.6)+1.5rem)] lg:left-[calc(theme(spacing.7)+1rem)] z-40 flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg border border-gray-100 bg-white/80 backdrop-blur-md text-gray-600 hover:text-gray-900 hover:bg-slate-100/80 transition-all font-medium text-sm ring-1 ring-black/5"
            >
                <ArrowLeft className="w-4 h-4" /> 
            </button>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-6">
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-12">
          <div>
            <div className="sticky top-32">
              <img src={book.cover || "https://via.placeholder.com/400x600?text=No+Cover+Available"} alt={book.title} className="w-full rounded-lg shadow-lg object-cover aspect-[2/3]" />

              <div className={`mt-4 px-3 py-2 rounded-lg border flex items-center gap-2 ${statusInfo.color}`}>
                <StatusIcon className="w-4 h-4" />
                <span className="font-semibold text-sm">{statusInfo.label}</span>
              </div>

              <div className="mt-3 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="text-sm font-semibold text-slate-700">Stock: {book.stock}</p>
              </div>

              <Button onClick={handleBorrow} disabled={isBorrowing || displayStatusKey !== "available"} className={`w-full mt-4 py-3 text-white font-bold rounded-lg transition-all ${displayStatusKey === "available" ? statusInfo.buttonColor : "bg-gray-400 cursor-not-allowed"}`}>
                {isBorrowing ? "Processing..." : displayStatusKey === "available" ? "Borrow Now (Deposit Rp 25k)" : statusInfo.label}
              </Button>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">{book.category}</span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">{book.title}</h1>
              <p className="text-lg text-gray-600">{book.author}</p>
            </div>

            <div>
              <p className="text-gray-700 leading-relaxed text-base">{book.synopsis || book.description || "No synopsis available for this book."}</p>
            </div>

            <BookInfoGrid book={book} />

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Loan Policy</h3>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                <li>A refundable deposit of Rp 25,000 is required for borrowing.</li>
                <li>The loan duration is 7 days from the date of borrowing.</li>
                <li>Late returns may result in the forfeiture of the deposit.</li>
                <li>Books must be returned in good condition.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface BookInfoGridProps {
  book: any
}

function BookInfoGrid({ book }: BookInfoGridProps) {
  const info = [
    { label: "Publisher", value: book.publisher || "N/A" },
    { label: "Year Published", value: book.year || "N/A" },
    { label: "Location", value: book.location || "N/A" },
    { label: "ISBN", value: book.isbn || "N/A" },
  ]

  return (
    <div className="grid grid-cols-2 gap-6 py-6 border-y border-gray-100">
      {info.map(({ label, value }) => (
        <div key={label}>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{label}</p>
          <p className="text-gray-900 font-medium text-sm">{value}</p>
        </div>
      ))}
    </div>
  )
}
