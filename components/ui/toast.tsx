"use client";

import * as React from "react";
import { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Toast {
    id: string;
    type: "success" | "error" | "info" | "warning";
    message: string;
    duration?: number;
}

interface ToastContextValue {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, "id">) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((toast: Omit<Toast, "id">) => {
        const id = `toast_${Date.now()}`;
        const newToast = { ...toast, id };
        setToasts((prev) => [...prev, newToast]);

        // Auto-dismiss
        const duration = toast.duration || (toast.type === "error" ? 6000 : 4000);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} onDismiss={removeToast} />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}

function ToastContainer({
    toasts,
    onDismiss,
}: {
    toasts: Toast[];
    onDismiss: (id: string) => void;
}) {
    return (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 50, scale: 0.9 }}
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg",
                            {
                                "bg-green-500/90 text-white": toast.type === "success",
                                "bg-red-500/90 text-white": toast.type === "error",
                                "bg-blue-500/90 text-white": toast.type === "info",
                                "bg-yellow-500/90 text-black": toast.type === "warning",
                            }
                        )}
                    >
                        <div className="flex h-5 w-5 items-center justify-center">
                            {toast.type === "success" && <Check className="h-5 w-5" />}
                            {toast.type === "error" && <X className="h-5 w-5" />}
                            {toast.type === "info" && <Info className="h-5 w-5" />}
                            {toast.type === "warning" && <AlertTriangle className="h-5 w-5" />}
                        </div>
                        <span className="text-sm font-medium">{toast.message}</span>
                        <button
                            onClick={() => onDismiss(toast.id)}
                            className="ml-2 opacity-70 hover:opacity-100"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
