"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { CircularProgress } from "@/components/ui/circular-progress";
import { Confetti } from "@/components/ui/confetti";
import {
    type Scrape,
    type Lead,
    type LeadList,
    createScrape,
    generateLeads,
    getSavedScrapes,
    saveScrape,
    deleteScrape,
    exportToCSV,
    businessNames,
    getSavedLeadLists,
    saveLeadList,
    updateLeadListTotalLeads,
} from "@/lib/scraper-utils";
import {
    MapPin,
    Search,
    Download,
    RefreshCw,
    Info,
    Loader2,
    Check,
    X,
    Phone,
    Mail,
    Star,
    Building,
    ChevronDown,
    ChevronUp,
    Copy,
    ExternalLink,
    MoreHorizontal,
    AlertCircle,
    Clock,
    Trash2,
    Filter,
    ArrowUpDown,
    CheckCircle2,
    XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Activity feed item for live updates
interface ActivityItem {
    id: string;
    name: string;
    hasEmail: boolean;
    timestamp: string;
}

export default function ScraperPage() {
    // Form state
    const [location, setLocation] = useState("");
    const [keyword, setKeyword] = useState("");
    const [maxResults, setMaxResults] = useState([500]);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [minRating, setMinRating] = useState([1]);
    const [minReviews, setMinReviews] = useState("");
    const [includePhones, setIncludePhones] = useState(true);
    const [includeEmails, setIncludeEmails] = useState(true);
    const [includeWebsites, setIncludeWebsites] = useState(true);

    // Lead list state
    const [leadListName, setLeadListName] = useState("");
    const [isNewList, setIsNewList] = useState(true);
    const [existingLeadLists, setExistingLeadLists] = useState<LeadList[]>([]);

    // Scraper state
    const [currentScrape, setCurrentScrape] = useState<Scrape | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);
    const [showConfetti, setShowConfetti] = useState(false);
    const [pastScrapes, setPastScrapes] = useState<Scrape[]>([]);

    // Results state
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState<"all" | "withEmail" | "withPhone" | "highRating">("all");
    const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
    const [sortColumn, setSortColumn] = useState<"name" | "rating" | "reviews">("name");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const leadsPerPage = 50;

    // Validation state
    const [errors, setErrors] = useState<{ location?: string; keyword?: string; leadListName?: string }>({});

    // Rate limiting
    const [scrapesThisHour, setScrapesThisHour] = useState(0);
    const maxScrapesPerHour = 5;

    // Refs
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Load past scrapes and lead lists on mount
    useEffect(() => {
        setPastScrapes(getSavedScrapes());
        setExistingLeadLists(getSavedLeadLists());

        // Check rate limiting
        const lastHourScrapes = getSavedScrapes().filter((s) => {
            const createdAt = new Date(s.createdAt);
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            return createdAt > oneHourAgo;
        });
        setScrapesThisHour(lastHourScrapes.length);
    }, []);

    // Estimated time based on results
    const estimatedTime = Math.ceil(maxResults[0] / 100) * 0.5;

    // Validate form
    const validateForm = () => {
        const newErrors: { location?: string; keyword?: string; leadListName?: string } = {};

        if (!location.trim()) {
            newErrors.location = "Location is required";
        } else if (location.length > 100) {
            newErrors.location = "Location must be less than 100 characters";
        }

        if (!keyword.trim()) {
            newErrors.keyword = "Please enter a search keyword";
        } else if (keyword.length > 50) {
            newErrors.keyword = "Keyword must be less than 50 characters";
        }

        if (!leadListName.trim()) {
            newErrors.leadListName = "Lead list name is required";
        } else if (leadListName.length > 50) {
            newErrors.leadListName = "List name must be less than 50 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Start scraping
    const handleStartScrape = () => {
        if (!validateForm()) return;
        if (scrapesThisHour >= maxScrapesPerHour) {
            setErrors({ location: `Rate limit: You can run ${maxScrapesPerHour - scrapesThisHour} more scrapes this hour` });
            return;
        }

        const scrape = createScrape(location.trim(), keyword.trim(), maxResults[0], leadListName.trim());
        scrape.status = "running";
        setCurrentScrape(scrape);
        setIsRunning(true);
        setActivityFeed([]);
        setSelectedLeads(new Set());
        setCurrentPage(1);

        // Simulate progress
        let progress = 0;
        let leadsGenerated: Lead[] = [];

        progressIntervalRef.current = setInterval(() => {
            const increment = 5 + Math.random() * 10;
            progress = Math.min(progress + increment, 100);

            // Generate some leads each tick
            const newLeadCount = Math.floor((progress / 100) * maxResults[0]);
            const currentLeadCount = leadsGenerated.length;

            if (newLeadCount > currentLeadCount) {
                const additionalLeads = generateLeads(
                    newLeadCount - currentLeadCount,
                    location,
                    keyword
                );
                leadsGenerated = [...leadsGenerated, ...additionalLeads];

                // Add to activity feed
                additionalLeads.slice(-3).forEach((lead, i) => {
                    setTimeout(() => {
                        setActivityFeed((prev) => [
                            {
                                id: lead.id,
                                name: lead.name,
                                hasEmail: !!lead.email,
                                timestamp: "Just now",
                            },
                            ...prev.slice(0, 4),
                        ]);
                    }, i * 200);
                });
            }

            const leadsWithEmail = leadsGenerated.filter((l) => l.email).length;
            const leadsWithPhone = leadsGenerated.filter((l) => l.phone).length;
            const avgRating = leadsGenerated.length > 0
                ? leadsGenerated.reduce((sum, l) => sum + l.rating, 0) / leadsGenerated.length
                : 0;

            setCurrentScrape((prev) => prev ? {
                ...prev,
                progress,
                leadsFound: leadsGenerated.length,
                leadsWithEmail,
                leadsWithPhone,
                avgRating: Math.round(avgRating * 10) / 10,
                results: leadsGenerated,
            } : null);

            if (progress >= 100) {
                clearInterval(progressIntervalRef.current!);

                const completedScrape: Scrape = {
                    ...scrape,
                    status: "completed",
                    progress: 100,
                    leadsFound: leadsGenerated.length,
                    leadsWithEmail,
                    leadsWithPhone,
                    avgRating: Math.round(avgRating * 10) / 10,
                    results: leadsGenerated,
                    completedAt: new Date().toISOString(),
                };

                setCurrentScrape(completedScrape);
                saveScrape(completedScrape);

                // Save to lead list
                if (leadListName.trim()) {
                    saveLeadList(leadListName.trim(), completedScrape.id);
                    updateLeadListTotalLeads(leadListName.trim());
                    setExistingLeadLists(getSavedLeadLists());
                }

                setPastScrapes(getSavedScrapes());
                setIsRunning(false);
                setShowConfetti(true);
                setScrapesThisHour((prev) => prev + 1);

                setTimeout(() => setShowConfetti(false), 1500);
            }
        }, 500);
    };

    // Cancel scraping
    const handleCancelScrape = () => {
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
        }
        setIsRunning(false);
        setCurrentScrape(null);
        setActivityFeed([]);
    };

    // Reset form for new scrape
    const handleNewScrape = () => {
        setCurrentScrape(null);
        setLocation("");
        setKeyword("");
        setMaxResults([500]);
        setLeadListName("");
        setIsNewList(true);
        setActivityFeed([]);
        setSelectedLeads(new Set());
        setSearchQuery("");
        setFilterType("all");
        setCurrentPage(1);
    };

    // View past scrape results
    const handleViewPastScrape = (scrape: Scrape) => {
        setCurrentScrape(scrape);
        setSelectedLeads(new Set());
        setSearchQuery("");
        setFilterType("all");
        setCurrentPage(1);
    };

    // Re-run past scrape
    const handleRerunScrape = (scrape: Scrape) => {
        setLocation(scrape.location);
        setKeyword(scrape.keyword);
        setMaxResults([scrape.maxResults]);
        setCurrentScrape(null);
    };

    // Delete past scrape
    const handleDeleteScrape = (id: string) => {
        deleteScrape(id);
        setPastScrapes(getSavedScrapes());
        if (currentScrape?.id === id) {
            setCurrentScrape(null);
        }
    };

    // Export leads
    const handleExport = (leads: Lead[], type: "all" | "selected" | "filtered") => {
        const listNamePart = leadListName ? `${leadListName.replace(/[^a-zA-Z0-9]/g, "_")}_` : "";
        const filename = `lumflow_${listNamePart}leads_${location.replace(/[^a-zA-Z0-9]/g, "_")}_${keyword}_${new Date().toISOString().split("T")[0]}.csv`;
        exportToCSV(leads, filename);
    };

    // Copy to clipboard
    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    // Filter and sort leads
    const getFilteredLeads = useCallback(() => {
        if (!currentScrape?.results) return [];

        let filtered = [...currentScrape.results];

        // Apply search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (lead) =>
                    lead.name.toLowerCase().includes(query) ||
                    lead.address.toLowerCase().includes(query) ||
                    lead.email?.toLowerCase().includes(query)
            );
        }

        // Apply filter
        switch (filterType) {
            case "withEmail":
                filtered = filtered.filter((lead) => lead.email);
                break;
            case "withPhone":
                filtered = filtered.filter((lead) => lead.phone);
                break;
            case "highRating":
                filtered = filtered.filter((lead) => lead.rating >= 4);
                break;
        }

        // Apply sort
        filtered.sort((a, b) => {
            let comparison = 0;
            switch (sortColumn) {
                case "name":
                    comparison = a.name.localeCompare(b.name);
                    break;
                case "rating":
                    comparison = a.rating - b.rating;
                    break;
                case "reviews":
                    comparison = a.reviews - b.reviews;
                    break;
            }
            return sortDirection === "asc" ? comparison : -comparison;
        });

        return filtered;
    }, [currentScrape?.results, searchQuery, filterType, sortColumn, sortDirection]);

    const filteredLeads = getFilteredLeads();
    const totalPages = Math.ceil(filteredLeads.length / leadsPerPage);
    const paginatedLeads = filteredLeads.slice(
        (currentPage - 1) * leadsPerPage,
        currentPage * leadsPerPage
    );

    // Toggle lead selection
    const toggleLeadSelection = (id: string) => {
        setSelectedLeads((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    // Toggle all selections
    const toggleAllSelection = () => {
        if (selectedLeads.size === paginatedLeads.length) {
            setSelectedLeads(new Set());
        } else {
            setSelectedLeads(new Set(paginatedLeads.map((l) => l.id)));
        }
    };

    return (
        <div className="space-y-8">
            {/* Confetti */}
            {showConfetti && <Confetti />}

            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">Google Maps Scraper</h1>
                <p className="mt-1 text-slate-400">
                    Extract leads from any location in minutes
                </p>
            </div>

            {/* Main Content */}
            <div className="grid gap-8 lg:grid-cols-5">
                {/* Left Column - Form */}
                <div className="lg:col-span-2">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="sticky top-8"
                    >
                        <SpotlightCard className="p-6">
                            {/* Header */}
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold text-white">
                                    Scraper Settings
                                </h2>
                                <p className="mt-1 text-sm text-slate-400">
                                    Extract leads from any location in minutes
                                </p>
                                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-purple-500/10 px-3 py-1">
                                    <div className="h-2 w-2 rounded-full bg-purple-400" />
                                    <span className="text-xs font-medium text-purple-300">
                                        {10000 - (currentScrape?.leadsFound || 0)} credits remaining
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Location */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor="location" className="text-slate-300">
                                            Location
                                        </Label>
                                        <div className="group relative">
                                            <Info className="h-4 w-4 cursor-help text-slate-500" />
                                            <div className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 rounded-lg bg-slate-800 px-3 py-2 text-xs text-slate-300 shadow-lg group-hover:block">
                                                City, state, or full address
                                            </div>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                                        <Input
                                            id="location"
                                            placeholder="New York, NY"
                                            value={location}
                                            onChange={(e) => {
                                                setLocation(e.target.value);
                                                if (errors.location) setErrors((prev) => ({ ...prev, location: undefined }));
                                            }}
                                            className={cn(
                                                "border-white/10 bg-white/5 pl-10 text-white placeholder:text-slate-500",
                                                errors.location && "border-red-500"
                                            )}
                                            disabled={isRunning}
                                        />
                                    </div>
                                    {errors.location ? (
                                        <p className="text-xs text-red-400">{errors.location}</p>
                                    ) : (
                                        <p className="text-xs text-slate-500">
                                            Examples: &quot;San Francisco, CA&quot; or &quot;London, UK&quot;
                                        </p>
                                    )}
                                </div>

                                {/* Keyword */}
                                <div className="space-y-2">
                                    <Label htmlFor="keyword" className="text-slate-300">
                                        Business Type / Keyword
                                    </Label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                                        <Input
                                            id="keyword"
                                            placeholder="restaurants"
                                            value={keyword}
                                            onChange={(e) => {
                                                setKeyword(e.target.value);
                                                if (errors.keyword) setErrors((prev) => ({ ...prev, keyword: undefined }));
                                            }}
                                            className={cn(
                                                "border-white/10 bg-white/5 pl-10 text-white placeholder:text-slate-500",
                                                errors.keyword && "border-red-500"
                                            )}
                                            disabled={isRunning}
                                        />
                                    </div>
                                    {errors.keyword ? (
                                        <p className="text-xs text-red-400">{errors.keyword}</p>
                                    ) : (
                                        <p className="text-xs text-slate-500">
                                            What type of businesses are you looking for?
                                        </p>
                                    )}
                                </div>

                                {/* Lead List Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="leadListName" className="text-slate-300">
                                        Lead List Name
                                    </Label>

                                    {/* Toggle between Create New and Update Existing */}
                                    <div className="flex gap-2 mb-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsNewList(true);
                                                setLeadListName("");
                                            }}
                                            className={cn(
                                                "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                                isNewList
                                                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/50"
                                                    : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10"
                                            )}
                                            disabled={isRunning}
                                        >
                                            Create New List
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsNewList(false)}
                                            className={cn(
                                                "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                                !isNewList
                                                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/50"
                                                    : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10"
                                            )}
                                            disabled={isRunning || existingLeadLists.length === 0}
                                        >
                                            Update Existing ({existingLeadLists.length})
                                        </button>
                                    </div>

                                    {isNewList ? (
                                        <Input
                                            id="leadListName"
                                            placeholder="e.g., NYC Restaurants"
                                            value={leadListName}
                                            onChange={(e) => {
                                                setLeadListName(e.target.value);
                                                if (errors.leadListName) setErrors((prev) => ({ ...prev, leadListName: undefined }));
                                            }}
                                            className={cn(
                                                "border-white/10 bg-white/5 text-white placeholder:text-slate-500",
                                                errors.leadListName && "border-red-500"
                                            )}
                                            disabled={isRunning}
                                        />
                                    ) : (
                                        <select
                                            value={leadListName}
                                            onChange={(e) => {
                                                setLeadListName(e.target.value);
                                                if (errors.leadListName) setErrors((prev) => ({ ...prev, leadListName: undefined }));
                                            }}
                                            className={cn(
                                                "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white",
                                                errors.leadListName && "border-red-500"
                                            )}
                                            disabled={isRunning}
                                        >
                                            <option value="">Select a list...</option>
                                            {existingLeadLists.map((list) => (
                                                <option key={list.id} value={list.name}>
                                                    {list.name} ({list.totalLeads} leads)
                                                </option>
                                            ))}
                                        </select>
                                    )}

                                    {errors.leadListName ? (
                                        <p className="text-xs text-red-400">{errors.leadListName}</p>
                                    ) : (
                                        <p className="text-xs text-slate-500">
                                            {isNewList
                                                ? "Give your lead list a memorable name"
                                                : "Add leads to an existing list"}
                                        </p>
                                    )}
                                </div>


                                {/* Max Results */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-slate-300">Number of Leads</Label>
                                        <span className="text-2xl font-bold text-white">
                                            {maxResults[0].toLocaleString()}
                                        </span>
                                    </div>
                                    <Slider
                                        value={maxResults}
                                        onValueChange={setMaxResults}
                                        min={10}
                                        max={10000}
                                        step={10}
                                        disabled={isRunning}
                                        className="[&>span:first-child]:bg-slate-700 [&>span:first-child>span]:bg-gradient-to-r [&>span:first-child>span]:from-purple-500 [&>span:first-child>span]:to-blue-500"
                                    />
                                    <div className="flex justify-between text-xs text-slate-500">
                                        <span>Estimated time: ~{estimatedTime} min</span>
                                        <span>Uses {maxResults[0].toLocaleString()} credits</span>
                                    </div>
                                </div>

                                {/* Advanced Options */}
                                <div className="border-t border-white/5 pt-4">
                                    <button
                                        className="flex w-full items-center justify-between text-sm text-slate-400 hover:text-white"
                                        onClick={() => setShowAdvanced(!showAdvanced)}
                                    >
                                        <span>Advanced Filters</span>
                                        {showAdvanced ? (
                                            <ChevronUp className="h-4 w-4" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4" />
                                        )}
                                    </button>

                                    <AnimatePresence>
                                        {showAdvanced && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="mt-4 space-y-4">
                                                    {/* Min Rating */}
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <Label className="text-slate-400 text-sm">Minimum Rating</Label>
                                                            <span className="text-sm text-white">{minRating[0].toFixed(1)} ⭐</span>
                                                        </div>
                                                        <Slider
                                                            value={minRating}
                                                            onValueChange={setMinRating}
                                                            min={1}
                                                            max={5}
                                                            step={0.5}
                                                            disabled={isRunning}
                                                            className="[&>span:first-child]:bg-slate-700"
                                                        />
                                                    </div>

                                                    {/* Min Reviews */}
                                                    <div className="space-y-2">
                                                        <Label className="text-slate-400 text-sm">Minimum Reviews</Label>
                                                        <Input
                                                            type="number"
                                                            placeholder="e.g., 10"
                                                            value={minReviews}
                                                            onChange={(e) => setMinReviews(e.target.value)}
                                                            className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                                                            disabled={isRunning}
                                                        />
                                                    </div>

                                                    {/* Include Checkboxes */}
                                                    <div className="space-y-2">
                                                        <Label className="text-slate-400 text-sm">Include</Label>
                                                        <div className="flex flex-wrap gap-4">
                                                            <label className="flex items-center gap-2 text-sm text-slate-300">
                                                                <Checkbox
                                                                    checked={includePhones}
                                                                    onCheckedChange={(c) => setIncludePhones(!!c)}
                                                                    disabled={isRunning}
                                                                />
                                                                Phone numbers
                                                            </label>
                                                            <label className="flex items-center gap-2 text-sm text-slate-300">
                                                                <Checkbox
                                                                    checked={includeEmails}
                                                                    onCheckedChange={(c) => setIncludeEmails(!!c)}
                                                                    disabled={isRunning}
                                                                />
                                                                Email addresses
                                                            </label>
                                                            <label className="flex items-center gap-2 text-sm text-slate-300">
                                                                <Checkbox
                                                                    checked={includeWebsites}
                                                                    onCheckedChange={(c) => setIncludeWebsites(!!c)}
                                                                    disabled={isRunning}
                                                                />
                                                                Websites
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Action Button */}
                                <Button
                                    onClick={isRunning ? handleCancelScrape : handleStartScrape}
                                    className={cn(
                                        "w-full py-6 text-white transition-all",
                                        isRunning
                                            ? "border border-red-500/30 bg-red-500/10 hover:bg-red-500/20"
                                            : "gradient-primary glow-primary hover:scale-[1.02]"
                                    )}
                                    disabled={(!location || !keyword || !leadListName) && !isRunning}
                                >
                                    {isRunning ? (
                                        <span className="flex items-center gap-2 text-red-400">
                                            <X className="h-4 w-4" />
                                            Cancel Scrape
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <Search className="h-4 w-4" />
                                            Start Scraping
                                        </span>
                                    )}
                                </Button>
                            </div>

                            {/* Info Box */}
                            <div className="mt-6 flex items-start gap-3 rounded-xl bg-purple-500/10 p-4">
                                <Info className="h-5 w-5 shrink-0 text-purple-400" />
                                <p className="text-sm text-purple-300">
                                    💡 Tip: More leads = more time. We recommend starting with 100-500 leads.
                                </p>
                            </div>

                            {/* Rate Limit Warning */}
                            {scrapesThisHour >= maxScrapesPerHour - 2 && (
                                <div className="mt-4 flex items-start gap-3 rounded-xl bg-yellow-500/10 p-4">
                                    <AlertCircle className="h-5 w-5 shrink-0 text-yellow-400" />
                                    <p className="text-sm text-yellow-300">
                                        You can run {maxScrapesPerHour - scrapesThisHour} more scrape{maxScrapesPerHour - scrapesThisHour !== 1 ? "s" : ""} this hour.
                                    </p>
                                </div>
                            )}
                        </SpotlightCard>
                    </motion.div>
                </div>

                {/* Right Column - Results */}
                <div className="lg:col-span-3">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <SpotlightCard className="p-6">
                            <Tabs defaultValue="current" className="w-full">
                                <TabsList className="mb-6 w-full bg-slate-800/50">
                                    <TabsTrigger
                                        value="current"
                                        className="flex-1 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300"
                                    >
                                        Current Scrape
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="past"
                                        className="flex-1 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300"
                                    >
                                        Past Scrapes
                                        {pastScrapes.length > 0 && (
                                            <span className="ml-2 rounded-full bg-slate-700 px-2 py-0.5 text-xs">
                                                {pastScrapes.length}
                                            </span>
                                        )}
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="current">
                                    {/* Idle State */}
                                    {!isRunning && !currentScrape && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="flex flex-col items-center justify-center py-16 text-center"
                                        >
                                            <motion.div
                                                className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-800/50"
                                                animate={{ scale: [1, 1.05, 1] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                            >
                                                <Search className="h-10 w-10 text-slate-500" />
                                            </motion.div>
                                            <h3 className="text-xl font-semibold text-white">Ready to Find Leads</h3>
                                            <p className="mt-2 text-slate-400">
                                                Fill out the form on the left and click &quot;Start Scraping&quot; to begin.
                                            </p>
                                        </motion.div>
                                    )}

                                    {/* Running State */}
                                    {isRunning && currentScrape && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="py-8"
                                        >
                                            {/* Status Badge */}
                                            <div className="mb-6 flex items-center justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                                                        <span className="text-sm font-medium text-green-400">Running</span>
                                                    </div>
                                                    <h3 className="mt-2 text-xl font-semibold text-white">
                                                        Scraping in Progress...
                                                    </h3>
                                                    <p className="text-sm text-slate-400">
                                                        Searching for &quot;{currentScrape.keyword}&quot; in {currentScrape.location}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Progress Ring */}
                                            <div className="flex flex-col items-center py-8">
                                                <CircularProgress value={currentScrape.progress} size={180} />
                                                <p className="mt-4 text-lg text-white">
                                                    {currentScrape.leadsFound.toLocaleString()} / {currentScrape.maxResults.toLocaleString()} leads found
                                                </p>
                                                <p className="text-sm text-slate-500">
                                                    ~{Math.ceil(((100 - currentScrape.progress) / 100) * estimatedTime * 60)} seconds remaining
                                                </p>
                                            </div>

                                            {/* Activity Feed */}
                                            <div className="mt-6 rounded-xl bg-slate-800/30 p-4">
                                                <h4 className="mb-3 text-sm font-medium text-slate-400">Live Activity</h4>
                                                <div className="space-y-2">
                                                    <AnimatePresence mode="popLayout">
                                                        {activityFeed.map((item) => (
                                                            <motion.div
                                                                key={item.id}
                                                                initial={{ opacity: 0, x: -20 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                exit={{ opacity: 0 }}
                                                                className="flex items-center gap-3 text-sm"
                                                            >
                                                                {item.hasEmail ? (
                                                                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                                                                ) : (
                                                                    <AlertCircle className="h-4 w-4 text-yellow-400" />
                                                                )}
                                                                <span className="text-white">{item.name}</span>
                                                                <span className="text-slate-500">- {item.timestamp}</span>
                                                                {!item.hasEmail && (
                                                                    <span className="text-xs text-yellow-400">(no email)</span>
                                                                )}
                                                            </motion.div>
                                                        ))}
                                                    </AnimatePresence>
                                                    {activityFeed.length === 0 && (
                                                        <p className="text-sm text-slate-500">Waiting for results...</p>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Completed State */}
                                    {!isRunning && currentScrape?.status === "completed" && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="space-y-6"
                                        >
                                            {/* Success Card */}
                                            <div className="rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-6">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <CheckCircle2 className="h-5 w-5 text-green-400" />
                                                            <span className="text-sm font-medium text-green-400">Completed</span>
                                                        </div>
                                                        <h3 className="mt-2 text-2xl font-bold text-white">
                                                            Scrape Successful!
                                                        </h3>
                                                        <p className="text-slate-400">
                                                            Found {currentScrape.leadsFound.toLocaleString()} leads in {currentScrape.location}
                                                            {currentScrape.listName && (
                                                                <span className="ml-1">
                                                                    • Saved to <span className="font-medium text-purple-400">{currentScrape.listName}</span>
                                                                </span>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Stats */}
                                                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                                                    <div className="rounded-lg bg-slate-900/50 p-4 text-center">
                                                        <p className="text-3xl font-bold text-purple-400">
                                                            {currentScrape.leadsFound.toLocaleString()}
                                                        </p>
                                                        <p className="text-sm text-slate-400">Total Leads</p>
                                                    </div>
                                                    <div className="rounded-lg bg-slate-900/50 p-4 text-center">
                                                        <p className="text-3xl font-bold text-green-400">
                                                            {currentScrape.leadsWithEmail.toLocaleString()}
                                                        </p>
                                                        <p className="text-sm text-slate-400">With Emails</p>
                                                    </div>
                                                    <div className="rounded-lg bg-slate-900/50 p-4 text-center">
                                                        <p className="text-3xl font-bold text-blue-400">
                                                            {currentScrape.leadsWithPhone.toLocaleString()}
                                                        </p>
                                                        <p className="text-sm text-slate-400">With Phones</p>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="mt-6 flex flex-wrap gap-3">
                                                    <Button
                                                        onClick={() => handleExport(currentScrape.results, "all")}
                                                        className="gradient-primary text-white"
                                                    >
                                                        <Download className="mr-2 h-4 w-4" />
                                                        Export to CSV
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        onClick={handleNewScrape}
                                                        className="border border-white/10 text-slate-300 hover:bg-white/5"
                                                    >
                                                        <RefreshCw className="mr-2 h-4 w-4" />
                                                        Start New Scrape
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Results Table */}
                                            <div className="space-y-4">
                                                {/* Table Header */}
                                                <div className="flex flex-wrap items-center justify-between gap-4">
                                                    <h3 className="text-lg font-semibold text-white">
                                                        Scrape Results - {filteredLeads.length.toLocaleString()} leads
                                                    </h3>
                                                    <div className="flex gap-2">
                                                        <div className="relative">
                                                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                                                            <Input
                                                                placeholder="Search leads..."
                                                                value={searchQuery}
                                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                                className="w-48 border-white/10 bg-white/5 pl-10 text-white placeholder:text-slate-500"
                                                            />
                                                        </div>
                                                        <select
                                                            value={filterType}
                                                            onChange={(e) => setFilterType(e.target.value as typeof filterType)}
                                                            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                                                        >
                                                            <option value="all">All</option>
                                                            <option value="withEmail">With Email</option>
                                                            <option value="withPhone">With Phone</option>
                                                            <option value="highRating">4+ Stars</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                {/* Table */}
                                                <div className="overflow-x-auto rounded-xl border border-white/5">
                                                    <table className="w-full">
                                                        <thead>
                                                            <tr className="border-b border-white/5 bg-slate-800/30">
                                                                <th className="px-4 py-3 text-left">
                                                                    <Checkbox
                                                                        checked={selectedLeads.size === paginatedLeads.length && paginatedLeads.length > 0}
                                                                        onCheckedChange={toggleAllSelection}
                                                                    />
                                                                </th>
                                                                <th
                                                                    className="cursor-pointer px-4 py-3 text-left text-xs font-medium text-slate-400 hover:text-white"
                                                                    onClick={() => {
                                                                        if (sortColumn === "name") {
                                                                            setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
                                                                        } else {
                                                                            setSortColumn("name");
                                                                            setSortDirection("asc");
                                                                        }
                                                                    }}
                                                                >
                                                                    <span className="flex items-center gap-1">
                                                                        Name
                                                                        <ArrowUpDown className="h-3 w-3" />
                                                                    </span>
                                                                </th>
                                                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">
                                                                    Phone
                                                                </th>
                                                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">
                                                                    Email
                                                                </th>
                                                                <th
                                                                    className="cursor-pointer px-4 py-3 text-left text-xs font-medium text-slate-400 hover:text-white"
                                                                    onClick={() => {
                                                                        if (sortColumn === "rating") {
                                                                            setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
                                                                        } else {
                                                                            setSortColumn("rating");
                                                                            setSortDirection("desc");
                                                                        }
                                                                    }}
                                                                >
                                                                    <span className="flex items-center gap-1">
                                                                        Rating
                                                                        <ArrowUpDown className="h-3 w-3" />
                                                                    </span>
                                                                </th>
                                                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">
                                                                    Actions
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-white/5">
                                                            <AnimatePresence>
                                                                {paginatedLeads.map((lead, index) => (
                                                                    <motion.tr
                                                                        key={lead.id}
                                                                        initial={{ opacity: 0, y: 10 }}
                                                                        animate={{ opacity: 1, y: 0 }}
                                                                        transition={{ delay: index * 0.02 }}
                                                                        className="group transition-colors hover:bg-purple-500/5"
                                                                    >
                                                                        <td className="px-4 py-3">
                                                                            <Checkbox
                                                                                checked={selectedLeads.has(lead.id)}
                                                                                onCheckedChange={() => toggleLeadSelection(lead.id)}
                                                                            />
                                                                        </td>
                                                                        <td className="px-4 py-3">
                                                                            <div className="flex items-center gap-3">
                                                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800">
                                                                                    <Building className="h-4 w-4 text-slate-400" />
                                                                                </div>
                                                                                <div>
                                                                                    <p className="text-sm font-medium text-white">{lead.name}</p>
                                                                                    <p className="text-xs text-slate-500 truncate max-w-[200px]" title={lead.address}>
                                                                                        {lead.address}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-4 py-3">
                                                                            <div className="group/phone flex items-center gap-2">
                                                                                <span className="text-sm text-slate-300">{lead.phone}</span>
                                                                                <button
                                                                                    onClick={() => handleCopy(lead.phone)}
                                                                                    className="opacity-0 transition-opacity group-hover/phone:opacity-100"
                                                                                >
                                                                                    <Copy className="h-3 w-3 text-slate-500 hover:text-white" />
                                                                                </button>
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-4 py-3">
                                                                            {lead.email ? (
                                                                                <div className="group/email flex items-center gap-2">
                                                                                    <span className="text-sm text-slate-300">{lead.email}</span>
                                                                                    <button
                                                                                        onClick={() => handleCopy(lead.email!)}
                                                                                        className="opacity-0 transition-opacity group-hover/email:opacity-100"
                                                                                    >
                                                                                        <Copy className="h-3 w-3 text-slate-500 hover:text-white" />
                                                                                    </button>
                                                                                </div>
                                                                            ) : (
                                                                                <span className="text-sm text-slate-500">—</span>
                                                                            )}
                                                                        </td>
                                                                        <td className="px-4 py-3">
                                                                            <div className="flex items-center gap-1">
                                                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                                                <span className="text-sm text-white">{lead.rating}</span>
                                                                                <span className="text-xs text-slate-500">({lead.reviews})</span>
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-4 py-3">
                                                                            <a
                                                                                href={`https://www.google.com/maps/search/${encodeURIComponent(lead.name + " " + lead.address)}`}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="inline-flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300"
                                                                            >
                                                                                <ExternalLink className="h-3 w-3" />
                                                                                View
                                                                            </a>
                                                                        </td>
                                                                    </motion.tr>
                                                                ))}
                                                            </AnimatePresence>
                                                        </tbody>
                                                    </table>
                                                </div>

                                                {/* Pagination */}
                                                {totalPages > 1 && (
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-sm text-slate-400">
                                                            Showing {(currentPage - 1) * leadsPerPage + 1} to{" "}
                                                            {Math.min(currentPage * leadsPerPage, filteredLeads.length)} of{" "}
                                                            {filteredLeads.length} leads
                                                        </p>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                                                disabled={currentPage === 1}
                                                                className="border border-white/10 text-slate-300"
                                                            >
                                                                Previous
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                                                disabled={currentPage === totalPages}
                                                                className="border border-white/10 text-slate-300"
                                                            >
                                                                Next
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Bulk Actions */}
                                                <AnimatePresence>
                                                    {selectedLeads.size > 0 && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: 20 }}
                                                            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
                                                        >
                                                            <div className="flex items-center gap-4 rounded-xl bg-slate-800 px-6 py-4 shadow-xl">
                                                                <span className="text-sm text-white">
                                                                    {selectedLeads.size} lead{selectedLeads.size !== 1 ? "s" : ""} selected
                                                                </span>
                                                                <div className="h-6 w-px bg-white/10" />
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        const selectedData = currentScrape.results.filter((l) => selectedLeads.has(l.id));
                                                                        handleExport(selectedData, "selected");
                                                                    }}
                                                                    className="gradient-primary text-white"
                                                                >
                                                                    <Download className="mr-1 h-3 w-3" />
                                                                    Export Selected
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => setSelectedLeads(new Set())}
                                                                    className="text-slate-400 hover:text-white"
                                                                >
                                                                    Clear Selection
                                                                </Button>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </motion.div>
                                    )}
                                </TabsContent>

                                <TabsContent value="past">
                                    {pastScrapes.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-16 text-center">
                                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800/50">
                                                <Clock className="h-8 w-8 text-slate-500" />
                                            </div>
                                            <p className="text-slate-400">No past scrapes yet</p>
                                            <p className="mt-1 text-sm text-slate-500">
                                                Your scrape history will appear here
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {pastScrapes.map((scrape) => (
                                                <motion.div
                                                    key={scrape.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    whileHover={{ y: -4 }}
                                                    className="flex flex-col gap-4 rounded-xl bg-slate-800/30 p-4 sm:flex-row sm:items-center sm:justify-between"
                                                >
                                                    <div className="flex items-start gap-4">
                                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20">
                                                            <MapPin className="h-6 w-6 text-purple-400" />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-medium text-white">
                                                                    {scrape.keyword} in {scrape.location}
                                                                </p>
                                                                {scrape.status === "completed" ? (
                                                                    <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-xs text-green-400">
                                                                        <Check className="h-3 w-3" />
                                                                        Completed
                                                                    </span>
                                                                ) : scrape.status === "failed" ? (
                                                                    <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-xs text-red-400">
                                                                        <XCircle className="h-3 w-3" />
                                                                        Failed
                                                                    </span>
                                                                ) : null}
                                                            </div>
                                                            <div className="mt-1 flex flex-wrap gap-4 text-sm text-slate-400">
                                                                <span>📊 {scrape.leadsFound.toLocaleString()} leads</span>
                                                                <span>📧 {scrape.leadsWithEmail.toLocaleString()} emails</span>
                                                                <span>📞 {scrape.leadsWithPhone.toLocaleString()} phones</span>
                                                                <span>⭐ {scrape.avgRating.toFixed(1)} avg</span>
                                                            </div>
                                                            <p className="mt-1 text-xs text-slate-500">
                                                                {new Date(scrape.createdAt).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleViewPastScrape(scrape)}
                                                            className="text-slate-400 hover:text-white"
                                                        >
                                                            View Results
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleRerunScrape(scrape)}
                                                            className="text-slate-400 hover:text-white"
                                                        >
                                                            <RefreshCw className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleExport(scrape.results, "all")}
                                                            className="text-slate-400 hover:text-white"
                                                        >
                                                            <Download className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDeleteScrape(scrape.id)}
                                                            className="text-red-400 hover:text-red-300"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </SpotlightCard>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
