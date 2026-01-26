"use client";

import { useRef, ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface StickyScrollRevealProps {
    items: {
        title: string;
        description: string;
        icon?: ReactNode;
        content?: ReactNode;
    }[];
    className?: string;
}

export function StickyScrollReveal({ items, className }: StickyScrollRevealProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    return (
        <div ref={containerRef} className={cn("relative", className)}>
            <div className="sticky top-0 flex h-screen items-center overflow-hidden">
                <div className="relative mx-auto w-full max-w-4xl px-4">
                    {items.map((item, index) => (
                        <StickyCard
                            key={index}
                            item={item}
                            index={index}
                            total={items.length}
                            progress={scrollYProgress}
                        />
                    ))}
                </div>
            </div>
            {/* Spacer for scroll */}
            <div style={{ height: `${items.length * 100}vh` }} />
        </div>
    );
}

interface StickyCardProps {
    item: {
        title: string;
        description: string;
        icon?: ReactNode;
        content?: ReactNode;
    };
    index: number;
    total: number;
    progress: ReturnType<typeof useScroll>["scrollYProgress"];
}

function StickyCard({ item, index, total, progress }: StickyCardProps) {
    const start = index / total;
    const end = (index + 1) / total;

    const y = useTransform(progress, [start, end], ["0%", "-10%"]);
    const scale = useTransform(progress, [start, end], [1, 0.95]);
    const opacity = useTransform(
        progress,
        [start, start + 0.1, end - 0.1, end],
        [0, 1, 1, index === total - 1 ? 1 : 0.5]
    );
    const zIndex = total - index;

    return (
        <motion.div
            className="absolute inset-x-4 top-1/2 -translate-y-1/2"
            style={{
                y,
                scale,
                opacity,
                zIndex,
            }}
        >
            <div className="glass-card rounded-2xl p-8 shadow-2xl">
                <div className="flex items-start gap-6">
                    {item.icon && (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                            {item.icon}
                        </div>
                    )}
                    <div className="flex-1">
                        <span className="mb-2 inline-block rounded-full bg-purple-500/20 px-3 py-1 text-sm font-medium text-purple-300">
                            Step {index + 1}
                        </span>
                        <h3 className="mb-3 text-2xl font-bold text-white">{item.title}</h3>
                        <p className="text-lg text-slate-400">{item.description}</p>
                    </div>
                </div>
                {item.content && (
                    <div className="mt-6 rounded-xl bg-slate-900/50 p-4">
                        {item.content}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
