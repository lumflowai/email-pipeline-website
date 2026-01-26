"use client";

import { useRef, ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface ParallaxGalleryProps {
    items: {
        title: string;
        description: string;
        icon?: ReactNode;
    }[];
    className?: string;
}

export function ParallaxGallery({ items, className }: ParallaxGalleryProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"],
    });

    const x = useTransform(scrollYProgress, [0, 1], ["10%", "-60%"]);

    return (
        <div ref={containerRef} className={cn("relative overflow-hidden py-20", className)}>
            <motion.div
                className="flex gap-6"
                style={{ x }}
            >
                {items.map((item, index) => (
                    <motion.div
                        key={index}
                        className="glass-card min-w-[300px] rounded-2xl p-6 md:min-w-[400px]"
                        whileHover={{ scale: 1.02, y: -5 }}
                        transition={{ duration: 0.2 }}
                    >
                        {item.icon && (
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                                {item.icon}
                            </div>
                        )}
                        <h3 className="mb-2 text-xl font-bold text-white">{item.title}</h3>
                        <p className="text-slate-400">{item.description}</p>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}
