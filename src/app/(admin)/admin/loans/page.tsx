"use client";

import { useEffect, useState, useMemo } from "react";
import { getAuthToken } from "@/lib/auth";
import { Loader2, CheckCircle, Clock, RotateCcw, Search, Filter, X} from "lucide-react";
import type { Loan } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { colors } from "@/styles/colors";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const statusConfig = {
  borrowed: { color: colors.warning, icon: Clock, label: "Borrowed" },
  returned: { color: colors.success, icon: CheckCircle, label: "Returned" },
  late: { color: colors.danger, icon: CheckCircle, label: "LATE (Fine)" },
};

const calculateBorrowedAt = (dueDateString?: string | null): Date | null => {
  if (!dueDateString) return null;
  try {
    const due = new Date(dueDateString as any);
    if (isNaN(due.getTime())) return null;
    return new Date(due.getTime() - 7 * 24 * 60 * 60 * 1000);
  } catch {
    return null;
  }
};

const getBorrowDate = (loan: Loan): Date => {
  try {
    if (loan.borrowDate) {
      const d = new Date(loan.borrowDate as any);
      if (!isNaN(d.getTime())) return d;
    }
    const calc = calculateBorrowedAt((loan as any).dueDate);
    if (calc) return calc;
  } catch {}
  return new Date(0);
};

