import Link from "next/link"
import { Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { typography } from "@/styles/typography"
import { colors } from "@/styles/colors"

type RoomCardProps = {
  id: string
  name: string
  description?: string 
  capacity: number
  photos: string[]
  facilities: string[]
  status?: "available" | "booked"
}

export function RoomCard({ id, name, description, capacity, photos, facilities, status = "available" }: RoomCardProps) {
  const isAvailable = status === "available"

  return (
    <Link href={`/rooms/${id}`}>
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm hover:shadow-xl hover:shadow-blue-300/30 transition-all duration-300 cursor-pointer h-full flex flex-col hover:scale-[1.02]">
        
        {/* Room Image */}
        <div className="bg-slate-100 h-48 flex items-center justify-center overflow-hidden">
          <img 
            src={photos?.[0] || "https://via.placeholder.com/500x300?text=No+Image"} 
            alt={name} 
            className="w-full h-full object-cover transition-transform duration-300" 
          />
        </div>

        <div className="p-4 flex flex-col flex-grow">
          {/* Room Name */}
           <h3 className={`${typography.h4} hover:text-cyan-600 transition-colors`}>
            {name}
          </h3>

         {/* Description */}
          <p className={`${typography.bodySmall} mt-1 flex-grow line-clamp-2`}>
            {description || "No description available."}
          </p>

          {/* Capacity */}
           <div className="flex items-center gap-2 mt-3">
            <Users className="w-4 h-4" style={{ color: colors.textSecondary }} />
            <span className={`${typography.label}`}>Capacity: {capacity}</span>
          </div>

          {/* Facilities */}
          <div className="flex flex-wrap gap-2 mt-3">
            {facilities?.slice(0, 3).map((facility, i) => (
              <span 
                key={i} 
                className={`${typography.labelSmall} bg-slate-100 px-2 py-1 rounded border border-slate-200`}
                style={{ color: colors.textSecondary }}
              >
                 {facility}
              </span>
            ))}
          </div>

     
          {/* Status */}
          <div className="mt-3 mb-3">
            <span 
              className={`${typography.label}`}
               style={{ color: isAvailable ? colors.success : colors.danger }}
            >
              {isAvailable ? "✓ Available" : "✗ Booked"}
            </span>
          </div>

          {/* Button */}
          <Button 
            className={`w-full font-bold transition-all mt-2 ${
                isAvailable 
                     ? "bg-cyan-500 hover:bg-cyan-600" 
                    : "bg-gray-400 cursor-not-allowed"
            }`}
            variant="primary"
            disabled={!isAvailable}
          >
            View Details & Book
           </Button>
        </div>
      </div>
    </Link>
  )
}

export default RoomCard