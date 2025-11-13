"use client"; 

import Link from "next/link";
import { Users, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { typography } from "@/styles/typography";
import { colors } from "@/styles/colors";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

type RoomCardProps = {
  id: string;
  _id?: string;
  name: string;
  description?: string;
  capacity: number;
  photos: string[];
  facilities: string[];
  status?: "available" | "booked" | "maintenance";
};

export function RoomCard({ 
  id, 
  _id, 
  name, 
  description, 
  capacity, 
  photos, 
  facilities, 
  status = "available" 
}: RoomCardProps) {
  
  const statusConfig = {
    available: {
      label: "✓ Available",
      color: colors.success,
      buttonEnabled: true,
      buttonLabel: "View Details & Book",
      buttonClass: "bg-cyan-500 hover:bg-cyan-600",
    },
    booked: {
      label: "✗ Booked",
      color: colors.danger,
      buttonEnabled: false,
      buttonLabel: "Booked",
      buttonClass: "bg-gray-400 cursor-not-allowed",
    },
    maintenance: {
      label: "✗ Maintenance",
      color: colors.warning, 
      buttonEnabled: false,
      buttonLabel: "Under Maintenance",
      buttonClass: "bg-gray-400 cursor-not-allowed",
    }
  };
  
  const currentStatus = statusConfig[status] || statusConfig.available;
  const finalId = (id || _id) as string; 
  if (!finalId) return null;

  // Cek kalo fotonya beneran ada dan array-nya gak kosong
  const hasPhotos = photos && photos.length > 0;

  return (
    <Link href={`/rooms/${finalId}`}>
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm hover:shadow-xl hover:shadow-blue-300/30 transition-all duration-300 cursor-pointer h-full flex flex-col hover:scale-[1.02]">
        
        <div className="bg-slate-100 h-48 flex items-center justify-center overflow-hidden relative">
          <Carousel className="w-full h-full">
            <CarouselContent>
              {hasPhotos ? (
                photos.map((photo, index) => (
                  <CarouselItem key={index}>
                    <img 
                      src={photo} 
                      alt={`${name} photo ${index + 1}`} 
                      className="w-full h-48 object-cover" 
                    />
                  </CarouselItem>
                ))
              ) : (
                <CarouselItem>
                  <img 
                    src="https://via.placeholder.com/500x300?text=No+Image" 
                    alt="No image available" 
                    className="w-full h-48 object-cover"
                  />
                </CarouselItem>
              )}
            </CarouselContent>
          </Carousel>

          {status === 'maintenance' && (
            <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
              <Wrench className="w-3 h-3" />
              MAINTENANCE
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col flex-grow">
          <h3 className={`${typography.h4} hover:text-cyan-600 transition-colors`}>
            {name}
          </h3>
          <p className={`${typography.bodySmall} mt-1 flex-grow line-clamp-2`}>
            {description || "No description available."}
          </p>
          <div className="flex items-center gap-2 mt-3">
            <Users className="w-4 h-4" style={{ color: colors.textSecondary }} />
            <span className={`${typography.label}`}>Capacity: {capacity}</span>
          </div>
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
          <div className="mt-3 mb-3">
            <span 
              className={`${typography.label}`}
              style={{ color: currentStatus.color }}
            >
              {currentStatus.label}
            </span>
          </div>
          <Button 
            className={`w-full font-bold transition-all mt-2 ${currentStatus.buttonClass}`}
            variant="primary"
            disabled={!currentStatus.buttonEnabled}
          >
            {currentStatus.buttonLabel}
          </Button>
        </div>
      </div>
    </Link>
  )
}

export default RoomCard;