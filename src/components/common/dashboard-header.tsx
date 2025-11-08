"use client";

import Link from "next/link";
import { LogOut, Menu, X, Bell } from "lucide-react";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { removeAuthToken } from "@/lib/auth";
import { typography } from "@/styles/typography";
import { colors } from "@/styles/colors";

export default function DashboardHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const userProfilePicture = "https://api.dicebear.com/7.x/avataaars/svg?seed=john";
  const username = "john_doe";

  const handleLogout = () => {
    removeAuthToken();
    router.push("/login");
  };

  const handleProfileClick = () => {
    router.push("/profile");
  };

  // Helper function untuk check apakah link aktif
  const isActive = (href: string) => {
    return pathname.startsWith(href);
  };

  const navLinks = [
    { href: "/books", label: "Books" },
    { href: "/rooms", label: "Rooms" },
    { href: "/announcements", label: "Announcements" },
  ];

  return (
    <header 
      className="sticky top-0 z-50 bg-white shadow-sm"
      style={{ borderBottom: `1px solid #e2e8f0` }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img
              src="/logo.png"
              alt="Naratama"
              className="h-12 w-auto"
            />            
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className={`${typography.body} transition-all pb-2 border-b-2 ${
                  isActive(link.href)
                    ? "font-bold"
                    : "hover:font-semibold"
                }`}
                style={{
                  color: isActive(link.href) ? colors.info : colors.textSecondary,
                  borderBottomColor: isActive(link.href) ? colors.info : "transparent",
                  borderBottomWidth: "2px",
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button 
              className="relative p-2 rounded-lg transition-colors hover:opacity-80"
              style={{ 
                color: colors.textSecondary,
                backgroundColor: colors.bgSecondary
              }}
            >
              <Bell className="w-6 h-6" />
              <span 
                className="absolute top-1 right-1 w-2 h-2 rounded-full"
                style={{ backgroundColor: colors.danger }}
              ></span>
            </button>

            {/* Profile Picture */}
            <button
              onClick={handleProfileClick}
              className="cursor-pointer hover:opacity-80 transition-opacity"
            >
              <img
                src={userProfilePicture}
                alt={username}
                className="w-10 h-10 rounded-full border-2"
                style={{ borderColor: colors.info }}
              />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg transition-colors"
              style={{ 
                color: colors.textSecondary,
                backgroundColor: colors.bgSecondary
              }}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-white font-semibold rounded-lg transition-all hover:opacity-90"
              style={{ backgroundColor: colors.danger }}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div 
            className="md:hidden border-t py-4 space-y-2"
            style={{ borderTopColor: "#e2e8f0" }}
          >
            {navLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className={`block px-4 py-2 rounded-lg transition-all ${
                  isActive(link.href)
                    ? "font-bold"
                    : ""
                }`}
                style={{
                  color: isActive(link.href) ? colors.info : colors.textSecondary,
                  backgroundColor: isActive(link.href) ? colors.bgTertiary : colors.bgSecondary,
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}