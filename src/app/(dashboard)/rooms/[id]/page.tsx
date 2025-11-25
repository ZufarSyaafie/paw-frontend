"use client"

import { Button } from "@/components/ui/button"
import { useRouter, useParams } from "next/navigation"
import {
  ArrowLeft,
  Users,
  AlertCircle,
  Phone,
  User as UserIcon,
  Loader2,
  Calendar,
  Clock,
  Pencil,
  AlertTriangle,
  CreditCard,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useState, useEffect } from "react"
import { getAuthToken } from "@/lib/auth"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ""

const timeToMinutes = (timeString: string) => {
  if (!timeString) return 0
  const [h, m] = timeString.split(":").map(Number)
  return h * 60 + m
}
const calculateDurationHours = (start: string, end: string) => {
  if (!start || !end) return 0
  const s = timeToMinutes(start)
  const e = timeToMinutes(end)
  if (e <= s) return 0
  return (e - s) / 60
}
const formatRupiah = (amount: number) => {
  if (typeof amount !== "number" || isNaN(amount)) return "Rp 0"
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount)
}
const formatDate = (date: Date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}
const getMinDate = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return formatDate(today)
}

const MOCK_ROOM: any = {
  id: "R-MOCK",
  name: "Discussion Room A (Fallback)",
  description: "Deskripsi fallback jika API gagal.",
  capacity: 6,
  photos: ["https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop"],
  facilities: ["Whiteboard", "Projector", "WiFi"],
  status: "available",
  price: 50000,
}
const startTimeOptions = Array.from({ length: 18 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8
  const minute = (i % 2) * 30
  if (hour === 17 && minute === 0) return null
  if (hour === 16 && minute === 30) return null
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
}).filter(Boolean) as string[]
const endTimeOptions = Array.from({ length: 17 }, (_, i) => {
  const hour = Math.floor(i / 2) + 9
  const minute = (i % 2) * 30
  if (hour === 17 && minute === 30) return null
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
}).filter(Boolean) as string[]

