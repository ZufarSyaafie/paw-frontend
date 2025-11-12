"use client"

import Link from "next/link"
import { ChevronRight, BookOpen, Users, Bell, Loader2, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import BookCard from "@/components/books/book-card" 
import { RoomCard } from "@/components/rooms/room-card" 
import AnnouncementCard from "@/components/announcements/announcement-card"
import { typography } from "@/styles/typography"
import { colors } from "@/styles/colors"
import { spacing } from "@/styles/spacing"
import type { Book, Room, Announcement } from "@/types"
import { getAuthToken } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL

const sampleBooks: Book[] = [
	{
		id: "1",
		title: "Mock Book",
		author: "Mock Author",
		stock: 5,
        status: "available", category: "Fiction", year: 2023,
	},
]

const sampleRooms: Room[] = [
	{
		id: "1",
		name: "Mock Room",
		description: "A quiet room",
		capacity: 6,
		photos: ["https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop"], // Ganti ke 'photos'
		facilities: ["Whiteboard"], 
		status: "available" as const,
        price: 0,
	},
]

const sampleAnnouncements: Announcement[] = [
	{
		id: 1,
		title: "Mock Announcement",
		snippet: "Mock update.",
		bookTitle: "", message: "", createdAt: ""
	},
]

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalBooks: 0,
        availableRooms: 0,
        announcementCount: 0,
        featuredBooks: sampleBooks,
        featuredRooms: sampleRooms,
         featuredAnnouncements: sampleAnnouncements,
    })
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    
    useEffect(() => {
        const token = getAuthToken()
        if (!token) {
            setError("Authentication required.")
            setIsLoading(false)
            return
        }

        const fetchDashboardData = async () => {
             setIsLoading(true)
            setError(null)

            try {
                // Fetchers parallel
                const [booksRes, roomsRes, announcementsRes] = await Promise.all([
                    fetch(`${API_URL}/api/books?limit=3`, { headers: { "Authorization": `Bearer ${token}` } }), 
                    fetch(`${API_URL}/api/rooms`, { headers: { "Authorization": `Bearer ${token}` } }),
                    fetch(`${API_URL}/api/announcements`, { headers: { "Authorization": `Bearer ${token}` } }),
                ]);

                // 1. Books Data
                const booksData = await booksRes.json()
                const featuredBooks = booksData.data || []
                const totalBooks = booksData.total || featuredBooks.length 
                
                // 2. Rooms Data
                const roomsData = await roomsRes.json()
                const featuredRooms = (roomsData || []).slice(0, 3) 
                const availableRooms = (roomsData || []).filter((r: any) => r.status === 'available').length

                // 3. Announcements Data
                const announcementsData = await announcementsRes.json()
                const featuredAnnouncements = (announcementsData || []).slice(0, 3)
                const announcementCount = (announcementsData || []).length

                 setStats({
                    totalBooks,
                    availableRooms,
                    announcementCount,
                    featuredBooks,
                     featuredRooms,
                    featuredAnnouncements,
                })
            } catch (err: any) {
                console.error("Dashboard Fetch Error:", err)
                setError("Failed to load dashboard data. Check backend.")
                setStats({
                    totalBooks: 0, availableRooms: 0, announcementCount: 0,
                    featuredBooks: sampleBooks, featuredRooms: sampleRooms, featuredAnnouncements: sampleAnnouncements,
                 })
            } finally {
                setIsLoading(false)
            }
        }

        fetchDashboardData()
    }, [])


    if (isLoading) return (
        <div className="flex justify-center items-center h-screen">
            <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
            <p className="ml-3 text-gray-600 font-medium">Loading Dashboard...</p>
        </div>
    )

    if (error) return (
        <div className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="font-semibold text-red-800 mb-1">Error Loading Dashboard</h3>
            <p className="text-sm text-red-700">{error}</p>
         </div>
    )

	return (
		<div style={{ backgroundColor: colors.bgPrimary }}>
			{/* Hero Section */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16">
				<div className={`space-y-${spacing.sm}`}>
					<h1 className={typography.h1}>Welcome Back</h1>
					<p className={typography.body}>Explore books, reserve rooms, and stay updated</p>
				</div>
			</div>

			{/* Quick Stats */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<StatCard
						href="/books"
						label="Total Books"
						value={stats.totalBooks.toLocaleString()}
						icon={<BookOpen className="w-12 h-12" style={{ color: colors.info }} />}
					/>
					<StatCard
						href="/rooms"
						label="Available Rooms"
						value={stats.availableRooms.toLocaleString()}
						icon={<Users className="w-12 h-12" style={{ color: colors.success }} />}
					/>
					<StatCard
						href="/announcements"
						label="Announcements"
						value={stats.announcementCount.toLocaleString()}
						icon={<Bell className="w-12 h-12" style={{ color: colors.warning }} />}
					/>
				</div>
			</div>

			{/* Main Content */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 pb-16">
				{/* Featured Books */}
				<Section
					title="Featured Books"
					description="Latest additions to our collection"
					viewAllHref="/books"
				>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
						{stats.featuredBooks.map((book: any) => (
							<BookCard 
								key={book.id || book._id} 
								id={book.id || book._id}
								title={book.title}
								author={book.author}
								// 'cover' gak ada di BE, jadi 'book.cover' bakal undefined
								cover={book.cover} 
								stock={book.stock}
							/>
						))}
					</div>
				</Section>

				{/* Available Rooms */}
				<Section
					title="Available Rooms"
					description="Book a space for your group"
					viewAllHref="/rooms"
				>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{stats.featuredRooms.map((room: any) => (
							<RoomCard key={room.id || room._id} {...room} />
						))}
					</div>
				</Section>

				{/* Latest Announcements */}
				<Section
					title="Latest Announcements"
					description="Stay updated with library news"
					viewAllHref="/announcements"
				>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{stats.featuredAnnouncements.map((announcement: any) => (
							<AnnouncementCard 
								key={announcement.id || announcement._id} 
								id={announcement.id || announcement._id}
								title={announcement.bookTitle || announcement.title}
								snippet={announcement.message || announcement.snippet}
								date={announcement.createdAt || announcement.date}
							/>
						))}
					</div>
				</Section>
			</div>
		</div>
	)
}

// Reusable Section Component
function Section({
	title,
	description,
	viewAllHref,
	children,
}: {
	title: string
	description: string
	viewAllHref: string
	children: React.ReactNode
}) {
	return (
		<section>
			<div className="flex items-center justify-between mb-8">
				<div>
					<h2 className={typography.h2}>{title}</h2>
					<p className={`${typography.bodySmall} mt-1`} style={{ color: colors.textSecondary }}>{description}</p>
				</div>
				<Link href={viewAllHref}>
					<button className="font-semibold flex items-center gap-2 text-sm transition-colors" style={{ color: colors.info }}>
						View All
						<ChevronRight className="w-4 h-4" />
					</button>
				</Link>
			</div>
			{children}
		</section>
	)
}

// Reusable StatCard Component
function StatCard({
	href,
	label,
	value,
	icon,
}: {
	href: string
	label: string
	value: string
	icon: React.ReactNode
}) {
	return (
		<Link href={href}>
			<div className="bg-white border border-slate-200 rounded-lg p-6 shadow-md hover:shadow-lg transition-all cursor-pointer">
				<div className="flex items-center justify-between">
					<div>
						<p className={`${typography.label} text-slate-600`}>{label}</p>
						<p className={`${typography.h2} mt-1`}>{value}</p>
					</div>
					<div className="opacity-80">{icon}</div>
				</div>
			</div>
		</Link>
	)
}