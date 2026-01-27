import { DomainStatus } from '@/lib/domains/types';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, XCircle, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DomainStatusBadgeProps {
    status: DomainStatus;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function DomainStatusBadge({ status, size = 'md', className }: DomainStatusBadgeProps) {
    const config = {
        verified: {
            label: 'Verified',
            icon: CheckCircle2,
            className: 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20',
        },
        pending: {
            label: 'Pending Verification',
            icon: Clock,
            className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20',
        },
        failed: {
            label: 'Verification Failed',
            icon: XCircle,
            className: 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20',
        },
        warming: {
            label: 'Warming Up',
            icon: Flame,
            className: 'bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20',
        },
    };

    const { label, icon: Icon, className: badgeClassName } = config[status];

    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-2.5 py-1',
        lg: 'text-base px-3 py-1.5',
    };

    const iconSizes = {
        sm: 'h-3 w-3',
        md: 'h-4 w-4',
        lg: 'h-5 w-5',
    };

    return (
        <Badge
            variant="outline"
            className={cn(
                'flex items-center gap-1.5 font-medium transition-colors',
                badgeClassName,
                sizeClasses[size],
                className
            )}
        >
            <Icon className={iconSizes[size]} />
            {label}
        </Badge>
    );
}
