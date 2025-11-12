'use client'

import { useEffect, useState } from 'react'
import { typography } from '@/styles/typography'
import { Loader2, AlertCircle, DollarSign } from 'lucide-react'
import { PaymentCard } from '@/components/payments/PaymentCard'
import type { Payment } from '@/types'
import { getAuthToken } from '@/lib/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL

// Mock Payments 
// const MOCK_PAYMENTS: Payment[] = [
//     {
//         id: "PAY-001",
//         userId: "U-001",
//         amount: 25000,
//         status: "completed",
//         paymentMethod: "bank_transfer",
//         description: "Deposit Peminjaman Buku",
//         transactionId: "TRX-12345",
//         type: "loan_deposit",
//         createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
//     },
//     {
//         id: "PAY-002",
//         userId: "U-001",
//         amount: 100000,
//         status: "pending",
//         paymentMethod: "e_wallet",
//         description: "Room Booking Fee - Meeting Room C",
//         transactionId: "TRX-12346",
//         type: "room_booking",
//         createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
//     },
//     {
//         id: "PAY-003",
//         userId: "U-001",
//         amount: 50000,
//         status: "failed",
//         paymentMethod: "credit_card",
//         description: "Room Booking Fee - Discussion Room A",
//         transactionId: "TRX-12347",
//         type: "room_booking",
//         createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
//     },
// ]

export default function PaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchPayments = async () => {
            const token = getAuthToken()
            
            if (!token) {
                setError("Authentication required to view payment history.")
                setIsLoading(false)
                return
            }

            setIsLoading(true)
              setError(null)
            
            try {
                const response = await fetch(`${API_URL}/api/payments/my`, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.message || "Failed to fetch payment.")
                }

                const data = await response.json()
                setPayments(data);
            } catch (err: any) {
                console.error("Fetch Payments Error:", err)
                setError(err.message || "Failed to load payment history.")
                setPayments([]) // Set data kosong kalo error
            } finally {
                setIsLoading(false)
            }
        }

        fetchPayments()
    }, []) 

    return (
        <div className="space-y-8 p-4 sm:p-6 lg:p-8">
            <header className="py-4 border-b mb-4">
                <h1 className={typography.h1}>Payment History</h1>
                <p className={`${typography.bodySmall} mt-2 text-gray-600`}>View your deposit and transaction history</p>
            </header>

            {isLoading ? (
                <div className="flex justify-center items-center h-48">
                    <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
                    <p className="ml-3 text-gray-600 font-medium">Loading history...</p>
                </div>
            ) : error ? (
                <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center flex flex-col items-center">
                    <AlertCircle className="w-8 h-8 text-red-600 mb-3" />
                    <h3 className="font-semibold text-red-800 mb-1">Error Loading Data</h3>
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            ) : payments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {payments.map((payment: Payment) => (
                        <PaymentCard key={payment.id} payment={payment} />
                    ))}
                </div>
            ) : (
                <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
                    <DollarSign className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-800 mb-1">No Payments Found</h3>
                    <p className="text-sm text-gray-600">You currently have no recorded transactions.</p>
                </div>
            )}
        </div>
    )
}