"use client";

import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MetricCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    trendUp?: boolean;
    className?: string;
}

export function MetricCard({
    title,
    value,
    icon: Icon,
    trend,
    trendUp,
    className,
}: MetricCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card className={cn("overflow-hidden", className)}>
                <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">
                                {title}
                            </p>
                            <p className="text-3xl font-bold">{value}</p>
                            {trend && (
                                <p
                                    className={cn(
                                        "text-xs font-medium",
                                        trendUp ? "text-green-500" : "text-muted-foreground"
                                    )}
                                >
                                    {trend}
                                </p>
                            )}
                        </div>
                        <div className="rounded-full bg-primary/10 p-3">
                            <Icon className="h-5 w-5 text-primary" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
