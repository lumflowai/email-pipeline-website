"use client";

import { useRef, useState, MouseEvent, ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MagneticButtonProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
    strength?: number;
    disabled?: boolean;
}

export function MagneticButton({
    children,
    className = "",
    onClick,
    strength = 0.3,
    disabled = false,
}: MagneticButtonProps) {
    const ref = useRef<HTMLButtonElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
        if (disabled || !ref.current) return;

        const { clientX, clientY } = e;
        const { left, top, width, height } = ref.current.getBoundingClientRect();

        const centerX = left + width / 2;
        const centerY = top + height / 2;

        const x = (clientX - centerX) * strength;
        const y = (clientY - centerY) * strength;

        setPosition({ x, y });
    };

    const handleMouseLeave = () => {
        setPosition({ x: 0, y: 0 });
    };

    return (
        <motion.button
            ref={ref}
            className={cn(
                "relative inline-flex items-center justify-center px-8 py-4",
                "rounded-xl font-semibold text-white",
                "gradient-primary glow-primary",
                "transition-all duration-300",
                "hover:scale-105 active:scale-95",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                className
            )}
            animate={{ x: position.x, y: position.y }}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            disabled={disabled}
        >
            <span className="relative z-10">{children}</span>
            <motion.div
                className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                    background:
                        "radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, transparent 70%)",
                }}
                initial={{ scale: 0 }}
                whileHover={{ scale: 1, opacity: 1 }}
            />
        </motion.button>
    );
}
