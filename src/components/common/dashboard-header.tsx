"use client";

import Link from "next/link";
import { LogOut, Menu, X, Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { removeAuthToken, getAuthToken } from "@/lib/auth";
import { typography } from "@/styles/typography";
import { colors } from "@/styles/colors"; 

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const DEFAULT_AVATAR = "https://api.dicebear.com/7.x/avataaars/svg?seed=user_default";

export default function DashboardHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const [hasUnreadNotifs, setHasUnreadNotifs] = useState(false);
  const [profilePicUrl, setProfilePicUrl] = useState(DEFAULT_AVATAR);
  
  const handleLogout = () => {
    removeAuthToken();
    localStorage.removeItem('userProfilePicture'); 
    localStorage.removeItem('lastNotifRead'); 
    router.push("/sign-in");
  };
  
  const handleProfileClick = () => {
    router.push("/profile");
  };

  const isActive = (href: string) => {
    const baseHref = href.split("/").slice(0, 2).join("/");
    const basePathname = pathname.split("/").slice(0, 2).join("/");
    return basePathname === baseHref;
  };

  const saveLastReadTimestamp = () => {
    localStorage.setItem('lastNotifRead', String(Date.now()));
    setHasUnreadNotifs(false);
  };

  const handleNotificationClick = () => {
    router.push("/announcements");
    saveLastReadTimestamp();
  };

  useEffect(() => {
    // 1. Ambil foto profil dari localStorage
    const storedPic = localStorage.getItem('userProfilePicture');
    if (storedPic) {
      setProfilePicUrl(storedPic);
    }

    // 2. Cek notifikasi
    const checkNotifications = async () => {
      const token = getAuthToken();
      if (!token || !API_URL) return;
      try {
        const res = await fetch(`${API_URL}/api/announcements`, { 
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error("Failed to fetch announcements");

        const announcements = await res.json();
        
        if (announcements && announcements.length > 0) {
          const latestNotifTimestamp = new Date(announcements[0].createdAt).getTime();
          const lastReadTimestamp = localStorage.getItem('lastNotifRead');
          if (!lastReadTimestamp || latestNotifTimestamp > Number(lastReadTimestamp)) {
             setHasUnreadNotifs(true);
          }
        }
      } catch (error) {
        console.error("Failed to check notifications:", error);
      }
    };

    checkNotifications();

    // Listener buat update foto live
    const handleStorageChange = () => {
        const newPic = localStorage.getItem('userProfilePicture');
        setProfilePicUrl(newPic || DEFAULT_AVATAR);
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };

  }, []);

  const navLinks: { href: string, label: string }[] = [
    { href: "/books", label: "Books" },
    { href: "/rooms", label: "Rooms" },
    { href: "/announcements", label: "Announcements" },
    { href: "/loans", label: "Loans" },
    { href: "/bookings", label: "Bookings" },
  ];

  return (
    <header 
      className="sticky top-0 z-50 bg-white shadow-md"
      style={{ borderBottom: `1px solid #e2e8f0` }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo/Brand */}
          <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
           <img
              src="/logo.png"
              alt="Naratama"
              className="h-12 w-auto"
            />            
          </Link>

          {/* Desktop Menu */}
           <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className={`
                   ${typography.bodySmall} 
                  font-semibold 
                  transition-all 
                  pb-2 
                  border-b-2 
                   text-sm 
                  whitespace-nowrap
                  ${
                    isActive(link.href)
                      ? "font-bold text-cyan-600 border-cyan-600"
                      : "text-slate-600 border-transparent hover:text-cyan-600 hover:border-cyan-400"
                  }
                `}
                style={{
                  borderBottomWidth: "3px", 
                }}
              >
                {link.label}
              </Link>
            ))}
           </div>

          {/* Right Side Icons */}
          <div className="flex items-center gap-4">
            
            {/* Tombol Notifikasi */}
            <button 
              onClick={handleNotificationClick} 
              className="relative p-2 rounded-full transform transition-all hover:bg-slate-200 hover:shadow-md hover:scale-105"
              style={{ 
                 color: colors.textSecondary,
                backgroundColor: colors.bgSecondary
              }}
            >
              <Bell className="w-5 h-5" />
              
              {hasUnreadNotifs && (
                <span 
                  className="absolute top-1 right-1 w-2 h-2 rounded-full border-2 border-white"
                  style={{ backgroundColor: colors.danger }}
                ></span>
              )}
            </button>

            {/* Profile Picture (DINAMIS) */}
            <button
              onClick={handleProfileClick}
               className="cursor-pointer transform transition-all hover:shadow-lg hover:scale-105" 
            >
              <img
                src={profilePicUrl} 
                alt="User Profile"
                className="w-10 h-10 rounded-full border-2 shadow-sm object-cover"
                 style={{ borderColor: colors.info }}
              />
            </button>

            {/* Logout Button (Desktop) */}
            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-white font-semibold rounded-lg transform transition-all hover:bg-red-700 hover:shadow-md hover:scale-105"
               style={{ backgroundColor: colors.danger }}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>

            {/* Mobile Menu Button */}
            <button
               onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg transition-colors"
              style={{ 
                color: colors.textSecondary,
                backgroundColor: colors.bgSecondary
              }}
             >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

         {/* Mobile Menu (Dropdown) */}
        {isMenuOpen && (
          <div 
            className="lg:hidden border-t py-4 space-y-2"
            style={{ borderTopColor: "#e2e8f0" }}
          >
            {navLinks.map((link) => (
              <Link 
                 key={link.href}
                href={link.href} 
                onClick={() => setIsMenuOpen(false)} 
                className={`block px-4 py-2 rounded-lg transition-all ${ isActive(link.href) ? "font-bold" : "" }`}
                style={{
                  color: isActive(link.href) ? colors.info : colors.textPrimary,
                   backgroundColor: isActive(link.href) ? colors.bgTertiary : colors.bgSecondary,
                }}
              >
                {link.label}
              </Link>
            ))}
            {/* Tombol Logout untuk Mobile */}
             <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 mt-4 text-white font-semibold rounded-lg transition-all hover:bg-red-700 flex items-center gap-2"
              style={{ backgroundColor: colors.danger }}
            >
              <LogOut className="w-4 h-4" />
               Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}