export default function RoomDetailPage() {
  const router = useRouter()
  const params = useParams()
  const roomId = params?.id as string

  const [room, setRoom] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [isBooking, setIsBooking] = useState(false)
  const [selectedDate, setSelectedDate] = useState(getMinDate())
  const [borrowerName, setBorrowerName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [startTimeInput, setStartTimeInput] = useState("08:00")
  const [endTimeInput, setEndTimeInput] = useState("09:00")
  const [isNameLocked, setIsNameLocked] = useState(true)
  const [isPhoneLocked, setIsPhoneLocked] = useState(true)

  // State untuk modal payment
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null)

  const todayString = getMinDate()
  const isToday = selectedDate === todayString
  
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinutes = now.getMinutes()
  const currentTimeInMinutes = currentHour * 60 + currentMinutes

  const isTimeSlotDisabled = (time: string) => {
    if (!isToday) return false 

    const [optionHour, optionMinute] = time.split(':').map(Number)
    const optionTimeInMinutes = optionHour * 60 + optionMinute
    
    return optionTimeInMinutes < currentTimeInMinutes
  }

  useEffect(() => {
    if (apiError) {
      setApiError(null)
    }
  }, [selectedDate, startTimeInput, endTimeInput])

  useEffect(() => {
    let cancelled = false
    let activeController: AbortController | null = null

    const fetchRoomSafe = async (showLoading = false) => {
      if (showLoading) setIsLoading(true)
      if (!showLoading) setError(null)

      try {
        if (activeController) activeController.abort()
        const controller = new AbortController()
        activeController = controller

        const token = getAuthToken()
        if (!token) {
          if (!cancelled) {
            setError("authentication required.")
            setRoom(MOCK_ROOM)
          }
          return
        }

        const headers: Record<string, string> = {}
        if (token) headers["Authorization"] = `Bearer ${token}`

        const roomResponse = await fetch(`${API_URL}/api/rooms/${roomId}`, {
          headers,
          signal: controller.signal,
        })

        if (!roomResponse.ok) {
          const err = await roomResponse.json().catch(() => null)
          throw new Error(err?.message || "room not found.")
        }

        const roomData = await roomResponse.json()

        if (showLoading) {
            const userResponse = await fetch(`${API_URL}/api/users/me`, {
              headers,
              signal: controller.signal,
            })
            const userData = userResponse.ok ? await userResponse.json().catch(() => ({})) : {}

            if (!cancelled) {
              setBorrowerName(userData.name || userData.email || "")
              setPhoneNumber(userData.phone || "")
            }
        }

        if (!cancelled) {
          // setBorrowerName(userData.name || userData.email || "")
          // setPhoneNumber(userData.phone || "")
          setRoom(roomData)
          // setSelectedDate(getMinDate()) // Optional: reset date on reload or keep
          setError(null)
        }
      } catch (err: any) {
        if (!cancelled) {
          if (err.name === "AbortError") {
          } else {
            setError(err?.message || "failed to load room details.")
            setRoom(MOCK_ROOM)
          }
        }
      } finally {
        if (!cancelled && showLoading) setIsLoading(false)
      }
    }

    if (!roomId) {
      setIsLoading(false)
      setError("invalid room id.")
      return
    }

    // initial load with loader once
    fetchRoomSafe(true)

    const onFocus = () => fetchRoomSafe(false)
    const onVisibility = () => {
      if (document.visibilityState === "visible") fetchRoomSafe(false)
    }

    window.addEventListener("focus", onFocus)
    document.addEventListener("visibilitychange", onVisibility)

    const interval = setInterval(() => fetchRoomSafe(false), 5000)

    return () => {
      cancelled = true
      if (activeController) activeController.abort()
      window.removeEventListener("focus", onFocus)
      document.removeEventListener("visibilitychange", onVisibility)
      clearInterval(interval)
    }
  }, [roomId])

  const totalHours = calculateDurationHours(startTimeInput, endTimeInput)
  const totalPrice = room ? totalHours * room.price : 0
  const isRoomInMaintenance = room?.status === "maintenance"

  let warningMessage: string | null = null
  let warningColor = "bg-red-50 text-red-700 border-red-200"

  if (isRoomInMaintenance) {
    warningMessage = "This room is currently under maintenance."
    warningColor = "bg-yellow-50 text-yellow-700 border-yellow-200"
  } else if (calculateDurationHours(startTimeInput, endTimeInput) <= 0) {
    warningMessage = "End time must be after start time."
  } else if (totalHours < 1) {
    warningMessage = "Minimum booking duration is 1 hour."
  } else if (totalHours > 8) {
    warningMessage = "Maximum booking duration is 8 hours."
  } else if (apiError) {
    warningMessage = apiError
  }

  const isButtonDisabled = isBooking || isRoomInMaintenance || !!warningMessage || !borrowerName.trim() || !phoneNumber.trim()

  const handleBook = async () => {
    if (isButtonDisabled) return

    const selectedDateTime = new Date(`${selectedDate}T${startTimeInput}:00`);
    const nowCheck = new Date();

    if (selectedDateTime.getTime() < nowCheck.getTime()) {
      setApiError("Booking failed: Selected time is in the past. Please select a future time/date.")
      return
    }
    
    setIsBooking(true)
    setApiError(null)
    const token = getAuthToken()
    try {
      const response = await fetch(`${API_URL}/api/rooms/${roomId}/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: selectedDate,
          startTime: startTimeInput,
          endTime: endTimeInput,
          phone: phoneNumber,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.message || "Booking failed.")

      // Cek apakah ada payment_url
      if (data.payment_url) {
        setPaymentUrl(data.payment_url)
        setShowPaymentModal(true) // Tampilkan modal
      } else {
        // Booking gratis (ga ada payment)
        alert("Booking successful!")
        router.push("/bookings")
      }
    } catch (err: any) {
      setApiError(err.message || "Failed to process booking")
    } finally {
      setIsBooking(false)
    }
  }

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
        <p className="ml-3 text-gray-600 font-medium">Loading room details...</p>
      </div>
    )

  if (error || !room)
    return (
      <div className="p-12 text-center">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <h3 className="font-semibold text-red-800 mb-1">Error</h3>
        <p className="text-sm text-red-700">{error || `Room with ID ${roomId} not found.`}</p>
      </div>
    )

  const hasPhotos = room.photos && room.photos.length > 0

  return (
    <div className="min-h-screen bg-white">
      <button
        onClick={() => router.back()}
        className="fixed top-24 left-[calc(theme(spacing.4)+1rem)] sm:left-[calc(theme(spacing.6)+1.5rem)] lg:left-[calc(theme(spacing.7)+1rem)] z-40 flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg border border-gray-100 bg-white/80 backdrop-blur-md text-gray-600 hover:text-gray-900 hover:bg-slate-100/80 transition-all font-medium text-sm ring-1 ring-black/5"
      >
        <ArrowLeft className="w-4 h-4" />
      </button>

      {/* Modal Payment Confirmation */}
      {showPaymentModal && paymentUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Successful!</h3>
              <p className="text-gray-600">Room booked successfully. Please proceed to payment.</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Room:</span>
                <span className="font-semibold text-gray-900">{room.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-semibold text-gray-900">{selectedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-semibold text-gray-900">{startTimeInput} - {endTimeInput}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="font-semibold text-gray-900">{totalHours.toFixed(2)} hrs</span>
              </div>
              <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
                <span className="text-gray-900 font-semibold">Total Price:</span>
                <span className="text-cyan-600 font-bold text-lg">{formatRupiah(totalPrice)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  if (paymentUrl) window.location.href = paymentUrl
                }}
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <CreditCard className="w-5 h-5" />
                Pay Now
              </button>
              <button
                onClick={() => {
                  setShowPaymentModal(false)
                  router.push("/bookings")
                }}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 rounded-lg transition-all"
              >
                Pay Later (View Bookings)
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        
        {/* GLOBAL ERROR (Fetch Gagal) */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-6">
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* DETAIL ROOM */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Header Info */}
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                {room.name}
              </h1>
              <p className="text-gray-700 leading-relaxed">
                {room.description || "No description available for this room."}
              </p>
              
              {/* Capacity */}
              <div className="flex items-center gap-4 mt-3">
                <span className="flex items-center gap-2 text-gray-700 font-medium">
                  <Users className="w-5 h-5" />
                  {room.capacity} People
                </span>
              </div>
            </div>

            {/* Carousel Image */}
            <div className="relative w-full rounded-xl shadow-xl overflow-hidden aspect-[16/9] bg-gray-200">
              <Carousel className="w-full h-full" opts={{ loop: true }}>
                <CarouselContent>
                  {hasPhotos ? (
                    room.photos.map((photo: string, index: number) => (
                      <CarouselItem key={index}>
                        <img src={photo} alt={`${room.name} photo ${index + 1}`} className="w-full h-full object-cover" />
                      </CarouselItem>
                    ))
                  ) : (
                    <CarouselItem>
                      <img src={MOCK_ROOM.photos[0]} alt={room.name} className="w-full h-full object-cover" />
                    </CarouselItem>
                  )}
                </CarouselContent>

                {hasPhotos && room.photos.length > 1 && (
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

            {/* Room Features */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Room Features</h3>
              <div className="flex flex-wrap gap-2">
                {(room.facilities || []).map((feature: string, index: number) => (
                  <span key={index} className="px-3 py-1 bg-slate-200 text-slate-700 rounded-full text-sm font-medium">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* FORM BOOKING */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 space-y-8">
              
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
                <h3 className="font-bold text-gray-900 text-xl border-b pb-4">Book this Room</h3>
                
                <div>
                  <label className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Select Date <span className="text-red-500">*</span>
                  </label>
                  <input type="date" value={selectedDate} min={getMinDate()} onChange={(e) => setSelectedDate(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white transition-all" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Start
                    </label>
                    <select 
                      value={startTimeInput} 
                      onChange={(e) => setStartTimeInput(e.target.value)} 
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white transition-all text-sm"
                    >
                      {startTimeOptions.map(time => {
                        const disabled = isTimeSlotDisabled(time);
                        return (
                          <option key={time} value={time} disabled={disabled} className={disabled ? 'text-gray-400' : ''}>
                            {time}
                          </option>
                        );
                      })}          
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" /> End
                    </label>
                    <select 
                      value={endTimeInput} 
                      onChange={(e) => setEndTimeInput(e.target.value)} 
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white transition-all text-sm"
                    >
                      {endTimeOptions.map(time => {
                        const disabled = isTimeSlotDisabled(time);
                        return (
                          <option key={time} value={time} disabled={disabled} className={disabled ? 'text-gray-400' : ''}>
                            {time}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                 <div className="border-t border-gray-100 pt-2 space-y-4">
                  <h4 className="text-sm font-semibold text-gray-900">Borrower Information</h4>
                  
                  {/* Name Input */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1.5 flex items-center gap-1.5">
                      <UserIcon className="w-3.5 h-3.5" />
                      Full Name <span className="text-red-500">*</span>
                      <Pencil className="w-3 h-3 ml-auto text-gray-400 cursor-pointer hover:text-gray-600" onClick={() => setIsNameLocked(false)} style={{ display: isNameLocked ? "block" : "none" }} />
                    </label>
                    <input type="text" value={borrowerName} onChange={(e) => setBorrowerName(e.target.value)} placeholder="Enter your full name" readOnly={isNameLocked} className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all text-sm ${isNameLocked ? "bg-gray-50 border-gray-200 text-gray-600" : "bg-white border-gray-300"}`} />
                  </div>

                  {/* Phone Input */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1.5 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" />
                      Phone Number <span className="text-red-500">*</span>
                      <Pencil className="w-3 h-3 ml-auto text-gray-400 cursor-pointer hover:text-gray-600" onClick={() => setIsPhoneLocked(false)} style={{ display: isPhoneLocked ? "block" : "none" }} />
                    </label>
                    <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="0812..." readOnly={isPhoneLocked} className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all text-sm ${isPhoneLocked ? "bg-gray-50 border-gray-200 text-gray-600" : "bg-white border-gray-300"}`} />
                  </div>
                </div>

                {/* PRICE & BUTTON */}
                <div className="border-t border-gray-100 pt-4 mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-500">Duration</span>
                    <span className="font-medium text-gray-900">{totalHours > 0 ? Number(totalHours.toFixed(1)) : 0} hrs</span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-500">Total Price</span>
                    <span className="text-xl font-bold text-cyan-600">{formatRupiah(totalPrice)}</span>
                  </div>

                  {warningMessage && (
                    <div className={`p-3 rounded-lg border flex items-start gap-2 mb-4 ${warningColor}`}>
                      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <p className="text-xs font-semibold">{warningMessage}</p>
                    </div>
                  )}

                  <Button
                    onClick={handleBook}
                    disabled={isButtonDisabled}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg transform active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    {isBooking ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                      </>
                    ) : (
                      "Complete Booking"
                    )}
                  </Button>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}