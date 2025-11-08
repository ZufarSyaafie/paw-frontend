'use client'

import { useState } from 'react'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Error } from '@/components/common/Error'

interface BookingFormProps {
  roomId: string
  onSubmit: (startDate: string, endDate: string) => Promise<void>
}

export const BookingForm: React.FC<BookingFormProps> = ({ roomId, onSubmit }) => {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await onSubmit(startDate, endDate)
      setStartDate('')
      setEndDate('')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Booking failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
      <h2 className="text-xl font-bold">Book This Room</h2>

      {error && <Error message={error} />}

      <Input
        label="Start Date"
        type="datetime-local"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        required
      />

      <Input
        label="End Date"
        type="datetime-local"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        required
      />

      <Button type="submit" variant="primary" size="lg" isLoading={isLoading}>
        Book Room
      </Button>
    </form>
  )
}