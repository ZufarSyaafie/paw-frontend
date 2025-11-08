"use client"

import { Button } from "@/components/ui/button"
import { typography } from "@/styles/typography"
import Link from "next/link"

interface BookCardProps {
  id: string
  title: string
  author: string
  cover: string
  stock: number
}

export default function BookCard({ id, title, author, cover, stock }: BookCardProps) {
  const stockStatus = stock > 0 ? "In Stock" : "Out of Stock"
  const stockColor = stock > 0 ? "text-emerald-600" : "text-red-600"

  return (
    <Link href={`/books/${id}`}>
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer h-full flex flex-col">
        {/* Book Cover */}
        <div className="bg-slate-200 h-48 flex items-center justify-center overflow-hidden">
          <img
            src={cover || "https://via.placeholder.com/150x200?text=Book+Cover"}
            alt={title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Book Info */}
        <div className="p-4 flex flex-col flex-grow">
          <h3 className={`${typography.h4} mb-1 line-clamp-2 hover:text-blue-500 transition-colors`}>
            {title}
          </h3>
          <p className={`${typography.bodySmall} mb-4 flex-grow`}>{author}</p>

          {/* Stock Status */}
          <div className="mt-2 mb-3">
            <span className={`text-sm font-medium ${stockColor}`}>
              {stockStatus === "In Stock" ? "✓ " : "✗ "}
              Stock: {stock}
            </span>
          </div>

          {/* View Details Button */}
          <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition-all">
            View Details
          </Button>
        </div>
      </div>
    </Link>
  )
}