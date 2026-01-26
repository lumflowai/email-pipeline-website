"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    Star,
    Battery,
    Phone,
    MapPin,
    Mail,
    PhoneCall,
    ArrowRight,
    Check,
    Clock,
    Loader2,
} from "lucide-react";

const recentActivity = [
    {
        service: "Google Maps Scraper",
        status: "completed",
        result: "1,200 leads",
        date: "Jan 20, 2025",
    },
    {
        service: "Google Maps Scraper",
        status: "running",
        result: "45%",
        date: "Jan 25, 2025",
    },
    {
        service: "Email Campaign",
        status: "completed",
        result: "500 emails",
        date: "Jan 18, 2025",
    },
];

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                <p className="mt-1 text-slate-400">
                    Welcome back! Here&apos;s an overview of your account.
                </p>
            </div>

            {/* Overview Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                {/* Current Plan */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <SpotlightCard className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/10">
                                <Star className="h-6 w-6 text-purple-400" />
                            </div>
                            <Link href="/dashboard/billing">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs text-slate-400 hover:text-white"
                                >
                                    Upgrade Plan
                                </Button>
                            </Link>
                        </div>
                        <h3 className="mt-4 text-2xl font-bold text-white">Pro Plan</h3>
                        <p className="mt-1 text-sm text-slate-400">
                            $349/month • Renews Feb 25, 2026
                        </p>
                    </SpotlightCard>
                </motion.div>

                {/* Credits Remaining */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <SpotlightCard className="p-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/10">
                            <Battery className="h-6 w-6 text-blue-400" />
                        </div>
                        <h3 className="mt-4 text-2xl font-bold text-white">
                            7,500{" "}
                            <span className="text-base font-normal text-slate-500">
                                / 10,000
                            </span>
                        </h3>
                        <p className="mt-1 text-sm text-slate-400">Leads used this month</p>
                        <div className="mt-4">
                            <Progress value={75} className="h-2 bg-slate-800" />
                        </div>
                        <p className="mt-2 text-xs text-slate-500">2,500 leads remaining</p>
                    </SpotlightCard>
                </motion.div>

                {/* AI Calls */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <SpotlightCard className="p-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-500/10">
                            <Phone className="h-6 w-6 text-cyan-400" />
                        </div>
                        <h3 className="mt-4 text-2xl font-bold text-white">
                            320{" "}
                            <span className="text-base font-normal text-slate-500">
                                / 500
                            </span>
                        </h3>
                        <p className="mt-1 text-sm text-slate-400">AI calls used</p>
                        <div className="mt-4">
                            <Progress value={64} className="h-2 bg-slate-800" />
                        </div>
                        <p className="mt-2 text-xs text-slate-500">180 calls remaining</p>
                    </SpotlightCard>
                </motion.div>
            </div>

            {/* Recent Activity */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <div className="glass-card rounded-2xl p-6">
                    <h2 className="mb-6 text-xl font-semibold text-white">
                        Recent Activity
                    </h2>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/5 text-left">
                                    <th className="pb-4 text-sm font-medium text-slate-400">
                                        Service
                                    </th>
                                    <th className="pb-4 text-sm font-medium text-slate-400">
                                        Status
                                    </th>
                                    <th className="pb-4 text-sm font-medium text-slate-400">
                                        Results
                                    </th>
                                    <th className="pb-4 text-sm font-medium text-slate-400">
                                        Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {recentActivity.map((activity, index) => (
                                    <tr key={index}>
                                        <td className="py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800/50">
                                                    {activity.service.includes("Scraper") ? (
                                                        <MapPin className="h-4 w-4 text-purple-400" />
                                                    ) : (
                                                        <Mail className="h-4 w-4 text-blue-400" />
                                                    )}
                                                </div>
                                                <span className="text-sm text-white">
                                                    {activity.service}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${activity.status === "completed"
                                                    ? "bg-green-500/10 text-green-400"
                                                    : "bg-yellow-500/10 text-yellow-400"
                                                    }`}
                                            >
                                                {activity.status === "completed" ? (
                                                    <Check className="h-3 w-3" />
                                                ) : (
                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                )}
                                                {activity.status === "completed"
                                                    ? "Completed"
                                                    : `Running (${activity.result})`}
                                            </span>
                                        </td>
                                        <td className="py-4 text-sm text-slate-300">
                                            {activity.status === "completed" ? activity.result : "—"}
                                        </td>
                                        <td className="py-4 text-sm text-slate-500">
                                            {activity.date}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <h2 className="mb-4 text-xl font-semibold text-white">Quick Actions</h2>
                <div className="grid gap-4 md:grid-cols-3">
                    {/* Start Scraper */}
                    <Link href="/dashboard/scraper">
                        <Button className="h-auto w-full flex-col items-start gap-3 gradient-primary p-6 text-left hover:scale-[1.02] transition-transform">
                            <MapPin className="h-6 w-6" />
                            <div>
                                <p className="font-semibold">Start Google Maps Scraper</p>
                                <p className="text-sm text-white/70">
                                    Find leads from any location
                                </p>
                            </div>
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>

                    {/* Email Campaign */}
                    <Link href="/dashboard/email">
                        <Button className="h-auto w-full flex-col items-start gap-3 bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-left hover:scale-[1.02] transition-transform">
                            <Mail className="h-6 w-6" />
                            <div>
                                <p className="font-semibold">Launch Email Campaign</p>
                                <p className="text-sm text-white/70">
                                    Send personalized cold emails
                                </p>
                            </div>
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>

                    {/* AI Calls */}
                    <Link href="/dashboard/calling">
                        <Button className="h-auto w-full flex-col items-start gap-3 bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-left hover:scale-[1.02] transition-transform">
                            <PhoneCall className="h-6 w-6" />
                            <div>
                                <p className="font-semibold">Schedule AI Calls</p>
                                <p className="text-sm text-white/70">
                                    AI-powered voice calling
                                </p>
                            </div>
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
