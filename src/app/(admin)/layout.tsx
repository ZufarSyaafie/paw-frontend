"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_URL}/api/users/me`, { credentials: 'include' });

        if (!res.ok) throw new Error("Not authorized");

        const user = await res.json();

        if (user.role !== "admin") {
          alert("Akses ditolak. Hanya untuk Admin.");
          router.push("/dashboard");
        } else {
          setIsAdmin(true); 
        }
      } catch (err) {
        router.push("/sign-in");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="ml-3">Memverifikasi akses admin...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null; 
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
      {/* Sidebar di Top Right */}
      <AdminSidebar /> 

      {/* Main Content - Centered */}
      <main className="flex-1 overflow-y-auto">
        <div className="flex justify-center min-h-full">
          <div className="w-full max-w-7xl px-4 sm:px-6 md:px-8 lg:px-10 py-6 sm:py-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}