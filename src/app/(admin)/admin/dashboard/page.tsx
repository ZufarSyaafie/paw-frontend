"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { getAuthToken } from "@/lib/auth";
import { 
  Loader2, Users, Book, Box, 
  DoorOpen, Hourglass, AlarmClock, Send, CalendarCheck, Bell
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
    const fetchAllStats = async () => {
      const token = getAuthToken();
      if (!token) {
        setIsLoading(false);
        return;
      }
      
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
        setIsLoading(false);
      }
    };

    fetchAllStats();
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          <Link href="/admin/users">
            <StatCard 
              title="Total Users" 
              value={stats?.users?.toString() ?? '...'} 
              icon={<Users className="w-6 h-6" style={{ color: colors.primary }} />}
            />
          </Link>
          <Link href="/admin/books">
            <StatCard 
              title="Total Books" 
              value={stats?.books?.toString() ?? '...'} 
              icon={<Book className="w-6 h-6" style={{ color: colors.success }} />} 
            />
          </Link>
          <Link href="/admin/loans">
            <StatCard 
              title="Total Loans" 
              value={stats?.loans?.toString() ?? '...'} 
              icon={<Box className="w-6 h-6" style={{ color: colors.info }} />} 
            />
          </Link>
          <Link href="/admin/rooms">
            <StatCard 
              title="Available Rooms" 
              value={stats?.availableRooms?.toString() ?? '...'} 
              icon={<DoorOpen className="w-6 h-6" style={{ color: colors.warning }} />} 
            />
          </Link>
          <Link href="/admin/bookings">
            <StatCard 
              title="Pending Bookings" 
              value={stats?.pendingBookings?.toString() ?? '...'} 
              icon={<Hourglass className="w-6 h-6" style={{ color: colors.danger }} />} 
            />
          </Link>
          <Link href="/admin/announcements">
            <StatCard
              title="Announcements"
              value={stats?.announcements?.toString() ?? '...'}
              icon={<Bell className="w-6 h-6" style={{ color: colors.warning }} />}
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

function StatCard({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
  return (
    <div 
      className="p-5 rounded-lg border shadow-sm flex flex-col justify-between h-32 transition-all hover:shadow-lg cursor-pointer"
      style={{
        backgroundColor: colors.bgPrimary,
        borderColor: colors.bgTertiary,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = colors.primary;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = colors.bgTertiary;
      }}
    >
      <div className="text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
        {title}
      </div>
      <div className="flex items-center justify-between">
        <div className="p-3 rounded-full flex-shrink-0" style={{ backgroundColor: colors.bgSecondary }}>
          {icon}
        </div>
        <div className="text-4xl font-bold ml-4" style={{ color: colors.textPrimary }}>
          {value}
        </div>
      </div>
    </div>
  );
}

function UpcomingDueDatesPanel({ loans }: { loans: Loan[] }) {
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
      <h3 className="text-xl font-bold mb-4" style={{ color: colors.textPrimary }}>
        Upcoming Due Dates
      </h3>
      {upcomingLoans.length > 0 ? (
        <ul className="space-y-3">
          {upcomingLoans.map(loan => (
            <li 
              key={loan._id || loan.id} 
              className="flex justify-between items-center p-3 rounded-lg border"
              style={{
                backgroundColor: isOverdue(loan.dueDate) ? `${colors.danger}10` : colors.bgSecondary,
                borderColor: isOverdue(loan.dueDate) ? `${colors.danger}30` : colors.bgTertiary
              }}
            >
              <div>
                <p className="font-semibold" style={{ color: colors.textPrimary }}>
                  {loan.book.title}
                </p>
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  oleh {loan.book.author}
                </p>
              </div>
              <div className="text-right flex-shrink-0 ml-4">
                <p 
                  className="font-semibold flex items-center gap-1.5"
                  style={{ color: isOverdue(loan.dueDate) ? colors.danger : colors.textSecondary }}
                >
                  {isOverdue(loan.dueDate) ? <CalendarCheck className="w-4 h-4" /> : <AlarmClock className="w-4 h-4" />}
                  {formatDate(loan.dueDate)}
                </p>
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  {loan.user.email}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ color: colors.textSecondary }}>
          Tidak ada pinjaman aktif yang akan jatuh tempo.
        </p>
      )}
    </div>
  );
}

function QuickAnnouncementPanel() {
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
        // Book announcement
        payload = {
          title: title || `Buku Baru: ${bookTitle}`,
          bookTitle: bookTitle,
          message: message,
        };
      } else {
        // General announcement
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
        throw new Error(errData.message || "Gagal mengirim pengumuman.");
      }

      setSuccess("Pengumuman berhasil dikirim ke semua user!");
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
      <h3 className="text-xl font-bold mb-4" style={{ color: colors.textPrimary }}>
        Quick Announcement
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tipe Pengumuman */}
        <div>
          <label className="text-sm font-medium block mb-2" style={{ color: colors.textPrimary }}>
            Tipe Pengumuman
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
              📢 Umum
            </button>
            <button
              type="button"
              onClick={() => setAnnouncementType("book")}
              className="flex-1 py-2 px-4 rounded-lg font-medium transition-all"
              style={{
                backgroundColor: announcementType === "book" ? colors.success : colors.bgSecondary,
                color: announcementType === "book" ? "#ffffff" : colors.textSecondary,
                border: `2px solid ${announcementType === "book" ? colors.success : colors.bgTertiary}`,
              }}
            >
              📚 Buku Baru
            </button>
          </div>
        </div>

        {/* Conditional Fields */}
        {announcementType === "book" ? (
          <>
            <div>
              <label className="text-sm font-medium block mb-2" style={{ color: colors.textPrimary }}>
                Judul Buku <span style={{ color: colors.danger }}>*</span>
              </label>
              <input
                name="bookTitle"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                required
                placeholder="Misal: Norwegian Wood"
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
                Judul Pengumuman <span style={{ color: colors.textSecondary, fontSize: "0.85em" }}>(opsional)</span>
              </label>
              <input
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Default: Buku Baru: [Judul Buku]"
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
              Judul Pengumuman <span style={{ color: colors.danger }}>*</span>
            </label>
            <input
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Misal: Perpus Tutup Besok"
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
            Isi Pesan <span style={{ color: colors.danger }}>*</span>
          </label>
          <textarea
            name="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={4}
            placeholder={announcementType === "book" ? "Deskripsi tentang buku baru..." : "Isi pengumumannya..."}
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
          style={{ backgroundColor: announcementType === "book" ? colors.success : colors.primary }}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {loading ? "Mengirim..." : "Kirim ke Semua User"}
        </button>
      </form>
    </div>
  );
}