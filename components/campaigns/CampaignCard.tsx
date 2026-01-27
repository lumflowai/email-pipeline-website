"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, Send, MessageSquare, MoreVertical } from "lucide-react";
import type { Campaign } from "@/lib/campaigns/types";
import { CampaignStatusBadge } from "./CampaignStatusBadge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatNumber, formatPercentage, formatDate } from "@/lib/campaigns/utils";

interface CampaignCardProps {
    campaign: Campaign;
    index?: number;
}

export function CampaignCard({ campaign, index = 0 }: CampaignCardProps) {
    const progress = campaign.stats.sent > 0
        ? Math.min((campaign.stats.delivered / campaign.stats.sent) * 100, 100)
        : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
        >
            <Card className="group hover:border-primary/50 transition-all duration-200">
                <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-lg">{campaign.name}</h3>
                                <CampaignStatusBadge status={campaign.status} />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Created: {formatDate(campaign.createdAt)} • From: {campaign.fromDomain}
                            </p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                            <Send className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">
                                    {formatNumber(campaign.stats.sent)}
                                </p>
                                <p className="text-xs text-muted-foreground">Sent</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">
                                    {formatNumber(campaign.stats.opened)}{" "}
                                    <span className="text-xs text-muted-foreground">
                                        ({formatPercentage(campaign.stats.opened, campaign.stats.delivered)})
                                    </span>
                                </p>
                                <p className="text-xs text-muted-foreground">Opened</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">
                                    {formatNumber(campaign.stats.replied)}{" "}
                                    <span className="text-xs text-muted-foreground">
                                        ({formatPercentage(campaign.stats.replied, campaign.stats.opened)})
                                    </span>
                                </p>
                                <p className="text-xs text-muted-foreground">Replied</p>
                            </div>
                        </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="flex-1"
                        >
                            <Link href={`/dashboard/campaigns/${campaign.id}`}>
                                View Analytics
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="flex-1"
                        >
                            <Link href={`/dashboard/campaigns/${campaign.id}?tab=inbox`}>
                                Manage Replies
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
