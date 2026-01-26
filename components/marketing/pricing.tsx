"use client";

import { motion } from "framer-motion";
import { MaskTextReveal } from "@/components/ui/mask-text-reveal";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const plans = [
    {
        name: "Starter",
        price: "$149",
        period: "/month",
        description: "Perfect for testing the waters",
        features: [
            "2,500 leads/month",
            "1 email campaign (500 contacts)",
            "100 AI calls",
            "Email support",
        ],
        cta: "Start Free Trial",
        href: "/signup",
        popular: false,
    },
    {
        name: "Pro",
        price: "$349",
        period: "/month",
        description: "For growing sales teams",
        features: [
            "10,000 leads/month",
            "Unlimited email campaigns",
            "500 AI calls",
            "Priority support",
            "Advanced analytics",
        ],
        cta: "Start Free Trial",
        href: "/signup",
        popular: true,
    },
    {
        name: "Enterprise",
        price: "$899",
        period: "/month",
        description: "For large-scale operations",
        features: [
            "50,000 leads/month",
            "Everything unlimited",
            "Dedicated account manager",
            "Custom integrations",
            "SLA guarantee",
        ],
        cta: "Contact Sales",
        href: "/signup",
        popular: false,
    },
];

export function Pricing() {
    return (
        <section id="pricing" className="relative bg-[#0A0F1E] py-32">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent" />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-16 text-center">
                    <MaskTextReveal>
                        <h2 className="text-4xl font-bold text-white sm:text-5xl">
                            Simple, Transparent Pricing
                        </h2>
                    </MaskTextReveal>
                    <motion.p
                        className="mx-auto mt-4 max-w-2xl text-lg text-slate-400"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                    >
                        Start free, scale as you grow. No hidden fees.
                    </motion.p>
                </div>

                {/* Pricing Cards */}
                <div className="grid gap-8 md:grid-cols-3">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.name}
                            className={cn(
                                "relative rounded-2xl p-1",
                                plan.popular
                                    ? "bg-gradient-to-b from-purple-500 to-blue-500"
                                    : "bg-white/5"
                            )}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 + index * 0.1 }}
                            whileHover={{ y: -8 }}
                        >
                            {/* Popular Badge */}
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-1.5 text-sm font-medium text-white shadow-lg shadow-purple-500/25">
                                        <Sparkles className="h-4 w-4" />
                                        Recommended
                                    </div>
                                </div>
                            )}

                            {/* Card Content */}
                            <div className="rounded-xl bg-[#0A0F1E] p-8">
                                {/* Plan Name */}
                                <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
                                <p className="mt-1 text-sm text-slate-400">{plan.description}</p>

                                {/* Price */}
                                <div className="mt-6 flex items-baseline gap-1">
                                    <span className="text-5xl font-bold text-white">{plan.price}</span>
                                    <span className="text-slate-400">{plan.period}</span>
                                </div>

                                {/* Features */}
                                <ul className="mt-8 space-y-4">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-center gap-3">
                                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/20">
                                                <Check className="h-3 w-3 text-purple-400" />
                                            </div>
                                            <span className="text-sm text-slate-300">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA */}
                                <Link href={plan.href} className="mt-8 block">
                                    <Button
                                        className={cn(
                                            "w-full py-6",
                                            plan.popular
                                                ? "gradient-primary glow-primary text-white"
                                                : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                                        )}
                                    >
                                        {plan.cta}
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
