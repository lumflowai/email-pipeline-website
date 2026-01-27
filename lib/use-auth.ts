"use client";

import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user ?? null);
            setIsLoading(false);
            if (event === 'SIGNED_IN') {
                router.refresh();
            }
            if (event === 'SIGNED_OUT') {
                router.refresh();
                router.push("/");
            }
        });

        // Initial check
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [router, supabase]);

    const login = async (email: string, password?: string) => {
        if (password) {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
        } else {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
        }
    };

    const signup = async (email: string, password?: string) => {
        if (password) {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
        } else {
            // Fallback to magic link signup/login
            await login(email);
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
        router.refresh();
        router.replace("/");
    };

    const getUserEmail = () => {
        return user?.email || "";
    };

    return {
        user,
        isLoggedIn: !!user,
        isLoading,
        login,
        signup,
        logout,
        getUserEmail
    };
}

