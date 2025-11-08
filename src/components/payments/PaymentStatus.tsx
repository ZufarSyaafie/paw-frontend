'use client'

import { Payment } from '@/types'
import { Card } from '@/components/common/Card'

interface PaymentStatusProps {
  payment: Payment
}

export const PaymentStatus: React.FC<PaymentStatusProps> = ({ payment }) => {
  const statusColor = {
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  }

  const typeLabel = {
    booking: 'Room Booking',
    fine: 'Library Fine',
    fee: 'Service Fee',
  }

  return (
    <Card>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold">Payment #{payment.id.slice(0, 8)}</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColor[payment.status]}`}>
            {payment.status.toUpperCase()}
          </span>
        </div>

        {payment.type && (
          <p className="text-sm text-gray-600">
            Type: <span className="font-semibold">{typeLabel[payment.type as keyof typeof typeLabel] || payment.type}</span>
          </p>
        )}

        <p className="text-lg font-bold text-blue-600">
          Rp {payment.amount.toLocaleString('id-ID')}
        </p>

        {payment.transactionId && (
          <p className="text-sm text-gray-600">
            Transaction ID: <span className="font-mono">{payment.transactionId}</span>
          </p>
        )}

        {payment.paymentMethod && (
          <p className="text-sm text-gray-600">
            Method: <span className="font-semibold">{payment.paymentMethod.replace('_', ' ').toUpperCase()}</span>
          </p>
        )}

        <p className="text-sm text-gray-500 pt-2 border-t">
          {new Date(payment.createdAt).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>
    </Card>
  )
}