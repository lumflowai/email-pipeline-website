"use client";

import { Sidebar } from "@/components/dashboard/sidebar";
import { ToastProvider } from "@/components/ui/toast";
import { Menu } from "lucide-react";
import { useState } from "react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <ToastProvider>
            <div className="min-h-screen bg-[#0a0a0f]">
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

                <main className="lg:pl-64 min-h-screen transition-all duration-300">
                    {/* Top Bar */}
                    <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#2a2a3a] bg-[#0a0a0f]/80 px-4 backdrop-blur-md lg:px-8">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="rounded-lg p-2 text-slate-400 hover:bg-white/5 lg:hidden"
                            >
                                <Menu className="h-6 w-6" />
                            </button>
                            <div>
                                <h1 className="text-lg font-semibold text-white">Dashboard</h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="hidden items-center gap-2 rounded-full bg-[#8b5cf6]/10 px-3 py-1.5 md:flex border border-[#8b5cf6]/20">
                                <div className="h-2 w-2 rounded-full bg-[#8b5cf6] animate-pulse" />
                                <span className="text-xs font-medium text-[#8b5cf6]">
                                    8,420 / 10,000 Credits
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 lg:p-8">
                        {children}
                    </div>
                </main>
            </div>
        </ToastProvider>
    );
}
