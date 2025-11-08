'use client'

import { useState } from 'react'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Error } from '@/components/common/Error'

interface PaymentFormProps {
  amount: number
  type: 'booking' | 'fine'
  onSubmit: (amount: number) => Promise<void>
}

export const PaymentForm: React.FC<PaymentFormProps> = ({ amount, type, onSubmit }) => {
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await onSubmit(amount)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Payment failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
      <h2 className="text-xl font-bold">Payment - {type}</h2>

      {error && <Error message={error} />}

      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-gray-600 text-sm">Amount</p>
        <p className="text-3xl font-bold text-blue-600">Rp {amount.toLocaleString('id-ID')}</p>
      </div>

      <p className="text-sm text-gray-600">
        You will be redirected to payment gateway (Midtrans)
      </p>

      <Button type="submit" variant="primary" size="lg" isLoading={isLoading}>
        Pay Now
      </Button>
    </form>
  )
}