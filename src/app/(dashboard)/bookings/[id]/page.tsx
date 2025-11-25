"use client"

import { useRouter, useParams } from "next/navigation"
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Clock,
  Calendar,
  Users,
  DollarSign,
  XCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  // CreditCard, 
} from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import type { Booking } from "@/types"
import { getAuthToken } from "@/lib/auth"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel"

const API_URL = process.env.NEXT_PUBLIC_API_URL

// Helper function to format date
const formatDate = (dateString: string | undefined) => {
  if (!dateString) return "N/A"
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

// Helper function to format time
const formatTime = (timeString: string) => {
  const [hours, minutes] = timeString.split(":").map(Number)
  const date = new Date()
  date.setHours(hours, minutes)
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
}

// Helper function to format currency
const formatRupiah = (amount: number) => {
  if (typeof amount !== "number" || isNaN(amount)) return "Rp 0"
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount)
}

// Configuration for Booking Status
const STATUS_CONFIG = {
  confirmed: { color: "bg-emerald-100 text-emerald-800", icon: CheckCircle, label: "CONFIRMED" },
  pending_payment: { color: "bg-amber-100 text-amber-800", icon: Clock, label: "PENDING PAYMENT" },
  cancelled: { color: "bg-red-100 text-red-800", icon: XCircle, label: "CANCELLED" },
  completed: { color: "bg-slate-200 text-slate-700", icon: CheckCircle, label: "COMPLETED" },
}

const MOCK_BOOKING: Booking = {
  id: "MOCK-456",
  room: {
    id: "R-MOCK",
    name: "Discussion Room A (Mock)",
    capacity: 6,
    photos: ["https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop"],
    facilities: ["Whiteboard", "Projector", "WiFi"] as string[],
  },
  user: { id: "U-001", name: "Mock User", email: "mock@test.com" },
  date: new Date().toISOString(),
  startTime: "10:00",
  endTime: "12:00",
  durationHours: 2,
  totalPrice: 100000,
  status: "confirmed",
  paymentStatus: "paid",
  phone: "081234567890",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
} as unknown as Booking

