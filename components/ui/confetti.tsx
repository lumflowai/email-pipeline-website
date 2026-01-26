"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfettiProps {
    duration?: number;
}

export function Confetti({ duration = 1500 }: ConfettiProps) {
    const [particles, setParticles] = useState<
        { id: number; x: number; color: string; delay: number; rotation: number }[]
    >([]);

    useEffect(() => {
        const colors = ["#8B5CF6", "#3B82F6", "#06B6D4", "#10B981", "#F59E0B"];
        const newParticles = Array.from({ length: 50 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            color: colors[Math.floor(Math.random() * colors.length)],
            delay: Math.random() * 0.3,
            rotation: Math.random() * 360,
        }));
        setParticles(newParticles);

        const timer = setTimeout(() => {
            setParticles([]);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration]);

    return (
        <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
            <AnimatePresence>
                {particles.map((particle) => (
                    <motion.div
                        key={particle.id}
                        className="absolute h-3 w-3 rounded-sm"
                        style={{
                            left: `${particle.x}%`,
                            top: "-20px",
                            backgroundColor: particle.color,
                            rotate: particle.rotation,
                        }}
                        initial={{ y: 0, opacity: 1, scale: 1 }}
                        animate={{
                            y: window.innerHeight + 100,
                            opacity: 0,
                            rotate: particle.rotation + 720,
                            scale: 0.5,
                        }}
                        exit={{ opacity: 0 }}
                        transition={{
                            duration: 2,
                            delay: particle.delay,
                            ease: "easeOut",
                        }}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
}
