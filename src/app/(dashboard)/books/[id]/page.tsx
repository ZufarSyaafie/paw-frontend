"use client"

import { Button } from "@/components/ui/button"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Check, X, Clock, Loader2, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { getAuthToken } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL

const STATUS_CONFIG = {
  available: {
    label: "Available",
    icon: Check,
    color: "bg-green-50 text-green-700 border-green-200",
    buttonColor: "bg-cyan-500 hover:bg-cyan-600",
  },
  rented: { 
    label: "Rented",
    icon: Clock,
    color: "bg-yellow-50 text-yellow-700 border-yellow-200",
    buttonColor: "bg-gray-400 cursor-not-allowed",
  },
  unavailable: {
    label: "Unavailable",
    icon: X,
    color: "bg-red-50 text-red-700 border-red-200",
    buttonColor: "bg-gray-400 cursor-not-allowed",
  },
} as const

// Mock data (FALLBACK)
const MOCK_BOOK: any = { 
  id: "MOCK-123",
  title: "The Great Gatsby (Mock Fallback)",
  author: "F. Scott Fitzgerald",
  cover: "https://images.unsplash.com/photo-1543002588-d83cedbc4d60?w=400&h=600&fit=crop",
  category: "Fiction",
  year: 1925,
  synopsis: "A classic American novel set in the Jazz Age.", // BE pake synopsis
  publisher: "Scribner",
  location: "Rak A-1", 
  status: "available",
  stock: 5,
}

export default function BookDetailPage() {
  const router = useRouter()
  const params = useParams()
  const bookId = params.id as string

  const [book, setBook] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isBorrowing, setIsBorrowing] = useState(false)

  useEffect(() => {
    const fetchBook = async () => {
      const token = getAuthToken()
      if (!token) {
        setError("Authentication required.")
        setIsLoading(false)
        return
      }

      try {
        if (!bookId) throw new Error("Book ID is required.");
        
        const response = await fetch(`${API_URL}/api/books/${bookId}`, {
          headers: { "Authorization": `Bearer ${token}` }
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Book not found.")
        }

        const data = await response.json() 
        
        if (!data.status) {
            data.status = data.stock > 0 ? "available" : "unavailable";
        }

        setBook(data)

      } catch (err: any) {
        console.error(err)
        setError(err.message || "Failed to load book details.")
        setBook(MOCK_BOOK) // Fallback ke Mock Data jika Gagal
      } finally {
        setIsLoading(false)
      }
    }

    if (bookId) fetchBook()
  }, [bookId])


  const handleBorrow = async () => {
    if (!book || book.status !== 'available' || book.stock <= 0) return

    setIsBorrowing(true)
    setError(null)
    const token = getAuthToken()

    try {
      const response = await fetch(`${API_URL}/api/books/${bookId}/borrow`, {
        method: 'POST',
         headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Borrowing failed.")
      }

      // Sukses: Redirect ke Midtrans
      if (data.payment_url) {
        alert("Borrow request created. Redirecting to Midtrans for deposit payment.")
        window.location.href = data.payment_url
      } else {
        alert("Borrow request successful, but no payment required. Check loans page.")
         router.push("/loans")
      }

    } catch (err: any) {
      setError(err.message || "Failed to process borrowing.")
      alert(`Borrow failed: ${err.message}`)
    } finally {
      setIsBorrowing(false)
    }
  }


  if (isLoading) return (
    <div className="flex justify-center items-center h-screen">
      <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
      <p className="ml-3 text-gray-600 font-medium">Loading book details...</p>
    </div>
  )

  if (error || !book) return (
    <div className="p-12 text-center">
      <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
      <h3 className="font-semibold text-red-800 mb-1">Error</h3>
      <p className="text-sm text-red-700">{error || `Book with ID ${bookId} not found.`}</p>
    </div>
  )

  // Tentukan status
  const statusInfo = STATUS_CONFIG[book.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.unavailable
  const StatusIcon = statusInfo.icon

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Back Button */}
      <div className="sticky top-16 z-40 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
           >
            <ArrowLeft className="w-4 h-4" />
            Back to Books
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-6">
                <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
 
          {/* Left: Book Cover */}
          <div className="md:col-span-1">
            <div className="sticky top-32">
              {/* gada book cover di book.js (be)*/}
              <img
                src={book.cover || "https://via.placeholder.com/400x600?text=No+Cover+Available"}
                alt={book.title}
                className="w-full rounded-lg shadow-lg object-cover aspect-[2/3]"
              />

              {/* Status Badge */}
              <div className={`mt-4 px-3 py-2 rounded-lg border flex items-center gap-2 ${statusInfo.color}`}>
                <StatusIcon className="w-4 h-4" />
                <span className="font-semibold text-sm">{statusInfo.label}</span>
              </div>

              {/* Stock Info */}
              <div className="mt-3 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="text-sm font-semibold text-slate-700">Stock: {book.stock}</p>
              </div>

              {/* Borrow Button */}
              <Button
                onClick={handleBorrow}
                disabled={isBorrowing || book.status !== "available" || book.stock <= 0}
                className={`w-full mt-4 py-3 text-white font-bold rounded-lg transition-all ${book.status === "available" ? statusInfo.buttonColor : "bg-gray-400 cursor-not-allowed"}`}
              >
                {isBorrowing ? "Processing..." : book.stock <= 0 ? "Out of Stock" : "Borrow Now (Deposit Rp 25k)"}
              </Button>
            </div>
          </div>

          {/* Right: Book Details */}
          <div className="md:col-span-2 space-y-8">
            {/* Title Section */}
             <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                  {book.category || "Uncategorized"}
                </span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">{book.title}</h1>
              <p className="text-lg text-gray-600">{book.author}</p>
            </div>

            {/* Description */}
            <div>
              {/* gada book longDesc di book.js (be)*/}
              <p className="text-gray-700 leading-relaxed text-base">
                {book.synopsis || "No synopsis available for this book."}
              </p>
            </div>

            {/* Info Grid */}
            <BookInfoGrid book={book} />

            {/* Additional Info */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Additional Details (Synopsis)</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {book.synopsis || "No additional details available."}
              </p>
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
    // BE (Book.js) TIDAK PUNYA 'pages', kita ganti ke 'location'
    { label: "Location", value: book.location || "N/A" },
    // BE (Book.js) TIDAK PUNYA 'isbn', kita ganti ke 'category'
    { label: "Category", value: book.category || "N/A" },
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