"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Pause, Copy, Trash2, Search, Mail, CheckCircle2, Circle, SmilePlus, Meh, Frown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CampaignStatusBadge } from "@/components/campaigns/CampaignStatusBadge";
import { MetricCard } from "@/components/campaigns/MetricCard";
import { ActivityFeed } from "@/components/campaigns/ActivityFeed";
import { getMockCampaignById, generateMockActivity, generateMockLeads, generateMockInboxReplies, type InboxReply } from "@/lib/campaigns/mock-data";
import { formatNumber, formatPercentage, formatDate, getCampaignHealth, getHealthColor, formatRelativeTime } from "@/lib/campaigns/utils";
import { Eye, Send, MessageSquare, Ban } from "lucide-react";
import type { Campaign, CampaignActivity, CampaignLead } from "@/lib/campaigns/types";
import { cn } from "@/lib/utils";

interface CampaignDetailPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function CampaignDetailPage({ params }: CampaignDetailPageProps) {
    // Unwrap the params Promise using React.use()
    const { id } = use(params);

    const router = useRouter();
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [activities, setActivities] = useState<CampaignActivity[]>([]);
    const [leads, setLeads] = useState<CampaignLead[]>([]);
    const [inboxReplies, setInboxReplies] = useState<InboxReply[]>([]);
    const [loading, setLoading] = useState(true);
    const [leadsFilter, setLeadsFilter] = useState<string>("all");
    const [leadsSearch, setLeadsSearch] = useState("");

    useEffect(() => {
        // Load campaign data
        setTimeout(() => {
            const campaignData = getMockCampaignById(id);
            if (campaignData) {
                setCampaign(campaignData);
                setActivities(generateMockActivity(id, 14));
                setLeads(generateMockLeads(50));
                setInboxReplies(generateMockInboxReplies(id, 10));
            }
            setLoading(false);
        }, 600);
    }, [id]);

