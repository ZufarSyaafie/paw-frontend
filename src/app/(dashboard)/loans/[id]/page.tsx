"use client";

import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Check, X, Clock, Loader2, AlertCircle, TrendingDown } from "lucide-react";
import { useState, useEffect } from "react";
import type { Loan } from "@/types";
import { getAuthToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

const formatRupiah = (amount: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

const STATUS_CONFIG = {
  borrowed: {
    label: "Borrowed (Active)",
    icon: Clock,
    color: "text-cyan-700 border-cyan-200",
    button: "bg-green-500 hover:bg-green-600",
  },
  pending: {
    label: "Pending Payment",
    icon: Clock,
    color: "text-amber-400 border-amber-400",
    button: "bg-amber-500 hover:bg-amber-600",
  },
  returned: {
    label: "Returned",
    icon: Check,
    color: "text-green-700 border-green-200",
    button: "bg-gray-400 cursor-not-allowed",
  },
  overdue: {
    label: "Overdue",
    icon: X,
    color: "text-red-700 border-red-200",
    button: "bg-red-500 hover:bg-red-600",
  },
} as const;

const formatDate = (dateString: string | Date | undefined | null) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return "N/A";
  }
};

const calculateBorrowedAt = (dueDateString: string | undefined | null): Date | null => {
  if (!dueDateString) return null;
  try {
    const dueDate = new Date(dueDateString);
    if (isNaN(dueDate.getTime())) return null;
    return new Date(dueDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  } catch {
    return null;
  }
};

type FrontendLoanDetail = Loan & { isOverdue: boolean; fines?: number; returnDate?: string | null };

const normalizeLoan = (raw: any): any => {
  if (!raw) return raw;
  const data = { ...raw };

  if (data._id && !data.id) data.id = data._id;

  if (!data.borrowDate && data.dueDate) {
    const calc = calculateBorrowedAt(data.dueDate);
    if (calc) data.borrowDate = calc.toISOString();
  }

  const possibleReturnFields = ["returnDate", "returnedAt", "returned_at", "return_date", "returned_at_iso"];
  for (const f of possibleReturnFields) {
    if (data[f]) {
      data.returnDate = data[f];
      break;
    }
  }
  if (!data.returnDate && data.loan && typeof data.loan === "object") {
    for (const f of possibleReturnFields) {
      if (data.loan[f]) {
        data.returnDate = data.loan[f];
        break;
      }
    }
  }

  if (data.returnDate === "") data.returnDate = null;

  return data;
};

export default function LoanDetailPage() {
  const router = useRouter();
  const params = useParams();
  const loanId = params?.id as string;

  const [loan, setLoan] = useState<FrontendLoanDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    let cancelled = false
    let activeController: AbortController | null = null

    const fetchLoanSafe = async (showLoading = false) => {
      if (showLoading) setIsLoading(true)

      try {
        // abort previous in-flight request
        if (activeController) {
          activeController.abort()
        }
        const controller = new AbortController()
        activeController = controller

        const token = getAuthToken()
        if (!token) {
          if (!cancelled) {
            setError("authentication required.")
          }
          return
        }

        const headers: Record<string, string> = { Authorization: `Bearer ${token}` }

        const response = await fetch(`${API_URL}/api/loans/${loanId}`, {
          headers,
          signal: controller.signal,
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => null)
          throw new Error(errorData?.message || "loan not found.")
        }

        const responseData = await response.json()
        let data = responseData.loan || responseData || {}
        data = normalizeLoan(data)

        const isOverdue = data.status === "borrowed" && data.dueDate && new Date(data.dueDate) < new Date()
        const fines = typeof data.depositAmount === "number" ? data.depositAmount * 0.1 : undefined

        if (!cancelled) {
          setLoan({ ...data, isOverdue, fines } as FrontendLoanDetail)
          setError(null)
        }
      } catch (err: any) {
        if (!cancelled) {
          if (err.name === "AbortError") {
            // ignore abort
          } else {
            console.error("Fetch loan error:", err)
            setError(err?.message || "failed to load loan details.")
          }
        }
      } finally {
        if (!cancelled && showLoading) setIsLoading(false)
      }
    }

    if (!loanId) {
      setIsLoading(false)
      setError("invalid loan id.")
      return
    }

    fetchLoanSafe(true)

    // refresh without loader
    const onFocus = () => fetchLoanSafe(false)
    const onVisibility = () => {
      if (document.visibilityState === "visible") fetchLoanSafe(false)
    }
    window.addEventListener("focus", onFocus)
    document.addEventListener("visibilitychange", onVisibility)

    // polling without loader
    const interval = setInterval(() => fetchLoanSafe(false), 5000)

    return () => {
      cancelled = true
      if (activeController) activeController.abort()
      window.removeEventListener("focus", onFocus)
      document.removeEventListener("visibilitychange", onVisibility)
      clearInterval(interval)
    }
  }, [loanId])

  const handleCancelLoan = async () => {
    if (!loan) return;

    const token = getAuthToken();
    if (!token) {
      alert("authentication required.");
      return;
    }

    const isPending = loan.paymentStatus === "unpaid";

    if (!isPending) {
      alert("Only pending loans can be cancelled.");
      return;
    }

    const confirmCancel = confirm("Cancel this loan? This will cancel your deposit order.");
    if (!confirmCancel) return;

    setIsCancelling(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/loans/${loan.id}/cancel`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.message || "cancel failed.");
      }

      alert("Loan cancelled successfully.");
      router.push("/loans");
    } catch (err: any) {
      console.error("Cancel error:", err);
      setError(err?.message || "failed to cancel loan.");
      alert(`Cancel failed: ${err?.message || "unknown error"}`);
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
        <p className="ml-3 text-gray-600 font-medium">loading loan details...</p>
      </div>
    );
  }

  if (error && !loan) {
    return (
      <div className="p-12 text-center">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <h3 className="font-semibold text-red-800 mb-1">error</h3>
        <p className="text-sm text-red-700">{error || `loan with id ${loanId} not found.`}</p>
      </div>
    );
  }

  if (!loan) return null;

  const isPending = loan.paymentStatus === "unpaid";
  const isReturned = loan.status === "returned";
  const displayStatusKey = loan.isOverdue ? "overdue" : isReturned ? "returned" : isPending ? "pending" : "borrowed";

  const statusInfo = STATUS_CONFIG[displayStatusKey];
  const StatusIcon = statusInfo.icon;

  const showCancelButton = isPending;

  return (
    <div className="min-h-screen bg-white">
      <button
        onClick={() => router.back()}
        className="fixed top-24 left-[calc(theme(spacing.4)+1rem)] sm:left-[calc(theme(spacing.6)+1.5rem)] lg:left-[calc(theme(spacing.7)+1rem)] z-40 flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg border border-gray-100 bg-white/80 backdrop-blur-md text-gray-600 hover:text-gray-900 hover:bg-slate-100/80 transition-all font-medium text-sm ring-1 ring-black/5"
      >
        <ArrowLeft className="w-4 h-4" />
      </button>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-6">
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-12">
          <div className="md:col-span-1">
            <div className="sticky top-32">
              <img src={loan.book?.cover || "/placeholder.png"} alt={loan.book?.title || "book cover"} className="w-full rounded-lg shadow-lg object-cover aspect-[2/3]" />

              <div className={`mt-4 px-3 py-2 rounded-lg border flex items-center gap-2 ${statusInfo.color}`}>
                <StatusIcon className="w-4 h-4" />
                <span className="font-semibold text-sm capitalize">{statusInfo.label}</span>
              </div>

              <div className="mt-3 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="text-sm font-semibold text-slate-700">Deposit: {formatRupiah(loan.depositAmount || 0)}</p>
              </div>

              {showCancelButton && (
                <Button 
                  onClick={handleCancelLoan} 
                  disabled={isCancelling} 
                  className={`w-full mt-4 py-3 text-white font-bold rounded-lg transition-all ${isCancelling ? "opacity-70 pointer-events-none" : "bg-red-500 hover:bg-red-600"}`}
                >
                  {isCancelling ? "Cancelling..." : "Cancel Loan"}
                </Button>
              )}

              {!isPending && !isReturned && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-700 font-medium">
                    To return this book, please visit the library. The librarian will verify and process your return.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-1">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">{loan.book?.title}</h1>
              <p className="text-lg text-gray-600">by {loan.book?.author}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 py-4 sm:py-6 border-y border-gray-100 px-4 sm:px-0">
              <LoanDetailItem label="loan id" value={loan.id} />
              <LoanDetailItem label="loan date" value={formatDate(loan.borrowDate)} />
              <LoanDetailItem label="due date" value={formatDate(loan.dueDate)} />
              <LoanDetailItem label="return date" value={formatDate((loan as any).returnDate)} />
            </div>

            {loan.isOverdue && (
              <div className="p-4 bg-red-100 border border-red-300 rounded-lg flex items-center gap-3">
                <TrendingDown className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-red-800">overdue!</h3>
                  <p className="text-sm text-red-700">please return the book immediately to avoid deposit forfeiture.</p>
                </div>
              </div>
            )}

            {loan.status === "returned" && loan.refundStatus === "forfeited" && (
              <div className="p-4 bg-yellow-100 border border-yellow-300 rounded-lg flex items-center gap-3 mt-4">
                <TrendingDown className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-yellow-800">deposit forfeited</h3>
                  <p className="text-sm text-yellow-700">your deposit was forfeited due to late return.</p>
                </div>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-6 mt-6">
              <h3 className="font-semibold text-gray-900 mb-3">{loan.book?.title} summary</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{loan.book?.synopsis}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface LoanDetailItemProps {
  label: string;
  value: string | number | null | undefined;
}

function LoanDetailItem({ label, value }: LoanDetailItemProps) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{label}</p>
      <p className="text-gray-900 font-medium text-sm break-all">{value ?? "N/A"}</p>
    </div>
  );
}