const formatDate = (input?: string | Date | null) => {
  if (!input) return "N/A";
  try {
    const d = new Date(input as any);
    if (isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "N/A";
  }
};

export default function ManageLoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const token = getAuthToken();

  async function fetchLoans(showLoading = true) {
    if (showLoading) setIsLoading(true);
    
    try {
      const headers: HeadersInit = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`${API_URL}/api/loans`, { headers });
      if (!res.ok) {
        setLoans([]);
        return;
      }
      const data = await res.json();
      const arr = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      setLoans(arr);
    } catch (err) {
      setLoans([]);
      console.error("fetchLoans error:", err);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      fetchLoans(true) 

      const onFocus = () => {
        fetchLoans(false) 
      }
      window.addEventListener("focus", onFocus)

      const interval = setInterval(() => {
        fetchLoans(false)
      }, 5000)

      return () => {
        window.removeEventListener("focus", onFocus)
        clearInterval(interval)
      }
    } else setIsLoading(false);
  }, [token]);
  
  const handleReturn = async (loanId: string) => {
    if (!confirm("Are you sure you want to 'Return' this book?")) return;

    const loan = loans.find((l) => (l._id || (l as any).id) === loanId);
    if (!loan) {
      alert("Loan data not found");
      return;
    }

    const bookId = loan.book?.id || (loan.book as any)?._id;
    let prevStock: number | null = null;
    const tokenLocal = token;

    if (bookId) {
      try {
        const bRes = await fetch(`${API_URL}/api/books/${bookId}`, {
          headers: { ...(tokenLocal ? { Authorization: `Bearer ${tokenLocal}` } : {}) },
        });
        if (bRes.ok) {
          const bJson = await bRes.json().catch(() => ({}));
          const bObj = bJson.data || bJson;
          prevStock = typeof bObj?.stock === "number" ? bObj.stock : 0;
          console.log("[admin] prevStock:", prevStock);
        } else {
          console.warn("[admin] gagal fetch prevStock (non-fatal)");
        }
      } catch (err) {
        console.warn("[admin] error fetch prevStock:", err);
      }
    }

    try {
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (tokenLocal) headers["Authorization"] = `Bearer ${tokenLocal}`;

      const res = await fetch(`${API_URL}/api/loans/${loanId}/return`, {
        method: "POST",
        headers,
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload?.message || "return failed");

      if (bookId) {
        try {
          const latestRes = await fetch(`${API_URL}/api/books/${bookId}`, {
            headers: { ...(tokenLocal ? { Authorization: `Bearer ${tokenLocal}` } : {}) },
          });

          if (!latestRes.ok) {
            console.warn("[admin] gagal fetch latest book after return");
            if (prevStock !== null) {
              const doInc = confirm(
                `Gagal verifikasi stok otomatis. Kalau server belum nambah, stok seharusnya ${prevStock + 1}. Mau increment manual?`
              );
              if (doInc) await incrementBookStock(bookId, prevStock);
            } else {
              const doInc = confirm("Gagal verifikasi stok otomatis. Mau coba increment stok manual +1? (No = skip)");
              if (doInc) await incrementBookStock(bookId, null);
            }
          } else {
            const latestJson = await latestRes.json().catch(() => ({}));
            const latestBook = latestJson.data || latestJson;
            const latestStock = typeof latestBook?.stock === "number" ? latestBook.stock : null;
            console.log("[admin] latestStock:", latestStock, "prevStock:", prevStock);

            if (prevStock !== null && latestStock !== null) {
              if (latestStock === prevStock) {
                await incrementBookStock(bookId, prevStock);
              } else {
                console.log("[admin] server already incremented stock, skip increment");
              }
            } else if (prevStock === null && latestStock !== null) {
              const doInc = confirm(
                `Unable to verify previous stock. Current stock: ${latestStock}. Do you want to manually increment the stock by +1?`
              );
              if (doInc) await incrementBookStock(bookId, latestStock);
            } else {
              const doInc = confirm(
                "Unable to automatically verify book stock. Do you want to manually increment the stock by +1? (No = skip)"
              );
              if (doInc) await incrementBookStock(bookId, null);
            }
          }
        } catch (err) {
          console.warn("[admin] error verifying latest book:", err);
          if (prevStock !== null) {
            const doInc = confirm(
              `An error occurred during verification. If the server hasn't incremented yet, the stock should be ${prevStock + 1}. Do you want to manually increment?`
            );
            if (doInc) await incrementBookStock(bookId, prevStock);
          } else {
            const doInc = confirm(
              "An error occurred during stock verification. Do you want to try manually incrementing the stock by +1? (No = skip)"
            );
            if (doInc) await incrementBookStock(bookId, null);
          }
        }
      }

      await fetchLoans();
      alert(payload?.message || "Return berhasil diproses (admin).");
    } catch (err: any) {
      console.error("admin handleReturn error:", err);
      alert(err?.message || "Gagal memproses return");
    }
  };

  const incrementBookStock = async (bookId: string, prevStock: number | null) => {
    try {
      let currentBook: any = null;
      if (prevStock === null) {
        const r = await fetch(`${API_URL}/api/books/${bookId}`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        });
        if (r.ok) {
          const d = await r.json().catch(() => ({}));
          currentBook = d.data || d;
        }
      }

      const baseStock = prevStock !== null ? prevStock : (currentBook?.stock ?? 0);
      const newStock = baseStock + 1;

      const putRes = await fetch(`${API_URL}/api/books/${bookId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ...(currentBook || {}),
          stock: newStock,
        }),
      });

      if (!putRes.ok) {
        const errData = await putRes.json().catch(() => ({}));
        throw new Error(errData?.message || "Failed to update book stock");
      }

      console.log(`[admin] stock updated: ${baseStock} → ${newStock}`);
    } catch (err) {
      console.error("[admin] incrementBookStock failed:", err);
      alert("Failed to automatically update book stock. Check DB or try manual.");
    }
  };

  const handleCancel = async (loanId: string) => {
    if (!confirm("Are you sure you want to 'Cancel' (delete) this loan? This can only be done if the user has not paid the deposit.")) return;

    const tokenLocal = token;
    try {
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (tokenLocal) headers["Authorization"] = `Bearer ${tokenLocal}`;

      const res = await fetch(`${API_URL}/api/loans/${loanId}/cancel`, {
        method: "DELETE",
        headers,
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload?.message || "Cancel failed");

      await fetchLoans();
      alert(payload?.message || "Loan cancelled successfully.");
    } catch (err: any) {
      console.error("admin handleCancel error:", err);
      alert(err?.message || "Failed to process loan cancellation");
    }
  };

  const filteredLoans = useMemo(() => {
    const q = search.toLowerCase().trim();
    return loans
      .filter((l) => {
        if (filter === "all") return true;
        return l.status === filter;
      })
      .filter((l) => {
        if (!q) return true;
        return (
          (l.book?.title || "").toLowerCase().includes(q) ||
          (l.user?.email || "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => getBorrowDate(b).getTime() - getBorrowDate(a).getTime());
  }, [loans, filter, search]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: colors.primary }} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold" style={{ color: colors.textPrimary }}>
          Manage Loans
        </h1>
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mb-4">
        <div className="relative flex-1 sm:flex-none sm:w-64">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 flex-shrink-0"
            style={{ color: colors.textSecondary }}
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by book title or user email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border transition-all focus:outline-none focus:ring-2 text-sm"
            style={{
              backgroundColor: colors.bgPrimary,
              color: colors.textPrimary,
              borderColor: colors.bgTertiary,
            }}
            onFocus={(e: any) => {
              e.currentTarget.style.borderColor = colors.primary;
              e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.primary}20`;
            }}
            onBlur={(e: any) => {
              e.currentTarget.style.borderColor = colors.bgTertiary;
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>

        <div className="hidden sm:flex gap-2 flex-shrink-0">
          {["all", "borrowed", "returned", "late"].map((option) => (
            <Button
              key={option}
              variant={filter === option ? "primary" : "secondary"}
              className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                filter === option ? "bg-slate-900 text-white shadow-sm" : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
              } capitalize`}
              onClick={() => setFilter(option)}
            >
              {option}
            </Button>
          ))}
        </div>

        <div className="sm:hidden w-full">
          <Button
            variant="secondary"
            className="w-full justify-center px-3 py-2.5 rounded-md text-sm font-semibold flex items-center gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="rounded-lg p-4 sm:p-6 border space-y-4" style={{ backgroundColor: colors.bgPrimary, borderColor: colors.bgTertiary }}>
          <div>
            <p className="text-sm uppercase mb-3 font-bold" style={{ color: colors.textPrimary }}>
              Status
            </p>
            <div className="flex flex-wrap gap-2">
              {["all", "borrowed", "returned", "late"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all border whitespace-nowrap capitalize"
                  style={{
                    backgroundColor: filter === status ? colors.primary : colors.bgSecondary,
                    color: filter === status ? "white" : colors.textPrimary,
                    borderColor: filter === status ? colors.primary : colors.bgTertiary,
                    borderWidth: "1px",
                  }}
                >
                  {status.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg border shadow-sm overflow-hidden" style={{ backgroundColor: colors.bgPrimary, borderColor: colors.bgTertiary }}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="border-b" style={{ backgroundColor: colors.bgSecondary, borderColor: colors.bgTertiary }}>
              <tr>
                <th className="text-left p-4 font-semibold" style={{ color: colors.textPrimary }}>
                  Book Title
                </th>
                <th className="text-left p-4 font-semibold" style={{ color: colors.textPrimary }}>
                  User (Email)
                </th>
                <th className="text-left p-4 font-semibold" style={{ color: colors.textPrimary }}>
                  Borrow Date
                </th>
                <th className="text-left p-4 font-semibold" style={{ color: colors.textPrimary }}>
                  Due Date
                </th>
                <th className="text-left p-4 font-semibold" style={{ color: colors.textPrimary }}>
                  Status
                </th>
                <th className="text-center p-4 font-semibold" style={{ color: colors.textPrimary }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredLoans.length > 0 ? (
                filteredLoans.map((loan) => {
                  const loanStatus = (loan.status as keyof typeof statusConfig) || "borrowed";
                  const statusInfo = statusConfig[loanStatus] ?? statusConfig.borrowed;
                  const StatusIcon = statusInfo.icon;
                  const isLate = loan.status === "late";
                  const isReturned = loan.status === "returned";
                  const isUnpaid = (loan as any).paymentStatus === 'unpaid';

                  const borrowedDate = loan.borrowDate ? new Date(loan.borrowDate as any) : calculateBorrowedAt((loan as any).dueDate);

                  return (
                    <tr key={loan._id || (loan as any).id} className="border-b transition-colors hover:opacity-80" style={{ borderColor: colors.bgTertiary, backgroundColor: colors.bgPrimary }}>
                      <td className="p-4 align-top" style={{ color: colors.textPrimary }}>
                        {loan.book?.title || "Book Deleted"}
                      </td>
                      <td className="p-4 align-top text-sm" style={{ color: colors.textPrimary }}>
                        {loan.user?.email || "User Deleted"}
                      </td>
                      <td className="p-4 align-top" style={{ color: colors.textPrimary }}>
                        {formatDate(borrowedDate)}
                      </td>
                      <td className="p-4 align-top" style={{ color: isLate ? colors.danger : colors.textPrimary, fontWeight: isLate ? "bold" : "normal" }}>
                        {formatDate((loan as any).dueDate)}
                        {isLate && (loan as any).fineAmount ? (
                          <span className="text-xs block mt-1" style={{ color: colors.danger }}>
                            (Penalty: Rp {(loan as any).fineAmount.toLocaleString("id-ID")})
                          </span>
                        ) : null}
                      </td>
                      <td className="p-4 align-top">
                        <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: statusInfo.color }}>
                          <StatusIcon className="w-4 h-4" />
                          {statusInfo.label}
                        </span>
                        {isUnpaid && (
                          <span className="flex items-center gap-1.5 text-xs font-semibold mt-1" style={{ color: colors.warning }}>
                            (Unpaid)
                          </span>
                        )}
                      </td>
                      <td className="p-4 align-top text-center">
                        {!isReturned && !isUnpaid && (
                          <button
                            onClick={() => handleReturn(loan._id || (loan as any).id)}
                            className="p-1.5 rounded-lg transition-colors hover:opacity-80 inline-flex mr-2"
                            style={{
                              backgroundColor: `${colors.info}15`,
                              color: colors.info,
                            }}
                            title="Verify Return (Admin)"
                          >
                            <RotateCcw className="w-5 h-5" />
                          </button>
                        )}
                        {isUnpaid && (
                          <button
                            onClick={() => handleCancel(loan._id || (loan as any).id)}
                            className="p-1.5 rounded-lg transition-colors hover:opacity-80 inline-flex"
                            style={{
                              backgroundColor: `${colors.danger}15`,
                              color: colors.danger,
                            }}
                            title="Cancel Loan (Admin)"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="text-center p-8" style={{ color: colors.textSecondary }}>
                    No matching loan data found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}