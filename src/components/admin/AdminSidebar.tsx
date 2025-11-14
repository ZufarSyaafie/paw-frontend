// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { 
//   Users, 
//   Book, 
//   LayoutDashboard, 
//   ArrowLeft,
//   DoorOpen,   
//   Box,          
//   Hourglass     
// } from "lucide-react";

// const adminNavs = [
//   { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
//   { href: "/admin/users", label: "Manage Users", icon: Users },
//   { href: "/admin/books", label: "Manage Books", icon: Book },
//   { href: "/admin/rooms", label: "Manage Rooms", icon: DoorOpen },
//   { href: "/admin/bookings", label: "Manage Bookings", icon: Hourglass },
//   { href: "/admin/loans", label: "Manage Loans", icon: Box },
// ];

// export default function AdminSidebar() {
//   const pathname = usePathname();
//   const isActive = (href: string) => pathname.startsWith(href);

//   return (
//     <div className="w-20 hover:w-64 h-screen flex flex-col p-4 bg-slate-900 
//                     transition-all duration-300 ease-in-out group 
//                     overflow-y-auto overflow-x-hidden flex-shrink-0">
      
//       <h2 className="text-2xl font-bold text-white mb-10 flex items-center gap-3
//                      justify-center group-hover:justify-start">
//         <LayoutDashboard className="w-6 h-6 flex-shrink-0" />
//         <span className="hidden group-hover:inline whitespace-nowrap">Admin Panel</span>
//       </h2>
      
//       <nav className="flex flex-col gap-2">
//         {adminNavs.map((link) => (
//           <Link
//             key={link.href}
//             href={link.href}
//             className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors 
//                         justify-center group-hover:justify-start
//                         ${
//                           isActive(link.href)
//                             ? "bg-white/20 text-white" 
//                             : "text-slate-400 hover:bg-white/10 hover:text-white"
//                         }`}
//           >
//             <link.icon className="w-5 h-5 flex-shrink-0" />
//             <span className="hidden group-hover:inline whitespace-nowrap">{link.label}</span>
//           </Link>
//         ))}
//       </nav>

//       <div className="mt-auto"> 
//         <Link
//           href="/dashboard"
//           className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 
//                      hover:bg-white/10 hover:text-white transition-colors
//                      justify-center group-hover:justify-start"
//         >
//           <ArrowLeft className="w-5 h-5 flex-shrink-0" />
//           <span className="hidden group-hover:inline whitespace-nowrap">Keluar Panel Admin</span>
//         </Link>
//       </div>
//     </div>
//   );
// }

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Users, Book, ArrowLeft, DoorOpen, Box, Hourglass,
    LucideIcon, Menu, X, UserCog,
    LayoutDashboardIcon
} from "lucide-react";

interface LinkType { href: string; label: string; icon: LucideIcon }
const adminNavs: LinkType[] = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
    { href: "/admin/users", label: "Manage Users", icon: Users },
    { href: "/admin/books", label: "Manage Books", icon: Book },
    { href: "/admin/rooms", label: "Manage Rooms", icon: DoorOpen },
    { href: "/admin/bookings", label: "Manage Bookings", icon: Hourglass },
    { href: "/admin/loans", label: "Manage Loans", icon: Box },
];

interface NavItemProps { link: LinkType; isActive: (href: string) => boolean }
function NavItem({ link, isActive }: NavItemProps) {
    const Icon = link.icon;
    return (
        <Link
            href={link.href}
            title={link.label}
            className={`flex items-center gap-3 p-3 rounded-xl font-medium transition-colors hover:shadow-md ${
                isActive(link.href) ? "bg-black/40 text-white shadow-lg" : "text-black/60 hover:bg-black/10 hover:text-black"
            }`}
        >
            <Icon className="w-6 h-6 flex-shrink-0" />
            <span className="whitespace-nowrap">{link.label}</span>
        </Link>
    );
}

export default function AdminSidebar() {
    const pathname = usePathname();
    const isActive = useCallback((href: string) => pathname.startsWith(href), [pathname]);
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ x: 20, y: 20 });
    const [isDragging, setIsDragging] = useState(false);

    return (
        <AnimatePresence>
            <motion.div
                drag
                dragMomentum={false}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={() => setTimeout(() => setIsDragging(false), 50)}
                onDrag={(_, info) => setPosition({ x: info.point.x, y: info.point.y })}
                style={{ x: position.x, y: position.y }}
                className="fixed z-50"
            >
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        onClick={() => { if (!isDragging) setIsOpen(true) }}
                        className="w-14 h-14 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white shadow-lg"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Menu className="w-6 h-6 text-black/70" />
                    </motion.button>
                )}

                {isOpen && (
                    <motion.div
                        initial={{ x: -200, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -200, opacity: 0 }}
                        className="w-64 h-[65vh] flex flex-col p-4 bg-white/20 backdrop-blur-md border border-black/30 rounded-2xl shadow-2xl overflow-y-auto"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <UserCog className="w-8 h-8 text-black" />
                                <span className="text-xl font-bold text-black/70">Admin</span>
                            </div>
                            <button onClick={() => setIsOpen(false)}>
                                <X className="w-6 h-6 text-black/70" />
                            </button>
                        </div>

                        <nav className="flex flex-col gap-2">
                            {adminNavs.map((link) => (
                                <NavItem key={link.href} link={link} isActive={isActive} />
                            ))}
                        </nav>

                        <div className="mt-auto">
                            <Link
                                href="/dashboard"
                                className="flex items-center gap-3 p-3 bg-white text-black/300 shadow-lg rounded-xl text-black hover:bg-red-500/90 hover:text-white transition-colors"
                            >
                                <ArrowLeft className="w-6 h-6" />
                                <span>Keluar Admin</span>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </AnimatePresence>
    );
}
