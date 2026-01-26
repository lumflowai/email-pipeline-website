"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MaskTextRevealProps {
    children: ReactNode;
    className?: string;
    delay?: number;
}

export function MaskTextReveal({
    children,
    className = "",
    delay = 0,
}: MaskTextRevealProps) {
    return (
        <div className={cn("overflow-hidden", className)}>
            <motion.div
                initial={{ y: "100%" }}
                whileInView={{ y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{
                    duration: 0.6,
                    delay,
                    ease: [0.77, 0, 0.175, 1],
                }}
            >
                {children}
            </motion.div>
        </div>
    );
}

interface MaskTextRevealGroupProps {
    lines: string[];
    className?: string;
    lineClassName?: string;
    staggerDelay?: number;
}

export function MaskTextRevealGroup({
    lines,
    className = "",
    lineClassName = "",
    staggerDelay = 0.1,
}: MaskTextRevealGroupProps) {
    return (
        <div className={className}>
            {lines.map((line, index) => (
                <MaskTextReveal key={index} delay={index * staggerDelay}>
                    <span className={lineClassName}>{line}</span>
                </MaskTextReveal>
            ))}
        </div>
    );
}
