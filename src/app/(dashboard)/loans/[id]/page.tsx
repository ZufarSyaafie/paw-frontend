"use client"

import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Check, X, Clock, Loader2, AlertCircle, TrendingDown } from "lucide-react"
import { useState, useEffect } from "react"
import type { Loan } from "@/types" 
import { getAuthToken } from "@/lib/auth"
import { Button } from "@/components/ui/button" 

const API_URL = process.env.NEXT_PUBLIC_API_URL

// Helper function to format date
const formatDate = (dateString: string | undefined | null) => {
  if (!dateString) return "N/A"
  return new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

// Helper function to format currency
const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount)
}

// Configuration for Loan Status (status BE + Overdue di FE)
const STATUS_CONFIG = {
  borrowed: {
    label: "Borrowed (Active)",
    icon: Clock,
    color: "bg-cyan-50 text-cyan-700 border-cyan-200", 
    button: "bg-green-500 hover:bg-green-600",
  },
  returned: {
    label: "Returned",
    icon: Check,
    color: "bg-green-50 text-green-700 border-green-200",
    button: "bg-gray-400 cursor-not-allowed",
  },
  overdue: {
    label: "Overdue",
    icon: X,
    color: "bg-red-50 text-red-700 border-red-200",
    button: "bg-red-500 hover:bg-red-600",
  },
} as const

// Mock data (FALLBACK) - make sure struktur menggunakan nested fields (loan.book)
const MOCK_LOAN: Loan = {
  id: "MOCK-123",
  user: { id: "U-001", email: "mock@test.com" }, // user mock
  book: { 
      id: "B-MOCK",
      title: "The Great Gatsby (Mock Detail)",
      author: "F. Scott Fitzgerald",
      cover: "https://images.unsplash.com/photo-1543002588-d83cedbc4d60?w=400&h=600&fit=crop",
  },
  depositAmount: 25000,
  midtransOrderId: "MOCK-ORD",
  paymentStatus: "paid",
  refundStatus: "pending",
  borrowDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  status: "borrowed",
} as unknown as Loan // Type casting agar tipe match

// Tipe yang akan digunakan untuk state (Loan asli + status overdue untuk FE)
type FrontendLoanDetail = Loan & { isOverdue: boolean, fines?: number }

