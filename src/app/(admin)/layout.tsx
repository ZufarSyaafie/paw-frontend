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
          router.push("/dashboard"); // not admin, kick
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
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AdminSidebar /> 
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}