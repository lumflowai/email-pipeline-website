"use client";

import { motion } from "framer-motion";
import { MaskTextReveal } from "@/components/ui/mask-text-reveal";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Quote } from "lucide-react";

const testimonials = [
    {
        quote: "We 10x'd our outbound pipeline in 30 days.",
        name: "Alex Johnson",
        title: "VP of Sales",
        company: "GrowthCo",
    },
    {
        quote: "Finally, a tool that doesn't feel like a spreadsheet.",
        name: "Sarah Chen",
        title: "Marketing Director",
        company: "StartupXYZ",
    },
    {
        quote: "Our SDRs love it. Our CFO loves the ROI.",
        name: "Michael Roberts",
        title: "CRO",
        company: "ScaleUp Inc",
    },
];

export function Testimonials() {
    return (
        <section className="relative bg-[#0A0F1E] py-32">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-purple-500/5" />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-16 text-center">
                    <MaskTextReveal>
                        <h2 className="text-4xl font-bold text-white sm:text-5xl">
                            Trusted by Growth Teams
                        </h2>
                    </MaskTextReveal>
                    <motion.p
                        className="mx-auto mt-4 max-w-2xl text-lg text-slate-400"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                    >
                        See what our customers have to say
                    </motion.p>
                </div>

                {/* Testimonial Cards */}
                <div className="grid gap-8 md:grid-cols-3">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 + index * 0.1 }}
                        >
                            <SpotlightCard className="h-full p-8">
                                {/* Quote Icon */}
                                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                                    <Quote className="h-6 w-6 text-purple-400" />
                                </div>

                                {/* Quote Text */}
                                <blockquote className="mb-8 text-xl font-medium text-white">
                                    &ldquo;{testimonial.quote}&rdquo;
                                </blockquote>

                                {/* Author */}
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-lg font-semibold text-white">
                                        {testimonial.name[0]}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-white">{testimonial.name}</p>
                                        <p className="text-sm text-slate-400">
                                            {testimonial.title}, {testimonial.company}
                                        </p>
                                    </div>
                                </div>
                            </SpotlightCard>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
