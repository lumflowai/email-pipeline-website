"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
    type EmailCampaign,
    type EmailReply,
    getLeadLists,
    getCampaigns,
    saveCampaign,
    createCampaign,
    getReplies,
    saveReply,
    generateMockReplies,
} from "@/lib/email-utils";
import {
    Mail,
    Send,
    Inbox,
    History,
    ChevronDown,
    ChevronUp,
    Plug,
    ExternalLink,
    Play,
    Pause,
    Eye,
    Star,
    Check,
    Clock,
    AlertCircle,
    Loader2,
    X,
    MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function EmailPage() {
    // Form state
    const [campaignName, setCampaignName] = useState("");
    const [selectedLeadList, setSelectedLeadList] = useState("");
    const [template, setTemplate] = useState("");
    const [subject, setSubject] = useState("");
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [emailsPerDay, setEmailsPerDay] = useState([50]);
    const [delayMinutes, setDelayMinutes] = useState([2]);
    const [trackOpens, setTrackOpens] = useState(true);

    // Data state
    const [leadLists, setLeadLists] = useState<ReturnType<typeof getLeadLists>>([]);
    const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
    const [replies, setReplies] = useState<EmailReply[]>([]);
    const [isInstantlyConnected, setIsInstantlyConnected] = useState(false);
    const [isLaunching, setIsLaunching] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [selectedReply, setSelectedReply] = useState<EmailReply | null>(null);

    // Load data
    useEffect(() => {
        setLeadLists(getLeadLists());
        setCampaigns(getCampaigns());
        setReplies(getReplies());

        // Check if "connected" (mock)
        const connected = localStorage.getItem("instantly_connected") === "true";
        setIsInstantlyConnected(connected);
    }, []);

    // Get selected lead list details
    const selectedList = leadLists.find((l) => l.id === selectedLeadList);

    // Personalization tokens
    const tokens = ["{{firstName}}", "{{businessName}}", "{{city}}", "{{rating}}", "{{website}}"];

    const insertToken = (token: string) => {
        setTemplate((prev) => prev + token);
    };

    // Connect Instantly (mock)
    const handleConnectInstantly = () => {
        localStorage.setItem("instantly_connected", "true");
        setIsInstantlyConnected(true);
    };

    // Launch campaign
    const handleLaunch = () => {
        if (!campaignName || !selectedLeadList || !template || !subject) return;

        setIsLaunching(true);

        setTimeout(() => {
            const campaign = createCampaign(
                campaignName,
                selectedLeadList,
                selectedList?.name || "",
                selectedList?.leads || 0,
                template,
                subject,
                emailsPerDay[0],
                delayMinutes[0]
            );
            campaign.status = "sending";
            campaign.startedAt = new Date().toISOString();
            campaign.stats.sent = Math.floor((selectedList?.leads || 0) * 0.3);
            campaign.stats.opened = Math.floor(campaign.stats.sent * 0.2);
            campaign.stats.replied = Math.floor(campaign.stats.sent * 0.03);
            campaign.stats.clicked = Math.floor(campaign.stats.sent * 0.08);

            saveCampaign(campaign);
            setCampaigns(getCampaigns());

            // Generate mock replies
            const mockReplies = generateMockReplies(campaign.id, 5);
            mockReplies.forEach((r) => saveReply(r));
            setReplies(getReplies());

            // Reset form
            setCampaignName("");
            setSelectedLeadList("");
            setTemplate("");
            setSubject("");
            setIsLaunching(false);
        }, 2000);
    };

    // Toggle campaign status
    const toggleCampaignStatus = (campaign: EmailCampaign) => {
        campaign.status = campaign.status === "sending" ? "paused" : "sending";
        saveCampaign(campaign);
        setCampaigns(getCampaigns());
    };

    // Mark reply as read/starred
    const toggleReplyStatus = (reply: EmailReply, status: "read" | "starred") => {
        reply.status = reply.status === status ? "read" : status;
        saveReply(reply);
        setReplies(getReplies());
    };

    const activeCampaigns = campaigns.filter((c) => c.status === "sending" || c.status === "paused");
    const completedCampaigns = campaigns.filter((c) => c.status === "completed" || c.status === "stopped");
    const newReplies = replies.filter((r) => r.status === "new");

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">Email Campaigns</h1>
                <p className="mt-1 text-slate-400">
                    Send personalized cold emails at scale
                </p>
            </div>

            {/* Main Content */}
            <div className="grid gap-8 lg:grid-cols-5">
                {/* Left Column - Form */}
                <div className="lg:col-span-2">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="sticky top-8"
                    >
                        <SpotlightCard className="p-6">
                            {/* Header */}
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold text-white">
                                    Launch Email Campaign
                                </h2>
                                <p className="mt-1 text-sm text-slate-400">
                                    Send personalized cold emails at scale
                                </p>
                                <div className={cn(
                                    "mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1",
                                    isInstantlyConnected ? "bg-green-500/10" : "bg-yellow-500/10"
                                )}>
                                    <div className={cn(
                                        "h-2 w-2 rounded-full",
                                        isInstantlyConnected ? "bg-green-400" : "bg-yellow-400"
                                    )} />
                                    <span className={cn(
                                        "text-xs font-medium",
                                        isInstantlyConnected ? "text-green-300" : "text-yellow-300"
                                    )}>
                                        {isInstantlyConnected ? "Instantly Connected" : "Connect Instantly Account"}
                                    </span>
                                </div>
                            </div>

                            {!isInstantlyConnected ? (
                                // Not connected state
                                <div className="flex flex-col items-center py-12 text-center">
                                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800/50">
                                        <Plug className="h-8 w-8 text-slate-500" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-white">
                                        Connect Your Instantly Account
                                    </h3>
                                    <p className="mt-2 max-w-xs text-sm text-slate-400">
                                        Lumflow integrates with Instantly to send emails from your own domains.
                                    </p>
                                    <Button
                                        onClick={handleConnectInstantly}
                                        className="mt-6 gradient-primary text-white"
                                    >
                                        <Plug className="mr-2 h-4 w-4" />
                                        Connect Instantly
                                    </Button>
                                    <a
                                        href="https://instantly.ai"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-3 flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300"
                                    >
                                        Don&apos;t have Instantly? Sign up here
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                </div>
                            ) : (
                                // Connected - show form
                                <div className="space-y-6">
                                    {/* Campaign Name */}
                                    <div className="space-y-2">
                                        <Label className="text-slate-300">Campaign Name</Label>
                                        <Input
                                            placeholder="NYC Restaurants Outreach - Jan 2025"
                                            value={campaignName}
                                            onChange={(e) => setCampaignName(e.target.value)}
                                            className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                                        />
                                        <p className="text-xs text-slate-500">Internal name for tracking</p>
                                    </div>

                                    {/* Lead List */}
                                    <div className="space-y-2">
                                        <Label className="text-slate-300">Send To</Label>
                                        <select
                                            value={selectedLeadList}
                                            onChange={(e) => setSelectedLeadList(e.target.value)}
                                            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
                                        >
                                            <option value="">Select a lead list...</option>
                                            {leadLists.map((list) => (
                                                <option key={list.id} value={list.id}>
                                                    {list.name} ({list.leads} leads) - {list.date}
                                                </option>
                                            ))}
                                        </select>
                                        {leadLists.length === 0 && (
                                            <p className="text-xs text-yellow-400">
                                                No lead lists available. Run a scrape first!
                                            </p>
                                        )}
                                    </div>

                                    {/* Subject Line */}
                                    <div className="space-y-2">
                                        <Label className="text-slate-300">Subject Line</Label>
                                        <Input
                                            placeholder="Quick question about {{businessName}}"
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                                        />
                                    </div>

                                    {/* Email Template */}
                                    <div className="space-y-2">
                                        <Label className="text-slate-300">Email Template</Label>
                                        <textarea
                                            placeholder={`Hi {{firstName}},\n\nI noticed {{businessName}} has great reviews in {{city}}...`}
                                            value={template}
                                            onChange={(e) => setTemplate(e.target.value)}
                                            rows={8}
                                            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-500"
                                        />
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs text-slate-500">
                                                Use personalization tokens below
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {template.length} / 500
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {tokens.map((token) => (
                                                <button
                                                    key={token}
                                                    onClick={() => insertToken(token)}
                                                    className="rounded-full bg-purple-500/10 px-2 py-1 text-xs text-purple-300 hover:bg-purple-500/20"
                                                >
                                                    {token}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Advanced Settings */}
                                    <div className="border-t border-white/5 pt-4">
                                        <button
                                            className="flex w-full items-center justify-between text-sm text-slate-400 hover:text-white"
                                            onClick={() => setShowAdvanced(!showAdvanced)}
                                        >
                                            <span>Advanced Settings</span>
                                            {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                        </button>

                                        <AnimatePresence>
                                            {showAdvanced && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="mt-4 space-y-4">
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between">
                                                                <Label className="text-slate-400 text-sm">Emails per day</Label>
                                                                <span className="text-sm text-white">{emailsPerDay[0]}</span>
                                                            </div>
                                                            <Slider
                                                                value={emailsPerDay}
                                                                onValueChange={setEmailsPerDay}
                                                                min={10}
                                                                max={500}
                                                                step={10}
                                                                className="[&>span:first-child]:bg-slate-700"
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <div className="flex justify-between">
                                                                <Label className="text-slate-400 text-sm">Delay between emails</Label>
                                                                <span className="text-sm text-white">{delayMinutes[0]} min</span>
                                                            </div>
                                                            <Slider
                                                                value={delayMinutes}
                                                                onValueChange={setDelayMinutes}
                                                                min={1}
                                                                max={10}
                                                                step={1}
                                                                className="[&>span:first-child]:bg-slate-700"
                                                            />
                                                        </div>

                                                        <div className="flex items-center justify-between">
                                                            <Label className="text-slate-400 text-sm">Track opens & clicks</Label>
                                                            <Switch
                                                                checked={trackOpens}
                                                                onCheckedChange={setTrackOpens}
                                                            />
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3">
                                        <Button
                                            variant="ghost"
                                            onClick={() => setShowPreview(true)}
                                            className="flex-1 border border-white/10 text-slate-300"
                                            disabled={!template}
                                        >
                                            <Eye className="mr-2 h-4 w-4" />
                                            Preview
                                        </Button>
                                        <Button
                                            onClick={handleLaunch}
                                            className="flex-1 gradient-primary text-white"
                                            disabled={!campaignName || !selectedLeadList || !template || !subject || isLaunching}
                                        >
                                            {isLaunching ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : (
                                                <Send className="mr-2 h-4 w-4" />
                                            )}
                                            {isLaunching ? "Launching..." : "Launch Campaign"}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </SpotlightCard>
                    </motion.div>
                </div>

                {/* Right Column - Campaigns & Inbox */}
                <div className="lg:col-span-3">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <SpotlightCard className="p-6">
                            <Tabs defaultValue="active" className="w-full">
                                <TabsList className="mb-6 w-full bg-slate-800/50">
                                    <TabsTrigger
                                        value="active"
                                        className="flex-1 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300"
                                    >
                                        Active Campaigns
                                        {activeCampaigns.length > 0 && (
                                            <span className="ml-2 rounded-full bg-purple-500/30 px-2 py-0.5 text-xs">
                                                {activeCampaigns.length}
                                            </span>
                                        )}
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="inbox"
                                        className="flex-1 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300"
                                    >
                                        Inbox
                                        {newReplies.length > 0 && (
                                            <span className="ml-2 rounded-full bg-green-500/30 px-2 py-0.5 text-xs text-green-300">
                                                {newReplies.length}
                                            </span>
                                        )}
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="history"
                                        className="flex-1 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300"
                                    >
                                        History
                                    </TabsTrigger>
                                </TabsList>

                                {/* Active Campaigns */}
                                <TabsContent value="active">
                                    {activeCampaigns.length === 0 ? (
                                        <div className="flex flex-col items-center py-16 text-center">
                                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800/50">
                                                <Mail className="h-8 w-8 text-slate-500" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-white">No Active Campaigns</h3>
                                            <p className="mt-2 text-sm text-slate-400">
                                                Create your first email campaign to start generating replies.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {activeCampaigns.map((campaign) => (
                                                <motion.div
                                                    key={campaign.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    whileHover={{ y: -4 }}
                                                    className="rounded-xl bg-slate-800/30 p-4"
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <h3 className="font-medium text-white">{campaign.name}</h3>
                                                                <span className={cn(
                                                                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs",
                                                                    campaign.status === "sending" ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"
                                                                )}>
                                                                    {campaign.status === "sending" ? "🟢 Sending" : "⏸️ Paused"}
                                                                </span>
                                                            </div>
                                                            <p className="mt-1 text-sm text-slate-400">{campaign.leadListName}</p>

                                                            {/* Progress */}
                                                            <div className="mt-3">
                                                                <div className="mb-1 flex justify-between text-xs">
                                                                    <span className="text-slate-400">
                                                                        {campaign.stats.sent} / {campaign.totalLeads} sent
                                                                    </span>
                                                                    <span className="text-purple-400">
                                                                        {Math.round((campaign.stats.sent / campaign.totalLeads) * 100)}%
                                                                    </span>
                                                                </div>
                                                                <div className="h-2 overflow-hidden rounded-full bg-slate-700">
                                                                    <div
                                                                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                                                                        style={{ width: `${(campaign.stats.sent / campaign.totalLeads) * 100}%` }}
                                                                    />
                                                                </div>
                                                            </div>

                                                            {/* Stats */}
                                                            <div className="mt-3 flex flex-wrap gap-4 text-sm">
                                                                <span className="text-slate-400">📧 {campaign.stats.sent} sent</span>
                                                                <span className="text-slate-400">
                                                                    ✅ {campaign.stats.opened} opened ({campaign.stats.sent > 0 ? Math.round((campaign.stats.opened / campaign.stats.sent) * 100) : 0}%)
                                                                </span>
                                                                <span className="text-slate-400">
                                                                    💬 {campaign.stats.replied} replied ({campaign.stats.sent > 0 ? Math.round((campaign.stats.replied / campaign.stats.sent) * 100) : 0}%)
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => toggleCampaignStatus(campaign)}
                                                            className={cn(
                                                                campaign.status === "sending"
                                                                    ? "text-yellow-400 hover:bg-yellow-500/10"
                                                                    : "text-green-400 hover:bg-green-500/10"
                                                            )}
                                                        >
                                                            {campaign.status === "sending" ? (
                                                                <><Pause className="mr-1 h-4 w-4" /> Pause</>
                                                            ) : (
                                                                <><Play className="mr-1 h-4 w-4" /> Resume</>
                                                            )}
                                                        </Button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </TabsContent>

                                {/* Inbox */}
                                <TabsContent value="inbox">
                                    {replies.length === 0 ? (
                                        <div className="flex flex-col items-center py-16 text-center">
                                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800/50">
                                                <Inbox className="h-8 w-8 text-slate-500" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-white">No Replies Yet</h3>
                                            <p className="mt-2 text-sm text-slate-400">
                                                When people reply to your campaigns, they&apos;ll show up here.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {replies.map((reply) => (
                                                <motion.div
                                                    key={reply.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    whileHover={{ scale: 1.01 }}
                                                    className={cn(
                                                        "cursor-pointer rounded-xl p-4 transition-colors",
                                                        reply.status === "new" ? "bg-purple-500/10" : "bg-slate-800/30",
                                                        "hover:bg-slate-700/30"
                                                    )}
                                                    onClick={() => setSelectedReply(reply)}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium text-white">{reply.from.name}</span>
                                                                <span className="text-sm text-slate-500">{reply.from.email}</span>
                                                                {reply.status === "new" && (
                                                                    <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400">New</span>
                                                                )}
                                                                {reply.status === "starred" && (
                                                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                                )}
                                                            </div>
                                                            <p className="mt-1 text-sm font-medium text-slate-300">{reply.subject}</p>
                                                            <p className="mt-1 text-sm text-slate-400 line-clamp-1">{reply.preview}</p>
                                                        </div>
                                                        <span className="text-xs text-slate-500">
                                                            {new Date(reply.receivedAt).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </TabsContent>

                                {/* History */}
                                <TabsContent value="history">
                                    {completedCampaigns.length === 0 ? (
                                        <div className="flex flex-col items-center py-16 text-center">
                                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800/50">
                                                <History className="h-8 w-8 text-slate-500" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-white">No Past Campaigns</h3>
                                            <p className="mt-2 text-sm text-slate-400">
                                                Completed campaigns will appear here.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {completedCampaigns.map((campaign) => (
                                                <div
                                                    key={campaign.id}
                                                    className="rounded-xl bg-slate-800/30 p-4 opacity-70"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <h3 className="font-medium text-white">{campaign.name}</h3>
                                                            <p className="text-sm text-slate-400">
                                                                {campaign.stats.sent} sent • {campaign.stats.opened} opened • {campaign.stats.replied} replied
                                                            </p>
                                                        </div>
                                                        <span className="text-sm text-slate-500">
                                                            {new Date(campaign.completedAt || campaign.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </SpotlightCard>
                    </motion.div>
                </div>
            </div>

            {/* Reply Modal */}
            <AnimatePresence>
                {selectedReply && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                        onClick={() => setSelectedReply(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-2xl rounded-2xl bg-slate-900 p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-white">{selectedReply.from.name}</h3>
                                    <p className="text-sm text-slate-400">{selectedReply.from.email}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedReply(null)}
                                    className="text-slate-400 hover:text-white"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="mt-4 rounded-xl bg-slate-800/50 p-4">
                                <p className="text-sm font-medium text-slate-300">{selectedReply.subject}</p>
                                <p className="mt-3 text-slate-300">{selectedReply.fullContent}</p>
                                <p className="mt-3 text-xs text-slate-500">
                                    Received {new Date(selectedReply.receivedAt).toLocaleString()}
                                </p>
                            </div>

                            <div className="mt-6 flex gap-3">
                                <Button
                                    onClick={() => {
                                        toggleReplyStatus(selectedReply, "starred");
                                        setSelectedReply(null);
                                    }}
                                    variant="ghost"
                                    className="border border-white/10 text-slate-300"
                                >
                                    <Star className="mr-2 h-4 w-4" />
                                    {selectedReply.status === "starred" ? "Unstar" : "Star"}
                                </Button>
                                <Button
                                    className="flex-1 gradient-primary text-white"
                                    onClick={() => window.open("https://instantly.ai", "_blank")}
                                >
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    Reply in Instantly
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Preview Modal */}
            <AnimatePresence>
                {showPreview && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                        onClick={() => setShowPreview(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-2xl rounded-2xl bg-slate-900 p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-white">Email Preview</h3>
                                <button onClick={() => setShowPreview(false)} className="text-slate-400 hover:text-white">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="mt-4 rounded-xl bg-white p-6 text-black">
                                <p className="border-b pb-2 text-sm">
                                    <span className="font-medium">Subject:</span>{" "}
                                    {subject.replace(/\{\{(\w+)\}\}/g, (_, key) => {
                                        const examples: Record<string, string> = { firstName: "Joe", businessName: "Joe's Pizza", city: "New York" };
                                        return examples[key] || `[${key}]`;
                                    })}
                                </p>
                                <div className="mt-4 whitespace-pre-wrap text-sm">
                                    {template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
                                        const examples: Record<string, string> = { firstName: "Joe", businessName: "Joe's Pizza", city: "New York", rating: "4.5", website: "joespizza.com" };
                                        return examples[key] || `[${key}]`;
                                    })}
                                </div>
                            </div>

                            <Button
                                onClick={() => setShowPreview(false)}
                                className="mt-4 w-full gradient-primary text-white"
                            >
                                Looks Good!
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
