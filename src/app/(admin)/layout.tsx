"use client";

import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { getAuthToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(async () => {
        try {
            const token = getAuthToken();
            const headers: HeadersInit = {};
            
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            } else {
                 throw new Error("No token");
            }

            const res = await fetch(`${API_URL}/api/users/me`, { 
                headers,
                credentials: 'include' 
            });

            if (!res.ok) throw new Error("Not authorized");

            const user = await res.json();

            if (user.role !== "admin") {
                alert("Access denied. Admin only.");
                window.location.href = "/dashboard"; // Hard redirect
            } else {
                setIsAdmin(true); 
            }
        } catch (err) {
            window.location.href = "/sign-in"; // Hard redirect
        } finally {
            setIsLoading(false);
        }
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
        <p className="ml-3 text-slate-600">Verifying admin access...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
      <AdminSidebar /> 
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