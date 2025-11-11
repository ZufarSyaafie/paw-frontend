"use client"

import { useState, useRef } from "react"
import { Camera, Mail, Calendar, BookOpen, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { typography } from "@/styles/typography"
import { colors } from "@/styles/colors"
import type { User as UserType, UserActivity } from "@/types"

const STATUS_COLORS: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-700",
    upcoming: "bg-emerald-50 text-emerald-700",
    returned: "bg-slate-100 text-slate-600",
    completed: "bg-slate-100 text-slate-600",
    overdue: "bg-red-50 text-red-700",
    cancelled: "bg-red-50 text-red-700",
}

const STATUS_LABELS: Record<string, string> = {
    active: "Active",
    returned: "Returned",
    overdue: "Overdue",
    upcoming: "Upcoming",
    completed: "Completed",
    cancelled: "Cancelled",
}

export default function ProfilePage() {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [activeTab, setActiveTab] = useState<"overview" | "books" | "rooms">("overview")

    const [userData, setUserData] = useState<UserType>({
        id: "user123",
        username: "john_doe",
        email: "john@example.com",
        profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
        joinDate: "2024-01-15",
        bio: "Book lover and study enthusiast",
    })

    const [editedUsername, setEditedUsername] = useState(userData.username)
    const [editedBio, setEditedBio] = useState(userData.bio || "")

    const [activity] = useState<UserActivity>({
        borrowedBooks: [
            {
                id: "1",
                bookId: "b1",
                bookTitle: "The Great Gatsby",
                bookAuthor: "F. Scott Fitzgerald",
                borrowDate: "2024-11-01",
                dueDate: "2024-11-15",
                status: "active",
            },
            {
                id: "2",
                bookId: "b2",
                bookTitle: "To Kill a Mockingbird",
                bookAuthor: "Harper Lee",
                borrowDate: "2024-10-20",
                dueDate: "2024-11-03",
                status: "returned",
            },
            {
                id: "3",
                bookId: "b3",
                bookTitle: "1984",
                bookAuthor: "George Orwell",
                borrowDate: "2024-10-15",
                dueDate: "2024-10-25",
                status: "overdue",
            },
        ],
        roomBookings: [
            {
                id: "r1",
                roomId: "room1",
                roomName: "Discussion Room A",
                bookingDate: "2024-11-12",
                timeSlot: "14:00 - 15:00",
                status: "upcoming",
            },
            {
                id: "r2",
                roomId: "room2",
                roomName: "Quiet Study Room",
                bookingDate: "2024-11-10",
                timeSlot: "10:00 - 11:00",
                status: "completed",
            },
        ],
    })

    const handleProfilePictureClick = () => fileInputRef.current?.click()

    const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setUserData({ ...userData, profilePicture: reader.result as string })
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSaveProfile = () => {
        setUserData({ ...userData, username: editedUsername, bio: editedBio })
        setIsEditing(false)
    }

    const handleCancel = () => {
        setIsEditing(false)
        setEditedUsername(userData.username)
        setEditedBio(userData.bio || "")
    }

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })

    return (
        <div className="min-h-screen" style={{ backgroundColor: colors.bgPrimary }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-6 shadow-sm">
                            {/* Profile Picture */}
                            <div className="text-center">
                                <div className="relative inline-block">
                                    <img
                                        src={userData.profilePicture}
                                        alt={userData.username}
                                        className="w-32 h-32 rounded-full border-4"
                                        style={{ borderColor: colors.primary }}
                                    />
                                    <button
                                        onClick={handleProfilePictureClick}
                                        className="absolute bottom-0 right-0 p-2 rounded-full text-white hover:opacity-90 transition-opacity"
                                        style={{ backgroundColor: colors.primary }}
                                    >
                                        <Camera className="w-5 h-5" />
                                    </button>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleProfilePictureChange}
                                    className="hidden"
                                />
                            </div>

                            {/* User Info */}
                            <div className="space-y-4">
                                <div>
                                    <p className={`${typography.labelSmall} uppercase mb-2`} style={{ color: colors.textSecondary }}>
                                        Username
                                    </p>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editedUsername}
                                            onChange={(e) => setEditedUsername(e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2"
                                            style={{ backgroundColor: colors.bgSecondary, color: colors.textPrimary }}
                                        />
                                    ) : (
                                        <p className={typography.h4} style={{ color: colors.textPrimary }}>
                                            {userData.username}
                                        </p>
                                    )}
                                </div>

                                <InfoField icon={<Mail className="w-4 h-4" />} label="Email" value={userData.email} />
                                <InfoField
                                    icon={<Calendar className="w-4 h-4" />}
                                    label="Member Since"
                                    value={formatDate(userData.joinDate)}
                                />

                                <div>
                                    <p className={`${typography.labelSmall} uppercase mb-2`} style={{ color: colors.textSecondary }}>
                                        Bio
                                    </p>
                                    {isEditing ? (
                                        <textarea
                                            value={editedBio}
                                            onChange={(e) => setEditedBio(e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 resize-none"
                                            style={{ backgroundColor: colors.bgSecondary, color: colors.textPrimary }}
                                            rows={3}
                                        />
                                    ) : (
                                        <p className={typography.bodySmall} style={{ color: colors.textSecondary }}>
                                            {userData.bio || "No bio added yet"}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="space-y-2 pt-4 border-t border-slate-200">
                                {isEditing ? (
                                    <>
                                        {/* Save button - hijau */}
                                        <Button
                                            onClick={handleSaveProfile}
                                            variant="success"
                                            className="w-full"
                                        >
                                            Save Changes
                                        </Button>

                                        {/* Cancel button - abu-abu */}
                                        <Button
                                            onClick={handleCancel}
                                            variant="secondary"
                                            className="w-full"
                                        >
                                            Cancel
                                        </Button>
                                    </>
                                ) : (
                                    /* Edit button - biru */
                                    <Button
                                        onClick={() => setIsEditing(true)}
                                        variant="primary"
                                        className="w-full"
                                    >
                                        Edit Profile
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Activity Section */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                            {/* Tabs */}
                            <div className="flex border-b border-slate-200">
                                {[
                                    { id: "overview", label: "Overview" },
                                    { id: "books", label: "Books", icon: BookOpen, count: activity.borrowedBooks.length },
                                    { id: "rooms", label: "Rooms", icon: Users, count: activity.roomBookings.length },
                                ].map((tab) => (
                                    <TabButton
                                        key={tab.id}
                                        isActive={activeTab === tab.id}
                                        onClick={() => setActiveTab(tab.id as "overview" | "books" | "rooms")}
                                        icon={tab.icon}
                                        label={tab.label}
                                        count={tab.count}
                                    />
                                ))}
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                {activeTab === "overview" && <OverviewTab activity={activity} />}
                                {activeTab === "books" && <BooksTab books={activity.borrowedBooks} />}
                                {activeTab === "rooms" && <RoomsTab bookings={activity.roomBookings} />}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function TabButton({
    isActive,
    onClick,
    icon: Icon,
    label,
    count,
}: {
    isActive: boolean
    onClick: () => void
    icon?: any
    label: string
    count?: number
}) {
    return (
        <button
            onClick={onClick}
            className="flex-1 px-4 py-3 font-semibold border-b-2 transition-colors flex items-center justify-center gap-2"
            style={{
                backgroundColor: isActive ? colors.info : "transparent",
                color: isActive ? "white" : colors.textSecondary,
                borderBottomColor: isActive ? colors.info : "transparent",
            }}
        >
            {Icon && <Icon className="w-4 h-4" />}
            {label}
            {count !== undefined && ` (${count})`}
        </button>
    )
}

function InfoField({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode
    label: string
    value: string
}) {
    return (
        <div>
            <div className="flex items-center gap-2 mb-2">
                <span style={{ color: colors.textSecondary }}>{icon}</span>
                <p className={`${typography.labelSmall} uppercase`} style={{ color: colors.textSecondary }}>
                    {label}
                </p>
            </div>
            <p className={typography.body} style={{ color: colors.textPrimary }}>
                {value}
            </p>
        </div>
    )
}

function OverviewTab({ activity }: { activity: UserActivity }) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <StatBox label="Books Borrowed" value={activity.borrowedBooks.length} />
                <StatBox label="Room Bookings" value={activity.roomBookings.length} />
            </div>
            <div>
                <h3 className={`${typography.h4} mb-3`} style={{ color: colors.textPrimary }}>
                    Recent Activity
                </h3>
                <div className="space-y-3">
                    {activity.borrowedBooks.slice(0, 2).map((book) => (
                        <ActivityCard
                            key={book.id}
                            title={book.bookTitle}
                            subtitle={book.bookAuthor}
                            status={book.status}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

function BooksTab({ books }: { books: any[] }) {
    return (
        <div className="space-y-3">
            {books.map((book) => (
                <div
                    key={book.id}
                    className="rounded-lg border border-slate-200 p-4"
                    style={{ backgroundColor: colors.bgSecondary }}
                >
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <p className={typography.h4} style={{ color: colors.textPrimary }}>
                                {book.bookTitle}
                            </p>
                            <p className={`${typography.bodySmall} mt-1`} style={{ color: colors.textSecondary }}>
                                by {book.bookAuthor}
                            </p>
                        </div>
                        <StatusBadge status={book.status} />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className={typography.labelSmall} style={{ color: colors.textSecondary }}>
                                Borrow Date
                            </p>
                            <p className={typography.body} style={{ color: colors.textPrimary }}>
                                {new Date(book.borrowDate).toLocaleDateString()}
                            </p>
                        </div>
                        <div>
                            <p className={typography.labelSmall} style={{ color: colors.textSecondary }}>
                                Due Date
                            </p>
                            <p style={{ color: book.status === "overdue" ? colors.danger : colors.textPrimary }}>
                                {new Date(book.dueDate).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

function RoomsTab({ bookings }: { bookings: any[] }) {
    return (
        <div className="space-y-3">
            {bookings.map((booking) => (
                <div
                    key={booking.id}
                    className="rounded-lg border border-slate-200 p-4"
                    style={{ backgroundColor: colors.bgSecondary }}
                >
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <p className={typography.h4} style={{ color: colors.textPrimary }}>
                                {booking.roomName}
                            </p>
                            <p className={`${typography.bodySmall} mt-1`} style={{ color: colors.textSecondary }}>
                                {booking.timeSlot}
                            </p>
                        </div>
                        <StatusBadge status={booking.status} />
                    </div>
                    <div>
                        <p className={typography.labelSmall} style={{ color: colors.textSecondary }}>
                            Booking Date
                        </p>
                        <p className={typography.body} style={{ color: colors.textPrimary }}>
                            {new Date(booking.bookingDate).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    )
}

function StatBox({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-lg border border-slate-200 p-4" style={{ backgroundColor: colors.bgSecondary }}>
            <p className={typography.labelSmall} style={{ color: colors.textSecondary }}>
                {label}
            </p>
            <p className="text-3xl font-bold mt-1" style={{ color: colors.info }}>
                {value}
            </p>
        </div>
    )
}

function ActivityCard({ title, subtitle, status }: { title: string; subtitle: string; status: string }) {
    return (
        <div
            className="rounded-lg border border-slate-200 p-3 flex items-start justify-between"
            style={{ backgroundColor: colors.bgSecondary }}
        >
            <div>
                <p className={typography.body} style={{ color: colors.textPrimary }}>
                    {title}
                </p>
                <p className={`${typography.bodySmall} mt-1`} style={{ color: colors.textSecondary }}>
                    {subtitle}
                </p>
            </div>
            <StatusBadge status={status} />
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    return (
        <span className={`text-xs font-semibold px-2 py-1 rounded ${STATUS_COLORS[status] || STATUS_COLORS.active}`}>
            {STATUS_LABELS[status] || status}
        </span>
    )
}