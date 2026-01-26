"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/use-auth";
import { Mail, Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Mock login - no validation needed
        setTimeout(() => {
            login(email || "user@example.com");
            router.push("/dashboard");
        }, 500);
    };

    return (
        <AuroraBackground className="flex min-h-screen items-center justify-center px-4">
            {/* Back to Home */}
            <Link
                href="/"
                className="fixed left-6 top-6 z-20 text-sm text-slate-400 transition-colors hover:text-white"
            >
                ← Back to home
            </Link>

            {/* Login Card */}
            <motion.div
                className="relative w-full max-w-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="glass-card rounded-2xl p-8">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <Link href="/" className="inline-block">
                            <span className="text-2xl font-bold text-white">
                                Lumflow{" "}
                                <span className="gradient-text-glow">AI</span>
                            </span>
                        </Link>
                        <h1 className="mt-6 text-3xl font-bold text-white">Welcome Back</h1>
                        <p className="mt-2 text-slate-400">
                            Log in to your Lumflow dashboard
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-300">
                                Email
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="border-white/10 bg-white/5 pl-10 text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500/20"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-300">
                                Password
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="border-white/10 bg-white/5 pl-10 text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500/20"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full gradient-primary py-6 text-white transition-all hover:scale-[1.02] disabled:opacity-50"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <motion.div
                                        className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    />
                                    Logging in...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    Login
                                    <ArrowRight className="h-4 w-4" />
                                </span>
                            )}
                        </Button>
                    </form>

                    {/* Footer */}
                    <p className="mt-8 text-center text-sm text-slate-400">
                        Don&apos;t have an account?{" "}
                        <Link
                            href="/signup"
                            className="font-medium text-purple-400 transition-colors hover:text-purple-300"
                        >
                            Sign up
                        </Link>
                    </p>
                </div>
            </motion.div>
        </AuroraBackground>
    );
}
