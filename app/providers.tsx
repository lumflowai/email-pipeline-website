"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import { ToastProvider } from "@/components/ui/toast";

export function Providers({ children, ...props }: ThemeProviderProps) {
    return (
        <NextThemesProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange={false}
            {...props}
        >
            <ToastProvider>
                {children}
            </ToastProvider>
        </NextThemesProvider>
    );
}
