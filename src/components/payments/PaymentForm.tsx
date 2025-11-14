"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button' 
// import { Input } from '@/components/ui/input'
import { AlertCircle } from 'lucide-react'

interface PaymentFormProps {
  amount: number
  type: 'booking' | 'fine' | 'loan_deposit'
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
      setError(err.message || 'Payment failed') 
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
      <h2 className="text-xl font-bold">Payment - {type.toUpperCase()}</h2>

      {error && ( // FIX: Ganti <Error> dengan alert box
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-800 font-medium">{error}</p>
        </div>
      )}

      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-gray-600 text-sm">Amount</p>
        <p className="text-3xl font-bold text-blue-600">Rp {amount.toLocaleString('id-ID')}</p>
      </div>

      <p className="text-sm text-gray-600">
        You will be redirected to payment gateway (Midtrans)
      </p>

      {/* FIX PROP NAME: loading=isLoading */}
      <Button type="submit" variant="primary" size="lg" loading={isLoading}> 
        Pay Now
      </Button>
    </form>
  )
}