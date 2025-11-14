// src\app\(dashboard)\layout.tsx (VERSI FINAL - HILANGKAN DEMO TOKEN)
"use client"

import { useEffect, useState } from "react"
import DashboardHeader from "@/components/common/dashboard-header"
import Footer from "@/components/common/Footer"
import { getAuthToken, setAuthToken, removeAuthToken } from "@/lib/auth"
import { useRouter, useSearchParams } from "next/navigation" 
import { Loader2 } from "lucide-react" 

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false)
  const [isAuthChecked, setIsAuthChecked] = useState(false)
  
  const searchParams = useSearchParams(); 
  const router = useRouter(); 

  useEffect(() => {
    setIsMounted(true)
    
    let currentToken = getAuthToken(); // Ambil token yang sudah ada
    const urlToken = searchParams.get('token'); // Ambil token dari URL

    if (urlToken) {
      // 1. TOKEN DITEMUKAN DI URL (setelah redirect Google)
      setAuthToken(urlToken); 
      
      // Hapus cache role/data lama agar fetch data berikutnya mengambil yang baru
      localStorage.removeItem("userRole"); 
      localStorage.removeItem("username"); 
      
      currentToken = urlToken; // Update token

      // 2. BERSIHKAN URL dari parameter 'token' dan redirect ke dashboard bersih
      router.replace('/dashboard'); 
    }

    // 3. JIKA TIDAK ADA TOKEN (setelah semua upaya)
    if (!currentToken) {
      // Hapus token yang mungkin rusak/kedaluwarsa (termasuk demo token lama)
      removeAuthToken(); 
      
      // Redirect ke halaman Sign In
      router.replace('/sign-in');
      
      // Cepat keluar dari useEffect agar tidak me-render dashboard
      return; 
    }

    // Jika token ada, selesai pengecekan
    setIsAuthChecked(true);

  }, [searchParams, router])

  // Tampilkan loading saat proses pengecekan auth
  if (!isMounted || !isAuthChecked) {
      return (
          <div className="flex justify-center items-center h-screen">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
              <p className="ml-3 text-gray-600 font-medium">Verifying session...</p>
          </div>
      )
  }
  
  // Jika auth sudah dicek dan token valid, render dashboard
  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />
      <main className="flex-grow pt-20">{children}</main>
      <Footer />
    </div>
  )
}