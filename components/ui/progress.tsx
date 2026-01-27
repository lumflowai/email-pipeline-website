"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

interface ProgressProps extends React.ComponentProps<typeof ProgressPrimitive.Root> {
  showShimmer?: boolean;
  animated?: boolean;
}

function Progress({
  className,
  value,
  showShimmer = false,
  animated = true,
  ...props
}: ProgressProps) {
  const [displayValue, setDisplayValue] = React.useState(value || 0);
  const [isComplete, setIsComplete] = React.useState(false);

  React.useEffect(() => {
    if (animated && value !== undefined && value !== null) {
      const timeout = setTimeout(() => {
        setDisplayValue(value);
        if (value >= 100) {
          setIsComplete(true);
          setTimeout(() => setIsComplete(false), 1000);
        }
      }, 50);
      return () => clearTimeout(timeout);
    } else if (value !== null && value !== undefined) {
      setDisplayValue(value);
    }
  }, [value, animated]);

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      aria-valuenow={displayValue}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-live="polite"
      className={cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          "h-full w-full flex-1 transition-all duration-500 ease-out",
          showShimmer && "relative overflow-hidden",
          isComplete && "animate-pulse"
        )}
        style={{ transform: `translateX(-${100 - displayValue}%)` }}
      >
        {/* Gradient background */}
        <div className={cn(
          "h-full w-full",
          showShimmer
            ? "bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 bg-[length:200%_100%]"
            : "bg-primary"
        )}>
          {/* Shimmer overlay */}
          {showShimmer && (
            <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          )}
        </div>
      </ProgressPrimitive.Indicator>
    </ProgressPrimitive.Root>
  )
}

export { Progress }