export default function BookingDetailPage() {
  const router = useRouter()
  const params = useParams()
  const bookingId = params.id as string

  const [booking, setBooking] = useState<Booking | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)

  const checkIfCompleted = (booking: Booking): boolean => {
    if (booking.status !== "confirmed") return false
    const bookingEndDateTime = new Date(booking.date)
    const [hours, minutes] = booking.endTime.split(":").map(Number)
    bookingEndDateTime.setHours(hours, minutes, 0, 0)
    const now = new Date()
    return now.getTime() > bookingEndDateTime.getTime()
  }

  useEffect(() => {
    const fetchBooking = async (showLoading = true) => {
      const token = getAuthToken()
      if (!token) {
        setError("Authentication required.")
        setIsLoading(false)
        return
      }

      if (showLoading) setIsLoading(true)
      if (!showLoading) setError(null)

      try {
        const response = await fetch(`${API_URL}/api/rooms/bookings/list`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Failed to fetch bookings list.")
        }

        const list = (await response.json()) as Booking[]
        const found = list.find((b) => String(b.id) === bookingId || String((b as any)._id) === bookingId)

        if (!found) {
          throw new Error(`Booking with ID ${bookingId} not found in user list.`)
        }

        setBooking(found)
      } catch (err: any) {
        console.error(err)
        // jangan ganggu user dengan error flash pas silent reload
        if (showLoading) {
             setError(err.message || "Failed to load booking details. Using fallback data.")
             const mockDataWithPhotos = {
                ...MOCK_BOOKING,
                room: {
                  ...MOCK_BOOKING.room,
                  photos: MOCK_BOOKING.room.photos || ["https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop"]
                }
              }
              setBooking(mockDataWithPhotos as Booking)
        }
      } finally {
        if (showLoading) setIsLoading(false)
      }
    }

    if (bookingId) {
      fetchBooking(true)

      const onFocus = () => {
        fetchBooking(false)
      }
      window.addEventListener("focus", onFocus)

      const interval = setInterval(() => {
        fetchBooking(false)
      }, 5000)

      return () => {
        window.removeEventListener("focus", onFocus)
        clearInterval(interval)
      }
    }
  }, [bookingId])

  const handleCancel = async () => {
    if (!booking || booking.status === "cancelled") return

    if (!confirm("Are you sure you want to cancel this booking? This action cannot be undone and refund rules apply.")) {
      return
    }

    setIsCancelling(true)
    setError(null)
    const token = getAuthToken()

    try {
      const response = await fetch(`${API_URL}/api/rooms/bookings/${bookingId}/cancel`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Cancellation failed.")
      }

      alert(`Booking successfully cancelled!`)
      router.push("/bookings")
    } catch (err: any) {
      setError(err.message || "Failed to process cancellation.")
      alert(`Cancellation failed: ${err.message}`)
    } finally {
      setIsCancelling(false)
    }
  }

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
        <p className="ml-3 text-gray-600 font-medium">Loading booking details...</p>
      </div>
    )

  if (error && !booking)
    return (
      <div className="p-12 text-center">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <h3 className="font-semibold text-red-800 mb-1">Error</h3>
        <p className="text-sm text-red-700">{error || `Booking with ID ${bookingId} not found.`}</p>
      </div>
    )

  if (!booking) {
    return null
  }

  let statusKey: keyof typeof STATUS_CONFIG = booking.status as keyof typeof STATUS_CONFIG

  if (checkIfCompleted(booking)) {
    statusKey = "completed"
  }

  const statusInfo = STATUS_CONFIG[statusKey] || STATUS_CONFIG.cancelled

  const isCancellable = booking.status === "confirmed" || booking.status === "pending_payment"
  const isFinished = statusKey === "completed" // Tambah flag finished
  const isPending = booking.status === 'pending_payment'
  const isCancelled = statusKey === 'cancelled'

  // Buat variabel hasPhotos
  const hasPhotos = booking.room.photos && booking.room.photos.length > 0
  const paymentUrl = (booking as any).paymentUrl || null

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Back Button */}
      <button
        onClick={() => router.back()}
        className="fixed top-24 left-[calc(theme(spacing.4)+1rem)] sm:left-[calc(theme(spacing.6)+1.5rem)] lg:left-[calc(theme(spacing.7)+1rem)] z-40 flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg border border-gray-100 bg-white/80 backdrop-blur-md text-gray-600 hover:text-gray-900 hover:bg-slate-100/80 transition-all font-medium text-sm ring-1 ring-black/5"
      >
        <ArrowLeft className="w-4 h-4" />
      </button>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-6">
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Left: Room Image & Status */}
          <div className="md:col-span-1">
            <div className="sticky top-32">
              {/* CAROUSEL */}
              <div className="relative w-full rounded-xl shadow-xl overflow-hidden aspect-[16/9] bg-gray-200">
                <Carousel className="w-full h-full" opts={{ loop: true }}>
                  <CarouselContent>
                    {hasPhotos ? (
                      booking.room.photos.map((photo: string, index: number) => (
                        <CarouselItem key={index}>
                          <img
                            src={photo}
                            alt={`${booking.room.name} photo ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </CarouselItem>
                      ))
                    ) : (
                      <CarouselItem>
                        <img
                          src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop"
                          alt={booking.room.name}
                          className="w-full h-full object-cover"
                        />
                      </CarouselItem>
                    )}
                  </CarouselContent>
                  {hasPhotos && booking.room.photos.length > 1 && (
                    <>
                      <CarouselPrevious
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 h-12 w-12 p-0 rounded-full flex items-center justify-center bg-white/90 backdrop-blur-lg text-slate-900 border-none hover:scale-105 transition-transform shadow-md"
                        aria-label="previous"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </CarouselPrevious>
                      <CarouselNext
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 h-12 w-12 p-0 rounded-full flex items-center justify-center bg-white/90 backdrop-blur-lg text-slate-900 border-none hover:scale-105 transition-transform shadow-md"
                        aria-label="next"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </CarouselNext>
                    </>
                  )}
                </Carousel>
              </div>

              {/* Status Badge */}
              <div className={`mt-4 px-3 py-2 rounded-lg border flex items-center gap-2 ${statusInfo.color}`}>
                <statusInfo.icon className="w-4 h-4" />
                <span className="font-semibold text-sm capitalize">{statusInfo.label}</span>
              </div>

              {/* Payment Status */}
              <div className="mt-3 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="text-sm font-semibold text-slate-700">Payment Status: {booking.paymentStatus.toUpperCase()}</p>
              </div>

            {/* continue payment */}
              <div className="mt-5 space-y-3">
                {isPending && (
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => {
                        if (paymentUrl) {
                          // window.open(paymentUrl, '_blank')
                          window.location.href = paymentUrl
                        } else {
                          alert('Error: Payment URL not found. Please try re-booking.')
                        }
                      }
                    }
                    disabled={isCancelling||!paymentUrl}
                    className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-sm py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {/* <CreditCard className="w-5 h-5" /> */}
                    {paymentUrl ? "Continue Payment" : "Payment URL Missing"}
                    </Button>
                    <Button
                      onClick={handleCancel}
                      disabled={isCancelling}
                      className="w-full bg-red-500 hover:bg-red-600 text-white font-bold text-sm py-3 rounded-lg disabled:opacity-50"
                    >
                      {isCancelling ? "Cancelling..." : "Cancel Booking"}
                    </Button>
                    </div>
                  )}

                  {!isPending && isCancellable && !isFinished && (
                    <Button
                      onClick={handleCancel}
                      disabled={isCancelling}
                      className="w-full py-3 text-white font-bold rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-50"
                    >
                      {isCancelling ? "Processing Cancellation..." : "Cancel Booking (Confirmed)"}
                    </Button>
                  )}

                  {(isFinished || isCancelled) && (
                    <Button
                      disabled={true}
                      className="w-full py-3 text-white font-bold rounded-lg bg-gray-400 cursor-not-allowed"
                    >
                      {isFinished ? "Session Completed" : "Booking Cancelled"}
                    </Button>
                  )}
                  </div>
            </div>
          </div>

          {/* Right: Booking Details */}
          <div className="md:col-span-2 space-y-8">
            {/* Title Section */}
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3">
                {booking.room.name}
              </h1>              
              <p className="text-lg text-gray-600">Capacity: {booking.room.capacity} people</p>
            </div>

            {/* Booking Info Grid */}
            <div className="grid grid-cols-2 gap-6 py-6 border-y border-gray-100">
              <LoanDetailItem icon={Calendar} label="Booking Date" value={formatDate(booking.date)} />
              <LoanDetailItem icon={Clock} label="Time Slot" value={`${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}`} />
              <LoanDetailItem icon={Users} label="Duration" value={`${booking.durationHours} hours`} />
              <LoanDetailItem icon={DollarSign} label="Total Price" value={formatRupiah(booking.totalPrice)} />
            </div>

            {/* Important Notes */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Booking Rules</h3>
              <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                <li>Cancellation requires a minimum of 2 hours notice.</li>
                {/* <li>If cancellation is successful, refund depends on payment status.</li> */}
                <li>Phone number used: {booking.phone}</li>
              </ul>
            </div>

            {/* Room Features */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Room Features</h3>
              <div className="flex flex-wrap gap-2">
                {(booking.room.facilities || []).map((feature: string, index: number) => (
                  <span key={index} className="px-3 py-1 bg-slate-200 text-slate-700 rounded-full text-sm font-medium">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface LoanDetailItemProps {
  label: string
  value: string | number
  icon?: any
}

function LoanDetailItem({ label, value, icon: Icon }: LoanDetailItemProps) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
        {Icon && <Icon className="w-3 h-3" />} {label}
      </p>
      <p className="text-gray-900 font-medium text-sm">{value}</p>
    </div>
  )
}