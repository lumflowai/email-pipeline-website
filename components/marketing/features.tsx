"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MaskTextReveal } from "@/components/ui/mask-text-reveal";
import { cn } from "@/lib/utils";
import {
    MapPin,
    Mail,
    Mic,
    BarChart3,
    Download,
    DollarSign,
    ArrowRight,
} from "lucide-react";

const features = [
    {
        title: "Google Maps Scraper",
        description: "Scrape 10,000+ leads from any city, any niche, in minutes.",
        icon: <MapPin className="h-7 w-7 text-purple-400" />,
        size: "large",
        learnMore: "/dashboard/scraper",
    },
    {
        title: "Cold Email Campaigns",
        description: "Connect your Instantly account. Send emails that actually get replies.",
        icon: <Mail className="h-7 w-7 text-blue-400" />,
        size: "medium",
        learnMore: "#",
    },
    {
        title: "AI Voice Calling",
        description: "AI caller that sounds human. Qualifies leads 24/7.",
        icon: <Mic className="h-7 w-7 text-cyan-400" />,
        size: "medium",
        learnMore: "#",
    },
    {
        title: "Real-Time Progress",
        description: "Watch your campaigns run live. No more guessing.",
        icon: <BarChart3 className="h-6 w-6 text-green-400" />,
        size: "small",
        learnMore: "#",
    },
    {
        title: "Export & Integrations",
        description: "Export to CSV. Sync with your CRM.",
        icon: <Download className="h-6 w-6 text-orange-400" />,
        size: "small",
        learnMore: "#",
    },
    {
        title: "Usage-Based Pricing",
        description: "Only pay for what you use. No hidden fees.",
        icon: <DollarSign className="h-7 w-7 text-emerald-400" />,
        size: "medium",
        learnMore: "#pricing",
    },
];

interface FeatureCardProps {
    feature: (typeof features)[0];
    className?: string;
    children?: React.ReactNode;
}

function FeatureCard({ feature, className, children }: FeatureCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    return (
        <motion.div
            className={cn(
                "group relative overflow-hidden rounded-2xl glass-card",
                "transition-all duration-300",
                className
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onMouseMove={handleMouseMove}
            whileHover={{ y: -8, scale: 1.01 }}
            transition={{ duration: 0.2 }}
        >
            {/* Spotlight Effect */}
            <div
                className="pointer-events-none absolute -inset-px transition-opacity duration-300"
                style={{
                    opacity: isHovered ? 1 : 0,
                    background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(139, 92, 246, 0.15), transparent 40%)`,
                }}
            />

            {/* Border Glow */}
            <div
                className="pointer-events-none absolute -inset-px rounded-2xl transition-opacity duration-300"
                style={{
                    opacity: isHovered ? 1 : 0,
                    background: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(139, 92, 246, 0.5), transparent 40%)`,
                    mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    maskComposite: "exclude",
                    WebkitMaskComposite: "xor",
                    padding: "1px",
                }}
            />

            {/* Glow Effect */}
            <div
                className={cn(
                    "absolute inset-0 rounded-2xl transition-all duration-500",
                    isHovered ? "opacity-100" : "opacity-0"
                )}
                style={{
                    boxShadow: "0 0 40px rgba(139, 92, 246, 0.3), 0 0 80px rgba(139, 92, 246, 0.1)",
                }}
            />

            {/* Content */}
            <div className="relative z-10 h-full">{children}</div>

            {/* Learn More Link */}
            <motion.a
                href={feature.learnMore}
                className={cn(
                    "absolute bottom-4 right-4 flex items-center gap-1 text-sm font-medium text-purple-400",
                    "opacity-0 translate-y-2 transition-all duration-300",
                    "group-hover:opacity-100 group-hover:translate-y-0"
                )}
            >
                Learn more
                <ArrowRight className="h-4 w-4" />
            </motion.a>
        </motion.div>
    );
}

export function Features() {
    return (
        <section id="features" className="relative bg-[#0A0F1E] py-32">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-blue-500/5" />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-16 text-center">
                    <MaskTextReveal>
                        <h2 className="text-4xl font-bold text-white sm:text-5xl">
                            Everything You Need to Close Deals
                        </h2>
                    </MaskTextReveal>
                    <motion.p
                        className="mx-auto mt-4 max-w-2xl text-lg text-slate-400"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                    >
                        Powerful tools working together to supercharge your pipeline
                    </motion.p>
                </div>

                {/* Bento Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Large Card - Google Maps Scraper */}
                    <motion.div
                        className="md:col-span-2 lg:row-span-2"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                    >
                        <FeatureCard feature={features[0]} className="h-full p-8">
                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/10">
                                {features[0].icon}
                            </div>
                            <h3 className="mt-6 text-2xl font-bold text-white">
                                {features[0].title}
                            </h3>
                            <p className="mt-3 text-slate-400">{features[0].description}</p>

                            {/* Mini Preview */}
                            <div className="mt-8 rounded-xl bg-slate-900/50 p-4">
                                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                                    <span className="text-sm text-slate-400">Location</span>
                                    <span className="text-sm text-white">New York, NY</span>
                                </div>
                                <div className="flex items-center justify-between border-b border-white/5 py-3">
                                    <span className="text-sm text-slate-400">Keyword</span>
                                    <span className="text-sm text-white">Restaurants</span>
                                </div>
                                <div className="flex items-center justify-between pt-3">
                                    <span className="text-sm text-slate-400">Results</span>
                                    <span className="text-sm text-green-400">2,847 leads</span>
                                </div>
                            </div>
                        </FeatureCard>
                    </motion.div>

                    {/* Medium Cards */}
                    {features.slice(1, 3).map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 + index * 0.1 }}
                        >
                            <FeatureCard feature={feature} className="h-full p-6 pb-12">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/10">
                                    {feature.icon}
                                </div>
                                <h3 className="mt-4 text-xl font-bold text-white">
                                    {feature.title}
                                </h3>
                                <p className="mt-2 text-sm text-slate-400">
                                    {feature.description}
                                </p>
                            </FeatureCard>
                        </motion.div>
                    ))}

                    {/* Small Cards */}
                    {features.slice(3, 5).map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 + index * 0.1 }}
                        >
                            <FeatureCard feature={feature} className="h-full p-5 pb-10">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-slate-700/50 to-slate-800/50">
                                        {feature.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white">{feature.title}</h3>
                                        <p className="text-xs text-slate-400">{feature.description}</p>
                                    </div>
                                </div>
                            </FeatureCard>
                        </motion.div>
                    ))}

                    {/* Last Medium Card */}
                    <motion.div
                        className="md:col-span-2"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6 }}
                    >
                        <FeatureCard feature={features[5]} className="h-full p-6 pb-12">
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/10">
                                    {features[5].icon}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">
                                        {features[5].title}
                                    </h3>
                                    <p className="mt-2 text-slate-400">{features[5].description}</p>
                                </div>
                            </div>
                        </FeatureCard>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
