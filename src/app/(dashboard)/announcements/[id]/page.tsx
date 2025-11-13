"use client"

import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Calendar, Loader2, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { typography } from "@/styles/typography"
import type { Announcement } from "@/types"
import { getAuthToken } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL

const MOCK_ANNOUNCEMENT: Announcement = {
    id: 1,
    title: "Mock Data Error",
    snippet: "Failed to load announcement.",
    fullContent: "The system encountered an error while retrieving the full announcement details. Please check your network connection.",
    date: new Date().toISOString(),
    bookTitle: "",
    message: "",
    createdAt: new Date().toISOString(),
}

export default function AnnouncementDetailPage() {
    const router = useRouter()
    const params = useParams()
    const announcementId = params.id as string

    const [announcement, setAnnouncement] = useState<Announcement | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)


    useEffect(() => {
        const fetchAnnouncement = async () => {
            const token = getAuthToken()
            if (!token) {
                setError("Authentication required.")
                setIsLoading(false)
                return
            }

            try {
                const response = await fetch(`${API_URL}/api/announcements`, {
                    headers: { "Authorization": `Bearer ${token}` }
                })

                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.message || "Failed to fetch announcements list.")
                }

                const list = await response.json() as Announcement[]
                
                const found = list.find(a => String(a.id) === announcementId || String((a as any)._id) === announcementId)

                if (!found) {
                    throw new Error(`Announcement with ID ${announcementId} not found.`)
                }
                
                setAnnouncement(found)

            } catch (err: any) {
                console.error(err)
                setError(err.message || "Failed to load announcement details.")
                setAnnouncement(MOCK_ANNOUNCEMENT) // Fallback ke Mock Data jika Gagal
            } finally {
                setIsLoading(false)
            }
        }

        if (announcementId) fetchAnnouncement()
    }, [announcementId])

    if (isLoading) return (
        <div className="flex justify-center items-center h-screen">
            <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
            <p className="ml-3 text-gray-600 font-medium">Loading announcement details...</p>
        </div>
    )

    if (error || !announcement) return (
        <div className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="font-semibold text-red-800 mb-1">Error</h3>
            <p className="text-sm text-red-700">{error || `Announcement with ID ${announcementId} not found.`}</p>
        </div>
    )

    const title = announcement.bookTitle || announcement.title || MOCK_ANNOUNCEMENT.title
    const fullContent = announcement.message || announcement.fullContent || MOCK_ANNOUNCEMENT.fullContent
    const date = announcement.createdAt || announcement.date || MOCK_ANNOUNCEMENT.date
    
    const formattedDate = new Date(date!).toLocaleDateString("en-US", { 
        year: "numeric",
        month: "long",
        day: "numeric",
    })

    const contentToDisplay = fullContent || "" 

    return (
        <div className="min-h-screen bg-white">
            <button
                onClick={() => router.back()}
                className="fixed top-24 left-[calc(theme(spacing.4)+1rem)] sm:left-[calc(theme(spacing.6)+1.5rem)] lg:left-[calc(theme(spacing.7)+1rem)] z-40 flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg border border-gray-100 bg-white/80 backdrop-blur-md text-gray-600 hover:text-gray-900 hover:bg-slate-100/80 transition-all font-medium text-sm ring-1 ring-black/5"
            >
                <ArrowLeft className="w-4 h-4" /> 
            </button>


            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
              
                {/* Date Badge */}
                <div className="px-3 py-2 rounded-lg border border-gray-200 flex items-center gap-2 bg-gray-50 w-fit mb-6">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <span className="font-semibold text-sm text-gray-700">{formattedDate}</span>
                </div>

     
                {/* Title */}
                <div className="mb-8">
                    <h1 className={typography.h1}>{title}</h1>
                </div>

          
                {/* Divider */}
                <div className="border-t border-gray-100 my-8" />

                {/* Content */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 lg:p-8 space-y-4">
                    {contentToDisplay.split("\n").map((paragraph, idx) => (
                        <p key={idx} className={`${typography.body} text-gray-800 leading-relaxed`}>
                            {paragraph}
                        </p>    
                    ))}
                </div>
            </div>
        </div>
    )
}