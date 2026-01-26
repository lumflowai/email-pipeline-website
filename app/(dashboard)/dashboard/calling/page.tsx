"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    type CallCampaign,
    type CallLog,
    getPhoneLeadLists,
    getCallCampaigns,
    saveCallCampaign,
    createCallCampaign,
    getCallLogs,
    saveCallLog,
    generateMockCallLogs,
    formatDuration,
} from "@/lib/calling-utils";
import {
    Mic,
    Phone,
    PhoneCall,
    PhoneOff,
    History,
    ChevronDown,
    ChevronUp,
    Plug,
    ExternalLink,
    Play,
    Pause,
    CheckCircle2,
    XCircle,
    Clock,
    Voicemail,
    Loader2,
    X,
    Volume2,
    FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function CallingPage() {
    // Form state
    const [campaignName, setCampaignName] = useState("");
    const [selectedLeadList, setSelectedLeadList] = useState("");
    const [script, setScript] = useState("");
    const [objective, setObjective] = useState<"qualify" | "book" | "message" | "custom">("qualify");
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [voice, setVoice] = useState<"male" | "female">("female");
    const [speakingSpeed, setSpeakingSpeed] = useState([1.0]);
    const [callsPerDay, setCallsPerDay] = useState([50]);

    // Data state
    const [leadLists, setLeadLists] = useState<ReturnType<typeof getPhoneLeadLists>>([]);
    const [campaigns, setCampaigns] = useState<CallCampaign[]>([]);
    const [callLogs, setCallLogs] = useState<CallLog[]>([]);
    const [isBlandConnected, setIsBlandConnected] = useState(false);
    const [isStarting, setIsStarting] = useState(false);
    const [selectedLog, setSelectedLog] = useState<CallLog | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>("all");

    // Load data
    useEffect(() => {
        setLeadLists(getPhoneLeadLists());
        setCampaigns(getCallCampaigns());
        setCallLogs(getCallLogs());

        const connected = localStorage.getItem("bland_connected") === "true";
        setIsBlandConnected(connected);
    }, []);

    const selectedList = leadLists.find((l) => l.id === selectedLeadList);
    const activeCampaign = campaigns.find((c) => c.status === "calling" || c.status === "paused");
    const completedCampaigns = campaigns.filter((c) => c.status === "completed" || c.status === "stopped");

    const tokens = ["{{firstName}}", "{{businessName}}", "{{city}}"];

    const insertToken = (token: string) => {
        setScript((prev) => prev + token);
    };

    const handleConnectBland = () => {
        localStorage.setItem("bland_connected", "true");
        setIsBlandConnected(true);
    };

    const handleStartCampaign = () => {
        if (!campaignName || !selectedLeadList || !script) return;

        setIsStarting(true);

        setTimeout(() => {
            const campaign = createCallCampaign(
                campaignName,
                selectedLeadList,
                selectedList?.name || "",
                selectedList?.leads || 0,
                script,
                objective
            );
            campaign.status = "calling";
            campaign.startedAt = new Date().toISOString();
            campaign.callsMade = Math.floor((selectedList?.leads || 0) * 0.1);
            campaign.stats = {
                interested: Math.floor(campaign.callsMade * 0.25),
                notInterested: Math.floor(campaign.callsMade * 0.55),
                noAnswer: Math.floor(campaign.callsMade * 0.15),
                voicemail: Math.floor(campaign.callsMade * 0.05),
            };

            saveCallCampaign(campaign);
            setCampaigns(getCallCampaigns());

            // Generate mock call logs
            const mockLogs = generateMockCallLogs(campaign.id, 10);
            mockLogs.forEach((l) => saveCallLog(l));
            setCallLogs(getCallLogs());

            setCampaignName("");
            setSelectedLeadList("");
            setScript("");
            setIsStarting(false);
        }, 2000);
    };

    const toggleCampaignStatus = (campaign: CallCampaign) => {
        campaign.status = campaign.status === "calling" ? "paused" : "calling";
        saveCallCampaign(campaign);
        setCampaigns(getCallCampaigns());
    };

    const filteredLogs = filterStatus === "all"
        ? callLogs
        : callLogs.filter((l) => l.status === filterStatus);

    const getStatusIcon = (status: CallLog["status"]) => {
        switch (status) {
            case "interested":
                return <CheckCircle2 className="h-4 w-4 text-green-400" />;
            case "not_interested":
                return <XCircle className="h-4 w-4 text-red-400" />;
            case "no_answer":
                return <Phone className="h-4 w-4 text-slate-400" />;
            case "voicemail":
                return <Voicemail className="h-4 w-4 text-yellow-400" />;
        }
    };

    const getStatusLabel = (status: CallLog["status"]) => {
        switch (status) {
            case "interested":
                return "Interested";
            case "not_interested":
                return "Not Interested";
            case "no_answer":
                return "No Answer";
            case "voicemail":
                return "Voicemail";
        }
    };

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">AI Voice Calling</h1>
                <p className="mt-1 text-slate-400">
                    Let AI qualify leads and book meetings for you
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
                                    Schedule AI Calls
                                </h2>
                                <p className="mt-1 text-sm text-slate-400">
                                    AI caller that sounds human. Qualifies leads 24/7.
                                </p>
                                <div className={cn(
                                    "mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1",
                                    isBlandConnected ? "bg-green-500/10" : "bg-yellow-500/10"
                                )}>
                                    <div className={cn(
                                        "h-2 w-2 rounded-full",
                                        isBlandConnected ? "bg-green-400" : "bg-yellow-400"
                                    )} />
                                    <span className={cn(
                                        "text-xs font-medium",
                                        isBlandConnected ? "text-green-300" : "text-yellow-300"
                                    )}>
                                        {isBlandConnected ? "Bland AI Connected" : "Connect Bland AI"}
                                    </span>
                                </div>
                            </div>

                            {!isBlandConnected ? (
                                <div className="flex flex-col items-center py-12 text-center">
                                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800/50">
                                        <Mic className="h-8 w-8 text-slate-500" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-white">
                                        Connect Bland AI
                                    </h3>
                                    <p className="mt-2 max-w-xs text-sm text-slate-400">
                                        Lumflow uses Bland AI to power human-sounding voice calls.
                                    </p>
                                    <Button
                                        onClick={handleConnectBland}
                                        className="mt-6 gradient-primary text-white"
                                    >
                                        <Plug className="mr-2 h-4 w-4" />
                                        Connect Bland AI
                                    </Button>
                                    <a
                                        href="https://bland.ai"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-3 flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300"
                                    >
                                        Learn more about Bland AI
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Campaign Name */}
                                    <div className="space-y-2">
                                        <Label className="text-slate-300">Campaign Name</Label>
                                        <Input
                                            placeholder="NYC Restaurants Follow-up Calls"
                                            value={campaignName}
                                            onChange={(e) => setCampaignName(e.target.value)}
                                            className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                                        />
                                    </div>

                                    {/* Lead List */}
                                    <div className="space-y-2">
                                        <Label className="text-slate-300">Call These Leads</Label>
                                        <select
                                            value={selectedLeadList}
                                            onChange={(e) => setSelectedLeadList(e.target.value)}
                                            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
                                        >
                                            <option value="">Select leads with phone numbers...</option>
                                            {leadLists.map((list) => (
                                                <option key={list.id} value={list.id}>
                                                    {list.name} ({list.leads} phones) - {list.date}
                                                </option>
                                            ))}
                                        </select>
                                        {leadLists.length === 0 && (
                                            <p className="text-xs text-yellow-400">
                                                No leads with phones. Run a scrape first!
                                            </p>
                                        )}
                                    </div>

                                    {/* Call Script */}
                                    <div className="space-y-2">
                                        <Label className="text-slate-300">AI Caller Script</Label>
                                        <textarea
                                            placeholder={`Hi, is this {{firstName}} from {{businessName}}?\n\nI'm calling because we help restaurants like yours...`}
                                            value={script}
                                            onChange={(e) => setScript(e.target.value)}
                                            rows={10}
                                            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-500"
                                        />
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs text-slate-500">Use personalization tokens</p>
                                            <p className="text-xs text-slate-500">{script.length} / 1000</p>
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

                                    {/* Call Objective */}
                                    <div className="space-y-2">
                                        <Label className="text-slate-300">What should the AI accomplish?</Label>
                                        <div className="space-y-2">
                                            {[
                                                { value: "qualify", label: "Qualify lead (ask discovery questions)" },
                                                { value: "book", label: "Book a meeting (schedule on calendar)" },
                                                { value: "message", label: "Deliver a message (just inform them)" },
                                                { value: "custom", label: "Custom (define in script)" },
                                            ].map((opt) => (
                                                <label
                                                    key={opt.value}
                                                    className={cn(
                                                        "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors",
                                                        objective === opt.value
                                                            ? "border-purple-500 bg-purple-500/10"
                                                            : "border-white/10 hover:bg-white/5"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "flex h-4 w-4 items-center justify-center rounded-full border",
                                                        objective === opt.value
                                                            ? "border-purple-500 bg-purple-500"
                                                            : "border-white/30"
                                                    )}>
                                                        {objective === opt.value && (
                                                            <div className="h-2 w-2 rounded-full bg-white" />
                                                        )}
                                                    </div>
                                                    <span className="text-sm text-slate-300">{opt.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Advanced Settings */}
                                    <div className="border-t border-white/5 pt-4">
                                        <button
                                            className="flex w-full items-center justify-between text-sm text-slate-400 hover:text-white"
                                            onClick={() => setShowAdvanced(!showAdvanced)}
                                        >
                                            <span>Voice & Timing Settings</span>
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
                                                            <Label className="text-slate-400 text-sm">Voice</Label>
                                                            <select
                                                                value={voice}
                                                                onChange={(e) => setVoice(e.target.value as "male" | "female")}
                                                                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
                                                            >
                                                                <option value="female">Female (Rachel)</option>
                                                                <option value="male">Male (James)</option>
                                                            </select>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <div className="flex justify-between">
                                                                <Label className="text-slate-400 text-sm">Speaking speed</Label>
                                                                <span className="text-sm text-white">{speakingSpeed[0]}x</span>
                                                            </div>
                                                            <Slider
                                                                value={speakingSpeed}
                                                                onValueChange={setSpeakingSpeed}
                                                                min={0.8}
                                                                max={1.5}
                                                                step={0.1}
                                                                className="[&>span:first-child]:bg-slate-700"
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <div className="flex justify-between">
                                                                <Label className="text-slate-400 text-sm">Calls per day</Label>
                                                                <span className="text-sm text-white">{callsPerDay[0]}</span>
                                                            </div>
                                                            <Slider
                                                                value={callsPerDay}
                                                                onValueChange={setCallsPerDay}
                                                                min={10}
                                                                max={200}
                                                                step={10}
                                                                className="[&>span:first-child]:bg-slate-700"
                                                            />
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Action Button */}
                                    <Button
                                        onClick={handleStartCampaign}
                                        className="w-full gradient-primary py-6 text-white"
                                        disabled={!campaignName || !selectedLeadList || !script || isStarting}
                                    >
                                        {isStarting ? (
                                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Starting...</>
                                        ) : (
                                            <><PhoneCall className="mr-2 h-4 w-4" /> Start Calling</>
                                        )}
                                    </Button>

                                    {/* Cost Estimate */}
                                    {selectedList && (
                                        <div className="rounded-xl bg-slate-800/30 p-4 text-sm">
                                            <p className="text-slate-400">
                                                <span className="text-white font-medium">{selectedList.leads}</span> calls at ~$0.09/min
                                            </p>
                                            <p className="mt-1 text-slate-500">
                                                Est. duration: {Math.ceil(selectedList.leads / callsPerDay[0])} days
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </SpotlightCard>
                    </motion.div>
                </div>

                {/* Right Column - Call Logs */}
                <div className="lg:col-span-3">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <SpotlightCard className="p-6">
                            <Tabs defaultValue="live" className="w-full">
                                <TabsList className="mb-6 w-full bg-slate-800/50">
                                    <TabsTrigger
                                        value="live"
                                        className="flex-1 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300"
                                    >
                                        Live Calls
                                        {activeCampaign && (
                                            <span className="ml-2 h-2 w-2 animate-pulse rounded-full bg-green-400" />
                                        )}
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="history"
                                        className="flex-1 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300"
                                    >
                                        Call History
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="recordings"
                                        className="flex-1 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300"
                                    >
                                        Recordings
                                    </TabsTrigger>
                                </TabsList>

                                {/* Live Calls */}
                                <TabsContent value="live">
                                    {!activeCampaign ? (
                                        <div className="flex flex-col items-center py-16 text-center">
                                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800/50">
                                                <Phone className="h-8 w-8 text-slate-500" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-white">No Active Campaigns</h3>
                                            <p className="mt-2 text-sm text-slate-400">
                                                Schedule your first AI calling campaign to start qualifying leads.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {/* Active Campaign Card */}
                                            <div className="rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 p-6">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="text-lg font-semibold text-white">
                                                                {activeCampaign.name}
                                                            </h3>
                                                            <span className={cn(
                                                                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs",
                                                                activeCampaign.status === "calling"
                                                                    ? "bg-green-500/10 text-green-400"
                                                                    : "bg-yellow-500/10 text-yellow-400"
                                                            )}>
                                                                {activeCampaign.status === "calling" ? "🟢 Calling" : "⏸️ Paused"}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-slate-400">{activeCampaign.leadListName}</p>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => toggleCampaignStatus(activeCampaign)}
                                                        className={cn(
                                                            activeCampaign.status === "calling"
                                                                ? "text-yellow-400"
                                                                : "text-green-400"
                                                        )}
                                                    >
                                                        {activeCampaign.status === "calling" ? (
                                                            <><Pause className="mr-1 h-4 w-4" /> Pause</>
                                                        ) : (
                                                            <><Play className="mr-1 h-4 w-4" /> Resume</>
                                                        )}
                                                    </Button>
                                                </div>

                                                {/* Progress */}
                                                <div className="mt-4">
                                                    <div className="mb-1 flex justify-between text-sm">
                                                        <span className="text-slate-400">
                                                            {activeCampaign.callsMade} / {activeCampaign.totalLeads} calls
                                                        </span>
                                                        <span className="text-purple-400">
                                                            {Math.round((activeCampaign.callsMade / activeCampaign.totalLeads) * 100)}%
                                                        </span>
                                                    </div>
                                                    <div className="h-3 overflow-hidden rounded-full bg-slate-700">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                                                            style={{ width: `${(activeCampaign.callsMade / activeCampaign.totalLeads) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Stats */}
                                                <div className="mt-6 grid grid-cols-4 gap-4">
                                                    <div className="text-center">
                                                        <p className="text-2xl font-bold text-green-400">
                                                            {activeCampaign.stats.interested}
                                                        </p>
                                                        <p className="text-xs text-slate-400">Interested</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-2xl font-bold text-red-400">
                                                            {activeCampaign.stats.notInterested}
                                                        </p>
                                                        <p className="text-xs text-slate-400">Not Interested</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-2xl font-bold text-slate-400">
                                                            {activeCampaign.stats.noAnswer}
                                                        </p>
                                                        <p className="text-xs text-slate-400">No Answer</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-2xl font-bold text-yellow-400">
                                                            {activeCampaign.stats.voicemail}
                                                        </p>
                                                        <p className="text-xs text-slate-400">Voicemail</p>
                                                    </div>
                                                </div>

                                                {/* Audio Visualization */}
                                                {activeCampaign.status === "calling" && (
                                                    <div className="mt-6 rounded-xl bg-slate-800/50 p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20">
                                                                <Phone className="h-5 w-5 text-green-400" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-white">Currently calling: Manhattan Deli</p>
                                                                <p className="text-xs text-slate-400">+1 (212) 555-1234 • 1m 23s</p>
                                                            </div>
                                                        </div>
                                                        <div className="mt-3 flex h-8 items-center gap-0.5">
                                                            {Array.from({ length: 30 }).map((_, i) => (
                                                                <motion.div
                                                                    key={i}
                                                                    className="w-1 rounded-full bg-green-400"
                                                                    animate={{
                                                                        height: [4, 12 + Math.random() * 16, 4],
                                                                    }}
                                                                    transition={{
                                                                        duration: 0.5,
                                                                        repeat: Infinity,
                                                                        delay: i * 0.05,
                                                                    }}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </TabsContent>

                                {/* Call History */}
                                <TabsContent value="history">
                                    {callLogs.length === 0 ? (
                                        <div className="flex flex-col items-center py-16 text-center">
                                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800/50">
                                                <History className="h-8 w-8 text-slate-500" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-white">No Call History</h3>
                                            <p className="mt-2 text-sm text-slate-400">
                                                Your call logs will appear here.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {/* Filters */}
                                            <div className="flex gap-2">
                                                <select
                                                    value={filterStatus}
                                                    onChange={(e) => setFilterStatus(e.target.value)}
                                                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                                                >
                                                    <option value="all">All Calls</option>
                                                    <option value="interested">Interested</option>
                                                    <option value="not_interested">Not Interested</option>
                                                    <option value="no_answer">No Answer</option>
                                                    <option value="voicemail">Voicemail</option>
                                                </select>
                                            </div>

                                            {/* Table */}
                                            <div className="overflow-x-auto rounded-xl border border-white/5">
                                                <table className="w-full">
                                                    <thead>
                                                        <tr className="border-b border-white/5 bg-slate-800/30">
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">Business</th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">Phone</th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">Status</th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">Duration</th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-white/5">
                                                        {filteredLogs.map((log) => (
                                                            <tr
                                                                key={log.id}
                                                                className="cursor-pointer transition-colors hover:bg-purple-500/5"
                                                                onClick={() => setSelectedLog(log)}
                                                            >
                                                                <td className="px-4 py-3 text-sm text-white">{log.businessName}</td>
                                                                <td className="px-4 py-3 text-sm text-slate-400">{log.phone}</td>
                                                                <td className="px-4 py-3">
                                                                    <span className="inline-flex items-center gap-1.5">
                                                                        {getStatusIcon(log.status)}
                                                                        <span className="text-sm text-slate-300">{getStatusLabel(log.status)}</span>
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-slate-400">{formatDuration(log.duration)}</td>
                                                                <td className="px-4 py-3">
                                                                    <div className="flex gap-2">
                                                                        <button className="text-purple-400 hover:text-purple-300">
                                                                            <Volume2 className="h-4 w-4" />
                                                                        </button>
                                                                        <button className="text-purple-400 hover:text-purple-300">
                                                                            <FileText className="h-4 w-4" />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </TabsContent>

                                {/* Recordings */}
                                <TabsContent value="recordings">
                                    {callLogs.length === 0 ? (
                                        <div className="flex flex-col items-center py-16 text-center">
                                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800/50">
                                                <Volume2 className="h-8 w-8 text-slate-500" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-white">No Recordings</h3>
                                            <p className="mt-2 text-sm text-slate-400">
                                                Call recordings will appear here.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                            {callLogs.slice(0, 6).map((log) => (
                                                <div
                                                    key={log.id}
                                                    className="rounded-xl bg-slate-800/30 p-4"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-medium text-white">{log.businessName}</p>
                                                            <p className="text-xs text-slate-400">
                                                                {new Date(log.calledAt).toLocaleDateString()} • {formatDuration(log.duration)}
                                                            </p>
                                                        </div>
                                                        {getStatusIcon(log.status)}
                                                    </div>
                                                    <div className="mt-4 flex items-center gap-3">
                                                        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/20 text-purple-400 hover:bg-purple-500/30">
                                                            <Play className="h-5 w-5" />
                                                        </button>
                                                        <div className="h-2 flex-1 rounded-full bg-slate-700">
                                                            <div className="h-full w-0 rounded-full bg-purple-500" />
                                                        </div>
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

            {/* Call Detail Modal */}
            <AnimatePresence>
                {selectedLog && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                        onClick={() => setSelectedLog(null)}
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
                                    <h3 className="text-lg font-semibold text-white">{selectedLog.businessName}</h3>
                                    <p className="text-sm text-slate-400">{selectedLog.phone}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    {getStatusIcon(selectedLog.status)}
                                    <span className="text-sm text-slate-300">{getStatusLabel(selectedLog.status)}</span>
                                    <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-white">
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-4 flex gap-4 text-sm text-slate-400">
                                <span>Duration: {formatDuration(selectedLog.duration)}</span>
                                <span>{new Date(selectedLog.calledAt).toLocaleString()}</span>
                            </div>

                            {/* Audio Player */}
                            <div className="mt-6 rounded-xl bg-slate-800/50 p-4">
                                <div className="flex items-center gap-4">
                                    <button className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500 text-white hover:bg-purple-600">
                                        <Play className="h-6 w-6" />
                                    </button>
                                    <div className="flex-1">
                                        <div className="h-2 rounded-full bg-slate-700">
                                            <div className="h-full w-0 rounded-full bg-purple-500" />
                                        </div>
                                        <div className="mt-1 flex justify-between text-xs text-slate-500">
                                            <span>0:00</span>
                                            <span>{formatDuration(selectedLog.duration)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Transcript */}
                            <div className="mt-6">
                                <h4 className="text-sm font-medium text-slate-300">Transcript</h4>
                                <div className="mt-2 rounded-xl bg-slate-800/30 p-4 text-sm text-slate-300 whitespace-pre-wrap">
                                    {selectedLog.transcript}
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="mt-4">
                                <h4 className="text-sm font-medium text-slate-300">AI Summary</h4>
                                <p className="mt-2 text-sm text-slate-400">{selectedLog.summary}</p>
                            </div>

                            <div className="mt-6 flex gap-3">
                                <Button variant="ghost" className="border border-white/10 text-slate-300">
                                    <Phone className="mr-2 h-4 w-4" />
                                    Call Again
                                </Button>
                                <Button className="flex-1 gradient-primary text-white">
                                    Send Follow-up Email
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
