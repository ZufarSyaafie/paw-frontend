"use client";
import Link from "next/link";
import { LogOut, Menu, X, Bell, ShieldCheck } from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { colors } from "@/styles/colors";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const DEFAULT_AVATAR = "https://api.dicebear.com/7.x/avataaars/svg?seed=user_default";

// nav links defined outside component to avoid re-creation each render
const baseNavLinks: { href: string; label: string }[] = [
    { href: "/books", label: "Books" },
    { href: "/rooms", label: "Rooms" },
    { href: "/announcements", label: "Announcements" },
    { href: "/loans", label: "Loans" },
    { href: "/bookings", label: "Bookings" },
];

export default function DashboardHeader() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const [hasUnreadNotifs, setHasUnreadNotifs] = useState(false);
    const [profilePicUrl, setProfilePicUrl] = useState(DEFAULT_AVATAR);
    const [userRole, setUserRole] = useState<string | null>(null);

    // helper to determine active nav link
    const isActive = useCallback(
        (href: string) => {
            if (href === "/dashboard") return pathname === "/dashboard";
            const baseHref = href.split("/").slice(0, 2).join("/");
            const basePathname = pathname.split("/").slice(0, 2).join("/");
            return basePathname === baseHref;
        },
        [pathname]
    );

    // styling helper for links
    const linkClassName = (href: string) =>
        `px-3 py-2 rounded-md text-sm font-medium transition-colors motion-reduce:transition-none ${
            isActive(href) ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
    }`;

    const adminLinkClassName = (href: string) =>
        `px-3 py-2 rounded-md text-sm font-medium transition-colors motion-reduce:transition-none flex items-center gap-1.5 ${
            isActive(href) ? "bg-blue-100 text-blue-700" : "text-blue-600 hover:bg-blue-50 hover:text-blue-700"
    }`;

    // logout logic
    const handleLogout = async () => {
        try {
            await fetch(`${API_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' });
        } catch {}
        localStorage.removeItem("userProfilePicture");
        localStorage.removeItem("lastNotifRead");
        localStorage.removeItem("userRole");
        router.push("/sign-in");
    };

    const handleProfileClick = () => {
        router.push("/profile");
    };

    const saveLastReadTimestamp = () => {
        localStorage.setItem("lastNotifRead", String(Date.now()));
        setHasUnreadNotifs(false);
    };

    const handleNotificationClick = () => {
        router.push("/announcements");
        saveLastReadTimestamp();
    };

    useEffect(() => {
        // load profile pic from localstorage
        const storedPic = localStorage.getItem("userProfilePicture");
        if (storedPic) setProfilePicUrl(storedPic);

                const checkUserRole = async () => {
                    const cachedRole = localStorage.getItem("userRole");
                    if (cachedRole) {
                        setUserRole(cachedRole);
                    }
                    try {
                        const res = await fetch(`${API_URL}/api/users/me`, { credentials: 'include' });
                        if (res.ok) {
                            const user = await res.json();
                            setUserRole(user.role);
                            localStorage.setItem("userRole", user.role);
                        }
                    } catch (error) {
                        console.error("failed to fetch user role:", error);
                    }
                };

        // check latest announcement to flag unread
        const checkNotifications = async () => {
            if (!API_URL) return;
            try {
                const res = await fetch(`${API_URL}/api/announcements?limit=1`, { credentials: 'include' });
                if (!res.ok) throw new Error("failed to fetch announcements");
                const announcements = await res.json();
                if (Array.isArray(announcements) && announcements.length > 0) {
                    const latestNotifTimestamp = new Date(announcements[0].createdAt).getTime();
                    const lastReadTimestamp = localStorage.getItem("lastNotifRead");
                    if (!lastReadTimestamp || latestNotifTimestamp > Number(lastReadTimestamp)) {
                        setHasUnreadNotifs(true);
                    }
                }
            } catch (error) {
                console.error("failed to check notifications:", error);
            }
        };

        checkUserRole();
        checkNotifications();

        // listen for storage changes (e.g., profile pic updated elsewhere)
        const handleStorageChange = () => {
            const newPic = localStorage.getItem("userProfilePicture");
            setProfilePicUrl(newPic || DEFAULT_AVATAR);
            const newRole = localStorage.getItem("userRole");
            setUserRole(newRole);
        };
        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, [pathname]);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 pt-4 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg ring-1 ring-black/5" style={{ border: `1px solid #e2e8f0` }}>
                <div className="relative flex items-center justify-between h-16 px-4 sm:px-6">
                    {/* kiri: logo */}
                    <div className="flex-shrink-0">
                        <Link
                            href="/dashboard"
                            className={`flex items-center gap-3 p-2 rounded-md transition-all motion-reduce:transition-none ${
                                isActive("/dashboard") ? "opacity-100" : "opacity-70 hover:opacity-100 hover:bg-slate-100"
                            }`}
                        >
                            <img src="/logo.png" alt="Naratama" className="h-10 w-auto" />
                        </Link>
                    </div>

                    {/* tengah: nav links (desktop - lg) */}
                    <nav className="hidden lg:flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
                        {userRole === 'admin' && (
                            <React.Fragment>
                                <Link href="/admin/dashboard" className={adminLinkClassName("/admin")}>
                                    <ShieldCheck className="w-4 h-4" />
                                    Admin Panel
                                </Link>
                                {/* Garis Pemisah */}
                                <div className="h-4 w-px bg-slate-300 mx-2" />
                            </React.Fragment>
                        )}
                        {baseNavLinks.map((link) => (
                            <Link key={link.href} href={link.href} className={linkClassName(link.href)}>
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* kanan: icons + desktop logout */}
                    <div className="flex items-center gap-3 sm:gap-4">
                        
                        {/* notif (FIXED) */}
                        <button
                            onClick={handleNotificationClick}
                            className="relative group p-2 rounded-full transition-all transform hover:-translate-y-0.5"
                            style={{ color: colors.textSecondary }}
                            aria-label="notifications"
                        >
                            {/* Div untuk BG dan Shadow Bulat */}
                            <div 
                                className="absolute inset-0 rounded-full group-hover:shadow-md transition-all duration-200"
                                style={{ backgroundColor: colors.bgSecondary }}
                            ></div>
                            
                            {/* Ikon (di atas div shadow) */}
                            <Bell className="w-5 h-5 relative z-10" />
                            
                            {hasUnreadNotifs && (
                                <span
                                    className="absolute top-1 right-1 w-2 h-2 rounded-full border-2 border-white z-20" // z-20 biar di atas
                                    style={{ backgroundColor: colors.danger }}
                                />
                            )}
                        </button>

                        {/* profile */}
                        <button onClick={handleProfileClick} className="relative cursor-pointer rounded-full transition-all hover:opacity-80 group transform hover:-translate-y-0.5" 
                        aria-label="profile">
                            {/* Shadow Div (Sibling 1) */}
                            <div className="absolute inset-0 rounded-full group-hover:shadow-md transition-shadow duration-200"></div>
                            
                            {/* Image (Sibling 2, on top) */}
                            <img
                                src={profilePicUrl}
                                alt="User Profile"
                                className="w-10 h-10 rounded-full border-2 shadow-sm object-cover relative z-10"
                                style={{ borderColor: colors.textPrimary }}
                            />
                        </button>

                        {/* logout - visible on md+ (desktop) (INI UDAH BENER) */}
                        <button
                            onClick={handleLogout}
                            className="hidden md:flex items-center gap-2 px-4 py-2 font-semibold rounded-lg border border-red-600 text-red-600 transition-all hover:bg-red-600 hover:text-white
                            transform hover:shadow-md hover:-translate-y-0.5"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="text-sm">Logout</span>
                        </button>

                        {/* mobile menu toggle */}
                        <button
                            onClick={() => setIsMenuOpen((s) => !s)}
                            className="lg:hidden p-2 rounded-lg transition-colors"
                            style={{ color: colors.textSecondary, backgroundColor: colors.bgSecondary }}
                            aria-label="menu"
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* mobile dropdown - logout moved here for mobile only */}
            {isMenuOpen && (
                <nav className="lg:hidden mt-2 py-4 px-4 space-y-1 bg-white shadow-lg rounded-xl ring-1 ring-black/5" style={{ border: `1px solid #e2e8f0` }}>
                    {userRole === 'admin' && (
                         <Link
                            href="/admin/dashboard"
                            onClick={() => setIsMenuOpen(false)}
                            className={`block px-4 py-3 rounded-lg font-medium transition-all ${adminLinkClassName("/admin")}`}
                        >
                            <ShieldCheck className="w-4 h-4 inline-block mr-2" />
                            Admin Panel
                        </Link>
                    )}
                    {baseNavLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setIsMenuOpen(false)}
                            className={`block px-4 py-3 rounded-lg font-medium transition-all ${isActive(link.href) ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50"}`}
                        >
                            {link.label}
                        </Link>
                    ))}

                    {/* logout - mobile only */}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 mt-2 font-semibold rounded-lg border border-red-600 text-red-600 transition-all hover:bg-red-600 hover:text-white sm:hidden"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </nav>
            )}
        </header>
    );
}