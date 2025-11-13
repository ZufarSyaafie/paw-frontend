"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { typography } from "@/styles/typography"

type BookCardProps = {
  id: string
  _id?: string
  title: string
  author: string
  cover?: string
  stock: number
}

export default function BookCard({
  id,
  _id,
  title,
  author,
  cover,
  stock
}: BookCardProps) {
  const isInStock = stock > 0
  const finalId = (id || _id) as string
  if (!finalId) return null

  return (
    <Link
      href={`/books/${finalId}`}
      className="block h-full"
      style={{ textDecoration: "none" }}
    >
      <Card
        className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm hover:shadow-xl hover:shadow-blue-300/30 transition-all duration-300 cursor-pointer h-full flex flex-col hover:scale-[1.02]"
      >
        {/* Cover Buku */}
        <div className="relative h-48 w-full bg-slate-100 flex items-center justify-center overflow-hidden">
          <img
            src={cover || "https://via.placeholder.com/150x200?text=No+Cover"}
            alt={title}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            draggable={false}
          />
        </div>

        {/* Konten Buku */}
        <div className="p-4 flex flex-col flex-grow">
          {/* Judul */}
          <h3
            className={`${typography.h4} hover:text-cyan-600 transition-colors line-clamp-2`}
          >
            {title}
          </h3>

          {/* Penulis */}
          <p className={`${typography.bodySmall} mt-1 text-slate-600`}>
            {author}
          </p>

          {/* Status stok */}
          <div className="mt-3 mb-3">
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

          <div className="mt-auto">
            <div
              className={`w-full text-center font-bold py-2 rounded-md transition-all select-none ${
                isInStock
                  ? "bg-cyan-500 hover:bg-cyan-600 text-white"
                  : "bg-gray-300 text-gray-600 cursor-not-allowed"
              }`}
            >
              View Details
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
