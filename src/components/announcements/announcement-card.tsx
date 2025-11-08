import Link from "next/link"
import { Calendar } from "lucide-react"
import { typography } from "@/styles/typography"

type AnnouncementCardProps = {
  id: number
  title: string
  snippet: string
  date: string
  variant?: "light" | "dark"
}

export default function AnnouncementCard({ 
  id, 
  title, 
  snippet, 
  date,
  variant = "light"
}: AnnouncementCardProps) {
  const formattedDate = new Date(date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })

  const isLight = variant === "light"

  return (
    <Link href={`/announcements/${id}`}>
      <div className={`border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer h-full flex flex-col ${
        isLight
          ? "bg-white border-slate-200"
          : "bg-[#1E293B] border-slate-700"
      }`}>
        {/* Header Background */}
        <div className={`h-16 flex items-center px-4 border-b ${
          isLight
            ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-slate-200"
            : "bg-gradient-to-r from-slate-700 to-slate-800 border-slate-600"
        }`}>
          <Calendar className={`w-5 h-5 mr-2 ${isLight ? "text-blue-500" : "text-cyan-400"}`} />
          <span className={`text-sm font-semibold ${isLight ? "text-slate-700" : "text-slate-200"}`}>
            {formattedDate}
          </span>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-grow">
          <h3 className={`${typography.h4} mb-2 line-clamp-2 transition-colors ${
            isLight 
              ? "text-gray-900 hover:text-blue-500" 
              : "text-slate-100 hover:text-cyan-400"
          }`}>
            {title}
          </h3>
          <p className={`${typography.bodySmall} flex-grow line-clamp-3 ${
            isLight ? "text-gray-600" : "text-slate-400"
          }`}>
            {snippet}
          </p>

          {/* Read More Link */}
          <div className={`mt-4 pt-4 border-t ${isLight ? "border-slate-100" : "border-slate-600"}`}>
            <span className={`text-sm font-semibold transition-colors ${
              isLight 
                ? "text-blue-600 hover:text-blue-700" 
                : "text-cyan-400 hover:text-cyan-300"
            }`}>
              Read More →
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}