import Link from "next/link"
import { Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { typography } from "@/styles/typography"
import { colors } from "@/styles/colors"

type RoomCardProps = {
  id: string
  name: string
  description: string
  capacity: number
  image: string
  features: string[]
  status?: "available" | "booked"
}

export function RoomCard({ id, name, description, capacity, image, features, status = "available" }: RoomCardProps) {
  return (
    <Link href={`/rooms/${id}`}>
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer h-full flex flex-col">
        {/* Room Image */}
        <div className="bg-slate-100 h-48 flex items-center justify-center overflow-hidden">
          <img 
            src={image} 
            alt={name} 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
          />
        </div>

        <div className="p-4 flex flex-col flex-grow">
          {/* Room Name */}
          <h3 className={`${typography.h4} hover:text-blue-500 transition-colors`}>
            {name}
          </h3>

          {/* Description */}
          <p className={`${typography.bodySmall} mt-1 flex-grow`}>
            {description}
          </p>

          {/* Capacity */}
          <div className="flex items-center gap-2 mt-3">
            <Users className="w-4 h-4" style={{ color: colors.textSecondary }} />
            <span className={`${typography.label}`}>Capacity: {capacity}</span>
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-2 mt-3">
            {features.map((feature, i) => (
              <span 
                key={i} 
                className={`${typography.labelSmall} bg-slate-100 px-2 py-1 rounded border border-slate-200`}
                style={{ color: colors.textSecondary }}
              >
                {feature}
              </span>
            ))}
          </div>

          {/* Status */}
          <div className="mt-3 mb-3">
            <span 
              className={`${typography.label}`}
              style={{ color: status === "available" ? colors.success : colors.danger }}
            >
              {status === "available" ? "✓ Available" : "✗ Booked"}
            </span>
          </div>

          {/* Button */}
          <Button 
            className="w-full font-semibold transition-all"
            style={{ backgroundColor: colors.info }}
          >
            View Details & Book
          </Button>
        </div>
      </div>
    </Link>
  )
}

export default RoomCard