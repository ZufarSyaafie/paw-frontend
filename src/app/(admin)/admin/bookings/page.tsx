"use client";

import { useEffect, useState, useMemo } from "react";
import { getAuthToken } from "@/lib/auth";
import { Loader2, XCircle, CheckCircle, Hourglass, Search, Filter, X } from "lucide-react";
import type { Booking } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { colors } from "@/styles/colors";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const statusConfig = {
  confirmed: { color: colors.success, icon: CheckCircle, label: 'Confirmed' },
  pending_payment: { color: colors.warning, icon: Hourglass, label: 'Pending Payment' },
  cancelled: { color: colors.danger, icon: XCircle, label: 'Cancelled' },
  completed: { color: colors.textSecondary, icon: CheckCircle, label: 'Completed' },
};

// const filterOptions = [
//   { label: "All", value: "all" },
//   { label: "Confirmed", value: "confirmed" },
//   { label: "Pending Payment", value: "pending_payment" },
//   { label: "Cancelled", value: "cancelled" },
//   { label: "Completed", value: "completed" },
// ];

const checkIfCompleted = (booking: Booking): boolean => {
    if (booking.status !== 'confirmed') return false;
    
    const bookingEndDateTime = new Date(booking.date);
    const [hours, minutes] = booking.endTime.split(':').map(Number);
    bookingEndDateTime.setHours(hours, minutes, 0, 0);

    return new Date().getTime() > bookingEndDateTime.getTime();
};

