"use client"

import { useState } from "react"
import Link from "next/link"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { typography } from "@/styles/typography"
import { colors } from "@/styles/colors"

type BookCardProps = {
  id: string
  _id?: string
  title: string
  author: string
  cover?: string
  stock: number
  status?: string
}

export default function BookCard({
  id,
  _id,
  title,
  author,
  cover,
  stock,
  status = "available"
}: BookCardProps) {
  const [showCoverPreview, setShowCoverPreview] = useState(false)
  const finalId = id || _id

  let displayStatus = "Available"
  let badgeVariant: "outline" | "destructive" | "secondary" = "outline"
  let badgeStyle = {
    color: "#059669",
    borderColor: "#A7F3D0",
    backgroundColor: "#ECFDF5",
  } 

  if (status === "unavailable") {
    displayStatus = "Unavailable"
    badgeVariant = "destructive"
    badgeStyle = { color: "#DC2626", borderColor: "#FECACA", backgroundColor: "#FEF2F2" }
  } 
  else if (stock === 0) {
    displayStatus = "Out of Stock"
    badgeVariant = "secondary"
    badgeStyle = { color: "#D97706", borderColor: "#FDE68A", backgroundColor: "#FFFBEB" }
  } 
  else {
    displayStatus = `✓ Stock: ${stock}`
  }

  const canView = status !== "unavailable"

  return (
    <>
      <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full hover:scale-[1.02]">
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

        <div className="p-3 flex flex-col flex-grow">
          <div className="flex-grow min-h-[60px]">
            <Link
              href={`/books/${finalId}`}
              className="hover:transition-colors line-clamp-2"
              style={{ color: colors.primary }}
            >
              <h3 className={`${typography.bodySmall} font-bold`}>{title}</h3>
            </Link>
            <p className={`${typography.labelSmall} mt-1 mb-1 line-clamp-1`} style={{ color: colors.textSecondary }}>
              {author}
            </p>
          </div>

          <div className="mt-auto flex flex-col gap-2 pt-1">
            <Badge
              variant={badgeVariant}
              className="inline-flex self-start rounded-md border px-2 py-0.5 text-xs font-semibold"
              style={badgeStyle}
            >
              {displayStatus}
            </Badge>

            <Link
              href={`/books/${finalId}`}
              className="w-full text-center font-bold py-1.5 rounded-md transition-all transform hover:shadow-md hover:-translate-y-0.5 text-sm"
              style={{
                backgroundColor: canView ? colors.primary : "#d1d5db",
                color: canView ? "white" : "#6b7280",
                cursor: canView ? "pointer" : "not-allowed",
                pointerEvents: canView ? "auto" : "none",
              }}
            >
              View Details
            </Link>
          </div>
        </div>
      </div>

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
            <button
              onClick={() => setShowCoverPreview(false)}
              className="absolute -top-10 right-0 p-2 hover:bg-white/20 rounded-full transition-colors z-10"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            <div className="bg-slate-100 flex items-center justify-center overflow-hidden rounded-t-xl w-full"
              style={{ aspectRatio: "3/4", maxHeight: "calc(90vh - 200px)" }}
            >
              <img
                src={cover || "https://via.placeholder.com/300x450?text=No+Cover"}
                alt={title}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="p-6 w-full text-center border-t border-slate-200">
              <h2 className={`${typography.h3}`} style={{ color: colors.textPrimary }}>{title}</h2>
              <p className={`${typography.bodySmall} mt-2 mb-4`} style={{ color: colors.textSecondary }}>by {author}</p>
              
              <div className="mb-4 flex justify-center">
                <Badge variant={badgeVariant} className="rounded-md border px-2 py-0.5 text-xs font-semibold" style={badgeStyle}>
                  {displayStatus}
                </Badge>
              </div>

              <Link
                href={`/books/${finalId}`}
                className="inline-block font-bold py-2 px-6 rounded-lg transition-all transform hover:shadow-md hover:-translate-y-0.5"
                style={{ 
                    backgroundColor: canView ? colors.primary : "#d1d5db",
                    color: canView ? "white" : "#6b7280",
                    cursor: canView ? "pointer" : "not-allowed",
                    pointerEvents: canView ? "auto" : "none",
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