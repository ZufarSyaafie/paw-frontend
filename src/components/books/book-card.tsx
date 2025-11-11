"use client"

import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { typography } from "@/styles/typography"
import { colors } from "@/styles/colors"

type BookCardProps = {
  id: string
  title: string
  author: string
  cover: string
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

  return (
    <Card className="overflow-hidden flex flex-col transition-transform duration-200 hover:-translate-y-1 bg-white border-slate-200">
      <div className="relative h-48 w-full bg-slate-100">
        <img 
          src={cover || "https://via.placeholder.com/150x200?text=Book+Cover"} 
          alt={title} 
          className="object-cover w-full h-full hover:scale-105 transition-transform duration-300" 
        />
      </div>
      
      <CardHeader>
        <CardTitle className={`${typography.h4} truncate`}>
          {title}
        </CardTitle>
        <CardDescription className={typography.bodySmall}>
          {author}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow">
        {isInStock ? (
          <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">
            ✓ Stock: {stock}
          </Badge>
        ) : (
          <Badge variant="destructive" className="bg-red-100 text-red-600 border-red-200">
            ✗ Out of Stock
          </Badge>
        )}
      </CardContent>
      
      <div className="p-4">
        <Link href={`/books/${id}`} className="w-full">
          <Button className="w-full font-semibold transition-colors" variant="primary">
            View Details
          </Button>
        </Link>
      </div>
    </Card>
  )
}