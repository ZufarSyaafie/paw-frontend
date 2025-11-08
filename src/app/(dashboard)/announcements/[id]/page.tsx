"use client"

import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { typography } from "@/styles/typography"

export default function AnnouncementDetailPage() {
    const router = useRouter()
    const params = useParams()
    const announcementId = params.id as string

    // Mock data - in real app, fetch from API
    const announcement = {
        id: parseInt(announcementId) || 1,
        title: "Library System Maintenance",
        snippet: "The library system will undergo scheduled maintenance on Saturday, November 15th from 10 PM to 2 AM.",
        fullContent:
            "The library system will undergo scheduled maintenance on Saturday, November 15th from 10 PM to 2 AM. Services will be temporarily unavailable during this time.\n\nDuring this period:\n• Online book catalog will not be accessible\n• Room booking system will be offline\n• Digital resources will be unavailable\n• Physical library access will remain open\n\nWe apologize for any inconvenience and appreciate your patience as we work to improve our services. If you have any questions, please contact our support team at support@naratama.com.",
        date: "2024-11-10",
    }

    const formattedDate = new Date(announcement.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    })

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="sticky top-16 z-40 bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Announcements
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Date Badge */}
                <div className="px-3 py-2 rounded-lg border border-gray-200 flex items-center gap-2 bg-gray-50 w-fit mb-6">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <span className="font-semibold text-sm text-gray-700">{formattedDate}</span>
                </div>

                {/* Title */}
                <div className="mb-8">
                    <h1 className={typography.h1}>{announcement.title}</h1>
                    <p className={`${typography.body} text-gray-600 mt-2`}>{announcement.snippet}</p>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100 my-8" />

                {/* Content */}
                <div className="space-y-4">
                    {announcement.fullContent.split("\n").map((paragraph, idx) => (
                        <p key={idx} className={`${typography.body} text-gray-700`}>
                            {paragraph}
                        </p>
                    ))}
                </div>
            </div>
        </div>
    )
}