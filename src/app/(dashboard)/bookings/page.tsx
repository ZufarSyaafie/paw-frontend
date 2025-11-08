'use client'

import { useState } from 'react'
import { ArrowLeft, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { typography } from '@/styles/typography'
import { colors } from '@/styles/colors'

interface Booking {
    id: string
    roomName: string
    startDate: string
    endDate: string
    status: 'confirmed' | 'pending' | 'cancelled'
    totalPrice: number
    notes?: string
    createdAt: string
}

// Mock Bookings Data
const mockBookings: Booking[] = [
    {
        id: '1',
        roomName: 'Discussion Room A',
        startDate: '2024-11-15T14:00:00',
        endDate: '2024-11-15T15:00:00',
        status: 'confirmed',
        totalPrice: 50000,
        notes: 'Team meeting for project discussion',
        createdAt: '2024-11-10T10:30:00',
    },
    {
        id: '2',
        roomName: 'Quiet Study Room',
        startDate: '2024-11-16T10:00:00',
        endDate: '2024-11-16T12:00:00',
        status: 'pending',
        totalPrice: 75000,
        notes: 'Personal study session',
        createdAt: '2024-11-11T09:15:00',
    },
    {
        id: '3',
        roomName: 'Computer Lab',
        startDate: '2024-11-20T13:00:00',
        endDate: '2024-11-20T15:00:00',
        status: 'cancelled',
        totalPrice: 100000,
        notes: 'Programming workshop',
        createdAt: '2024-11-08T14:45:00',
    },
]

export default function BookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>(mockBookings)
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'bg-emerald-100 text-emerald-700'
            case 'pending':
                return 'bg-yellow-100 text-yellow-700'
            case 'cancelled':
                return 'bg-red-100 text-red-700'
            default:
                return 'bg-slate-100 text-slate-700'
        }
    }

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const calculateDuration = (startDate: string, endDate: string) => {
        const start = new Date(startDate)
        const end = new Date(endDate)
        const hours = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60))
        return hours
    }

    const handleCancelBooking = (bookingId: string) => {
        if (confirm('Are you sure you want to cancel this booking?')) {
            setBookings((prev) =>
                prev.map((booking) =>
                    booking.id === bookingId
                        ? { ...booking, status: 'cancelled' as const }
                        : booking
                )
            )
            if (selectedBooking?.id === bookingId) {
                setSelectedBooking({ ...selectedBooking, status: 'cancelled' })
            }
            alert('Booking cancelled successfully!')
        }
    }

    const handleDownloadReceipt = (bookingId: string) => {
        alert(`Downloading receipt for booking ${bookingId}...`)
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: colors.bgSecondary }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="py-8 border-b" style={{ borderBottomColor: '#e2e8f0' }}>
                    <h1 className={typography.h1} style={{ color: colors.textPrimary }}>
                        My Bookings
                    </h1>
                    <p className={`${typography.bodySmall} mt-2`} style={{ color: colors.textSecondary }}>
                        Manage your room bookings
                    </p>
                </div>

                {/* Main Content */}
                <div className="py-8">
                    {!selectedBooking ? (
                        // List View
                        <div className="space-y-4">
                            <p
                                className={`${typography.label} uppercase mb-4`}
                                style={{ color: colors.textSecondary }}
                            >
                                {bookings.length} Total Bookings
                            </p>

                            <div className="grid grid-cols-1 gap-4">
                                {bookings.map((booking) => (
                                    <div
                                        key={booking.id}
                                        className="rounded-lg border p-4 sm:p-6 cursor-pointer transition-all hover:shadow-md"
                                        onClick={() => setSelectedBooking(booking)}
                                        style={{
                                            backgroundColor: colors.bgPrimary,
                                            borderColor: '#e2e8f0',
                                        }}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className={typography.h4} style={{ color: colors.textPrimary }}>
                                                    {booking.roomName}
                                                </h3>
                                                <p className={`${typography.bodySmall} mt-1`} style={{ color: colors.textSecondary }}>
                                                    ID: {booking.id}
                                                </p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(booking.status)}`}>
                                                {booking.status.toUpperCase()}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            <div>
                                                <p className={typography.labelSmall} style={{ color: colors.textTertiary }}>
                                                    Date
                                                </p>
                                                <p className={`${typography.bodySmall} mt-1 font-medium`} style={{ color: colors.textPrimary }}>
                                                    {new Date(booking.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </p>
                                            </div>
                                            <div>
                                                <p className={typography.labelSmall} style={{ color: colors.textTertiary }}>
                                                    Time
                                                </p>
                                                <p className={`${typography.bodySmall} mt-1 font-medium`} style={{ color: colors.textPrimary }}>
                                                    {new Date(booking.startDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                            <div>
                                                <p className={typography.labelSmall} style={{ color: colors.textTertiary }}>
                                                    Duration
                                                </p>
                                                <p className={`${typography.bodySmall} mt-1 font-medium`} style={{ color: colors.textPrimary }}>
                                                    {calculateDuration(booking.startDate, booking.endDate)}h
                                                </p>
                                            </div>
                                            <div>
                                                <p className={typography.labelSmall} style={{ color: colors.textTertiary }}>
                                                    Price
                                                </p>
                                                <p className={`${typography.bodySmall} mt-1 font-medium`} style={{ color: colors.info }}>
                                                    Rp {booking.totalPrice.toLocaleString('id-ID')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        // Detail View
                        <div className="space-y-6">
                            {/* Back Button */}
                            <button
                                onClick={() => setSelectedBooking(null)}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                                style={{
                                    backgroundColor: colors.bgPrimary,
                                    color: colors.textSecondary,
                                    border: `1px solid #e2e8f0`,
                                }}
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Bookings
                            </button>

                            {/* Detail Card */}
                            <div
                                className="rounded-lg border p-6 space-y-6"
                                style={{
                                    backgroundColor: colors.bgPrimary,
                                    borderColor: '#e2e8f0',
                                }}
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between pb-6 border-b" style={{ borderBottomColor: '#e2e8f0' }}>
                                    <div>
                                        <h2 className={typography.h2} style={{ color: colors.textPrimary }}>
                                            {selectedBooking.roomName}
                                        </h2>
                                        <p className={`${typography.bodySmall} mt-2`} style={{ color: colors.textSecondary }}>
                                            Booking ID: {selectedBooking.id}
                                        </p>
                                    </div>
                                    <span className={`px-4 py-2 rounded-full font-semibold ${getStatusBadge(selectedBooking.status)}`}>
                                        {selectedBooking.status.toUpperCase()}
                                    </span>
                                </div>

                                {/* Booking Information */}
                                <div>
                                    <p className={`${typography.label} uppercase mb-4`} style={{ color: colors.textPrimary }}>
                                        Booking Information
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 rounded-lg" style={{ backgroundColor: colors.bgSecondary }}>
                                            <p className={typography.labelSmall} style={{ color: colors.textSecondary }}>
                                                Start Date & Time
                                            </p>
                                            <p className={`${typography.body} mt-2 font-semibold`} style={{ color: colors.textPrimary }}>
                                                {formatDateTime(selectedBooking.startDate)}
                                            </p>
                                        </div>
                                        <div className="p-4 rounded-lg" style={{ backgroundColor: colors.bgSecondary }}>
                                            <p className={typography.labelSmall} style={{ color: colors.textSecondary }}>
                                                End Date & Time
                                            </p>
                                            <p className={`${typography.body} mt-2 font-semibold`} style={{ color: colors.textPrimary }}>
                                                {formatDateTime(selectedBooking.endDate)}
                                            </p>
                                        </div>
                                        <div className="p-4 rounded-lg" style={{ backgroundColor: colors.bgSecondary }}>
                                            <p className={typography.labelSmall} style={{ color: colors.textSecondary }}>
                                                Duration
                                            </p>
                                            <p className={`${typography.body} mt-2 font-semibold`} style={{ color: colors.textPrimary }}>
                                                {calculateDuration(selectedBooking.startDate, selectedBooking.endDate)} hours
                                            </p>
                                        </div>
                                        <div className="p-4 rounded-lg" style={{ backgroundColor: colors.bgSecondary }}>
                                            <p className={typography.labelSmall} style={{ color: colors.textSecondary }}>
                                                Total Price
                                            </p>
                                            <p className={`${typography.h4} mt-2`} style={{ color: colors.info }}>
                                                Rp {selectedBooking.totalPrice.toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Notes */}
                                {selectedBooking.notes && (
                                    <div>
                                        <p className={`${typography.label} uppercase mb-3`} style={{ color: colors.textPrimary }}>
                                            Notes
                                        </p>
                                        <p className={typography.body} style={{ color: colors.textSecondary }}>
                                            {selectedBooking.notes}
                                        </p>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="border-t pt-6 space-y-3" style={{ borderTopColor: '#e2e8f0' }}>
                                    <p className={`${typography.label} uppercase mb-4`} style={{ color: colors.textPrimary }}>
                                        Actions
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <Button
                                            className="text-white font-semibold flex-1"
                                            style={{ backgroundColor: colors.info }}
                                        >
                                            View Room Details
                                        </Button>
                                        {selectedBooking.status === 'pending' && (
                                            <Button
                                                className="text-white font-semibold flex-1"
                                                style={{ backgroundColor: colors.danger }}
                                                onClick={() => handleCancelBooking(selectedBooking.id)}
                                            >
                                                Cancel Booking
                                            </Button>
                                        )}
                                        <Button
                                            className="flex items-center justify-center gap-2 font-semibold flex-1"
                                            style={{
                                                backgroundColor: colors.bgSecondary,
                                                color: colors.textSecondary,
                                                border: `1px solid #e2e8f0`,
                                            }}
                                            onClick={() => handleDownloadReceipt(selectedBooking.id)}
                                        >
                                            <Download className="w-4 h-4" />
                                            Download Receipt
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}