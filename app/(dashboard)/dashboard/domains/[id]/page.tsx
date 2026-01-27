"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, RefreshCw, Trash2, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { DomainStatusBadge } from '@/components/domains/DomainStatusBadge';
import { DNSRecordsTable } from '@/components/domains/DNSRecordsTable';
import { getMockDomainById, generateMockActivity } from '@/lib/domains/mock-data';
import { Domain, DomainActivity } from '@/lib/domains/types';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function DomainDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const domainId = params.id as string;
    const defaultTab = searchParams.get('tab') || 'dns';

    const [domain, setDomain] = useState<Domain | null>(null);
    const [activity, setActivity] = useState<DomainActivity[]>([]);
    const [dailyLimit, setDailyLimit] = useState([50]);
    const [autoWarmup, setAutoWarmup] = useState(true);
    const [warmupSpeed, setWarmupSpeed] = useState('moderate');

    useEffect(() => {
        const timer = setTimeout(() => {
            const foundDomain = getMockDomainById(domainId);
            if (foundDomain) {
                setDomain(foundDomain);
                setDailyLimit([foundDomain.dailyLimit]);
                setActivity(generateMockActivity(domainId));
            }
        }, 0);
        return () => clearTimeout(timer);
    }, [domainId]);

    if (!domain) {
        return (
            <div className="flex items-center justify-center py-16">
                <p className="text-slate-400">Domain not found</p>
            </div>
        );
    }

    const stats = domain.stats || { totalSent: 0, opened: 0, clicked: 0, bounced: 0 };
    const openRate = stats.totalSent > 0 ? ((stats.opened / stats.totalSent) * 100).toFixed(1) : '0';
    const clickRate = stats.totalSent > 0 ? ((stats.clicked / stats.totalSent) * 100).toFixed(1) : '0';
    const bounceRate = stats.totalSent > 0 ? ((stats.bounced / stats.totalSent) * 100).toFixed(1) : '0';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/domains">
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-bold text-white">{domain.domain}</h1>
                            <DomainStatusBadge status={domain.status} />
                        </div>
                        {domain.verifiedAt && (
                            <p className="text-sm text-slate-500">
                                Verified on {new Date(domain.verifiedAt).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue={defaultTab} className="space-y-6">
                <TabsList className="bg-[#1a1a24] border border-[#2a2a3a]">
                    <TabsTrigger value="dns" className="data-[state=active]:bg-purple-600">
                        DNS Records
                    </TabsTrigger>
                    <TabsTrigger value="health" className="data-[state=active]:bg-purple-600">
                        Health & Performance
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="data-[state=active]:bg-purple-600">
                        Settings
                    </TabsTrigger>
                </TabsList>

                {/* DNS Records Tab */}
                <TabsContent value="dns" className="space-y-4">
                    <Card className="bg-[#1a1a24] border-[#2a2a3a]">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-white">DNS Configuration</CardTitle>
                                    <CardDescription className="text-slate-400">
                                        Verify these records are correctly set in your DNS provider
                                    </CardDescription>
                                </div>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <RefreshCw className="h-4 w-4" />
                                    Refresh Verification
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <DNSRecordsTable records={domain.dnsRecords} />
                            <p className="text-xs text-slate-500 mt-4">
                                Last checked: {new Date().toLocaleString()}
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Health & Performance Tab */}
                <TabsContent value="health" className="space-y-6">
                    {/* Metrics Cards */}
                    <div className="grid gap-6 md:grid-cols-3">
                        {/* Warmup Progress */}
                        <Card className="bg-[#1a1a24] border-[#2a2a3a]">
                            <CardHeader>
                                <CardTitle className="text-white text-base">Warmup Progress</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-center">
                                    <div className="relative w-32 h-32">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle
                                                cx="64"
                                                cy="64"
                                                r="56"
                                                stroke="currentColor"
                                                strokeWidth="8"
                                                fill="none"
                                                className="text-slate-700"
                                            />
                                            <motion.circle
                                                cx="64"
                                                cy="64"
                                                r="56"
                                                stroke="currentColor"
                                                strokeWidth="8"
                                                fill="none"
                                                strokeLinecap="round"
                                                className="text-purple-500"
                                                initial={{ strokeDashoffset: 352 }}
                                                animate={{ strokeDashoffset: 352 - (352 * domain.warmupProgress) / 100 }}
                                                transition={{ duration: 1, ease: 'easeOut' }}
                                                style={{ strokeDasharray: 352 }}
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-2xl font-bold text-white">{domain.warmupProgress}%</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-center space-y-1">
                                    <p className="text-sm text-slate-400">
                                        {domain.warmupProgress < 100 ? `${Math.ceil((100 - domain.warmupProgress) / 5)} days remaining` : 'Complete'}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        Sending {domain.dailySent} emails/day
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Deliverability Score */}
                        <Card className="bg-[#1a1a24] border-[#2a2a3a]">
                            <CardHeader>
                                <CardTitle className="text-white text-base">Deliverability Score</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-center">
                                    <motion.div
                                        className="text-5xl font-bold"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 200 }}
                                    >
                                        <span
                                            className={
                                                domain.healthScore >= 80
                                                    ? 'text-green-400'
                                                    : domain.healthScore >= 60
                                                        ? 'text-yellow-400'
                                                        : 'text-red-400'
                                            }
                                        >
                                            {domain.healthScore}
                                        </span>
                                        <span className="text-slate-600">/100</span>
                                    </motion.div>
                                </div>
                                <div className="flex items-center justify-center gap-2">
                                    {domain.healthScore >= 80 ? (
                                        <>
                                            <TrendingUp className="h-4 w-4 text-green-400" />
                                            <span className="text-sm text-green-400">Excellent</span>
                                        </>
                                    ) : domain.healthScore >= 60 ? (
                                        <>
                                            <TrendingDown className="h-4 w-4 text-yellow-400" />
                                            <span className="text-sm text-yellow-400">Good</span>
                                        </>
                                    ) : (
                                        <>
                                            <AlertTriangle className="h-4 w-4 text-red-400" />
                                            <span className="text-sm text-red-400">Needs Attention</span>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Sending Stats */}
                        <Card className="bg-[#1a1a24] border-[#2a2a3a]">
                            <CardHeader>
                                <CardTitle className="text-white text-base">Last 7 Days</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-400">Total Sent</span>
                                    <span className="text-lg font-semibold text-white">{stats.totalSent}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-400">Opened</span>
                                    <span className="text-sm font-medium text-green-400">
                                        {stats.opened} ({openRate}%)
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-400">Clicked</span>
                                    <span className="text-sm font-medium text-blue-400">
                                        {stats.clicked} ({clickRate}%)
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-400">Bounced</span>
                                    <span className="text-sm font-medium text-red-400">
                                        {stats.bounced} ({bounceRate}%)
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Activity Chart */}
                    <Card className="bg-[#1a1a24] border-[#2a2a3a]">
                        <CardHeader>
                            <CardTitle className="text-white">Email Activity (Last 14 Days)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64 flex items-end gap-2 justify-between">
                                {activity.map((day, index) => {
                                    const maxSent = Math.max(...activity.map((d) => d.sent));
                                    const height = (day.sent / maxSent) * 100;
                                    return (
                                        <motion.div
                                            key={day.date}
                                            initial={{ height: 0 }}
                                            animate={{ height: `${height}%` }}
                                            transition={{ delay: index * 0.05, duration: 0.3 }}
                                            className="flex-1 bg-gradient-to-t from-purple-600 to-purple-400 rounded-t min-h-[4px] relative group"
                                        >
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-800 px-2 py-1 rounded text-xs text-white whitespace-nowrap">
                                                {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                <br />
                                                {day.sent} emails
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                            <div className="flex items-center justify-between mt-4 text-xs text-slate-500">
                                <span>{new Date(activity[0]?.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                <span>{new Date(activity[activity.length - 1]?.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings" className="space-y-6">
                    <Card className="bg-[#1a1a24] border-[#2a2a3a]">
                        <CardHeader>
                            <CardTitle className="text-white">Domain Configuration</CardTitle>
                            <CardDescription className="text-slate-400">
                                Configure sending limits and warmup settings
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Daily Sending Limit */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-slate-300">Daily Sending Limit</Label>
                                    <span className="text-2xl font-bold text-white">{dailyLimit[0]}</span>
                                </div>
                                <Slider
                                    value={dailyLimit}
                                    onValueChange={setDailyLimit}
                                    min={10}
                                    max={500}
                                    step={10}
                                    showTooltip={true}
                                    tooltipLabel={(val) => `${val} emails/day`}
                                />
                                {dailyLimit[0] > 100 && (
                                    <p className="text-xs text-yellow-400 flex items-center gap-1">
                                        <AlertTriangle className="h-3 w-3" />
                                        High volumes may hurt deliverability for new domains
                                    </p>
                                )}
                            </div>

                            {/* Auto Warmup */}
                            <div className="flex items-center justify-between border-t border-[#2a2a3a] pt-4">
                                <div className="space-y-0.5">
                                    <Label className="text-slate-300">Auto Warmup</Label>
                                    <p className="text-xs text-slate-500">
                                        Automatically increase sending volume gradually
                                    </p>
                                </div>
                                <Switch checked={autoWarmup} onCheckedChange={setAutoWarmup} />
                            </div>

                            {/* Warmup Speed */}
                            {autoWarmup && (
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Warmup Speed</Label>
                                    <Select value={warmupSpeed} onValueChange={setWarmupSpeed}>
                                        <SelectTrigger className="bg-[#0a0a0f] border-white/10 text-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#1a1a24] border-[#2a2a3a]">
                                            <SelectItem value="conservative">Conservative (Recommended)</SelectItem>
                                            <SelectItem value="moderate">Moderate</SelectItem>
                                            <SelectItem value="aggressive">Aggressive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Custom Tracking Domain */}
                            <div className="space-y-2 border-t border-[#2a2a3a] pt-4">
                                <Label className="text-slate-300">Custom Tracking Domain</Label>
                                <Input
                                    placeholder="track.yourdomain.com"
                                    className="bg-[#0a0a0f] border-white/10 text-white"
                                />
                                <p className="text-xs text-slate-500">
                                    Use your own domain for link tracking
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="bg-[#1a1a24] border-red-500/50">
                        <CardHeader>
                            <CardTitle className="text-red-400">Danger Zone</CardTitle>
                            <CardDescription className="text-slate-400">
                                Irreversible and destructive actions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                variant="outline"
                                className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Domain
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
