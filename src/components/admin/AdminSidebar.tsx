"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Users, 
  Book, 
  LayoutDashboard, 
  ArrowLeft,
  DoorOpen,   
  Box,          
  Hourglass     
} from "lucide-react";

const adminNavs = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Manage Users", icon: Users },
  { href: "/admin/books", label: "Manage Books", icon: Book },
  { href: "/admin/rooms", label: "Manage Rooms", icon: DoorOpen },
  { href: "/admin/bookings", label: "Manage Bookings", icon: Hourglass },
  { href: "/admin/loans", label: "Manage Loans", icon: Box },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <div className="w-20 hover:w-64 h-screen flex flex-col p-4 bg-slate-900 
                    transition-all duration-300 ease-in-out group 
                    overflow-y-auto overflow-x-hidden flex-shrink-0">
      
      <h2 className="text-2xl font-bold text-white mb-10 flex items-center gap-3
                     justify-center group-hover:justify-start">
        <LayoutDashboard className="w-6 h-6 flex-shrink-0" />
        <span className="hidden group-hover:inline whitespace-nowrap">Admin Panel</span>
      </h2>
      
      <nav className="flex flex-col gap-2">
        {adminNavs.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors 
                        justify-center group-hover:justify-start
                        ${
                          isActive(link.href)
                            ? "bg-white/20 text-white" 
                            : "text-slate-400 hover:bg-white/10 hover:text-white"
                        }`}
          >
            <link.icon className="w-5 h-5 flex-shrink-0" />
            <span className="hidden group-hover:inline whitespace-nowrap">{link.label}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto"> 
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 
                     hover:bg-white/10 hover:text-white transition-colors
                     justify-center group-hover:justify-start"
        >
          <ArrowLeft className="w-5 h-5 flex-shrink-0" />
          <span className="hidden group-hover:inline whitespace-nowrap">Keluar Panel Admin</span>
        </Link>
      </div>
    </div>
  );
}