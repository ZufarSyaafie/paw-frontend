"use client"

import { Button } from "@/components/ui/button"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Users, AlertCircle, Phone, User as UserIcon, Loader2, Calendar, Clock, Pencil, AlertTriangle, ChevronDown } from "lucide-react"
import { useState, useEffect } from "react"
import { getAuthToken } from "@/lib/auth"
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselPrevious, 
  CarouselNext 
} from "@/components/ui/carousel";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ""

const timeToMinutes = (timeString: string) => {
  if (!timeString) return 0;
  const [h, m] = timeString.split(":").map(Number)
  return h * 60 + m
}
const calculateDurationHours = (start: string, end: string) => {
    if (!start || !end) return 0;
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
  const hour = Math.floor(i / 2) + 8;
  const minute = (i % 2) * 30;
  if (hour === 17 && minute === 0) return null;
  if (hour === 16 && minute === 30) return null;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}).filter(Boolean) as string[];
const endTimeOptions = Array.from({ length: 17 }, (_, i) => {
  const hour = Math.floor(i / 2) + 9;
  const minute = (i % 2) * 30;
  if (hour === 17 && minute === 30) return null;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}).filter(Boolean) as string[];
// --- End Helper Functions ---

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

  useEffect(() => {
    const fetchRoom = async () => {
      const token = getAuthToken()
      setIsLoading(true)
      setError(null)
      try {
        const roomResponse = await fetch(`${API_URL}/api/rooms/${roomId}`, { headers: { Authorization: `Bearer ${token}` } })
        const userResponse = await fetch(`${API_URL}/api/users/me`, { headers: { Authorization: `Bearer ${token}` } })
        if (!roomResponse.ok) {
          const errorData = await roomResponse.json().catch(() => ({}))
          throw new Error((errorData as any).message || "Room not found.")
        }
        const roomData = await roomResponse.json()
        const userData = await userResponse.json().catch(() => ({}))
        setBorrowerName(userData.name || userData.email || "")
        setPhoneNumber(userData.phone || "")
        setRoom(roomData)
        setSelectedDate(getMinDate())
      } catch (err: any) {
        setError(err?.message || "Failed to load room details.")
        setRoom(MOCK_ROOM)
      } finally {
        setIsLoading(false)
      }
    }
    if (roomId) fetchRoom()
  }, [roomId])

  // Tambahan: fungsi dapatkan daftar jam yang masih valid untuk "hari ini"
  const todayStr = getMinDate()
  const now = new Date()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  // Utility: ambil menit dari string HH:MM
  const toMinutes = (t: string) => {
    const [h, m] = t.split(":").map(Number)
    return h * 60 + m
  }

  // Filter start times jika tanggal sama dengan hari ini
  const filteredStartTimes = selectedDate === todayStr
    ? startTimeOptions.filter(t => toMinutes(t) > nowMinutes)
    : startTimeOptions

  // Pastikan start time terpilih masih valid; jika tidak, set ke slot pertama yang valid
  useEffect(() => {
    if (filteredStartTimes.length === 0 && selectedDate === todayStr) {
      // Semua jam sudah lewat; user harus pilih tanggal lain
      setStartTimeInput("")
      setEndTimeInput("")
      return
    }
    if (startTimeInput && !filteredStartTimes.includes(startTimeInput)) {
      setStartTimeInput(filteredStartTimes[0] || "")
      // Atur end minimal +1 slot
      const nextEnd = endTimeOptions.find(e => toMinutes(e) > toMinutes(filteredStartTimes[0]))
      setEndTimeInput(nextEnd || "")
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, filteredStartTimes])

  // Filter end times: tetap hanya yang > start selected
  const filteredEndTimes = endTimeOptions.filter(e => {
    if (!startTimeInput) return false
    return toMinutes(e) > toMinutes(startTimeInput)
  }).filter(e => {
    // Jika hari ini, juga pastikan end lebih besar dari waktu sekarang
    if (selectedDate !== todayStr) return true
    return toMinutes(e) > nowMinutes
  })

  const totalHours = calculateDurationHours(startTimeInput, endTimeInput)
  const totalPrice = room ? totalHours * room.price : 0

  const handleBook = async () => {
    if (!room || !borrowerName.trim() || !phoneNumber.trim()) {
      setApiError("Please fill required fields")
      return
    }
    if (totalHours < 1) {
      setApiError("Minimal booking duration is 1 hour")
      return
    }
    if (calculateDurationHours(startTimeInput, endTimeInput) <= 0) {
      setApiError("End time must be after start time")
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
      if (data.payment_url) {
        window.location.href = data.payment_url
      } else {
        router.push("/bookings")
      }
    } catch (err: any) {
      setApiError(err.message || "Failed to process booking")
    } finally {
      setIsBooking(false)
    }
  }

  if (isLoading) return (
    <div className="flex justify-center items-center h-screen">
      <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
      <p className="ml-3 text-gray-600 font-medium">Loading room details...</p>
    </div>
  )

  if (error || !room) return (
    <div className="p-12 text-center">
      <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
      <h3 className="font-semibold text-red-800 mb-1">Error</h3>
      <p className="text-sm text-red-700">{error || `Room with ID ${roomId} not found.`}</p>
    </div>
  )

  const isRoomInMaintenance = room.status === 'maintenance';
  const hasPhotos = room.photos && room.photos.length > 0;

  return (
    <div className="min-h-screen bg-white">
      <button
        onClick={() => router.back()}
        className="fixed top-24 left-[calc(theme(spacing.4)+1rem)] sm:left-[calc(theme(spacing.6)+1.5rem)] lg:left-[calc(theme(spacing.7)+1rem)] z-40 flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg border border-gray-100 bg-white/80 backdrop-blur-md text-gray-600 hover:text-gray-900 hover:bg-slate-100/80 transition-all font-medium text-sm ring-1 ring-black/5"
      >
        <ArrowLeft className="w-4 h-4" />
      </button>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

        {(error || apiError) && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-6">
            <p className="text-sm text-red-700 font-medium">{error || apiError}</p>
          </div>
        )}

        {isRoomInMaintenance && (
          <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg flex items-center gap-3 mb-6">
            <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-yellow-800">Room Under Maintenance</h3>
              <p className="text-sm text-yellow-700">This room is not available for booking because it is currently under maintenance.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{room.name}</h1>
              <p className="text-lg text-gray-600">{room.description || "Room description is not available."}</p>
              <div className="flex items-center gap-4 mt-3">
                <span className="flex items-center gap-1 text-gray-700">
                  <Users className="w-4 h-4" />
                  {room.capacity} people
                </span>
              </div>
            </div>

            <div className="relative w-full rounded-xl shadow-xl overflow-hidden aspect-[16/9] bg-gray-200">
              <Carousel className="w-full h-full" opts={{ loop: true }}>
                <CarouselContent>
                  {hasPhotos ? (
                    room.photos.map((photo: string, index: number) => (
                      <CarouselItem key={index}>
                        <img 
                          src={photo} 
                          alt={`${room.name} photo ${index + 1}`}
                          className="w-full h-full object-cover" 
                        />
                      </CarouselItem>
                    ))
                  ) : (
                    <CarouselItem>
                      <img 
                        src={MOCK_ROOM.photos[0]} 
                        alt={room.name} 
                        className="w-full h-full object-cover"
                      />
                    </CarouselItem>
                  )}
                </CarouselContent>
                
                {hasPhotos && room.photos.length > 1 && (
                  <>
                    <CarouselPrevious
      className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2
                 inline-flex items-center justify-center
                 h-7 w-7 sm:h-8 sm:w-8 aspect-square rounded-full
                 p-0 leading-none
                 border border-cyan-500 text-cyan-600
                 bg-white/70 backdrop-blur-sm shadow
                 hover:bg-cyan-50 hover:text-cyan-700 hover:border-cyan-600
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500
                 transition-all duration-200
                 [&>svg]:m-0 [&>svg]:h-3 [&>svg]:w-3 sm:[&>svg]:h-4 sm:[&>svg]:w-4 [&>svg]:shrink-0"
    />
    <CarouselNext
      className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2
                 inline-flex items-center justify-center
                 h-7 w-7 sm:h-8 sm:w-8 aspect-square rounded-full
                 p-0 leading-none
                 border border-cyan-500 text-cyan-600
                 bg-white/70 backdrop-blur-sm shadow
                 hover:bg-cyan-50 hover:text-cyan-700 hover:border-cyan-600
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500
                 transition-all duration-200
                 [&>svg]:m-0 [&>svg]:h-3 [&>svg]:w-3 sm:[&>svg]:h-4 sm:[&>svg]:w-4 [&>svg]:shrink-0"
    />
                  </>
                )}

              </Carousel>
            </div>

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

            <div>
              <h3 className="font-semibold text-gray-900 text-xl mb-3">About the Room</h3>
              <p className="text-gray-700 leading-relaxed">{room.description || "Detailed description is not available for this room."}</p>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-32 space-y-8">
              <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
                <h3 className="font-semibold text-gray-900 text-lg">Book this Room</h3>
                <div>
                  <label className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Select Date <span className="text-red-500">*</span></label>
                  <input type="date" value={selectedDate} min={getMinDate()} onChange={(e) => setSelectedDate(e.target.value)} className="w-full px-4 py-2.5 border border-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                       <Clock className="w-4 h-4" /> Start Time
                    </label>
                    <div className="relative">
                      <select
                        value={startTimeInput}
                        onChange={(e) => setStartTimeInput(e.target.value)}
                        className="w-full px-4 pr-10 py-2.5 border border-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white appearance-none"
                        disabled={filteredStartTimes.length === 0}
                      >
                        {filteredStartTimes.length === 0 ? (
                          <option value="">No time slots left today</option>
                        ) : (
                          filteredStartTimes.map(time => (
                            <option key={time} value={time}>{time}</option>
                          ))
                        )}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" /> End Time
                    </label>
                    <div className="relative">
                      <select
                        value={endTimeInput}
                        onChange={(e) => setEndTimeInput(e.target.value)}
                        className="w-full px-4 pr-10 py-2.5 border border-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white appearance-none"
                        disabled={!startTimeInput || filteredEndTimes.length === 0}
                      >
                        {!startTimeInput || filteredEndTimes.length === 0 ? (
                          <option value="">Select start first</option>
                        ) : (
                          filteredEndTimes.map(time => (
                            <option key={time} value={time}>{time}</option>
                          ))
                        )}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    </div>
                  </div>
                </div>
                <div className={`p-3 rounded-lg border text-center ${totalHours < 1 || totalHours > 8 ?
                  'bg-red-50 border-red-300' : 'bg-gray-50 border-gray-300'}`}>
                  <p className="text-sm font-semibold text-gray-800">
                    {totalHours < 1 ?
                      'Minimal booking duration is 1 hour.' : totalHours > 8 ? 'Maximum booking duration is 8 hours.'
                      : `Selected duration: ${Number(totalHours.toFixed(2))} hours`}
                  </p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
                <h3 className="font-semibold text-gray-900 text-lg">Borrower Information</h3>
                <div>
                  <label className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    Borrower Name <span className="text-red-500">*</span>
                    <Pencil className="w-4 h-4 ml-auto text-gray-500 cursor-pointer hover:text-gray-700" onClick={() => setIsNameLocked(false)} style={{ display: isNameLocked ? 'block' : 'none' }} />
                  </label>
                  <input type="text" value={borrowerName} onChange={(e) => setBorrowerName(e.target.value)} placeholder="Enter your full name" readOnly={isNameLocked} className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all ${isNameLocked ? 'bg-gray-100 border-slate-300' : 'bg-white border-slate-500'}`} />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number <span className="text-red-500">*</span>
                    <Pencil className="w-4 h-4 ml-auto text-gray-500 cursor-pointer hover:text-gray-700" onClick={() => setIsPhoneLocked(false)} style={{ display: isPhoneLocked ? 'block' : 'none' }} />
                  </label>
                  <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="Enter your phone number (e.g., 08123456789)" readOnly={isPhoneLocked} className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all ${isPhoneLocked ? 'bg-gray-100 border-slate-300' : 'bg-white border-slate-500'}`} />
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-600 mb-1">Total Estimated Price ({Number(totalHours.toFixed(2))} hours)</p>
                  <p className="text-2xl font-bold text-blue-600">{formatRupiah(totalPrice)}</p>
                  <p className="text-xs text-gray-500 mt-2">Price per Hour: {formatRupiah(room.price)}</p>
                </div>
                <Button onClick={handleBook} disabled={
                    isBooking ||
                    isRoomInMaintenance || 
                    totalHours < 1 || 
                    calculateDurationHours(startTimeInput, endTimeInput) <= 0 || 
                    !borrowerName.trim() ||
                    !phoneNumber.trim()
                  } 
                  className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg disabled:cursor-not-allowed transition-all"
                >
                  {isBooking ?
                    "Processing..." 
                    : isRoomInMaintenance ? "Sedang Maintenance"
                    : totalHours < 1 ? "Minimum 1 Hour Required" 
                    : `Complete Booking (${Number(totalHours.toFixed(2))} hours)`
                  }
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}