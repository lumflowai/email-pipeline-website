"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { TextScramble } from "@/components/ui/text-scramble";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { AuroraBackground } from "@/components/ui/aurora-background";
import Link from "next/link";

export function Hero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"],
    });

    const mockupY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
    const mockupScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1]);
    const mockupOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

    return (
        <AuroraBackground>
            <div
                ref={containerRef}
                className="relative flex min-h-screen flex-col items-center justify-center px-4 pt-20"
            >
                {/* Hero Content */}
                <div className="relative z-10 mx-auto max-w-5xl text-center">
                    {/* Headline */}
                    <motion.h1
                        className="mb-6 text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <TextScramble
                            text="Find Your Next 10,000 Customers"
                            delay={200}
                        />
                        <br />
                        <span className="gradient-text">
                            <TextScramble
                                text="While You Sleep"
                                delay={800}
                            />
                        </span>
                    </motion.h1>

                    {/* Subheadline */}
                    <motion.p
                        className="mx-auto mb-10 max-w-3xl text-lg text-slate-400 sm:text-xl md:text-2xl"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 1.2 }}
                    >
                        AI-powered lead scraping, email outreach, and voice calling —
                        <br className="hidden sm:block" />
                        all automated, all in one platform
                    </motion.p>

                    {/* CTA Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 1.5 }}
                    >
                        <Link href="/signup">
                            <MagneticButton className="text-lg px-10 py-5">
                                Start Free Trial
                            </MagneticButton>
                        </Link>
                    </motion.div>
                </div>

                {/* Dashboard Mockup */}
                <motion.div
                    className="relative mt-16 w-full max-w-5xl px-4"
                    style={{
                        y: mockupY,
                        scale: mockupScale,
                        opacity: mockupOpacity,
                    }}
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.8 }}
                >
                    <div className="glass-card relative overflow-hidden rounded-2xl p-2">
                        {/* Glow Effect */}
                        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-cyan-500/20 blur-xl" />

                        {/* Mockup Content */}
                        <div className="relative rounded-xl bg-slate-900/90 p-6">
                            {/* Top Bar */}
                            <div className="mb-6 flex items-center gap-3">
                                <div className="flex gap-2">
                                    <div className="h-3 w-3 rounded-full bg-red-500/80" />
                                    <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                                    <div className="h-3 w-3 rounded-full bg-green-500/80" />
                                </div>
                                <div className="flex-1 rounded-lg bg-slate-800/50 px-4 py-1.5 text-center text-sm text-slate-500">
                                    dashboard.lumflow.ai
                                </div>
                            </div>

                            {/* Dashboard Preview */}
                            <div className="grid gap-4 md:grid-cols-3">
                                {/* Stats Cards */}
                                <div className="rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 p-4">
                                    <p className="text-sm text-slate-400">Leads Scraped</p>
                                    <p className="mt-1 text-2xl font-bold text-white">12,847</p>
                                    <p className="mt-1 text-xs text-green-400">+23% this week</p>
                                </div>
                                <div className="rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 p-4">
                                    <p className="text-sm text-slate-400">Emails Sent</p>
                                    <p className="mt-1 text-2xl font-bold text-white">8,234</p>
                                    <p className="mt-1 text-xs text-green-400">92% delivered</p>
                                </div>
                                <div className="rounded-xl bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 p-4">
                                    <p className="text-sm text-slate-400">AI Calls Made</p>
                                    <p className="mt-1 text-2xl font-bold text-white">1,429</p>
                                    <p className="mt-1 text-xs text-green-400">68% answered</p>
                                </div>
                            </div>

                            {/* Chart Area */}
                            <div className="mt-4 rounded-xl bg-slate-800/30 p-4">
                                <div className="mb-3 flex items-center justify-between">
                                    <p className="text-sm font-medium text-white">Lead Generation</p>
                                    <p className="text-xs text-slate-500">Last 7 days</p>
                                </div>
                                <div className="flex h-32 items-end gap-2">
                                    {[40, 65, 45, 80, 55, 90, 75].map((height, i) => (
                                        <motion.div
                                            key={i}
                                            className="flex-1 rounded-t-md bg-gradient-to-t from-purple-500/50 to-blue-500/50"
                                            initial={{ height: 0 }}
                                            animate={{ height: `${height}%` }}
                                            transition={{ duration: 0.5, delay: 2 + i * 0.1 }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Floating Shadow */}
                    <div className="absolute -bottom-20 left-1/2 h-40 w-3/4 -translate-x-1/2 rounded-full bg-purple-500/20 blur-3xl" />
                </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                    className="absolute bottom-8 left-1/2 -translate-x-1/2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.5 }}
                >
                    <motion.div
                        className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-white/20 p-1"
                        animate={{ y: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        <motion.div
                            className="h-2 w-1 rounded-full bg-white/50"
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        />
                    </motion.div>
                </motion.div>
            </div>
        </AuroraBackground>
    );
}
