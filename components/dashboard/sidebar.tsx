"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/use-auth";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
    Home,
    MapPin,
    Mail,
    Settings,
    LogOut,
    Sparkles,
} from "lucide-react";

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/dashboard/scraper", label: "Google Maps Scraper", icon: MapPin },
    { href: "/dashboard/campaigns", label: "Email Campaigns", icon: Mail },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { logout, getUserEmail } = useAuth();

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    const userEmail = getUserEmail();
    const userInitial = userEmail ? userEmail[0].toUpperCase() : "U";

    return (
        <>
            {/* Mobile Overlay */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isOpen ? 1 : 0 }}
                transition={{ duration: 0.2 }}
                className={cn(
                    "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden",
                    isOpen ? "block" : "hidden"
                )}
                onClick={onClose}
            />

            <aside className={cn(
                "fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-[#2a2a3a] bg-[#0a0a0f] transition-transform lg:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Logo */}
                <div className="flex h-16 shrink-0 items-center border-b border-[#2a2a3a] px-6">
                    <Link href="/dashboard" className="flex items-center gap-2 group">
                        <motion.span
                            className="text-xl font-bold text-white"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                        >
                            Lumflow{" "}
                            <span className="bg-gradient-to-r from-[#8b5cf6] to-[#3B82F6] bg-clip-text text-transparent inline-block group-hover:animate-pulse">AI</span>
                        </motion.span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-4">
                    <ul className="space-y-1">
                        {navItems.map((item, index) => {
                            const isActive =
                                pathname === item.href ||
                                (item.href !== "/dashboard" && pathname?.startsWith(item.href));
                            const Icon = item.icon;

                            return (
                                <motion.li
                                    key={item.href}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05, duration: 0.3 }}
                                >
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200",
                                            "hover:scale-[1.02]",
                                            isActive
                                                ? "bg-[#8b5cf6] text-white shadow-lg shadow-purple-500/20"
                                                : "text-slate-400 hover:bg-white/5 hover:text-white"
                                        )}
                                    >
                                        {/* Active Indicator */}
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeNav"
                                                className="absolute inset-0 rounded-lg bg-[#8b5cf6]"
                                                transition={{ duration: 0.3 }}
                                            />
                                        )}

                                        <Icon
                                            className={cn(
                                                "h-5 w-5 transition-all duration-200 relative z-10",
                                                "group-hover:scale-110",
                                                isActive ? "text-white" : "text-slate-500 group-hover:text-white"
                                            )}
                                        />
                                        <span className="text-sm font-medium relative z-10">{item.label}</span>
                                    </Link>
                                </motion.li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Bottom Section */}
                <div className="mt-auto border-t border-[#2a2a3a] bg-[#0a0a0f] p-4">
                    {/* Upgrade Banner */}
                    <motion.div
                        className="mb-4 rounded-xl bg-gradient-to-br from-[#8b5cf6]/10 to-blue-500/10 p-4 border border-[#8b5cf6]/20 hover:border-[#8b5cf6]/40 transition-colors duration-200"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-[#8b5cf6] animate-pulse" />
                            <span className="text-xs font-semibold text-white">
                                Pro Plan
                            </span>
                        </div>
                        <div className="mt-2 text-xs text-slate-400">
                            Credits: <span className="text-white font-medium">8,420</span> / 10,000
                        </div>
                        <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                            <motion.div
                                className="h-full rounded-full bg-gradient-to-r from-[#8b5cf6] to-blue-500"
                                initial={{ width: 0 }}
                                animate={{ width: "84%" }}
                                transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                            />
                        </div>
                    </motion.div>

                    {/* Theme Toggle */}
                    <div className="flex items-center justify-center mb-4">
                        <ThemeToggle />
                    </div>

                    {/* User Profile */}
                    <motion.div
                        className="flex items-center gap-3 rounded-lg bg-[#1a1a24] p-3 border border-[#2a2a3a] hover:border-[#8b5cf6]/20 transition-colors duration-200"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                    >
                        <motion.div
                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#8b5cf6] to-blue-600 text-sm font-bold text-white shadow-inner"
                            whileHover={{ rotate: 5 }}
                            transition={{ duration: 0.2 }}
                        >
                            {userInitial}
                        </motion.div>
                        <div className="flex-1 overflow-hidden">
                            <p className="truncate text-sm font-medium text-white">
                                {userEmail?.split('@')[0]}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                                {userEmail}
                            </p>
                        </div>
                        <motion.button
                            onClick={handleLogout}
                            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-red-400"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <LogOut className="h-4 w-4" />
                        </motion.button>
                    </motion.div>
                </div>
            </aside>
        </>
    );
}
