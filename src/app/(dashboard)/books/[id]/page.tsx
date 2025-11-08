"use client"

import { Button } from "@/components/ui/button"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Check, X, Clock } from "lucide-react"
import { useState } from "react"
import type { BookDetail } from "@/types"

const STATUS_CONFIG = {
  available: {
    label: "Available",
    icon: Check,
    color: "bg-green-50 text-green-700 border-green-200",
    buttonColor: "bg-blue-500 hover:bg-blue-600",
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
}

const MOCK_BOOK: BookDetail = {
  id: "",
  title: "The Great Gatsby",
  author: "F. Scott Fitzgerald",
  cover: "https://images.unsplash.com/photo-1543002588-d83cedbc4d60?w=400&h=600&fit=crop",
  isbn: "978-0743273565",
  category: "Fiction",
  year: 1925,
  description: "A classic American novel set in the Jazz Age.",
  longDescription:
    "Set in the Jazz Age on Long Island, this novel follows the mysterious millionaire Jay Gatsby and his obsessive love for the beautiful Daisy Buchanan. Through the eyes of the narrator Nick Carraway, Fitzgerald explores themes of wealth, love, and the American Dream. The story unfolds across lavish parties and hidden sorrows, revealing the emptiness beneath the glittering surface of 1920s society.",
  publisher: "Scribner",
  pages: 180,
  status: "available",
  stock: 5,
}

export default function BookDetailPage() {
  const router = useRouter()
  const params = useParams()
  const bookId = params.id as string

  const book = { ...MOCK_BOOK, id: bookId }
  const [isBorrowing, setIsBorrowing] = useState(false)

  const handleBorrow = async () => {
    setIsBorrowing(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    alert("Book borrowed successfully!")
    setIsBorrowing(false)
  }

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Left: Book Cover */}
          <div className="md:col-span-1">
            <div className="sticky top-32">
              <img
                src={book.cover}
                alt={book.title}
                className="w-full rounded-lg shadow-lg object-cover aspect-[2/3]"
              />

              {/* Status Badge */}
              <div className={`mt-4 px-3 py-2 rounded-lg border flex items-center gap-2 ${statusInfo.color}`}>
                <StatusIcon className="w-4 h-4" />
                <span className="font-semibold text-sm">{statusInfo.label}</span>
              </div>

              {/* Stock Info */}
              <div className="mt-3 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-semibold text-green-700">Stock: {book.stock}</p>
              </div>

              {/* Borrow Button */}
              <Button
                onClick={handleBorrow}
                disabled={isBorrowing || book.status !== "available"}
                className={`w-full mt-4 py-3 text-white font-bold rounded-lg transition-all ${statusInfo.buttonColor}`}
              >
                {isBorrowing ? "Processing..." : "Borrow Now"}
              </Button>
            </div>
          </div>

          {/* Right: Book Details */}
          <div className="md:col-span-2 space-y-8">
            {/* Title Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                  {book.category}
                </span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">{book.title}</h1>
              <p className="text-lg text-gray-600">{book.author}</p>
            </div>

            {/* Description */}
            <div>
              <p className="text-gray-700 leading-relaxed text-base">{book.longDescription}</p>
            </div>

            {/* Info Grid */}
            <BookInfoGrid book={book} />

            {/* Additional Info */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">About This Book</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                This is a classic work of literature that explores timeless themes of love, ambition, and the pursuit of dreams. Perfect for readers who appreciate literary fiction and deep character development.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface BookInfoGridProps {
  book: BookDetail
}

function BookInfoGrid({ book }: BookInfoGridProps) {
  const info = [
    { label: "Publisher", value: book.publisher },
    { label: "Year Published", value: book.year },
    { label: "Pages", value: book.pages },
    { label: "ISBN", value: book.isbn },
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