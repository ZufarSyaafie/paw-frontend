'use client'

import { Payment } from '@/types'
import { Card } from '@/components/common/Card'

interface PaymentHistoryProps {
  payments: Payment[]
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({ payments }) => {
  const statusIcon = {
    pending: '⏳',
    completed: '✅',
    failed: '❌',
  }

  return (
    <Card>
      <h2 className="text-2xl font-bold mb-6">Payment History</h2>
      <div className="space-y-3">
        {payments.map((payment) => (
          <div
            key={payment.id}
            className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">{statusIcon[payment.status]}</span>
              <div>
                <p className="font-semibold text-gray-800">
                  Rp {payment.amount.toLocaleString('id-ID')}
                </p>
                <p className="text-sm text-gray-600">
                  {new Date(payment.createdAt).toLocaleDateString('id-ID')}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-700">
                {payment.paymentMethod}
              </p>
              <p
                className={`text-xs font-semibold ${
                  payment.status === 'completed'
                    ? 'text-green-600'
                    : payment.status === 'pending'
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}
              >
                {payment.status.toUpperCase()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}