"use client";

import Link from "next/link";
import { Twitter, Linkedin } from "lucide-react";

const footerLinks = [
    { href: "#features", label: "Features" },
    { href: "#pricing", label: "Pricing" },
    { href: "#faq", label: "FAQ" },
    { href: "/login", label: "Login" },
];

const socialLinks = [
    { href: "https://twitter.com", icon: <Twitter className="h-5 w-5" />, label: "Twitter" },
    { href: "https://linkedin.com", icon: <Linkedin className="h-5 w-5" />, label: "LinkedIn" },
];

export function Footer() {
    return (
        <footer className="bg-[#0A0F1E] border-t border-white/5">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="grid gap-12 md:grid-cols-3">
                    {/* Logo & Tagline */}
                    <div>
                        <Link href="/" className="inline-block">
                            <span className="text-2xl font-bold text-white">
                                Lumflow{" "}
                                <span className="gradient-text-glow">AI</span>
                            </span>
                        </Link>
                        <p className="mt-4 text-sm text-slate-400">
                            Lead gen that converts.
                        </p>
                    </div>

                    {/* Links */}
                    <nav className="flex flex-wrap gap-6">
                        {footerLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-sm text-slate-400 transition-colors hover:text-white"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Social */}
                    <div className="flex gap-4 md:justify-end">
                        {socialLinks.map((social) => (
                            <a
                                key={social.label}
                                href={social.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-slate-400 transition-all hover:bg-white/10 hover:text-white"
                            >
                                {social.icon}
                                <span className="sr-only">{social.label}</span>
                            </a>
                        ))}
                    </div>
                </div>

                {/* Copyright */}
                <div className="mt-12 border-t border-white/5 pt-8">
                    <p className="text-center text-sm text-slate-500">
                        © 2025 Lumflow AI. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
