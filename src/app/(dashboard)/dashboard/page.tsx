"use client"

import Link from "next/link"
import { ChevronRight, BookOpen, Users, Bell, Loader2, AlertCircle, AlertTriangle } from "lucide-react"
import { useState, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import BookCard from "@/components/books/book-card"
import { RoomCard } from "@/components/rooms/room-card"
import AnnouncementCard from "@/components/announcements/announcement-card"
import { typography } from "@/styles/typography"
import { colors } from "@/styles/colors"
import { spacing } from "@/styles/spacing"
import type { Book, Room, Announcement, Loan } from "@/types"
import { getAuthToken, setAuthToken, removeAuthToken } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "" // fallback ke empty string

const sampleBooks: Book[] = [
  { id: "1", title: "Mock Book", author: "Mock Author", stock: 5, status: "available", category: "Fiction", year: 2023 },
]
const sampleRooms: Room[] = [
  {
    id: "1",
    name: "Mock Room",
    description: "A quiet room",
    capacity: 6,
    photos: ["https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop"],
    facilities: ["Whiteboard"],
    status: "available" as const,
    price: 0,
  },
]
const sampleAnnouncements: Announcement[] = [
  { id: 1, title: "Mock Announcement", snippet: "Mock update.", bookTitle: "", message: "", createdAt: "" },
]

export default function DashboardPageWrapper() {
  return (
    <Suspense fallback={<DashboardLoadingSkeleton />}>
      <Dashboard />
    </Suspense>
  )
}

function DashboardLoadingSkeleton() {
  return (
    <div className="flex justify-center items-center h-screen">
      <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
      <p className="ml-3 text-gray-600 font-medium">Loading Dashboard...</p>
    </div>
  )
}

type StatsState = {
  totalBooks: number
  availableRooms: number
  announcementCount: number
  featuredBooks: Book[]
  featuredRooms: Room[]
  featuredAnnouncements: Announcement[]
}

function Dashboard() {
  const [stats, setStats] = useState<StatsState>({
    totalBooks: 0,
    availableRooms: 0,
    announcementCount: 0,
    featuredBooks: sampleBooks,
    featuredRooms: sampleRooms,
    featuredAnnouncements: sampleAnnouncements,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [username, setUsername] = useState<string>("")
  const [greeting, setGreeting] = useState<string>("")
  const [lateLoans, setLateLoans] = useState<Loan[]>([])
  const [upcomingLoans, setUpcomingLoans] = useState<Loan[]>([])

  const router = useRouter()
  const searchParams = useSearchParams()

  // refs to avoid stale closures / race
  const controllerRef = useRef<AbortController | null>(null)
  const cancelledRef = useRef(false)
  const intervalRef = useRef<number | null>(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // ambil token dari query (OAuth redirect)
  useEffect(() => {
    try {
      const token = searchParams?.get("token")
      if (token && typeof token === "string" && token !== "undefined") {
        setAuthToken(token)
        // remove token param tanpa reload
        try {
          const url = new URL(window.location.href)
          url.searchParams.delete("token")
          window.history.replaceState({}, document.title, url.pathname + url.search)
        } catch {}
      }
    } catch {}
    const hour = new Date().getHours()
    if (hour < 11) setGreeting("Good Morning")
    else if (hour < 15) setGreeting("Good Afternoon")
    else if (hour < 18) setGreeting("Good Evening")
    else setGreeting("Good Night")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams?.toString()])

  useEffect(() => {
    try {
      const stored = localStorage.getItem("username")
      if (stored) setUsername(stored)
    } catch {}
  }, [])

  useEffect(() => {
    const token = getAuthToken()
    if (!token) {
      setError("Authentication required.")
      setIsLoading(false)
      router.replace("/sign-in")
      return
    }

    if (!API_URL) {
      setError("API URL tidak dikonfigurasi. Set NEXT_PUBLIC_API_URL.")
      setIsLoading(false)
      return
    }

    cancelledRef.current = false

    const safeJson = async (res: Response) => {
      // cek status dulu
      if (!res.ok) {
        const text = await res.text().catch(() => "")
        throw new Error(`HTTP ${res.status} ${text}`)
      }
      // coba parse json, fallback ke null
      return res.json().catch(() => null)
    }

    const fetchDashboardDataSafe = async (showLoading = true) => {
      if (!isMountedRef.current) return
      if (showLoading) setIsLoading(true)
      if (!showLoading) setError(null)

      try {
        // abort previous
        controllerRef.current?.abort()
        const controller = new AbortController()
        controllerRef.current = controller
        const signal = controller.signal

        const headers: Record<string, string> = {}
        if (token) headers["Authorization"] = `Bearer ${token}`

        const common: RequestInit = { credentials: "include", headers, signal }

        const base = API_URL.replace(/\/+$/, "")

        const [
          userRes,
          featuredBooksRes,
          totalBooksRes,
          roomsRes,
          announcementsRes,
          loansRes,
        ] = await Promise.all([
          fetch(`${base}/api/users/me`, common),
          fetch(`${base}/api/books?limit=4&sortBy=createdAt&order=desc`, common),
          fetch(`${base}/api/books?limit=1`, common),
          fetch(`${base}/api/rooms`, common),
          fetch(`${base}/api/announcements`, common),
          fetch(`${base}/api/loans/my`, common),
        ])

        // unauthorized handling
        if ([userRes, featuredBooksRes, totalBooksRes, roomsRes, announcementsRes, loansRes].some(r => r.status === 401 || r.status === 403)) {
          removeAuthToken()
          if (!cancelledRef.current) router.replace("/sign-in")
          return
        }

        const userData = await safeJson(userRes)
        const featuredBooksData = await safeJson(featuredBooksRes)
        const totalBooksData = await safeJson(totalBooksRes)
        const roomsData = await safeJson(roomsRes) || []
        const announcementsData = await safeJson(announcementsRes) || []
        const loansData = await safeJson(loansRes) || []

        if (cancelledRef.current) return

        if (userData) {
          const realName = userData.name || userData.username || "User"
          setUsername(realName)
          try { localStorage.setItem("username", realName) } catch {}
        }

        const featuredBooks = (featuredBooksData?.data) || []
        const totalBooks = (totalBooksData?.total) || 0

        const featuredRooms = (roomsData || [])
          .sort((a: any, b: any) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
            return dateB - dateA
          })
          .slice(0, 3)

        const availableRooms = (roomsData || []).filter((r: any) => r.status === "available").length
        const featuredAnnouncements = (announcementsData || []).slice(0, 3)
        const announcementCount = (announcementsData || []).length || 0

        const now = new Date()
        const sevenDaysFromNow = new Date()
        sevenDaysFromNow.setDate(now.getDate() + 7)
        const startOfToday = new Date()
        startOfToday.setHours(0,0,0,0)

        const late = (loansData || []).filter((loan: any) => loan.status === 'late')
        const upcoming = (loansData || []).filter((loan: any) => {
          if (!loan.dueDate || isNaN(new Date(loan.dueDate).getTime())) return false
          const dueDate = new Date(loan.dueDate)
          return loan.status === 'borrowed' && dueDate >= startOfToday && dueDate <= sevenDaysFromNow
        })

        setLateLoans(late)
        setUpcomingLoans(upcoming)
        setStats({
          totalBooks,
          availableRooms,
          announcementCount,
          featuredBooks,
          featuredRooms,
          featuredAnnouncements,
        })
        setError(null)
      } catch (err: any) {
        if (err?.name === "AbortError") {
          // ignore abort
        } else {
          console.error("dashboard fetch error:", err)
          if (!cancelledRef.current) {
            if (showLoading) setError("Failed to load dashboard data. Check backend.")
          }
        }
      } finally {
        if (!cancelledRef.current && showLoading) setIsLoading(false)
      }
    }

    fetchDashboardDataSafe(true)

    const onFocus = () => fetchDashboardDataSafe(false)
    const onVisibility = () => {
      if (document.visibilityState === "visible") fetchDashboardDataSafe(false)
    }

    window.addEventListener("focus", onFocus)
    document.addEventListener("visibilitychange", onVisibility)

    intervalRef.current = window.setInterval(() => fetchDashboardDataSafe(false), 5000)

    return () => {
      cancelledRef.current = true
      controllerRef.current?.abort()
      window.removeEventListener("focus", onFocus)
      document.removeEventListener("visibilitychange", onVisibility)
      if (intervalRef.current) window.clearInterval(intervalRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  if (isLoading) return <DashboardLoadingSkeleton />

  if (error)
    return (
      <div className="p-12 text-center">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <h3 className="font-semibold text-red-800 mb-1">Error Loading Dashboard</h3>
        <p className="text-sm text-red-700">{error}</p>
      </div>
    )

  return (
    <div style={{ backgroundColor: colors.bgPrimary }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16">
        <div className={`space-y-${spacing.sm}`}>
          <h1 className={`${typography.h1} !text-[1.65rem] sm:text-4xl`}>{greeting}, {username || "Guest"}!</h1>
          <p className={typography.body}>Explore books, reserve rooms, and stay updated</p>
        </div>
      </div>

      {lateLoans.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 mb-10">
          <div className="p-4 bg-red-50 border border-red-300 rounded-lg flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-800">Peringatan Keterlambatan!</h3>
              <p className="text-sm text-red-700">
                Ada {lateLoans.length} buku yang telat dibalikin. Cek <Link href="/loans" className="font-bold underline">Halaman Pinjaman</Link> buat liat denda.
              </p>
            </div>
          </div>
        </div>
      )}

      {upcomingLoans.length > 0 && lateLoans.length === 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 mb-10">
          <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-yellow-800">Upcoming Due Date Notice</h3>
              <p className="text-sm text-yellow-700">
                You have {upcomingLoans.length} books that are scheduled to be due within the next 7 days.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            href="/books"
            label="Total Books"
            value={stats.totalBooks.toLocaleString()}
            icon={<BookOpen className="w-12 h-12" style={{ color: colors.info }} />}
          />
          <StatCard
            href="/rooms"
            label="Available Rooms"
            value={stats.availableRooms.toLocaleString()}
            icon={<Users className="w-12 h-12" style={{ color: colors.success }} />}
          />
          <StatCard
            href="/announcements"
            label="Announcements"
            value={stats.announcementCount.toLocaleString()}
            icon={<Bell className="w-12 h-12" style={{ color: colors.warning }} />}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 pb-16">
        <Section title="Featured Books" description="Latest additions to our collection" viewAllHref="/books">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {stats.featuredBooks.map((book: any) => (
              <BookCard
                key={book.id || book._id}
                id={book.id || book._id}
                title={book.title || "Untitled"}
                author={book.author || "Unknown"}
                cover={book.cover || ""}
                stock={book.stock ?? 0}
                status={book.status ?? "available"}
              />
            ))}
          </div>
        </Section>

        <Section title="Available Rooms" description="Book a space for your group" viewAllHref="/rooms">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
            {stats.featuredRooms.map((room: any) => (
              <RoomCard key={room.id || room._id} {...room} />
            ))}
          </div>
        </Section>

        <Section title="Latest Announcements" description="Stay updated with library news" viewAllHref="/announcements">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.featuredAnnouncements.map((announcement: any) => (
              <AnnouncementCard
                key={announcement.id || announcement._id}
                id={announcement.id || announcement._id}
                title={announcement.bookTitle || announcement.title || "Announcement"}
                snippet={announcement.message || announcement.snippet || ""}
                date={announcement.createdAt || announcement.date || ""}
              />
            ))}
          </div>
        </Section>
      </div>
    </div>
  )
}

function Section({ title, description, viewAllHref, children }: { title: string; description: string; viewAllHref: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className={typography.h2}>{title}</h2>
          <p className={`${typography.bodySmall} mt-1`} style={{ color: colors.textSecondary }}>
            {description}
          </p>
        </div>
        <Link href={viewAllHref}>
          <button className="font-semibold flex items-center gap-2 text-sm transition-colors" style={{ color: colors.info }}>
            View All
            <ChevronRight className="w-4 h-4" />
          </button>
        </Link>
      </div>
      {children}
    </section>
  )
}

function StatCard({ href, label, value, icon }: { href: string; label: string; value: string; icon: React.ReactNode }) {
  return (
    <Link href={href}>
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-md hover:shadow-lg transition-all cursor-pointer">
        <div className="flex items-center justify-between">
          <div>
            <p className={`${typography.label} text-slate-600`}>{label}</p>
            <p className={`${typography.h2} mt-1`}>{value}</p>
          </div>
          <div className="opacity-80">{icon}</div>
        </div>
      </div>
    </Link>
  )
}
