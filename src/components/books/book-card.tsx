"use client"

import { useState } from "react"
import Link from "next/link"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { typography } from "@/styles/typography"
import { colors } from "@/styles/colors"

type BookCardProps = {
  id: string
  title: string
  author: string
  cover?: string
  stock: number
}

export default function BookCard({
  id,
  title,
  author,
  cover,
  stock
}: BookCardProps) {
  const isInStock = stock > 0
  const [showCoverPreview, setShowCoverPreview] = useState(false)

  return (
    <>
      <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full hover:scale-[1.02]">
        {/* Cover Buku - Full Portrait tanpa kepotong */}
        <div
          className="relative bg-slate-100 overflow-hidden cursor-pointer group flex items-center justify-center"
          style={{ aspectRatio: "3/4", minHeight: "200px" }}
        >
          <img
            src={cover || "https://via.placeholder.com/250x350?text=No+Cover"}
            alt={title}
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
            draggable={false}
          />
          
          {/* Overlay untuk preview */}
          <div 
            className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center"
            onClick={(e) => {
              e.preventDefault()
              setShowCoverPreview(true)
            }}
          >
            <button
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-4 py-2 bg-white text-slate-900 rounded-lg font-semibold text-sm"
              onClick={(e) => {
                e.preventDefault()
                setShowCoverPreview(true)
              }}
            >
              Preview
            </button>
          </div>
        </div>

        {/* Konten Buku */}
        <div className="p-3 flex flex-col flex-grow">
          {/* Judul */}
          <Link
            href={`/books/${id}`}
            className="hover:transition-colors line-clamp-2"
            style={{ color: colors.primary }}
          >
            <h3 className={`${typography.bodySmall} font-bold`}>
              {title}
            </h3>
          </Link>

          {/* Penulis */}
          <p className={`${typography.labelSmall} mt-1 line-clamp-1`} style={{ color: colors.textSecondary }}>
            {author}
          </p>

          {/* Status stok */}
          <div className="mt-2 mb-2">
            {isInStock ? (
              <Badge
                variant="outline"
                className="text-emerald-600 border-emerald-200 bg-emerald-50 text-xs py-0.5"
              >
                ✓ {stock}
              </Badge>
            ) : (
              <Badge
                variant="destructive"
                className="bg-red-100 text-red-600 border-red-200 text-xs py-0.5"
              >
                Out of Stock
              </Badge>
            )}
          </div>

          {/* Button View Details */}
          <Link
            href={`/books/${id}`}
            className="mt-auto w-full text-center font-bold py-1.5 rounded-md transition-all transform hover:shadow-md hover:-translate-y-0.5 text-sm"
            style={{
              backgroundColor: isInStock ? colors.primary : "#d1d5db",
              color: isInStock ? "white" : "#6b7280",
              cursor: isInStock ? "pointer" : "not-allowed",
              pointerEvents: isInStock ? "auto" : "none",
            }}
          >
            View Details
          </Link>
        </div>
      </div>

      {/* Cover Preview Modal - Full Size Portrait */}
      {showCoverPreview && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setShowCoverPreview(false)}
        >
          <div 
            className="relative bg-white rounded-xl shadow-2xl flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "90vw", maxHeight: "90vh" }}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowCoverPreview(false)}
              className="absolute -top-10 right-0 p-2 hover:bg-white/20 rounded-full transition-colors z-10"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Cover Image - Full Portrait tanpa kepotong */}
            <div 
              className="bg-slate-100 flex items-center justify-center overflow-hidden rounded-t-xl w-full"
              style={{ 
                aspectRatio: "3/4",
                maxHeight: "calc(90vh - 200px)"
              }}
            >
              <img
                src={cover || "https://via.placeholder.com/300x450?text=No+Cover"}
                alt={title}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Info di bawah cover */}
            <div className="p-6 w-full text-center border-t border-slate-200">
              <h2 className={`${typography.h3}`} style={{ color: colors.textPrimary }}>
                {title}
              </h2>
              <p 
                className={`${typography.bodySmall} mt-2 mb-4`}
                style={{ color: colors.textSecondary }}
              >
                by {author}
              </p>
              
              <div className="mb-4 flex justify-center">
                {isInStock ? (
                  <Badge
                    variant="outline"
                    className="text-emerald-600 border-emerald-200 bg-emerald-50"
                  >
                    ✓ Stock: {stock}
                  </Badge>
                ) : (
                  <Badge
                    variant="destructive"
                    className="bg-red-100 text-red-600 border-red-200"
                  >
                    ✗ Out of Stock
                  </Badge>
                )}
              </div>

              <Link
                href={`/books/${id}`}
                className="inline-block font-bold py-2 px-6 rounded-lg transition-all transform hover:shadow-md hover:-translate-y-0.5"
                style={{
                  backgroundColor: colors.primary,
                  color: "white",
                }}
              >
                View Full Details
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
