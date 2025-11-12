'use client'

import { Booking } from '@/types'
import { Card } from '@/components/ui/card' // <-- Ganti ke komponen UI Card
import Link from 'next/link'
import { Calendar, Clock, DollarSign, Users, XCircle, CheckCircle, Hourglass } from 'lucide-react'

interface BookingCardProps {
  booking: Booking
}

export const BookingCard: React.FC<BookingCardProps> = ({ booking }) => {
  const statusConfig = {
    confirmed: { color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle, label: 'CONFIRMED' },
    pending_payment: { color: 'bg-amber-100 text-amber-800', icon: Hourglass, label: 'PENDING PAYMENT' },
    cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'CANCELLED' },
  }

  const config = statusConfig[booking.status] || statusConfig.cancelled

  const date = new Date(booking.date)
  const formattedDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  const formattedTime = `${booking.startTime} - ${booking.endTime}`
  const isPending = booking.status === 'pending_payment'
  const totalPriceString = booking.totalPrice > 0 
    ? `Rp ${booking.totalPrice.toLocaleString('id-ID')}` 
    : 'Free (Rp 0)'


  return (
    <Card className={`overflow-hidden transition-all duration-300 hover:shadow-lg ${
        isPending ? 'border-amber-300 hover:border-amber-400' : 'border-slate-200 hover:border-blue-400'
    } h-full flex flex-col`}>
        
      <div className="space-y-4 p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-gray-900">{booking.room.name}</h3>
          
          {/* Status Badge */}
          <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${config.color}`}>
            <config.icon className='w-3 h-3' />
            {config.label}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-y-3 text-sm border-t pt-4 border-gray-100">
          
          {/* Tanggal */}
          <InfoItem icon={Calendar} label="Date" value={formattedDate} />
          
          {/* Waktu */}
          <InfoItem icon={Clock} label="Time" value={formattedTime} />
          
          {/* Durasi */}
          <InfoItem icon={Users} label="Capacity" value={`${booking.room.capacity} people`} />

          {/* Harga */}
          <InfoItem icon={DollarSign} label="Price" value={totalPriceString} />

        </div>

        {isPending && (
            <div className='p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 font-semibold'>
                Please complete payment to confirm your booking.
            </div>
        )}

        {/* Link Detail/Action */}
        <div className='mt-4 pt-4 border-t border-gray-100'>
            <Link
                href={`/bookings/${booking.id}`}
                className="text-cyan-600 hover:text-cyan-700 transition-colors text-sm font-semibold flex items-center gap-1"
            >
                View Details & Actions →
            </Link>
        </div>
      </div>
    </Card>
  )
}

// Helper Component untuk Info Baris
const InfoItem = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
    <div>
        <p className='text-xs text-gray-500 flex items-center gap-1.5 font-semibold uppercase'>
            <Icon className='w-3 h-3 text-gray-400' /> {label}
        </p>
        <p className='font-medium text-gray-900 mt-1'>{value}</p>
    </div>
)