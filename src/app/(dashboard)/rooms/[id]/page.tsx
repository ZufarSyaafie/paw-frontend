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
} from "lucide-react" 
import { useState, useEffect } from "react"
import { getAuthToken } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL

const formatRupiah = (amount: number) => {
    // Handle jika amount undefined atau null dari API
    if (typeof amount !== 'number' || isNaN(amount)) {
        return "Rp 0";
    }
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(amount)
}

const formatDate = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`
}

const getMinDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return formatDate(today);
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
};

export default function RoomDetailPage() {
    const router = useRouter()
    const params = useParams()
    const roomId = params.id as string
    
    const [room, setRoom] = useState<any | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [isBooking, setIsBooking] = useState(false)
    const [selectedDate, setSelectedDate] = useState(getMinDate())

    const [borrowerName, setBorrowerName] = useState("")
    const [phoneNumber, setPhoneNumber] = useState("")
    const [selectedSlots, setSelectedSlots] = useState<string[]>([])
    
    const SIMULATED_SLOTS = [
        "09:00 - 10:00", 
        "10:00 - 11:00", 
        "11:00 - 12:00", 
        "13:00 - 14:00", 
        "14:00 - 15:00", 
        "15:00 - 16:00"
    ]

    const handleSlotToggle = (slot: string) => {
         setSelectedSlots(prev => {
            if (prev.includes(slot)) {
                return prev.filter(s => s !== slot); 
            } else {
                return [...prev, slot].sort(); 
            }
        });
    }

    const totalHours = selectedSlots.length
    const totalPrice = room ? totalHours * room.price : 0

    useEffect(() => {
        const fetchRoom = async () => {
            const token = getAuthToken()
            
            setIsLoading(true)
            setError(null)
            
             try {
                if (!roomId) throw new Error("Room ID is missing in URL.");

                const response = await fetch(`${API_URL}/api/rooms/${roomId}`, {
                     headers: { "Authorization": `Bearer ${token}` }
                })

                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.message || "Room not found.")
                 }

                const data = await response.json() 
                setRoom(data)
                setSelectedDate(getMinDate())

            } catch (err: any) {
                console.error(err)
                 setError(err.message || "Failed to load room details.")
                 // Fallback ke MOCK_ROOM jika fetch gagal
                setRoom(MOCK_ROOM)
            } finally {
                setIsLoading(false)
            }
        }

        if (roomId) fetchRoom()
    }, [roomId]) 

    const handleBook = async (): Promise<void> => {
        // Validasi form
        if (!room || selectedSlots.length === 0 || !borrowerName.trim() || !phoneNumber.trim()) {
            alert("Please select time slots and fill in all required fields.");
            return;
        }

        setIsBooking(true);
        setError(null);
        const token = getAuthToken();
        
        try {
            const startTime = selectedSlots[0].split(" - ")[0];
            const endTime = selectedSlots[selectedSlots.length - 1].split(" - ")[1]; 

            const response = await fetch(`${API_URL}/api/rooms/${roomId}/book`, {
                method: 'POST',
                headers: { 
                    "Content-Type": "application/json",
                     "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify({
                    date: selectedDate,
                    startTime: startTime,
                    endTime: endTime,
                    phone: phoneNumber,
                }),
            });
            
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Booking failed.");
            }

            // Redirect ke Midtrans jika ada payment_url
            if (data.payment_url) {
                alert("Booking created, redirecting to payment.");
                window.location.href = data.payment_url;
            } else {
                // Jika gratis (totalPrice 0)
                alert(data.message || "Room booked successfully (Free of charge)!");
                router.push("/bookings");
            }
        } catch (err: any) {
            setError(err.message || "Failed to process booking.");
            alert(`Booking failed: ${err.message}`);
        } finally {
            setIsBooking(false);
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

    return (
        <div className="min-h-screen bg-white">
            {/* Header - Back Button */}
            <div className="sticky top-16 z-40 bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <button
                        onClick={() => router.back()}
                         className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Rooms
                     </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-6">
                        <p className="text-sm text-red-700 font-medium">{error}</p>
                    </div>
                )}
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                     
                     {/* Kolom Kiri: Detail Ruangan */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Header Section */}
                        <div>
                             <h1 className="text-4xl font-bold text-gray-900 mb-2">{room.name}</h1>
                             {/* use 'room.description' jika ada, jika tidak, fallback */}
                            <p className="text-lg text-gray-600">{room.description || "Deskripsi ruangan tidak tersedia."}</p>
                            <div className="flex items-center gap-4 mt-3">
                                <span className="flex items-center gap-1 text-gray-700">
                                    <Users className="w-4 h-4" />
                                    {room.capacity} people
                             </span>
                            </div>
                        </div>

                        {/* Room Image */}
                         <img
                            // use 'room.photos[0]' (gambar pertama dari array)
                            src={room.photos?.[0] || "https://via.placeholder.com/800x600?text=Room+Image"}
                            alt={room.name}
                             className="w-full rounded-xl shadow-xl object-cover aspect-[16/9]"
                        />

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

                        {/* Long Description */}
                        <div>
                            <h3 className="font-semibold text-gray-900 text-xl mb-3">About the Room</h3>
                            {/* use 'room.description' dari BE, karena 'longDescription' tidak ada */}
                            <p className="text-gray-700 leading-relaxed">{room.description || "Deskripsi detail tidak tersedia untuk ruangan ini."}</p>
                        </div>
                    </div>

                    {/* Kolom Kanan: Booking Widget */}
                     <div className="lg:col-span-1">
                        <div className="sticky top-32 space-y-8">
                            
                            {/* Form: Kalender dan Slot */}
                            <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
                                <h3 className="font-semibold text-gray-900 text-lg">Book this Room</h3>
                                 
                                <div>
                                    <label className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        Select Date <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        type="date" 
                                        value={selectedDate} 
                                        min={getMinDate()} // Set tanggal minimal hari ini
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white"
                                    />
                                </div>
                                
                                {/* Slot Waktu (Simulasi) */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        Available Slots (Simulation) <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {SIMULATED_SLOTS.map(slot => (
                                            <Button 
                                                key={slot}
                                                variant={selectedSlots.includes(slot) ? 'primary' : 'outline'}
                                                size="sm"
                                                onClick={() => handleSlotToggle(slot)}
                                                className={`text-xs ${selectedSlots.includes(slot) ? 'bg-cyan-600 text-white' : 'text-cyan-700 border-cyan-500'}`}
                                            >
                                                {slot}
                                            </Button>
                                        ))}
                                    </div>
                                    {selectedSlots.length > 0 && (
                                        <p className="text-xs text-gray-500 pt-1">
                                            Selected: {selectedSlots[0].split(' - ')[0]} to {selectedSlots[selectedSlots.length - 1].split(' - ')[1]} ({totalHours} jam)
                                        </p>
                                    )}
                                </div>
                            </div>
                           
                            {/* Form: Informasi Peminjam */}
                            <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
                                 <h3 className="font-semibold text-gray-900 text-lg">Borrower Information</h3>

                                <div>
                                    <label className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                         <UserIcon className="w-4 h-4" />
                                        Borrower Name <span className="text-red-500">*</span>
                                     </label>
                                    <input
                                        type="text"
                                         value={borrowerName}
                                        onChange={(e) => setBorrowerName(e.target.value)}
                                         placeholder="Enter your full name"
                                        className="w-full px-4 py-2.5 border border-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white"
                                         required
                                    />
                                </div>

                                 <div>
                                    <label className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                        <Phone className="w-4 h-4" />
                                          Phone Number <span className="text-red-500">*</span>
                                    </label>
                                     <input
                                        type="tel"
                                        value={phoneNumber}
                                         onChange={(e) => setPhoneNumber(e.target.value)}
                                        placeholder="Enter your phone number (e.g., 08123456789)"
                                         className="w-full px-4 py-2.5 border border-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white"
                                        required
                                     />
                                </div>

                                {/* Rangkuman Total Harga */}
                                 <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                    <p className="text-sm text-gray-600 mb-1">Total Estimated Price ({totalHours} hours)</p>
                                    <p className="text-2xl font-bold text-blue-600">{formatRupiah(totalPrice)}</p>
                                     <p className="text-xs text-gray-500 mt-2">
                                        Price per Hour: {formatRupiah(room.price)}
                                     </p>
                                </div>
                                
                                 
                                 {/* Tombol Submit Booking */}
                                <Button
                                    onClick={handleBook}
                                    // Tombol disable jika loading, atau form belum lengkap
                                     disabled={isBooking || selectedSlots.length === 0 || !borrowerName.trim() || !phoneNumber.trim()}
                                    className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg disabled:cursor-not-allowed transition-all"
                                >
                                     {isBooking ? "Processing..." : selectedSlots.length > 0 ? `Complete Booking (${totalHours} hours)` : "Select Time Slots to Book"}
                                </Button>
                            </div>
                        </div>
                     </div>
                </div>
            </div>
        </div>
    )
}