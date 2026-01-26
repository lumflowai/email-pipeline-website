"use client";

import { motion } from "framer-motion";
import { MaskTextReveal } from "@/components/ui/mask-text-reveal";
import { ParallaxGallery } from "@/components/ui/parallax-gallery";
import { Users, Megaphone, UserSearch, Rocket } from "lucide-react";

const useCases = [
    {
        title: "Sales Teams",
        description: "Close more deals with warm leads",
        icon: <Users className="h-8 w-8 text-purple-400" />,
    },
    {
        title: "Marketing Agencies",
        description: "Offer lead gen as a service",
        icon: <Megaphone className="h-8 w-8 text-blue-400" />,
    },
    {
        title: "Recruiters",
        description: "Find candidates before they job hunt",
        icon: <UserSearch className="h-8 w-8 text-cyan-400" />,
    },
    {
        title: "Founders",
        description: "Bootstrap your first 100 customers",
        icon: <Rocket className="h-8 w-8 text-green-400" />,
    },
];

export function UseCases() {
    return (
        <section className="relative overflow-hidden bg-[#0A0F1E] py-24">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-blue-500/5" />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 text-center">
                    <MaskTextReveal>
                        <h2 className="text-4xl font-bold text-white sm:text-5xl">
                            Built For Growth Teams
                        </h2>
                    </MaskTextReveal>
                    <motion.p
                        className="mx-auto mt-4 max-w-2xl text-lg text-slate-400"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                    >
                        Whether you&apos;re a solo founder or a scaling team, Lumflow adapts to your workflow
                    </motion.p>
                </div>
            </div>

            {/* Parallax Gallery */}
            <ParallaxGallery items={useCases} />
        </section>
    );
}
