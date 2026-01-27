"use client";

import { useRef, useState, MouseEvent, ReactNode, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SpotlightCardProps {
    children: ReactNode;
    className?: string;
    spotlightColor?: string;
    glowIntensity?: number;
    enableHoverScale?: boolean;
    fadeIn?: boolean;
    delay?: number;
}

export function SpotlightCard({
    children,
    className = "",
    spotlightColor = "rgba(139, 92, 246, 0.15)",
    glowIntensity = 0.4,
    enableHoverScale = true,
    fadeIn = false,
    delay = 0,
}: SpotlightCardProps) {
    const divRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);
    const rafRef = useRef<number | null>(null);

    const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
        if (!divRef.current) return;

        // Cancel any pending animation frame
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
        }

        // Use requestAnimationFrame for smooth updates
        rafRef.current = requestAnimationFrame(() => {
            if (!divRef.current) return;
            const rect = divRef.current.getBoundingClientRect();
            setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        });
    }, []);

    const handleMouseEnter = useCallback(() => {
        setOpacity(1);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setOpacity(0);
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
    }, []);

    const motionProps = fadeIn
        ? {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.4, delay },
        }
        : {};

    const hoverProps = enableHoverScale
        ? {
            whileHover: { y: -4, scale: 1.01 },
            transition: { duration: 0.2 },
        }
        : {};

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
            {...motionProps}
            {...hoverProps}
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
                    background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, rgba(139, 92, 246, ${glowIntensity}), transparent 40%)`,
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
