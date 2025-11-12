'use client'

import { FrontendLoan } from '@/types' 
import { Card } from '@/components/ui/card' 
import Link from 'next/link'
import { Clock, BookOpen, DollarSign, ArrowRight } from 'lucide-react'

interface LoanCardProps {
  loan: FrontendLoan
}

export const LoanCard: React.FC<LoanCardProps> = ({ loan }) => {
  const loanStatusString = loan.status as string;

  const statusConfig = {
    borrowed: { color: 'bg-cyan-100 text-cyan-800', label: 'BORROWED' },
    returned: { color: 'bg-green-100 text-green-800', label: 'RETURNED' },
    overdue: { color: 'bg-red-100 text-red-800', label: 'OVERDUE' }, 
  }

  const config = statusConfig[loanStatusString as keyof typeof statusConfig] || statusConfig.borrowed; 
  
  const isOverdue = loanStatusString === 'overdue' // <-- FIXED
  const isReturned = loanStatusString === 'returned' // <-- FIXED
  
  const daysLeft = Math.ceil(
    (new Date(loan.dueDate).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  )

  const daysOverdue = Math.abs(daysLeft)

  return (
    <Card className={`overflow-hidden transition-all duration-300 hover:shadow-lg ${
        isOverdue ? 'border-l-4 border-red-500 hover:shadow-red-300/30' : 'hover:border-cyan-400'
    } h-full flex flex-col`}>
      <div className="space-y-4 p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start border-b pb-3 border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{loan.book.title}</h3>
          
          {/* Status Badge */}
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${config.color} flex-shrink-0`}
          >
            {config.label}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-y-3 text-sm">
          
          {/* Penulis */}
          <InfoItem icon={BookOpen} label="Author" value={loan.book.author} />
          
          {/* Deposit */}
          <InfoItem icon={DollarSign} label="Deposit" value={`Rp ${loan.depositAmount.toLocaleString('id-ID')}`} />
          
          {/* Borrow Date */}
          <InfoItem icon={Clock} label="Borrowed" value={new Date(loan.borrowDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />

          {/* Due Date */}
          <InfoItem 
            icon={Clock} 
            label={isOverdue ? "OVERDUE DATE" : "Due Date"} 
            value={new Date(loan.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} 
            valueClass={isOverdue ? 'text-red-600 font-bold' : 'text-gray-900'}
          />
        </div>

        {/* Info Waktu */}
        {!isReturned && (
          <div className={`mt-2 p-3 rounded-lg text-sm font-semibold ${isOverdue ? 'bg-red-50 text-red-800' : 'bg-cyan-50 text-cyan-800'}`}>
            {isOverdue 
              ? `OVERDUE by ${daysOverdue} days!`
              : `${daysLeft} days left to return.`
            }
          </div>
        )}

        {/* Link Detail/Action */}
        <div className='mt-auto pt-4 border-t border-gray-100'>
            <Link
                href={`/loans/${loan.id}`}
                className="text-cyan-600 hover:text-cyan-700 transition-colors text-sm font-semibold flex items-center gap-1"
            >
                View Details & Return <ArrowRight className='w-4 h-4' />
            </Link>
        </div>
      </div>
    </Card>
  )
}

// Helper Component untuk Info Baris
const InfoItem = ({ icon: Icon, label, value, valueClass = 'text-gray-900' }: { icon: any, label: string, value: string, valueClass?: string }) => (
    <div>
        <p className='text-xs text-gray-500 flex items-center gap-1.5 font-semibold uppercase'>
            <Icon className='w-3 h-3 text-gray-400' /> {label}
        </p>
        <p className={`font-medium mt-1 ${valueClass}`}>{value}</p>
    </div>
)