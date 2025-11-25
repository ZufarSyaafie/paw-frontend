"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { getAuthToken } from "@/lib/auth";
import { 
  Loader2, Users, Book, Box, 
  DoorOpen, Hourglass, AlarmClock, Send, CalendarCheck, Bell, ChevronDown, ChevronUp
} from "lucide-react";
import type { Loan, Room, Booking } from "@/types"; 
import { colors } from "@/styles/colors";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface AdminStats {
  users: number;
  books: number;
  loans: number;
  availableRooms: number;
  pendingBookings: number;
  announcements: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [allLoans, setAllLoans] = useState<Loan[]>([]); 
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllStats = async (showLoading = true) => {
      const token = getAuthToken();
      if (!token) {
        setIsLoading(false);
        return;
      }
      
      if (showLoading) setIsLoading(true)
      try {
        const [usersRes, booksRes, loansRes, roomsRes, bookingsRes, announcementsRes] = await Promise.all([
          fetch(`${API_URL}/api/users`, {
            headers: { "Authorization": `Bearer ${token}` }
          }),
          fetch(`${API_URL}/api/books?`, {
             headers: { "Authorization": `Bearer ${token}` }
          }), 
          fetch(`${API_URL}/api/loans`, { 
            headers: { "Authorization": `Bearer ${token}` }
          }),
          fetch(`${API_URL}/api/rooms`, {
            headers: { "Authorization": `Bearer ${token}` }
          }),
          fetch(`${API_URL}/api/rooms/bookings/list`, {
            headers: { "Authorization": `Bearer ${token}` }
          }),
          fetch(`${API_URL}/api/announcements`, {
            headers: { "Authorization": `Bearer ${token}` }
          })
        ]);

        const usersData = await usersRes.json();
        const booksData = await booksRes.json();
        const loansData: Loan[] = await loansRes.json();
        const roomsData: Room[] = await roomsRes.json();
        const bookingsData: Booking[] = await bookingsRes.json();
        const announcementsData = await announcementsRes.json();

        const availableRoomsCount = roomsData.filter(room => room.status === 'available').length;
        const pendingBookingsCount = bookingsData.filter(b => b.status === 'pending_payment').length;

        const announcementsCount = Array.isArray(announcementsData)
          ? announcementsData.length
          : announcementsData?.total ?? announcementsData?.count ?? 0;

        setStats({
          users: (usersData || []).length,
          books: (booksData.total || (booksData.data || []).length),
          loans: (loansData || []).length,
          availableRooms: availableRoomsCount,
          pendingBookings: pendingBookingsCount,
          announcements: announcementsCount,
        });

        setAllLoans(loansData || []);

      } catch (err) {
        console.error("Gagal fetch admin stats:", err);
      } finally {
        if (showLoading) setIsLoading(false);
      }
    };

    fetchAllStats(true)

    const onFocus = () => {
      fetchAllStats(false)
    }
    window.addEventListener("focus", onFocus)

    const interval = setInterval(() => {
      fetchAllStats(false)
    }, 5000)

    return () => {
      window.removeEventListener("focus", onFocus)
      clearInterval(interval)
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto w-full">
      {/* Stats Grid */}
      {isLoading ? (
        <div className="flex items-center">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: colors.primary }} />
            <p className="ml-3 font-medium" style={{ color: colors.textSecondary }}>Loading stats...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-6 mb-8">
          
          <Link href="/admin/users">
            <StatCard 
              title={<span><span className="hidden xl:inline">Total </span>Users</span>} 
              value={stats?.users?.toString() ?? '...'} 
              icon={<Users className="w-5 h-5" style={{ color: colors.primary }} />}
            />
          </Link>
          <Link href="/admin/books">
            <StatCard 
              title={<span><span className="hidden xl:inline">Total </span>Books</span>} 
              value={stats?.books?.toString() ?? '...'} 
              icon={<Book className="w-5 h-5" style={{ color: colors.success }} />} 
            />
          </Link>
          <Link href="/admin/loans">
            <StatCard 
              title={<span><span className="hidden xl:inline">Total </span>Loans</span>} 
              value={stats?.loans?.toString() ?? '...'} 
              icon={<Box className="w-5 h-5" style={{ color: colors.info }} />} 
            />
          </Link>
          <Link href="/admin/rooms">
            <StatCard 
              title={<span><span className="hidden xl:inline">Available </span>Rooms</span>} 
              value={stats?.availableRooms?.toString() ?? '...'} 
              icon={<DoorOpen className="w-5 h-5" style={{ color: colors.warning }} />} 
            />
          </Link>
          <Link href="/admin/bookings">
            <StatCard 
              title={<span><span className="hidden xl:inline">Pending </span>Bookings</span>} 
              value={stats?.pendingBookings?.toString() ?? '...'} 
              icon={<Hourglass className="w-5 h-5" style={{ color: colors.danger }} />} 
            />
          </Link>
          <Link href="/admin/announcements">
            <StatCard
              title="Announcements"
              value={stats?.announcements?.toString() ?? '...'}
              icon={<Bell className="w-5 h-5" style={{ color: colors.warning }} />}
            />
          </Link>
        </div>
      )}

      {/* Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <UpcomingDueDatesPanel loans={allLoans} />
        </div>
        <div className="lg:col-span-1">
          <QuickAnnouncementPanel />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: React.ReactNode, value: string, icon: React.ReactNode }) {
  return (
    <div 
      className="flex flex-col justify-between p-5 rounded-xl border bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer h-full"
      style={{
        backgroundColor: colors.bgPrimary,
        borderColor: colors.bgTertiary,
      }}
    >
      <div className="mb-2">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 truncate">
          {title}
        </div>
      </div>

      <div className="flex items-center justify-between mt-2">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 shrink-0">
           <div className="flex items-center justify-center">
              {icon}
           </div>
        </div>

        <div className="text-right">
          <p className="text-3xl font-bold text-slate-900 leading-none">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function UpcomingDueDatesPanel({ loans }: { loans: Loan[] }) {
  const [isOpen, setIsOpen] = useState(true);
  
  const upcomingLoans = useMemo(() => {
    return loans
      .filter(loan => 
        loan.status === 'borrowed' && 
        loan.dueDate && 
        !isNaN(new Date(loan.dueDate).getTime())
      ) 
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5);
  }, [loans]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid Date";
      }
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return "Invalid Date";
    }
  };

  const isOverdue = (dueDateString: string) => {
    if (!dueDateString || isNaN(new Date(dueDateString).getTime())) return false;
    return new Date(dueDateString).getTime() < Date.now();
  };

  return (
    <div 
      className="p-6 rounded-lg border shadow-sm h-full"
      style={{
        backgroundColor: colors.bgPrimary,
        borderColor: colors.bgTertiary
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between mb-4 lg:cursor-default"
      >
        <h3 className="text-xl font-bold" style={{ color: colors.textPrimary }}>
          Upcoming Due Dates
        </h3>
        <div className="lg:hidden">
          {isOpen ? (
            <ChevronUp className="w-5 h-5" style={{ color: colors.textSecondary }} />
          ) : (
            <ChevronDown className="w-5 h-5" style={{ color: colors.textSecondary }} />
          )}
        </div>
      </button>
      
      <div className={`${isOpen ? 'block' : 'hidden'} lg:block`}>
        {upcomingLoans.length > 0 ? (
          <ul className="space-y-3">
            {upcomingLoans.map(loan => (
              <li 
                key={loan._id || loan.id} 
                className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-3 rounded-lg border"
                style={{
                  backgroundColor: isOverdue(loan.dueDate) ? `${colors.danger}10` : colors.bgSecondary,
                  borderColor: isOverdue(loan.dueDate) ? `${colors.danger}30` : colors.bgTertiary
                }}
              >
                <div className="w-full sm:w-auto">
                  <p className="font-semibold line-clamp-1" style={{ color: colors.textPrimary }}>
                    {loan.book.title}
                  </p>
                  <p className="text-sm line-clamp-1" style={{ color: colors.textSecondary }}>
                    oleh {loan.book.author}
                  </p>
                </div>
                <div className="w-full sm:w-auto flex flex-row sm:flex-col justify-between sm:items-end items-center gap-2 sm:gap-0 border-t sm:border-t-0 border-slate-200 pt-2 sm:pt-0 mt-1 sm:mt-0">
                  <p 
                    className="font-semibold flex items-center gap-1.5 text-sm"
                    style={{ color: isOverdue(loan.dueDate) ? colors.danger : colors.textSecondary }}
                  >
                    {isOverdue(loan.dueDate) ? <CalendarCheck className="w-4 h-4" /> : <AlarmClock className="w-4 h-4" />}
                    {formatDate(loan.dueDate)}
                  </p>
                  <p 
                    className="text-sm truncate max-w-[150px] sm:max-w-[160px]" 
                    style={{ color: colors.textSecondary }}
                    title={loan.user.email}
                  >
                    {loan.user.email}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: colors.textSecondary }}>
            There is no active loan that will be due soon.
          </p>
        )}
      </div>
    </div>
  );
}

function QuickAnnouncementPanel() {
  const [isOpen, setIsOpen] = useState(true);
  const [announcementType, setAnnouncementType] = useState<"general" | "book">("general");
  const [title, setTitle] = useState("");
  const [bookTitle, setBookTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    const token = getAuthToken();

    try {
      let payload: any = {};

      if (announcementType === "book") {
        payload = {
          title: title || `Buku Baru: ${bookTitle}`,
          bookTitle: bookTitle,
          message: message,
        };
      } else {
        payload = {
          title: title,
          bookTitle: title,
          message: message,
        };
      }

      const res = await fetch(`${API_URL}/api/announcements`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to send announcement.");
      }

      setSuccess("Announcement successfully sent to all users!");
      setTitle("");
      setBookTitle("");
      setMessage("");
      setAnnouncementType("general");

      window.dispatchEvent(new CustomEvent("announcements:updated"));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="p-6 rounded-lg border shadow-sm h-full"
      style={{
        backgroundColor: colors.bgPrimary,
        borderColor: colors.bgTertiary,
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between mb-4 lg:cursor-default"
      >
        <h3 className="text-xl font-bold" style={{ color: colors.textPrimary }}>
          Quick Announcement
        </h3>
        <div className="lg:hidden">
          {isOpen ? (
            <ChevronUp className="w-5 h-5" style={{ color: colors.textSecondary }} />
          ) : (
            <ChevronDown className="w-5 h-5" style={{ color: colors.textSecondary }} />
          )}
        </div>
      </button>

      <form onSubmit={handleSubmit} className={`space-y-4 ${isOpen ? 'block' : 'hidden'} lg:block`}>
        <div>
          <label className="text-sm font-medium block mb-2" style={{ color: colors.textPrimary }}>
            Announcement Type
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setAnnouncementType("general")}
              className="flex-1 py-2 px-4 rounded-lg font-medium transition-all"
              style={{
                backgroundColor: announcementType === "general" ? colors.primary : colors.bgSecondary,
                color: announcementType === "general" ? "#ffffff" : colors.textSecondary,
                border: `2px solid ${announcementType === "general" ? colors.primary : colors.bgTertiary}`,
              }}
            >
              📢 General
            </button>
            <button
              type="button"
              onClick={() => setAnnouncementType("book")}
              className="flex-1 py-2 px-4 rounded-lg font-medium transition-all"
              style={{
                backgroundColor: announcementType === "book" ? colors.primary : colors.bgSecondary,
                color: announcementType === "book" ? "#ffffff" : colors.textSecondary,
                border: `2px solid ${announcementType === "book" ? colors.primary : colors.bgTertiary}`,
              }}
            >
              📚 New Book
            </button>
          </div>
        </div>

        {announcementType === "book" ? (
          <>
            <div>
              <label className="text-sm font-medium block mb-2" style={{ color: colors.textPrimary }}>
                Book Title <span style={{ color: colors.danger }}>*</span>
              </label>
              <input
                name="bookTitle"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                required
                placeholder="E.g.: Norwegian Wood"
                className="w-full px-4 py-2 rounded-lg border focus:outline-none transition-all"
                style={{ backgroundColor: colors.bgSecondary, color: colors.textPrimary, borderColor: colors.bgTertiary }}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.success;
                  e.target.style.boxShadow = `0 0 0 2px ${colors.success}20`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.bgTertiary;
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-2" style={{ color: colors.textPrimary }}>
                Announcement Title <span style={{ color: colors.textSecondary, fontSize: "0.85em" }}>(optional)</span>
              </label>
              <input
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Default: New Book: [Book Title]"
                className="w-full px-4 py-2 rounded-lg border focus:outline-none transition-all"
                style={{ backgroundColor: colors.bgSecondary, color: colors.textPrimary, borderColor: colors.bgTertiary }}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.success;
                  e.target.style.boxShadow = `0 0 0 2px ${colors.success}20`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.bgTertiary;
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
          </>
        ) : (
          <div>
            <label className="text-sm font-medium block mb-2" style={{ color: colors.textPrimary }}>
              Announcement Title <span style={{ color: colors.danger }}>*</span>
            </label>
            <input
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="E.g.: The Library is Closed Tomorrow"
              className="w-full px-4 py-2 rounded-lg border focus:outline-none transition-all"
              style={{ backgroundColor: colors.bgSecondary, color: colors.textPrimary, borderColor: colors.bgTertiary }}
              onFocus={(e) => {
                e.target.style.borderColor = colors.primary;
                e.target.style.boxShadow = `0 0 0 2px ${colors.primary}20`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.bgTertiary;
                e.target.style.boxShadow = "none";
              }}
            />
          </div>
        )}

        <div>
          <label className="text-sm font-medium block mb-2" style={{ color: colors.textPrimary }}>
            Message <span style={{ color: colors.danger }}>*</span>
          </label>
          <textarea
            name="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={4}
            placeholder={announcementType === "book" ? "Description about the new book..." : "Enter the announcement..."}
            className="w-full px-4 py-2 rounded-lg border focus:outline-none transition-all resize-none"
            style={{ backgroundColor: colors.bgSecondary, color: colors.textPrimary, borderColor: colors.bgTertiary }}
            onFocus={(e) => {
              const color = announcementType === "book" ? colors.success : colors.primary;
              e.currentTarget.style.borderColor = color;
              e.currentTarget.style.boxShadow = `0 0 0 2px ${color}20`;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = colors.bgTertiary;
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>

        {error && <p className="text-sm" style={{ color: colors.danger }}>{error}</p>}
        {success && <p className="text-sm" style={{ color: colors.success }}>{success}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 mt-6 rounded-lg font-medium flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50 text-white"
          style={{ backgroundColor: announcementType === "book" ? colors.primary : colors.primary }}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {loading ? "Sending..." : "Send to All Users"}
        </button>
      </form>
    </div>
  );
}