export default function LoanDetailPage() {
  const router = useRouter()
  const params = useParams()
  const loanId = params.id as string

  const [loan, setLoan] = useState<FrontendLoanDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isReturning, setIsReturning] = useState(false)

  useEffect(() => {
    const fetchLoan = async () => {
      const token = getAuthToken()
      if (!token) {
        setError("Authentication required.")
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(`${API_URL}/api/loans/${loanId}`, {
          headers: { "Authorization": `Bearer ${token}` }
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Loan not found.")
        }

        const data = await response.json() as Loan 
        
        // Cek Overdue
        const isOverdue = data.status === 'borrowed' && new Date(data.dueDate) < new Date()

        setLoan({ ...data, isOverdue, fines: data.depositAmount * 0.1 } as FrontendLoanDetail) // Simulasi fines

      } catch (err: any) {
        console.error(err)
        setError(err.message || "Failed to load loan details. Using fallback data.")
        // Fallback ke Mock Data jika Gagal
        setLoan({ ...MOCK_LOAN, isOverdue: false, fines: 0 } as FrontendLoanDetail) 
      } finally {
        setIsLoading(false)
      }
    }

    if (loanId) fetchLoan()
  }, [loanId])

  const handleReturn = async () => {
    if (!loan || loan.status !== 'borrowed') return 

    setIsReturning(true)
    setError(null)
    const token = getAuthToken()

    try {
      const response = await fetch(`${API_URL}/api/loans/${loanId}/return`, {
        method: 'POST',
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Return failed.")
      }

      const refundStatus = data.loan.refundStatus
      const message = refundStatus === 'refunded' ? "Book successfully returned! Deposit refunded." : "Book returned. Deposit forfeited."
      
      alert(message)
      router.push("/loans") 

    } catch (err: any) {
      setError(err.message || "Failed to process return.")
      alert(`Return failed: ${err.message}`)
    } finally {
      setIsReturning(false)
    }
  }

  if (isLoading) return (
    <div className="flex justify-center items-center h-screen">
      <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
      <p className="ml-3 text-gray-600 font-medium">Loading loan details...</p>
    </div>
  )

  if (error && !loan) return (
    <div className="p-12 text-center">
      <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
      <h3 className="font-semibold text-red-800 mb-1">Error</h3>
      <p className="text-sm text-red-700">{error || `Loan with ID ${loanId} not found.`}</p>
    </div>
  )

  if (!loan) {
      return null; 
  }
  
  const displayStatusKey = loan.isOverdue ? 'overdue' : (loan.status === 'returned' ? 'returned' : 'borrowed')
  const statusInfo = STATUS_CONFIG[displayStatusKey]
  const StatusIcon = statusInfo.icon

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Back Button */}
      <div className="sticky top-16 z-40 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Loan History
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-6">
                <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
 
          {/* Left: Book Cover & Action */}
          <div className="md:col-span-1">
            <div className="sticky top-32">
              <img
                src={loan.book?.cover}
                alt={loan.book?.title} 
                
                className="w-full rounded-lg shadow-lg object-cover aspect-[2/3]"
              />

              {/* Status Badge */}
              <div className={`mt-4 px-3 py-2 rounded-lg border flex items-center gap-2 ${statusInfo.color}`}>
                <StatusIcon className="w-4 h-4" />
                <span className="font-semibold text-sm capitalize">{statusInfo.label}</span>
              </div>

              {/* Deposit Info */}
              <div className="mt-3 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="text-sm font-semibold text-slate-700">Deposit: {formatRupiah(loan.depositAmount)}</p>
              </div>

              {/* Return Button */}
              <Button
                onClick={handleReturn}
                disabled={isReturning || loan.status !== "borrowed"} 
                className={`w-full mt-4 py-3 text-white font-bold rounded-lg transition-all ${loan.status === 'borrowed' ? statusInfo.button : 'bg-gray-400 cursor-not-allowed'}`}
              >
                {isReturning ? "Processing Return..." : loan.status !== "borrowed" ? "Already Returned" : "Confirm Return"}
              </Button>
            </div>
          </div>

          {/* Right: Loan Details */}
          <div className="md:col-span-2 space-y-8">
            {/* Title Section */}
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">{loan.book?.title}</h1> 
              <p className="text-lg text-gray-600">by {loan.book?.author}</p> 
            </div>

            {/* Loan Info Grid */}
            <div className="grid grid-cols-2 gap-6 py-6 border-y border-gray-100">
                <LoanDetailItem label="Loan ID" value={loan.id} />
                <LoanDetailItem label="Loan Date" value={formatDate(loan.borrowDate)} /> 
                <LoanDetailItem label="Due Date" value={formatDate(loan.dueDate)} />
                <LoanDetailItem label="Return Date" value={formatDate(loan.returnDate)} />
            </div>

            {/* Fines (Simulasi) */}
            {loan.isOverdue && (
                <div className="p-4 bg-red-100 border border-red-300 rounded-lg flex items-center gap-3">
                    <TrendingDown className="w-6 h-6 text-red-600 flex-shrink-0" />
                    <div>
                        <h3 className="font-semibold text-red-800">Overdue!</h3>
                        <p className="text-sm text-red-700">Please return the book immediately to avoid further fines.</p>
                    </div>
                </div>
            )}
            {loan.status === 'returned' && loan.refundStatus === 'forfeited' && (
                <div className="p-4 bg-yellow-100 border border-yellow-300 rounded-lg flex items-center gap-3">
                    <TrendingDown className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                    <div>
                        <h3 className="font-semibold text-yellow-800">Deposit Forfeited</h3>
                        <p className="text-sm text-yellow-700">Your deposit was forfeited due to late return.</p>
                    </div>
                </div>
            )}


            {/* Description (If available) */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Book Summary</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {/* bookDescription inaccessible dari Loan object, hardcode/ambil dari book.title */}
                Summary for {loan.book?.title}. (Summary not provided by Loan API)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface LoanDetailItemProps {
    label: string;
    value: string | number;
}

function LoanDetailItem({ label, value }: LoanDetailItemProps) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{label}</p>
      <p className="text-gray-900 font-medium text-sm">{value}</p>
    </div>
  )
}