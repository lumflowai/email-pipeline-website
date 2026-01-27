"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
    currentStep: number;
    totalSteps: number;
    steps: { label: string; description: string }[];
}

export function StepIndicator({ currentStep, totalSteps, steps }: StepIndicatorProps) {
    return (
        <div className="w-full py-6">
            <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isCompleted = stepNumber < currentStep;
                    const isCurrent = stepNumber === currentStep;
                    const isUpcoming = stepNumber > currentStep;

                    return (
                        <div key={stepNumber} className="flex items-center flex-1 last:flex-none">
                            {/* Step Circle */}
                            <div className="flex flex-col items-center relative">
                                <div
                                    className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm border-2 transition-all duration-200",
                                        isCompleted && "bg-primary border-primary text-primary-foreground",
                                        isCurrent && "bg-background border-primary text-primary scale-110",
                                        isUpcoming && "bg-muted border-border text-muted-foreground"
                                    )}
                                >
                                    {isCompleted ? (
                                        <Check className="h-5 w-5" />
                                    ) : (
                                        stepNumber
                                    )}
                                </div>
                                <div className="mt-2 text-center">
                                    <p
                                        className={cn(
                                            "text-sm font-medium transition-colors",
                                            isCurrent && "text-foreground",
                                            !isCurrent && "text-muted-foreground"
                                        )}
                                    >
                                        {step.label}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
                                        {step.description}
                                    </p>
                                </div>
                            </div>

                            {/* Connector Line */}
                            {index < steps.length - 1 && (
                                <div className="flex-1 h-0.5 mx-4 relative -mt-12">
                                    <div className="absolute inset-0 bg-border" />
                                    <div
                                        className={cn(
                                            "absolute inset-0 bg-primary transition-all duration-300",
                                            isCompleted ? "w-full" : "w-0"
                                        )}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
