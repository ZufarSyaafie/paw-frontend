'use client'

import { Payment } from '@/types'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

interface PaymentCardProps {
  payment: Payment
}

export const PaymentCard: React.FC<PaymentCardProps> = ({ payment }) => {
  const statusColor = {
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  }

  const paymentMethodLabel = {
    credit_card: '💳 Credit Card',
    bank_transfer: '🏦 Bank Transfer',
    e_wallet: '📱 E-Wallet',
    cash: '💵 Cash',
  }

  return (
    <Card>
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-gray-800">
              Payment #{payment.id.slice(0, 8)}
            </h3>
            {payment.description && (
              <p className="text-sm text-gray-600 mt-1">{payment.description}</p>
            )}
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              statusColor[payment.status]
            }`}
          >
            {payment.status.toUpperCase()}
          </span>
        </div>

        <div className="border-t pt-4">
          <p className="text-2xl font-bold text-blue-600">
            Rp {payment.amount.toLocaleString('id-ID')}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-gray-600 text-xs">Payment Method</p>
            <p className="font-semibold">
              {paymentMethodLabel[payment.paymentMethod as keyof typeof paymentMethodLabel] ||
                payment.paymentMethod}
            </p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-gray-600 text-xs">Date</p>
            <p className="font-semibold">
              {new Date(payment.createdAt).toLocaleDateString('id-ID')}
            </p>
          </div>
        </div>

        {payment.transactionId && (
          <div className="bg-blue-50 p-3 rounded text-sm">
            <p className="text-gray-600 text-xs">Transaction ID</p>
            <p className="font-mono font-semibold text-blue-600">
              {payment.transactionId}
            </p>
          </div>
        )}

        <div className="pt-3 border-t flex gap-2">
          <Link
            href={`/payments/${payment.id}`}
            className="flex-1 text-center bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
          >
            View Details
          </Link>
          <button className="flex-1 bg-gray-200 text-gray-700 py-2 rounded font-semibold hover:bg-gray-300 transition">
            Download
          </button>
        </div>
      </div>
    </Card>
  )
}