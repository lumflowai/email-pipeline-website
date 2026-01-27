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
import { Mail, Lock, ArrowRight, Sparkles } from "lucide-react";

export default function SignupPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { signup } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await signup(email, password);
            setIsLoading(false);
            alert("Account created! Logging you in...");
            // Optional: Redirect or refresh dealt with by useAuth
        } catch (error) {
            console.error(error);
            alert("Signup failed. Please try again.");
            setIsLoading(false);
        }
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

            {/* Signup Card */}
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
                        <h1 className="mt-6 text-3xl font-bold text-white">
                            Start Your Free Trial
                        </h1>
                        <p className="mt-2 text-slate-400">No credit card required</p>
                    </div>

                    {/* Benefits */}
                    <div className="mb-6 flex items-center justify-center gap-2 rounded-xl bg-purple-500/10 px-4 py-3">
                        <Sparkles className="h-5 w-5 text-purple-400" />
                        <span className="text-sm text-purple-300">
                            7-day free trial • 500 leads • 20 AI calls
                        </span>
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
                                    placeholder="Create a password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="border-white/10 bg-white/5 pl-10 text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500/20"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full gradient-primary glow-primary py-6 text-white transition-all hover:scale-[1.02] disabled:opacity-50"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <motion.div
                                        className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    />
                                    Creating account...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    Create Account
                                    <ArrowRight className="h-4 w-4" />
                                </span>
                            )}
                        </Button>
                    </form>

                    {/* Terms */}
                    <p className="mt-6 text-center text-xs text-slate-500">
                        By signing up, you agree to our{" "}
                        <Link href="#" className="text-slate-400 hover:text-white">
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="#" className="text-slate-400 hover:text-white">
                            Privacy Policy
                        </Link>
                    </p>

                    {/* Footer */}
                    <p className="mt-6 text-center text-sm text-slate-400">
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="font-medium text-purple-400 transition-colors hover:text-purple-300"
                        >
                            Log in
                        </Link>
                    </p>
                </div>
            </motion.div>
        </AuroraBackground>
    );
}
