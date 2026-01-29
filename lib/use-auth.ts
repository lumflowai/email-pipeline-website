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
        // MOCK AUTH IMPLEMENTATION
        const mockSession = localStorage.getItem("lumflow_mock_session");
        if (mockSession) {
            try {
                const sessionUser = JSON.parse(mockSession);
                setUser(sessionUser);
            } catch (e) {
                console.error("Failed to parse mock session", e);
                localStorage.removeItem("lumflow_mock_session");
            }
        }
        setIsLoading(false);

        /* 
        // SUPABASE REAL AUTH DISABLED FOR NOW
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
        */
    }, [router, supabase]);

    const login = async (email: string, password?: string) => {
        // MOCK LOGIN
        const mockUser: any = {
            id: "mock-user-id",
            aud: "authenticated",
            role: "authenticated",
            email: email,
            email_confirmed_at: new Date().toISOString(),
            phone: "",
            confirmed_at: new Date().toISOString(),
            last_sign_in_at: new Date().toISOString(),
            app_metadata: {
                provider: "email",
                providers: ["email"],
            },
            user_metadata: {},
            identities: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        localStorage.setItem("lumflow_mock_session", JSON.stringify(mockUser));
        setUser(mockUser as User);

        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 800));

        router.refresh();
        router.push("/dashboard");
    };

    const signup = async (email: string, password?: string) => {
        // Reuse login for signup
        await login(email, password);
    };

    const logout = async () => {
        // MOCK LOGOUT
        localStorage.removeItem("lumflow_mock_session");
        setUser(null);
        router.refresh();
        router.replace("/");

        /*
        await supabase.auth.signOut();
        router.refresh();
        router.replace("/");
        */
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
