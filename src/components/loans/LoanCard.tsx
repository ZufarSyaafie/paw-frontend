'use client'

import { Loan } from '@/types'
import { Card } from '@/components/common/Card'
import Link from 'next/link'

interface LoanCardProps {
  loan: Loan
  bookTitle?: string
}

export const LoanCard: React.FC<LoanCardProps> = ({ loan, bookTitle }) => {
  const statusColor = {
    active: 'bg-blue-100 text-blue-800',
    returned: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800',
  }

  const isOverdue =
    new Date(loan.dueDate) < new Date() && loan.status === 'active'
  const daysLeft = Math.ceil(
    (new Date(loan.dueDate).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  )

  return (
    <Card className={isOverdue ? 'border-l-4 border-red-500' : ''}>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold">{bookTitle || 'Book'}</h3>
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              statusColor[loan.status]
            }`}
          >
            {loan.status.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-600 text-xs">Borrow Date</p>
            <p className="font-semibold">
              {new Date(loan.borrowDate).toLocaleDateString('id-ID')}
            </p>
          </div>
          <div>
            <p
              className={`text-xs ${isOverdue ? 'text-red-600 font-bold' : 'text-gray-600'}`}
            >
              {isOverdue ? 'OVERDUE' : 'Due Date'}
            </p>
            <p
              className={`font-semibold ${
                isOverdue ? 'text-red-600' : 'text-gray-800'
              }`}
            >
              {new Date(loan.dueDate).toLocaleDateString('id-ID')}
            </p>
          </div>
        </div>

        {loan.status === 'active' && (
          <p
            className={`text-sm ${
              isOverdue
                ? 'text-red-600 font-bold'
                : 'text-green-600'
            }`}
          >
            {isOverdue
              ? `Overdue by ${Math.abs(daysLeft)} days`
              : `${daysLeft} days left`}
          </p>
        )}

        {loan.returnDate && (
          <p className="text-sm text-gray-600">
            Returned: {new Date(loan.returnDate).toLocaleDateString('id-ID')}
          </p>
        )}

        <Link
          href={`/loans/${loan.id}`}
          className="text-blue-600 hover:underline text-sm font-semibold"
        >
          View Details →
        </Link>
      </div>
    </Card>
  )
}