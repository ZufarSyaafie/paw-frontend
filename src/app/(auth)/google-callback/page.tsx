// src\app\(auth)\google-callback\page.tsx (File BARU)
"use client"
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setAuthToken } from "@/lib/auth"; // [cite: 1695, 1696]
import { Loader2 } from 'lucide-react';
import { AuthLayout } from '@/components/auth/auth-layout';

export default function GoogleAuthCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            setAuthToken(token); // Simpan token ke localStorage 
            // Hapus cache role lama agar fetch data 'me' berikutnya mengambil role baru
            localStorage.removeItem("userRole"); 
            localStorage.removeItem("username"); 
            alert("Google Login Sukses! Redirecting ke Dashboard...");
            router.push('/dashboard'); // Redirect ke Dashboard
        } else {
            // Jika token tidak ada (misalnya gagal otorisasi Google)
            router.push('/sign-in?error=Google login failed, no token received.');
        }
    }, [router, searchParams]);

    return (
        <AuthLayout>
            <div className="flex flex-col items-center justify-center h-48 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
                <p className="ml-3 text-white">Memproses login Google **lu**...</p>
                <p className="text-xs text-white/60">Jangan tutup halaman ini.</p>
            </div>
        </AuthLayout>
    );
}