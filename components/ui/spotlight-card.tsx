"use client";

import { useRef, useState, MouseEvent, ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SpotlightCardProps {
    children: ReactNode;
    className?: string;
    spotlightColor?: string;
}

export function SpotlightCard({
    children,
    className = "",
    spotlightColor = "rgba(139, 92, 246, 0.15)",
}: SpotlightCardProps) {
    const divRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!divRef.current) return;

        const rect = divRef.current.getBoundingClientRect();
        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const handleMouseEnter = () => {
        setOpacity(1);
    };

    const handleMouseLeave = () => {
        setOpacity(0);
    };

    return (
        <motion.div
            ref={divRef}
            className={cn(
                "relative overflow-hidden rounded-2xl glass-card p-6",
                "transition-all duration-300",
                "hover:border-white/20",
                className
            )}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ duration: 0.2 }}
        >
            {/* Spotlight Effect */}
            <div
                className="pointer-events-none absolute -inset-px transition-opacity duration-300"
                style={{
                    opacity,
                    background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 40%)`,
                }}
            />

            {/* Border Glow */}
            <div
                className="pointer-events-none absolute -inset-px rounded-2xl transition-opacity duration-300"
                style={{
                    opacity,
                    background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, rgba(139, 92, 246, 0.4), transparent 40%)`,
                    mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    maskComposite: "exclude",
                    WebkitMaskComposite: "xor",
                    padding: "1px",
                }}
            />

            {/* Content */}
            <div className="relative z-10">{children}</div>
        </motion.div>
    );
}
