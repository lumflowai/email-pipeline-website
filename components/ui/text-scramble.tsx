"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";

interface TextScrambleProps {
    text: string;
    className?: string;
    delay?: number;
    speed?: number;
}

const chars = "!<>-_\\/[]{}—=+*^?#________";

export function TextScramble({
    text,
    className = "",
    delay = 0,
    speed = 30,
}: TextScrambleProps) {
    const [displayText, setDisplayText] = useState("");
    const [isComplete, setIsComplete] = useState(false);
    const frameRef = useRef(0);
    const resolveRef = useRef<(() => void) | null>(null);

    const scramble = useCallback(() => {
        let frame = 0;
        const queue: { from: string; to: string; start: number; end: number; char?: string }[] = [];

        const oldText = "";
        const newText = text;
        const length = Math.max(oldText.length, newText.length);

        for (let i = 0; i < length; i++) {
            const from = oldText[i] || "";
            const to = newText[i] || "";
            const start = Math.floor(Math.random() * 40);
            const end = start + Math.floor(Math.random() * 40);
            queue.push({ from, to, start, end });
        }

        const update = () => {
            let output = "";
            let complete = 0;

            for (let i = 0; i < queue.length; i++) {
                const { from, to, start, end } = queue[i];
                let { char } = queue[i];

                if (frame >= end) {
                    complete++;
                    output += to;
                } else if (frame >= start) {
                    if (!char || Math.random() < 0.28) {
                        char = chars[Math.floor(Math.random() * chars.length)];
                        queue[i].char = char;
                    }
                    output += char;
                } else {
                    output += from;
                }
            }

            setDisplayText(output);

            if (complete === queue.length) {
                setIsComplete(true);
                if (resolveRef.current) resolveRef.current();
            } else {
                frameRef.current = requestAnimationFrame(update);
                frame++;
            }
        };

        update();
    }, [text]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            scramble();
        }, delay);

        return () => {
            clearTimeout(timeout);
            cancelAnimationFrame(frameRef.current);
        };
    }, [delay, scramble]);

    return (
        <motion.span
            className={className}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.1 }}
        >
            {displayText}
            {!isComplete && <span className="animate-pulse">|</span>}
        </motion.span>
    );
}
