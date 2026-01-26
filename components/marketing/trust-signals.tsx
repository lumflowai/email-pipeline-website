"use client";

import { motion } from "framer-motion";
import { Database, Cpu, Mail, Phone } from "lucide-react";

const partners = [
    {
        name: "Supabase",
        description: "Built on Supabase",
        icon: <Database className="h-6 w-6" />,
    },
    {
        name: "OpenAI",
        description: "Powered by OpenAI",
        icon: <Cpu className="h-6 w-6" />,
    },
    {
        name: "Instantly",
        description: "Email via Instantly",
        icon: <Mail className="h-6 w-6" />,
    },
    {
        name: "Bland AI",
        description: "Calls by Bland AI",
        icon: <Phone className="h-6 w-6" />,
    },
];

export function TrustSignals() {
    return (
        <section className="relative bg-[#0A0F1E] py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Label */}
                <motion.p
                    className="mb-8 text-center text-sm font-medium text-slate-500"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                >
                    Powered by industry-leading tools
                </motion.p>

                {/* Partner Badges */}
                <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12">
                    {partners.map((partner, index) => (
                        <motion.div
                            key={partner.name}
                            className="flex items-center gap-3 rounded-full glass-light px-6 py-3"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 + index * 0.1 }}
                            whileHover={{ scale: 1.05 }}
                        >
                            <div className="text-slate-400">{partner.icon}</div>
                            <span className="text-sm font-medium text-slate-300">
                                {partner.description}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
