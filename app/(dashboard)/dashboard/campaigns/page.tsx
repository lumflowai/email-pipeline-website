"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Activity, Send, Eye, MessageSquare, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MetricCard } from "@/components/campaigns/MetricCard";
import { CampaignCard } from "@/components/campaigns/CampaignCard";
import Link from "next/link";
import { getMockCampaigns } from "@/lib/campaigns/mock-data";
import type { Campaign } from "@/lib/campaigns/types";
import { formatNumber, formatPercentage } from "@/lib/campaigns/utils";

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading campaigns
        setTimeout(() => {
            setCampaigns(getMockCampaigns());
            setLoading(false);
        }, 800);
    }, []);

    // Calculate overall stats
    const totalStats = campaigns.reduce(
        (acc, campaign) => ({
            sent: acc.sent + campaign.stats.sent,
            opened: acc.opened + campaign.stats.opened,
            replied: acc.replied + campaign.stats.replied,
            delivered: acc.delivered + campaign.stats.delivered,
        }),
        { sent: 0, opened: 0, replied: 0, delivered: 0 }
    );

    const activeCampaigns = campaigns.filter(c => c.status === 'active');
    const draftCampaigns = campaigns.filter(c => c.status === 'draft');
    const completedCampaigns = campaigns.filter(c => c.status === 'completed');
    const pausedCampaigns = campaigns.filter(c => c.status === 'paused');

    // Empty state
    if (!loading && campaigns.length === 0) {
        return (
            <div className="flex-1 space-y-6 p-8 pt-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Email Campaigns
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Create and manage automated email sequences
                        </p>
                    </div>
                </div>

                {/* Empty State */}
                <div className="flex items-center justify-center min-h-[600px]">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center space-y-6 max-w-md"
                    >
                        <div className="flex justify-center">
                            <div className="rounded-full bg-primary/10 p-6">
                                <Mail className="h-16 w-16 text-primary" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold">No Campaigns Yet</h2>
                            <p className="text-muted-foreground">
                                Create your first campaign to start generating replies from your scraped leads
                            </p>
                        </div>

                        {/* Benefits */}
                        <div className="grid gap-4 pt-4">
                            {[
                                { title: "Automated Outreach", desc: "Send personalized emails at scale" },
                                { title: "High Deliverability", desc: "Optimized sending patterns" },
                                { title: "Track Performance", desc: "Real-time analytics and insights" },
                            ].map((benefit, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 * i + 0.3 }}
                                    className="flex items-start gap-3 text-left p-4 rounded-lg bg-secondary/50 border border-border"
                                >
                                    <div className="rounded-lg bg-primary/10 p-2 mt-0.5">
                                        <Activity className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-sm">{benefit.title}</h3>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {benefit.desc}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <Button asChild size="lg" className="w-full">
                            <Link href="/dashboard/campaigns/new">
                                <Plus className="h-4 w-4 mr-2" />
                                Create Your First Campaign
                            </Link>
                        </Button>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Email Campaigns
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Create and manage automated email sequences
                    </p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/campaigns/new">
                        <Plus className="h-4 w-4 mr-2" />
                        New Campaign
                    </Link>
                </Button>
            </div>

            {/* Stats Grid */}
            {loading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-32 bg-secondary/50 animate-pulse rounded-lg" />
                    ))}
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <MetricCard
                        title="Active Campaigns"
                        value={activeCampaigns.length}
                        icon={Activity}
                        trend="+1 this week"
                        trendUp
                    />
                    <MetricCard
                        title="Total Sent"
                        value={formatNumber(totalStats.sent)}
                        icon={Send}
                        trend={`${formatPercentage(totalStats.delivered, totalStats.sent)} delivered`}
                    />
                    <MetricCard
                        title="Total Opened"
                        value={formatNumber(totalStats.opened)}
                        icon={Eye}
                        trend={formatPercentage(totalStats.opened, totalStats.delivered)}
                    />
                    <MetricCard
                        title="Total Replied"
                        value={formatNumber(totalStats.replied)}
                        icon={MessageSquare}
                        trend={formatPercentage(totalStats.replied, totalStats.opened)}
                    />
                </div>
            )}

            {/* Campaigns List with Tabs */}
            <Tabs defaultValue="active" className="mt-6">
                <TabsList>
                    <TabsTrigger value="active">
                        Active ({activeCampaigns.length})
                    </TabsTrigger>
                    <TabsTrigger value="drafts">
                        Drafts ({draftCampaigns.length})
                    </TabsTrigger>
                    <TabsTrigger value="completed">
                        Completed ({completedCampaigns.length})
                    </TabsTrigger>
                    <TabsTrigger value="paused">
                        Paused ({pausedCampaigns.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="mt-6">
                    {loading ? (
                        <div className="grid gap-4 md:grid-cols-2">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-64 bg-secondary/50 animate-pulse rounded-lg" />
                            ))}
                        </div>
                    ) : activeCampaigns.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2">
                            {activeCampaigns.map((campaign, index) => (
                                <CampaignCard key={campaign.id} campaign={campaign} index={index} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground py-12">
                            No active campaigns
                        </p>
                    )}
                </TabsContent>

                <TabsContent value="drafts" className="mt-6">
                    {draftCampaigns.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2">
                            {draftCampaigns.map((campaign, index) => (
                                <CampaignCard key={campaign.id} campaign={campaign} index={index} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground py-12">
                            No draft campaigns
                        </p>
                    )}
                </TabsContent>

                <TabsContent value="completed" className="mt-6">
                    {completedCampaigns.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2">
                            {completedCampaigns.map((campaign, index) => (
                                <CampaignCard key={campaign.id} campaign={campaign} index={index} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground py-12">
                            No completed campaigns
                        </p>
                    )}
                </TabsContent>

                <TabsContent value="paused" className="mt-6">
                    {pausedCampaigns.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2">
                            {pausedCampaigns.map((campaign, index) => (
                                <CampaignCard key={campaign.id} campaign={campaign} index={index} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground py-12">
                            No paused campaigns
                        </p>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
