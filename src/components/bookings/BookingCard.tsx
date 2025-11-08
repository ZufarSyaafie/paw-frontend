'use client'

import { Booking } from '@/types'
import { Card } from '@/components/common/Card'
import Link from 'next/link'

interface BookingCardProps {
  booking: Booking
}

export const BookingCard: React.FC<BookingCardProps> = ({ booking }) => {
  const statusColor = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }

  const startDate = new Date(booking.startDate)
  const endDate = new Date(booking.endDate)

  return (
    <Card>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold">Booking #{booking.id.slice(0, 8)}</h3>
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              statusColor[booking.status]
            }`}
          >
            {booking.status.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-600 text-xs">Start Date</p>
            <p className="font-semibold">{startDate.toLocaleDateString('id-ID')}</p>
          </div>
          <div>
            <p className="text-gray-600 text-xs">End Date</p>
            <p className="font-semibold">{endDate.toLocaleDateString('id-ID')}</p>
          </div>
        </div>

        <p className="text-sm text-gray-600">
          🏢 Room ID: <span className="font-mono">{booking.roomId}</span>
        </p>

        <Link
          href={`/bookings/${booking.id}`}
          className="text-blue-600 hover:underline text-sm font-semibold"
        >
          View Details →
        </Link>
      </div>
    </Card>
  )
}