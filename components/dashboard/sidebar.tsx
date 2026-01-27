"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/use-auth";
import {
    Home,
    MapPin,
    Mail,
    CreditCard,
    Settings,
    LogOut,
    Sparkles,
} from "lucide-react";

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/dashboard/scraper", label: "Google Maps Scraper", icon: MapPin },
    { href: "/dashboard/email", label: "Email Campaigns", icon: Mail },
    { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
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
        <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-white/5 bg-[#0A0F1E]">
            {/* Logo */}
            <div className="flex h-16 items-center border-b border-white/5 px-6">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <span className="text-xl font-bold text-white">
                        Lumflow{" "}
                        <span className="gradient-text-glow">AI</span>
                    </span>
                </Link>
            </div>

            {/* User Profile */}
            <div className="border-b border-white/5 p-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-sm font-semibold text-white">
                        {userInitial}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="truncate text-sm font-medium text-white">
                            {userEmail}
                        </p>
                        <p className="text-xs text-slate-500">Pro Plan</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4">
                <ul className="space-y-1">
                    {navItems.map((item) => {
                        const isActive =
                            pathname === item.href ||
                            (item.href !== "/dashboard" && pathname?.startsWith(item.href));
                        const Icon = item.icon;

                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "relative flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all",
                                        isActive
                                            ? "bg-purple-500/10 text-white"
                                            : "text-slate-400 hover:bg-white/5 hover:text-white"
                                    )}
                                >
                                    {isActive && (
                                        <motion.div
                                            className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-purple-500 to-blue-500"
                                            layoutId="activeTab"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                    <Icon
                                        className={cn(
                                            "h-5 w-5",
                                            isActive ? "text-purple-400" : "text-slate-500"
                                        )}
                                    />
                                    <span className="text-sm">{item.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Upgrade Banner */}
            <div className="mx-4 mb-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 p-4">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-400" />
                    <span className="text-sm font-medium text-white">
                        Upgrade to Enterprise
                    </span>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                    50,000 leads/month, unlimited everything
                </p>
                <Link
                    href="/dashboard/billing"
                    className="mt-3 block rounded-lg bg-white/10 py-2 text-center text-xs font-medium text-white transition-colors hover:bg-white/20"
                >
                    View Plans
                </Link>
            </div>

            {/* Logout */}
            <div className="border-t border-white/5 p-4">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
                >
                    <LogOut className="h-5 w-5" />
                    <span className="text-sm">Logout</span>
                </button>
            </div>
        </aside>
    );
}
