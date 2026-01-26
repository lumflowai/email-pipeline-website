"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AuroraBackgroundProps {
    children?: ReactNode;
    className?: string;
    showRadialGradient?: boolean;
}

export function AuroraBackground({
    children,
    className,
    showRadialGradient = true,
}: AuroraBackgroundProps) {
    return (
        <div
            className={cn(
                "relative min-h-screen w-full overflow-hidden bg-[#0A0F1E]",
                className
            )}
        >
            {/* Animated Aurora Blobs */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    className="absolute -top-1/2 -left-1/4 h-[800px] w-[800px] rounded-full bg-purple-500/30 blur-[120px]"
                    animate={{
                        x: [0, 100, 50, 0],
                        y: [0, -50, 50, 0],
                        scale: [1, 1.1, 0.9, 1],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
                <motion.div
                    className="absolute -top-1/4 right-0 h-[600px] w-[600px] rounded-full bg-blue-500/25 blur-[100px]"
                    animate={{
                        x: [0, -80, 40, 0],
                        y: [0, 60, -30, 0],
                        scale: [1, 0.9, 1.1, 1],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
                <motion.div
                    className="absolute top-1/3 left-1/3 h-[500px] w-[500px] rounded-full bg-violet-500/20 blur-[80px]"
                    animate={{
                        x: [0, 60, -40, 0],
                        y: [0, -40, 60, 0],
                        scale: [1, 1.15, 0.85, 1],
                    }}
                    transition={{
                        duration: 30,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
                <motion.div
                    className="absolute bottom-0 right-1/4 h-[700px] w-[700px] rounded-full bg-cyan-500/15 blur-[100px]"
                    animate={{
                        x: [0, -50, 80, 0],
                        y: [0, 80, -40, 0],
                        scale: [1, 0.95, 1.05, 1],
                    }}
                    transition={{
                        duration: 22,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            </div>

            {/* Radial Gradient Overlay */}
            {showRadialGradient && (
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#0A0F1E_70%)]" />
            )}

            {/* Noise Texture */}
            <div className="absolute inset-0 opacity-[0.015]" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }} />

            {/* Content */}
            <div className="relative z-10">{children}</div>
        </div>
    );
}
