"use client";

// Mock auth utility for testing
// In production, this would be replaced with a real auth solution

export function useAuth() {
    const isLoggedIn = typeof window !== "undefined" && localStorage.getItem("lumflow_auth") === "true";

    const login = (email: string) => {
        if (typeof window !== "undefined") {
            localStorage.setItem("lumflow_auth", "true");
            localStorage.setItem("lumflow_user_email", email);
        }
    };

    const logout = () => {
        if (typeof window !== "undefined") {
            localStorage.removeItem("lumflow_auth");
            localStorage.removeItem("lumflow_user_email");
        }
    };

    const getUserEmail = () => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("lumflow_user_email") || "user@example.com";
        }
        return "user@example.com";
    };

    return { isLoggedIn, login, logout, getUserEmail };
}

export function checkAuth(): boolean {
    if (typeof window !== "undefined") {
        return localStorage.getItem("lumflow_auth") === "true";
    }
    return false;
}
