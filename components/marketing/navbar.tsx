"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#pricing", label: "Pricing" },
    { href: "#faq", label: "FAQ" },
    { href: "#how-it-works", label: "How It Works" },
];

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (latest) => {
        setIsScrolled(latest > 50);
    });

    return (
        <>
            <motion.header
                className={cn(
                    "fixed left-0 right-0 top-0 z-50 transition-all duration-300",
                    isScrolled
                        ? "glass border-b border-white/5 py-3"
                        : "bg-transparent py-5"
                )}
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-white">
                            Lumflow{" "}
                            <span className="gradient-text-glow">AI</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden items-center gap-8 md:flex">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-sm font-medium text-slate-400 transition-colors hover:text-white"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Desktop CTA */}
                    <div className="hidden items-center gap-4 md:flex">
                        <Link href="/login">
                            <Button
                                variant="ghost"
                                className="border border-white/10 text-slate-300 hover:bg-white/5 hover:text-white"
                            >
                                Login
                            </Button>
                        </Link>
                        <Link href="/signup">
                            <Button className="gradient-primary glow-primary text-white transition-all duration-300 hover:scale-105">
                                Start Free Trial
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-white md:hidden"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </motion.header>

            {/* Mobile Menu */}
            <motion.div
                className={cn(
                    "fixed inset-x-0 top-16 z-40 glass border-b border-white/5 md:hidden",
                    isMobileMenuOpen ? "block" : "hidden"
                )}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: isMobileMenuOpen ? 1 : 0, y: isMobileMenuOpen ? 0 : -20 }}
                transition={{ duration: 0.2 }}
            >
                <nav className="flex flex-col gap-2 p-4">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="rounded-lg px-4 py-3 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <div className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-4">
                        <Link href="/login">
                            <Button
                                variant="ghost"
                                className="w-full border border-white/10 text-slate-300"
                            >
                                Login
                            </Button>
                        </Link>
                        <Link href="/signup">
                            <Button className="w-full gradient-primary text-white">
                                Start Free Trial
                            </Button>
                        </Link>
                    </div>
                </nav>
            </motion.div>
        </>
    );
}
