"use client"

import Link from "next/link"
import { ChevronRight, BookOpen, Users, Bell } from "lucide-react"
import BookCard from "@/components/books/book-card"
import RoomCard from "@/components/rooms/room-card"
import AnnouncementCard from "@/components/announcements/announcement-card"
import { typography } from "@/styles/typography"
import { colors } from "@/styles/colors"
import { spacing } from "@/styles/spacing"

// Sample data
const sampleBooks = [
	{
		id: "1",
		title: "The Great Gatsby",
		author: "F. Scott Fitzgerald",
		cover: "https://images.unsplash.com/photo-1543002588-d83cedbc4d60?w=400&h=600&fit=crop",
		stock: 5,
	},
]

const sampleRooms = [
	{
		id: "1",
		name: "Discussion Room A",
		description: "A quiet room perfect for group study",
		capacity: 6,
		image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop",
		features: ["Whiteboard", "Projector", "WiFi", "Sound System"],
		status: "available" as const,
	},
]

const sampleAnnouncements = [
	{
		id: 1,
		title: "Library System Maintenance",
		snippet:
			"The library system will undergo scheduled maintenance on Saturday, November 15th from 10 PM to 2 AM.",
		fullContent:
			"The library system will undergo scheduled maintenance on Saturday, November 15th from 10 PM to 2 AM. Services will be temporarily unavailable during this time.\n\nDuring this period:\n• Online book catalog will not be accessible\n• Room booking system will be offline\n• Digital resources will be unavailable\n• Physical library access will remain open\n\nWe apologize for any inconvenience and appreciate your patience as we work to improve our services. If you have any questions, please contact our support team at support@naratama.com.",
		date: "2024-11-10",
	},
]

export default function Dashboard() {
	return (
		<div style={{ backgroundColor: colors.bgPrimary }}>
			{/* Hero Section */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
				<div className={`space-y-${spacing.sm}`}>
					<h1 className={typography.h1}>Welcome Back</h1>
					<p className={typography.body}>Explore books, reserve rooms, and stay updated</p>
				</div>
			</div>

			{/* Quick Stats */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<StatCard
						href="/books"
						label="Total Books"
						value="2,458"
						icon={<BookOpen className="w-12 h-12" style={{ color: colors.info }} />}
					/>
					<StatCard
						href="/rooms"
						label="Available Rooms"
						value="1"
						icon={<Users className="w-12 h-12" style={{ color: colors.primary }} />}
					/>
					<StatCard
						href="/announcements"
						label="Announcements"
						value="1"
						icon={<Bell className="w-12 h-12" style={{ color: colors.warning }} />}
					/>
				</div>
			</div>

			{/* Main Content */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 pb-12">
				{/* Featured Books */}
				<Section
					title="Featured Books"
					description="Latest additions to our collection"
					viewAllHref="/books"
				>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{sampleBooks.map((book) => (
							<BookCard 
								key={book.id} 
								id={book.id}
								title={book.title}
								author={book.author}
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
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{sampleRooms.map((room) => (
							<RoomCard key={room.id} {...room} />
						))}
					</div>
				</Section>

				{/* Latest Announcements */}
				<Section
					title="Latest Announcements"
					description="Stay updated with library news"
					viewAllHref="/announcements"
				>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{sampleAnnouncements.map((announcement) => (
							<AnnouncementCard key={announcement.id} {...announcement} />
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
			<div className="flex items-center justify-between mb-6">
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
			<div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-all cursor-pointer">
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