export default function ManageBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const token = getAuthToken();

  async function fetchBookings(showLoading = true) {
    if (showLoading) setIsLoading(true);

    const res = await fetch(`${API_URL}/api/rooms/bookings/list`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setBookings(data || []);
    } else {
      setBookings([]);
    }
    
    if (showLoading) setIsLoading(false);
  }

  useEffect(() => {
    if (token) {
      fetchBookings(true)

      const onFocus = () => {
        fetchBookings(false)
      }
      window.addEventListener("focus", onFocus)

      const interval = setInterval(() => {
        fetchBookings(false)
      }, 5000)

      return () => {
        window.removeEventListener("focus", onFocus)
        clearInterval(interval)
      }
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const handleCancel = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this user's booking?")) return;
    
    await fetch(`${API_URL}/api/rooms/bookings/${bookingId}/cancel`, {
      method: "PUT",
      headers: { "Authorization": `Bearer ${token}` }
    });
    fetchBookings(); 
  };

  const handleClearFilters = () => {
    setSearch("");
    setFilter("all");
  };

  const hasActiveFilters = filter !== "all" || search !== "";

  const filteredBookings = useMemo(() => {
    return bookings
      .map(b => ({
          ...b,
          displayStatus: checkIfCompleted(b) ? 'completed' : b.status,
      }))
      .filter(b => {
        const statusFilter = (b as any).displayStatus as string;
        if (filter === 'all') return true;
        return statusFilter === filter;
      })
      .filter(b => {
        const query = search.toLowerCase();
        if (!query) return true;
        return (
          (b.room?.name || '').toLowerCase().includes(query) ||
          (b.user?.email || '').toLowerCase().includes(query)
        );
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [bookings, filter, search]);

  const formatDate = (date: string | Date | undefined | null) => { 
    if (!date) return 'N/A';
    try {
        return new Date(date).toLocaleDateString('id-ID'); 
    } catch {
        return 'Invalid Date';
    }
  };

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
          Manage Bookings
        </h1>
      </div>

      {/* Filter Bar - Mobile/Tablet Optimized */}
      <div className="py-6 space-y-4 mb-4">
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 flex-wrap">
          {/* Search bar */}
          <div className="relative flex-1 min-w-0 sm:flex-auto">
            <Search 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 flex-shrink-0" 
              style={{ color: colors.textSecondary }}
            />
            <Input 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Search by room name or user email..." 
              className="w-full sm:w-64 pl-10 pr-4 py-2.5 rounded-lg border transition-all focus:outline-none focus:ring-2 text-sm"
              style={{
                backgroundColor: colors.bgPrimary,
                color: colors.textPrimary,
                borderColor: colors.bgTertiary,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.primary;
                e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.primary}20`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.bgTertiary;
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Filter button */}
          <Button
            onClick={() => setShowFilters(!showFilters)}
            className="px-3 sm:px-4 py-2.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap text-sm"
            style={{
              backgroundColor: showFilters ? colors.primary : colors.bgPrimary,
              color: showFilters ? "white" : colors.textSecondary,
              border: `1px solid ${showFilters ? colors.primary : colors.bgTertiary}`,
              minHeight: "42px",
              padding: "10px 12px",
            }}
          >
            <Filter className="w-5 h-5 flex-shrink-0" />
            <span className="hidden sm:inline">Filters</span>
          </Button>

          {/* Clear button */}
          {hasActiveFilters && (
            <Button
              onClick={handleClearFilters}
              className="px-3 py-2.5 rounded-lg font-semibold flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap transition-all text-sm"
              style={{
                backgroundColor: colors.bgPrimary,
                color: colors.danger,
                border: `1px solid ${colors.danger}40`,
                minHeight: "42px",
                padding: "10px 12px",
              }}
            >
              <X className="w-5 h-5 flex-shrink-0" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
          )}
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div
            className="rounded-lg p-4 sm:p-6 border space-y-4"
            style={{
              backgroundColor: colors.bgPrimary,
              borderColor: colors.bgTertiary,
            }}
          >
            <div>
              <p className="text-sm uppercase mb-3 font-bold" style={{ color: colors.textPrimary }}>
                Status
              </p>
              <div className="flex flex-wrap gap-2">
                {['all', 'confirmed', 'pending_payment', 'cancelled', 'completed'].map(status => ( 
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
                    {status.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* mobile */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {filteredBookings.map((booking) => {
           const displayStatus = (booking as any).displayStatus as keyof typeof statusConfig;
           const statusInfo = statusConfig[displayStatus] || statusConfig.cancelled;
           const isCancellable = (booking.status === 'pending_payment' || booking.status === 'confirmed') && displayStatus !== 'completed';

           return (
              <div 
                key={booking._id || booking.id} 
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3"
              >
                {/* Header: Room Name & Status */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-slate-900 text-lg">{booking.room?.name || 'Room Deleted'}</h3>
                    <span 
                      className="inline-flex items-center gap-1 px-2 py-0.5 mt-1 rounded-full text-[10px] font-bold uppercase tracking-wide"
                      style={{ color: statusInfo.color.split(' ')[0].replace('text-', 'text-'), 
                        borderColor: statusInfo.color.split(' ')[0].replace('text-', 'bg-').replace('800', '100') 
                      }}
                    >
                      <statusInfo.icon className="w-3 h-3" />
                      {statusInfo.label}
                    </span>
                  </div>
                  
                  {/* Action */}
                  {isCancellable && (
                      <button
                        onClick={() => handleCancel(booking._id || booking.id)}
                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        title="Cancel Booking"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm text-slate-600 border-t border-slate-100 pt-3 mt-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">User:</span>
                    <span className="font-medium text-slate-800 truncate max-w-[150px]">{booking.user?.email || 'User Deleted'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Date:</span>
                    <span className="font-medium text-slate-800">{formatDate(booking.date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Time:</span>
                    <span className="font-medium text-slate-800">{booking.startTime} - {booking.endTime}</span>
                  </div>
                  {booking.status === 'cancelled' && booking.cancelledAt && (
                     <p className="text-xs text-red-500 italic text-right">
                        Canceled on {formatDate(booking.cancelledAt)}
                     </p>
                  )}
                </div>
              </div>
           )
        })}
        {filteredBookings.length === 0 && (
            <div className="text-center p-8 text-slate-500 bg-white rounded-xl border border-slate-200">
                No matching booking data found.
            </div>
        )}
      </div>

      {/* desktop */}
      <div 
        className="hidden md:block rounded-lg border shadow-sm overflow-hidden"
        style={{
          backgroundColor: colors.bgPrimary,
          borderColor: colors.bgTertiary,
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead 
              className="border-b"
              style={{
                backgroundColor: colors.bgSecondary,
                borderColor: colors.bgTertiary,
              }}
            >
              <tr>
                <th className="text-left p-4 font-semibold" style={{ color: colors.textPrimary }}>
                  Room
                </th>
                <th className="text-left p-4 font-semibold" style={{ color: colors.textPrimary }}>
                  User (Email)
                </th>
                <th className="text-left p-4 font-semibold" style={{ color: colors.textPrimary }}>
                  Date
                </th>
                <th className="text-left p-4 font-semibold" style={{ color: colors.textPrimary }}>
                  Time
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
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => {
                  const displayStatus = (booking as any).displayStatus as keyof typeof statusConfig;
                  const statusInfo = statusConfig[displayStatus] || statusConfig.cancelled;
                  
                  const isCancellable = (booking.status === 'pending_payment' || booking.status === 'confirmed') && displayStatus !== 'completed';

                  return (
                    <tr 
                      key={booking._id || booking.id} 
                      className="border-b transition-colors hover:opacity-80"
                      style={{
                        borderColor: colors.bgTertiary,
                        backgroundColor: colors.bgPrimary,
                      }}
                    >
                      <td className="p-4 align-top" style={{ color: colors.textPrimary }}>
                        {booking.room?.name || 'Room Deleted'}
                      </td>
                      <td className="p-4 align-top text-sm" style={{ color: colors.textPrimary }}>
                        {booking.user?.email || 'User Deleted'}
                      </td>
                      <td className="p-4 align-top" style={{ color: colors.textPrimary }}>
                        {formatDate(booking.date)}
                      </td>
                      <td className="p-4 align-top" style={{ color: colors.textPrimary }}>
                        {booking.startTime} - {booking.endTime}
                      </td>
                      <td className="p-4 align-top">
                        <span 
                          className="flex items-center gap-1.5 text-xs font-semibold"
                          style={{ color: statusInfo.color }}
                        >
                          <statusInfo.icon className="w-4 h-4" />
                          {statusInfo.label}
                        </span>
                        {booking.status === 'cancelled' && booking.cancelledAt && (
                             <span 
                               className="text-xs block mt-1"
                               style={{ color: colors.danger }}
                             >
                                (Canceled on {formatDate(booking.cancelledAt)}) 
                            </span>
                        )}
                      </td>
                      <td className="p-4 align-top text-center">
                        {isCancellable && (
                          <button
                            onClick={() => handleCancel(booking._id || booking.id)}
                            className="p-1.5 rounded-lg transition-colors hover:opacity-80 inline-flex"
                            style={{
                              backgroundColor: `${colors.danger}15`,
                              color: colors.danger,
                            }}
                            title="Cancel Booking"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="text-center p-8" style={{ color: colors.textSecondary }}>
                    There is no matching booking data.
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