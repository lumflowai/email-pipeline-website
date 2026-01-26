"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { MaskTextReveal } from "@/components/ui/mask-text-reveal";
import { Search, Mail, Phone, Sparkles, MapPin, MessageSquare } from "lucide-react";

const steps = [
    {
        title: "Scrape Leads",
        description:
            "Search Google Maps for your ideal clients. Get emails, phones, and contact info instantly.",
        icon: <Search className="h-8 w-8 text-purple-400" />,
        secondaryIcon: <MapPin className="h-5 w-5 text-blue-400" />,
        preview: (
            <div className="rounded-lg bg-slate-800/50 p-3">
                <div className="mb-2 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-400" />
                    <span className="text-xs text-slate-400">Scraping NYC restaurants...</span>
                </div>
                <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-slate-500">
                        <span>Found:</span>
                        <span className="text-white">1,247 leads</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                        <span>With email:</span>
                        <span className="text-green-400">892</span>
                    </div>
                </div>
            </div>
        ),
    },
    {
        title: "Automate Outreach",
        description:
            "Send personalized cold emails at scale. Our AI writes, sends, and tracks replies.",
        icon: <Mail className="h-8 w-8 text-blue-400" />,
        secondaryIcon: <Sparkles className="h-5 w-5 text-purple-400" />,
        preview: (
            <div className="rounded-lg bg-slate-800/50 p-3">
                <div className="mb-2 text-xs text-slate-400">Campaign: Restaurant Outreach</div>
                <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-slate-500">
                        <span>Sent:</span>
                        <span className="text-white">500</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                        <span>Opened:</span>
                        <span className="text-blue-400">234 (47%)</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                        <span>Replied:</span>
                        <span className="text-green-400">42 (8%)</span>
                    </div>
                </div>
            </div>
        ),
    },
    {
        title: "AI Calls Them",
        description:
            "Let AI make the first call. Qualify leads, book meetings, and hand off to you.",
        icon: <Phone className="h-8 w-8 text-cyan-400" />,
        secondaryIcon: <MessageSquare className="h-5 w-5 text-green-400" />,
        preview: (
            <div className="rounded-lg bg-slate-800/50 p-3">
                <div className="mb-2 text-xs text-slate-400">Today&apos;s calls</div>
                <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-slate-500">
                        <span>Completed:</span>
                        <span className="text-white">127</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                        <span>Interested:</span>
                        <span className="text-cyan-400">34</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                        <span>Meetings booked:</span>
                        <span className="text-green-400">12</span>
                    </div>
                </div>
            </div>
        ),
    },
];

export function HowItWorks() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"],
    });

    return (
        <section
            id="how-it-works"
            ref={containerRef}
            className="relative bg-[#0A0F1E] py-32"
        >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent" />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-20 text-center">
                    <MaskTextReveal>
                        <h2 className="text-4xl font-bold text-white sm:text-5xl">
                            How Lumflow Works
                        </h2>
                    </MaskTextReveal>
                    <motion.p
                        className="mx-auto mt-4 max-w-2xl text-lg text-slate-400"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                    >
                        Three simple steps to transform your lead generation
                    </motion.p>
                </div>

                {/* Steps */}
                <div className="relative">
                    {/* Connection Line */}
                    <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-purple-500/50 via-blue-500/50 to-cyan-500/50 lg:block" />

                    <div className="space-y-24 lg:space-y-32">
                        {steps.map((step, index) => (
                            <StepCard
                                key={index}
                                step={step}
                                index={index}
                                progress={scrollYProgress}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

interface StepCardProps {
    step: (typeof steps)[0];
    index: number;
    progress: ReturnType<typeof useScroll>["scrollYProgress"];
}

function StepCard({ step, index }: StepCardProps) {
    const isEven = index % 2 === 0;

    return (
        <motion.div
            className={`relative flex flex-col items-center gap-8 lg:flex-row ${isEven ? "lg:flex-row" : "lg:flex-row-reverse"
                }`}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
        >
            {/* Step Number (Center on desktop) */}
            <div className="absolute left-1/2 top-0 z-10 hidden h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-xl font-bold text-white shadow-lg shadow-purple-500/25 lg:flex">
                {index + 1}
            </div>

            {/* Card */}
            <div className="w-full lg:w-1/2">
                <motion.div
                    className="glass-card rounded-2xl p-8"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                >
                    {/* Mobile Step Number */}
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-lg font-bold text-white lg:hidden">
                        {index + 1}
                    </div>

                    {/* Icon */}
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                            {step.icon}
                        </div>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800/50">
                            {step.secondaryIcon}
                        </div>
                    </div>

                    {/* Content */}
                    <h3 className="mb-3 text-2xl font-bold text-white">{step.title}</h3>
                    <p className="mb-6 text-slate-400">{step.description}</p>

                    {/* Preview */}
                    {step.preview}
                </motion.div>
            </div>

            {/* Spacer for alternating layout */}
            <div className="hidden w-1/2 lg:block" />
        </motion.div>
    );
}
