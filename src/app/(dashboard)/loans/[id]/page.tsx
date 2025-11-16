"use client";

import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Check, X, Clock, Loader2, AlertCircle, TrendingDown } from "lucide-react";
import { useState, useEffect } from "react";
import type { Loan } from "@/types";
import { getAuthToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

// format rupiah
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

// safe formatter: terima string | Date | undefined | null
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

// helper: kalau dueDate valid, return dueDate - 7 hari sebagai Date, else null
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

// frontend detail type: tambahin isOverdue + optional fines
type FrontendLoanDetail = Loan & { isOverdue: boolean; fines?: number; returnDate?: string | null };

// Normalize loan object: id, borrowDate, returnDate (cover common variants)
const normalizeLoan = (raw: any): any => {
  if (!raw) return raw;
  const data = { ...raw };

  // normalize id
  if (data._id && !data.id) data.id = data._id;

  // normalize borrowDate (keep existing or compute from dueDate)
  if (!data.borrowDate && data.dueDate) {
    const calc = calculateBorrowedAt(data.dueDate);
    if (calc) data.borrowDate = calc.toISOString();
  }

  // normalize return date: accept multiple field names
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

  // coerce empty string -> null
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
  const [isReturning, setIsReturning] = useState(false);

  useEffect(() => {
    const fetchLoan = async () => {
      const token = getAuthToken();
      if (!token) {
        setError("authentication required.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/loans/${loanId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData?.message || "loan not found.");
        }

        const responseData = await response.json();

        // Handle wrapped and flat response, then normalize
        let data = responseData.loan || responseData || {};
        data = normalizeLoan(data);

        const isOverdue = data.status === "borrowed" && data.dueDate && new Date(data.dueDate) < new Date();
        const fines = typeof data.depositAmount === "number" ? data.depositAmount * 0.1 : undefined;

        setLoan({ ...data, isOverdue, fines } as FrontendLoanDetail);
      } catch (err: any) {
        console.error("Fetch loan error:", err);
        setError(err?.message || "failed to load loan details.");
      } finally {
        setIsLoading(false);
      }
    };

    if (loanId) fetchLoan();
    else {
      setIsLoading(false);
      setError("invalid loan id.");
    }
  }, [loanId]);

  const handleReturn = async () => {
    if (!loan) return;

    const token = getAuthToken();
    if (!token) {
      alert("authentication required.");
      return;
    }

    const isPending = loan.paymentStatus === "unpaid";
    const isBorrowed = loan.status === "borrowed";
    const isReturned = loan.status === "returned";

    if (isPending) {
      const confirmCancel = confirm("Batalkan pinjaman ini? Tindakan ini akan membatalkan order deposit.");
      if (!confirmCancel) return;

      setIsReturning(true);
      setError(null);

      try {
        const response = await fetch(`${API_URL}/api/loans/${loan.id}`, {
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

        alert("Pinjaman dibatalkan.");
        router.push("/loans");
      } catch (err: any) {
        console.error("Cancel error:", err);
        setError(err?.message || "failed to cancel loan.");
        alert(`Cancel failed: ${err?.message || "unknown error"}`);
      } finally {
        setIsReturning(false);
      }
      return;
    }

    if (!isBorrowed || isReturned) {
      console.log("Cannot return - Status:", loan.status);
      return;
    }

    const confirmReturn = confirm("Confirm return book? Deposit akan diproses sesuai kondisi buku.");
    if (!confirmReturn) return;

    setIsReturning(true);
    setError(null);

    try {
      // 1. Return loan
      const response = await fetch(`${API_URL}/api/loans/${loan.id}/return`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // get payload (may contain loan)
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || "return failed.");
      }

      let returnedLoan = data.loan || data || {};
      returnedLoan = normalizeLoan(returnedLoan);

      // If backend didn't provide returnDate, set local returned time so UI shows it immediately
      if (!returnedLoan.returnDate) {
        returnedLoan.returnDate = new Date().toISOString();
      }

      // normalize id
      if (returnedLoan._id && !returnedLoan.id) returnedLoan.id = returnedLoan._id;

      console.log("Return API response:", data);
      console.log("Returned loan (normalized):", returnedLoan);

      // update UI with returnedLoan
      const isOverdue = returnedLoan.status === "borrowed" && returnedLoan.dueDate && new Date(returnedLoan.dueDate) < new Date();
      setLoan({ ...returnedLoan, isOverdue, fines: loan.fines } as FrontendLoanDetail);

      const refundStatus = returnedLoan?.refundStatus || loan.refundStatus;
      const message = refundStatus === "refunded" ? "Book successfully returned! Deposit refunded." : "Book returned. Deposit processed.";

      alert(message);
      router.push("/loans");
    } catch (err: any) {
      console.error("Return error:", err);
      setError(err?.message || "failed to process return.");
      alert(`Return failed: ${err?.message || "unknown error"}`);
    } finally {
      setIsReturning(false);
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

  // FIX: Cleaner display status logic
  const isPending = loan.paymentStatus === "unpaid";
  const isReturned = loan.status === "returned";
  const displayStatusKey = loan.isOverdue ? "overdue" : isReturned ? "returned" : isPending ? "pending" : "borrowed";

  const statusInfo = STATUS_CONFIG[displayStatusKey];
  const StatusIcon = statusInfo.icon;

  const isButtonEnabled = (loan.status === "borrowed" && !isReturned) || isPending;
  const buttonText = isPending ? "Cancel borrowing" : loan.status === "borrowed" ? "Confirm Return" : statusInfo.label;

  const actionButtonClass = isReturned ? "bg-gray-400 cursor-not-allowed" : isPending ? "bg-amber-500 hover:bg-amber-600" : statusInfo.button;

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

              {isButtonEnabled && (
                <Button onClick={handleReturn} disabled={isReturning || !isButtonEnabled} className={`w-full mt-4 py-3 text-white font-bold rounded-lg transition-all ${isReturning ? "opacity-70 pointer-events-none" : actionButtonClass}`}>
                  {isReturning ? "Processing..." : buttonText}
                </Button>
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
                  <p className="text-sm text-red-700">please return the book immediately to avoid further fines.</p>
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
