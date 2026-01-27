"use client";

import { Domain } from '@/lib/domains/types';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { DomainStatusBadge } from './DomainStatusBadge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Send, TrendingUp, Shield, MoreHorizontal, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface DomainCardProps {
    domain: Domain;
    className?: string;
}

export function DomainCard({ domain, className }: DomainCardProps) {
    const isVerified = domain.status === 'verified' || domain.status === 'warming';
    const showWarmup = domain.warmupProgress > 0 && domain.warmupProgress < 100;

    return (
        <SpotlightCard
            className={cn(
                'p-6 transition-all duration-200',
                isVerified && 'ring-2 ring-purple-500/20',
                domain.status === 'failed' && 'border-red-500/50',
                className
            )}
            enableHoverScale={true}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-white truncate">
                            {domain.domain}
                        </h3>
                        <DomainStatusBadge status={domain.status} size="sm" />
                    </div>
                    {domain.verifiedAt && (
                        <p className="text-xs text-slate-500">
                            Verified on {new Date(domain.verifiedAt).toLocaleDateString()}
                        </p>
                    )}
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-400 hover:text-white hover:bg-white/5"
                >
                    <MoreHorizontal className="h-5 w-5" />
                </Button>
            </div>

            {/* Warmup Progress */}
            {showWarmup && (
                <div className="mb-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Warmup Progress</span>
                        <span className="text-white font-medium">{domain.warmupProgress}%</span>
                    </div>
                    <Progress
                        value={domain.warmupProgress}
                        showShimmer={true}
                        className="h-2"
                    />
                </div>
            )}

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-4 mb-4">
                {/* Daily Sending */}
                <div className="space-y-1">
                    <div className="flex items-center gap-1 text-slate-500">
                        <Send className="h-3.5 w-3.5" />
                        <span className="text-xs">Daily Sent</span>
                    </div>
                    <p className="text-white font-semibold">
                        {domain.dailySent}/{domain.dailyLimit}
                    </p>
                </div>

                {/* Health Score */}
                <div className="space-y-1">
                    <div className="flex items-center gap-1 text-slate-500">
                        <Shield className="h-3.5 w-3.5" />
                        <span className="text-xs">Health</span>
                    </div>
                    <p className={cn(
                        "font-semibold",
                        domain.healthScore >= 80 ? "text-green-400" :
                            domain.healthScore >= 60 ? "text-yellow-400" :
                                "text-red-400"
                    )}>
                        {domain.healthScore}/100
                    </p>
                </div>

                {/* Reputation */}
                <div className="space-y-1">
                    <div className="flex items-center gap-1 text-slate-500">
                        <TrendingUp className="h-3.5 w-3.5" />
                        <span className="text-xs">Status</span>
                    </div>
                    <p className="text-white font-semibold">
                        {domain.status === 'verified' ? 'Active' :
                            domain.status === 'warming' ? 'Warming' :
                                domain.status === 'pending' ? 'Pending' : 'Failed'}
                    </p>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
                <Link href={`/dashboard/domains/${domain.id}`} className="flex-1">
                    <Button
                        variant="outline"
                        className="w-full border-white/10 hover:bg-white/5 hover:border-purple-500/50 text-white"
                    >
                        View DNS Records
                        <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                </Link>
                <Link href={`/dashboard/domains/${domain.id}?tab=settings`}>
                    <Button
                        variant="ghost"
                        className="text-slate-400 hover:text-white hover:bg-white/5"
                    >
                        Configure
                    </Button>
                </Link>
            </div>
        </SpotlightCard>
    );
}
