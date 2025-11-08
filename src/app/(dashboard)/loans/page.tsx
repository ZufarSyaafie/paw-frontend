'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loan } from '@/types'
import { loanService } from '@/services/loanService'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { Loading } from '@/components/common/Loading'
import { Error } from '@/components/common/Error'
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux'
import { fetchLoans } from '@/store/slices/loansSlice'
import { LoanCard } from '@/components/loans/LoanCard'

export default function LoanDetailPage() {
  const params = useParams()
  const router = useRouter()
  const loanId = params.id as string

  const dispatch = useAppDispatch()
  const { loans, loading, error } = useAppSelector((state) => state.loans)

  const [loan, setLoan] = useState<Loan | null>(null)
  const [returning, setReturning] = useState(false)

  useEffect(() => {
    fetchLoan()
  }, [loanId])

  const fetchLoan = async () => {
    try {
      const data = await loanService.getLoan(loanId)
      setLoan(data)
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to fetch loan')
    }
  }

  const handleReturn = async () => {
    if (confirm('Are you sure you want to return this book?')) {
      try {
        setReturning(true)
        await loanService.returnBook(loanId)
        alert('Book returned successfully!')
        router.push('/loans')
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to return book')
      } finally {
        setReturning(false)
      }
    }
  }

  useEffect(() => {
    dispatch(fetchLoans())
  }, [dispatch])

  if (loading) return <Loading />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">My Loans</h1>
        <p className="text-gray-600 mt-2">Track your borrowed books</p>
      </div>

      {error && <Error message={error} onRetry={() => dispatch(fetchLoans())} />}

      {loans.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No active loans</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {loans.map((loan) => (
            <LoanCard key={loan.id} loan={loan} />
          ))}
        </div>
      )}
    </div>
  )
}