    if (loading) {
        return (
            <div className="flex-1 space-y-6 p-8 pt-6">
                <div className="h-12 bg-secondary/50 animate-pulse rounded-lg w-1/3" />
                <div className="grid gap-4 md:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-32 bg-secondary/50 animate-pulse rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }

    if (!campaign) {
        return (
            <div className="flex-1 space-y-6 p-8 pt-6">
                <Button variant="ghost" onClick={() => router.push("/dashboard/campaigns")}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Campaigns
                </Button>
                <div className="text-center py-12">
                    <p className="text-muted-foreground">Campaign not found</p>
                </div>
            </div>
        );
    }

    const healthScore = getCampaignHealth(campaign.stats);

    // Filter leads
    const filteredLeads = leads.filter(lead => {
        const matchesFilter = leadsFilter === "all" || lead.status === leadsFilter;
        const matchesSearch = !leadsSearch ||
            lead.businessName.toLowerCase().includes(leadsSearch.toLowerCase()) ||
            lead.contactName.toLowerCase().includes(leadsSearch.toLowerCase()) ||
            lead.email.toLowerCase().includes(leadsSearch.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push("/dashboard/campaigns")}
                        className="mb-2 -ml-2"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight">
                            {campaign.name}
                        </h1>
                        <CampaignStatusBadge status={campaign.status} />
                    </div>
                    <p className="text-muted-foreground">
                        Created {formatDate(campaign.createdAt)} • From: {campaign.fromDomain}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {campaign.status === 'active' ? (
                        <Button variant="outline" size="sm">
                            <Pause className="h-4 w-4 mr-2" />
                            Pause
                        </Button>
                    ) : campaign.status === 'paused' ? (
                        <Button variant="outline" size="sm">
                            <Play className="h-4 w-4 mr-2" />
                            Resume
                        </Button>
                    ) : null}
                    <Button variant="outline" size="sm">
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="mt-6">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="emails">Emails</TabsTrigger>
                    <TabsTrigger value="leads">Leads</TabsTrigger>
                    <TabsTrigger value="inbox">Inbox ({inboxReplies.filter(r => !r.isRead).length})</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6 mt-6">
                    {/* Metrics Grid */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <MetricCard
                            title="Sent"
                            value={formatNumber(campaign.stats.sent)}
                            icon={Send}
                            trend={`${formatPercentage(campaign.stats.delivered, campaign.stats.sent)} delivered`}
                        />
                        <MetricCard
                            title="Opened"
                            value={formatNumber(campaign.stats.opened)}
                            icon={Eye}
                            trend={formatPercentage(campaign.stats.opened, campaign.stats.delivered)}
                        />
                        <MetricCard
                            title="Replied"
                            value={formatNumber(campaign.stats.replied)}
                            icon={MessageSquare}
                            trend={formatPercentage(campaign.stats.replied, campaign.stats.opened)}
                        />
                        <MetricCard
                            title="Bounced"
                            value={formatNumber(campaign.stats.bounced)}
                            icon={Ban}
                            trend={formatPercentage(campaign.stats.bounced, campaign.stats.sent)}
                        />
                    </div>

                    {/* Health Score & Activity */}
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Health Score Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Campaign Health</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-center py-8">
                                    <div className="relative">
                                        <svg className="w-32 h-32 -rotate-90">
                                            <circle
                                                cx="64"
                                                cy="64"
                                                r="56"
                                                stroke="currentColor"
                                                strokeWidth="8"
                                                fill="none"
                                                className="text-secondary"
                                            />
                                            <motion.circle
                                                cx="64"
                                                cy="64"
                                                r="56"
                                                stroke="currentColor"
                                                strokeWidth="8"
                                                fill="none"
                                                strokeDasharray={`${2 * Math.PI * 56}`}
                                                strokeDashoffset={`${2 * Math.PI * 56 * (1 - healthScore / 100)}`}
                                                strokeLinecap="round"
                                                className={getHealthColor(healthScore)}
                                                initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                                                animate={{ strokeDashoffset: 2 * Math.PI * 56 * (1 - healthScore / 100) }}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <motion.span
                                                className={`text-4xl font-bold ${getHealthColor(healthScore)}`}
                                                initial={{ opacity: 0, scale: 0 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ duration: 0.5, delay: 0.3 }}
                                            >
                                                {healthScore}
                                            </motion.span>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Delivery Rate</p>
                                        <p className="font-semibold">
                                            {formatPercentage(campaign.stats.delivered, campaign.stats.sent)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Open Rate</p>
                                        <p className="font-semibold">
                                            {formatPercentage(campaign.stats.opened, campaign.stats.delivered)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Reply Rate</p>
                                        <p className="font-semibold">
                                            {formatPercentage(campaign.stats.replied, campaign.stats.opened)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Bounce Rate</p>
                                        <p className="font-semibold">
                                            {formatPercentage(campaign.stats.bounced, campaign.stats.sent)}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Activity Feed */}
                        <ActivityFeed activities={activities.slice(0, 10)} maxHeight="400px" />
                    </div>

                    {/* Email Sequence */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Email Sequence</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {campaign.emails.map((email, index) => (
                                <div key={email.id} className="border rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                                            {index + 1}
                                        </span>
                                        <span className="font-semibold">{email.subject}</span>
                                        {email.delayDays > 0 && (
                                            <span className="text-xs text-muted-foreground">
                                                (Send {email.delayDays} day{email.delayDays > 1 ? 's' : ''} after{' '}
                                                {email.conditionNoReply ? 'if no reply' : 'previous'})
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                                        {email.body.slice(0, 200)}
                                        {email.body.length > 200 && '...'}
                                    </p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Emails Tab */}
                <TabsContent value="emails" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Email Performance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">#</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Subject</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Sent</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Opened</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Clicked</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Replied</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {campaign.emails.map((email, index) => {
                                            // Calculate proportional stats for each email
                                            const emailSent = index === 0 ? campaign.stats.sent : Math.floor(campaign.stats.sent * 0.6);
                                            const emailOpened = Math.floor(emailSent * 0.4);
                                            const emailClicked = Math.floor(emailOpened * 0.1);
                                            const emailReplied = Math.floor(emailOpened * 0.05);

                                            return (
                                                <tr key={email.id} className="border-b hover:bg-muted/50 transition-colors">
                                                    <td className="py-3 px-4">
                                                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                                                            {index + 1}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 font-medium">{email.subject}</td>
                                                    <td className="py-3 px-4 text-right">{formatNumber(emailSent)}</td>
                                                    <td className="py-3 px-4 text-right">
                                                        {formatNumber(emailOpened)}
                                                        <span className="text-xs text-muted-foreground ml-1">
                                                            ({formatPercentage(emailOpened, emailSent)})
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        {formatNumber(emailClicked)}
                                                        <span className="text-xs text-muted-foreground ml-1">
                                                            ({formatPercentage(emailClicked, emailOpened)})
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        {formatNumber(emailReplied)}
                                                        <span className="text-xs text-muted-foreground ml-1">
                                                            ({formatPercentage(emailReplied, emailOpened)})
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Leads Tab */}
                <TabsContent value="leads" className="mt-6 space-y-4">
                    {/* Filters */}
                    <Card>
                        <CardContent className="py-4">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant={leadsFilter === "all" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setLeadsFilter("all")}
                                    >
                                        All ({leads.length})
                                    </Button>
                                    <Button
                                        variant={leadsFilter === "sent" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setLeadsFilter("sent")}
                                    >
                                        Sent ({leads.filter(l => l.status === "sent").length})
                                    </Button>
                                    <Button
                                        variant={leadsFilter === "opened" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setLeadsFilter("opened")}
                                    >
                                        Opened ({leads.filter(l => l.status === "opened").length})
                                    </Button>
                                    <Button
                                        variant={leadsFilter === "replied" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setLeadsFilter("replied")}
                                    >
                                        Replied ({leads.filter(l => l.status === "replied").length})
                                    </Button>
                                    <Button
                                        variant={leadsFilter === "bounced" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setLeadsFilter("bounced")}
                                    >
                                        Bounced ({leads.filter(l => l.status === "bounced").length})
                                    </Button>
                                </div>
                                <div className="relative w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search leads..."
                                        value={leadsSearch}
                                        onChange={(e) => setLeadsSearch(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Leads Table */}
                    <Card>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Business</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Contact</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Opens</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Last Activity</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredLeads.map((lead) => (
                                            <tr key={lead.id} className="border-b hover:bg-muted/50 transition-colors">
                                                <td className="py-3 px-4 font-medium">{lead.businessName}</td>
                                                <td className="py-3 px-4 text-sm">{lead.contactName}</td>
                                                <td className="py-3 px-4 text-sm text-muted-foreground">{lead.email}</td>
                                                <td className="py-3 px-4">
                                                    <span className={cn(
                                                        "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                                                        lead.status === "replied" && "bg-green-500/10 text-green-500",
                                                        lead.status === "opened" && "bg-blue-500/10 text-blue-500",
                                                        lead.status === "sent" && "bg-purple-500/10 text-purple-500",
                                                        lead.status === "bounced" && "bg-red-500/10 text-red-500",
                                                        lead.status === "pending" && "bg-muted text-muted-foreground"
                                                    )}>
                                                        {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-right text-sm">{lead.openCount}</td>
                                                <td className="py-3 px-4 text-sm text-muted-foreground">
                                                    {lead.lastActivity ? formatRelativeTime(lead.lastActivity) : "-"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {filteredLeads.length === 0 && (
                                <div className="py-12 text-center">
                                    <p className="text-muted-foreground">No leads found matching your filters</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Inbox Tab */}
                <TabsContent value="inbox" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Inbox Replies</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {inboxReplies.map((reply) => (
                                <div
                                    key={reply.id}
                                    className={cn(
                                        "border rounded-lg p-4 transition-colors hover:bg-muted/50",
                                        !reply.isRead && "bg-primary/5 border-primary/20"
                                    )}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            {reply.isRead ? (
                                                <Mail className="h-4 w-4 text-muted-foreground" />
                                            ) : (
                                                <Mail className="h-4 w-4 text-primary" />
                                            )}
                                            <div>
                                                <p className="font-medium">{reply.leadName}</p>
                                                <p className="text-xs text-muted-foreground">{reply.leadEmail}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {reply.sentiment === 'positive' && (
                                                <SmilePlus className="h-4 w-4 text-green-500" />
                                            )}
                                            {reply.sentiment === 'neutral' && (
                                                <Meh className="h-4 w-4 text-blue-500" />
                                            )}
                                            {reply.sentiment === 'negative' && (
                                                <Frown className="h-4 w-4 text-red-500" />
                                            )}
                                            <span className="text-xs text-muted-foreground">
                                                {formatRelativeTime(reply.receivedAt)}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="font-medium text-sm mb-1">{reply.subject}</p>
                                    <p className="text-sm text-muted-foreground">{reply.body}</p>
                                </div>
                            ))}
                            {inboxReplies.length === 0 && (
                                <div className="py-12 text-center">
                                    <p className="text-muted-foreground">No replies yet</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
