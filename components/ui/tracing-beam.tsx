"use client";

import { useRef, useEffect, useState, ReactNode } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface TracingBeamProps {
    children: ReactNode;
    className?: string;
}

export function TracingBeam({ children, className }: TracingBeamProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [svgHeight, setSvgHeight] = useState(0);

    useEffect(() => {
        if (containerRef.current) {
            setSvgHeight(containerRef.current.offsetHeight);
        }
    }, []);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    const y1 = useSpring(
        useTransform(scrollYProgress, [0, 0.8], [50, svgHeight]),
        { stiffness: 500, damping: 90 }
    );
    const y2 = useSpring(
        useTransform(scrollYProgress, [0, 1], [50, svgHeight - 200]),
        { stiffness: 500, damping: 90 }
    );

    return (
        <div ref={containerRef} className={cn("relative", className)}>
            {/* Tracing Line */}
            <div className="absolute left-8 top-0 hidden h-full md:block">
                <svg
                    viewBox={`0 0 20 ${svgHeight}`}
                    width="20"
                    height={svgHeight}
                    className="block"
                    aria-hidden="true"
                >
                    <motion.path
                        d={`M 10 0 V ${svgHeight}`}
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                    <defs>
                        <motion.linearGradient
                            id="gradient"
                            gradientUnits="userSpaceOnUse"
                            x1="0"
                            x2="0"
                            y1={y1}
                            y2={y2}
                        >
                            <stop stopColor="#8B5CF6" stopOpacity="0" />
                            <stop stopColor="#8B5CF6" />
                            <stop offset="0.325" stopColor="#3B82F6" />
                            <stop offset="1" stopColor="#06B6D4" stopOpacity="0" />
                        </motion.linearGradient>
                    </defs>
                </svg>

                {/* Glow Effect */}
                <motion.div
                    className="absolute left-[5px] h-4 w-4 rounded-full bg-purple-500"
                    style={{
                        top: y1,
                        boxShadow: "0 0 20px 5px rgba(139, 92, 246, 0.5)",
                    }}
                />
            </div>

            {/* Content */}
            <div className="ml-0 md:ml-20">{children}</div>
        </div>
    );
}
