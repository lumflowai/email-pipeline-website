"use client";

import { Sidebar } from "@/components/dashboard/sidebar";
import { ToastProvider } from "@/components/ui/toast";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ToastProvider>
            <div className="min-h-screen bg-[#0A0F1E]">
                <Sidebar />
                <main className="ml-64 min-h-screen">
                    <div className="p-8">{children}</div>
                </main>
            </div>
        </ToastProvider>
    );
}
