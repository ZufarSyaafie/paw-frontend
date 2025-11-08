'use client'

import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux'
import { fetchPayments } from '@/store/slices/paymentsSlice'
import { PaymentCard } from '@/components/payments/PaymentCard'
import { Loading } from '@/components/common/Loading'
import { Error } from '@/components/common/Error'

export default function PaymentsPage() {
  const dispatch = useAppDispatch()
  const { payments, loading, error } = useAppSelector((state) => state.payments)

  useEffect(() => {
    dispatch(fetchPayments())
  }, [dispatch])

  if (loading) return <Loading />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Payment History</h1>
        <p className="text-gray-600 mt-2">View your payment transactions</p>
      </div>

      {error && <Error message={error} onRetry={() => dispatch(fetchPayments())} />}

      {payments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No payments yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {payments.map((payment) => (
            <PaymentCard key={payment.id} payment={payment} />
          ))}
        </div>
      )}
    </div>
  )
}