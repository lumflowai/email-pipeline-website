"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MaskTextReveal } from "@/components/ui/mask-text-reveal";
import { ChevronDown, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
    {
        question: "How accurate is the Google Maps scraper?",
        answer:
            "We pull live data from Google Maps, including phone numbers, emails (when available), and ratings. Accuracy is 95%+ for basic info.",
    },
    {
        question: "Do I need to connect my own email accounts?",
        answer:
            "Yes, you'll connect your Instantly account. We don't send emails directly to keep your sender reputation safe.",
    },
    {
        question: "How does AI calling work?",
        answer:
            "Our AI caller (powered by Bland AI) makes outbound calls using a script you configure. It can qualify leads, answer questions, and book meetings.",
    },
    {
        question: "Can I cancel anytime?",
        answer: "Yes, cancel anytime. No long-term contracts.",
    },
    {
        question: "What's included in the free trial?",
        answer:
            "7-day free trial with 500 leads, 1 email campaign, and 20 AI calls. No credit card required.",
    },
];

export function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <section id="faq" className="relative bg-[#0A0F1E] py-32">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent" />

            <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-16 text-center">
                    <MaskTextReveal>
                        <h2 className="text-4xl font-bold text-white sm:text-5xl">
                            Frequently Asked Questions
                        </h2>
                    </MaskTextReveal>
                    <motion.p
                        className="mx-auto mt-4 max-w-2xl text-lg text-slate-400"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                    >
                        Everything you need to know about Lumflow
                    </motion.p>
                </div>

                {/* FAQ Items */}
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 + index * 0.05 }}
                        >
                            <div
                                className={cn(
                                    "glass-card overflow-hidden rounded-xl transition-all duration-300",
                                    openIndex === index && "ring-1 ring-purple-500/50"
                                )}
                            >
                                {/* Question */}
                                <button
                                    className="flex w-full items-center justify-between p-6 text-left"
                                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                >
                                    <span className="pr-4 text-lg font-medium text-white">
                                        {faq.question}
                                    </span>
                                    <div
                                        className={cn(
                                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-300",
                                            openIndex === index
                                                ? "bg-purple-500/20 text-purple-400"
                                                : "bg-slate-800/50 text-slate-400"
                                        )}
                                    >
                                        {openIndex === index ? (
                                            <Minus className="h-4 w-4" />
                                        ) : (
                                            <Plus className="h-4 w-4" />
                                        )}
                                    </div>
                                </button>

                                {/* Answer */}
                                <AnimatePresence>
                                    {openIndex === index && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className="border-t border-white/5 px-6 pb-6 pt-4">
                                                <p className="text-slate-400">{faq.answer}</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
