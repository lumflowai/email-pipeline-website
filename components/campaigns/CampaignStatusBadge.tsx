"use client";

import type { Campaign, CampaignStatus } from "@/lib/campaigns/types";

interface CampaignStatusBadgeProps {
    status: CampaignStatus;
    className?: string;
}

export function CampaignStatusBadge({ status, className }: CampaignStatusBadgeProps) {
    const getStatusConfig = (status: CampaignStatus) => {
        switch (status) {
            case 'active':
                return {
                    label: 'Active',
                    className: 'bg-green-500/10 text-green-500 border-green-500/20',
                    dot: 'bg-green-500',
                };
            case 'paused':
                return {
                    label: 'Paused',
                    className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
                    dot: 'bg-yellow-500',
                };
            case 'completed':
                return {
                    label: 'Completed',
                    className: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
                    dot: 'bg-blue-500',
                };
            case 'draft':
                return {
                    label: 'Draft',
                    className: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
                    dot: 'bg-gray-500',
                };
            default:
                return {
                    label: status,
                    className: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
                    dot: 'bg-gray-500',
                };
        }
    };

    const config = getStatusConfig(status);

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.className} ${className || ''}`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
            {config.label}
        </span>
    );
}
