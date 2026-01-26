"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
    User,
    Plug,
    Bell,
    Shield,
    Database,
    Check,
    X,
    ExternalLink,
    Monitor,
    Smartphone,
    Globe,
    Trash2,
    Download,
    AlertTriangle,
    Eye,
    EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Session {
    id: string;
    device: string;
    location: string;
    ip: string;
    lastActive: string;
    current: boolean;
}

const sessions: Session[] = [
    { id: "1", device: "Chrome on Windows", location: "Dhaka, Bangladesh", ip: "103.xxx.xxx.xxx", lastActive: "2 minutes ago", current: true },
    { id: "2", device: "Safari on iPhone", location: "New York, USA", ip: "72.xxx.xxx.xxx", lastActive: "3 days ago", current: false },
    { id: "3", device: "Firefox on Mac", location: "London, UK", ip: "185.xxx.xxx.xxx", lastActive: "1 week ago", current: false },
];

export default function SettingsPage() {
    // Account state
    const [fullName, setFullName] = useState("John Doe");
    const [email, setEmail] = useState("john@example.com");
    const [company, setCompany] = useState("");
    const [phone, setPhone] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Password state
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPasswords, setShowPasswords] = useState(false);
    const [passwordError, setPasswordError] = useState("");

    // API Connections
    const [isInstantlyConnected, setIsInstantlyConnected] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("instantly_connected") === "true";
        }
        return false;
    });
    const [isBlandConnected, setIsBlandConnected] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("bland_connected") === "true";
        }
        return false;
    });

    // Notifications
    const [notifications, setNotifications] = useState({
        scrapeCompleted: true,
        newReplies: true,
        callCompleted: true,
        weeklySummary: true,
        promotional: false,
        browserNotifications: false,
    });

    // Delete account modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");
    const [deletePassword, setDeletePassword] = useState("");

    const handleSaveProfile = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        }, 1000);
    };

    const handleChangePassword = () => {
        setPasswordError("");

        if (newPassword.length < 8) {
            setPasswordError("Password must be at least 8 characters");
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError("Passwords do not match");
            return;
        }

        // Mock password change
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    };

    const getPasswordStrength = (password: string): { label: string; color: string; width: string } => {
        if (password.length === 0) return { label: "", color: "", width: "0%" };
        if (password.length < 6) return { label: "Weak", color: "bg-red-500", width: "33%" };
        if (password.length < 10) return { label: "Medium", color: "bg-yellow-500", width: "66%" };
        return { label: "Strong", color: "bg-green-500", width: "100%" };
    };

    const passwordStrength = getPasswordStrength(newPassword);

    const handleConnectInstantly = () => {
        localStorage.setItem("instantly_connected", "true");
        setIsInstantlyConnected(true);
    };

    const handleDisconnectInstantly = () => {
        localStorage.removeItem("instantly_connected");
        setIsInstantlyConnected(false);
    };

    const handleConnectBland = () => {
        localStorage.setItem("bland_connected", "true");
        setIsBlandConnected(true);
    };

    const handleDisconnectBland = () => {
        localStorage.removeItem("bland_connected");
        setIsBlandConnected(false);
    };

    const handleExportData = () => {
        // Mock export
        const data = {
            leads: ["Sample Lead 1", "Sample Lead 2"],
            campaigns: ["Campaign 1"],
            exportedAt: new Date().toISOString(),
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "lumflow_data_export.json";
        a.click();
    };

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">Settings</h1>
                <p className="mt-1 text-slate-400">
                    Manage your account and preferences
                </p>
            </div>

            {/* Success Toast */}
            <AnimatePresence>
                {saveSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-green-500/90 px-4 py-3 text-white shadow-lg"
                    >
                        <Check className="h-5 w-5" />
                        <span className="font-medium">Changes saved successfully!</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <Tabs defaultValue="account" className="w-full">
                <TabsList className="mb-6 w-full bg-slate-800/50">
                    <TabsTrigger value="account" className="flex-1 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">
                        <User className="mr-2 h-4 w-4" />
                        Account
                    </TabsTrigger>
                    <TabsTrigger value="api" className="flex-1 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">
                        <Plug className="mr-2 h-4 w-4" />
                        Connections
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="flex-1 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">
                        <Bell className="mr-2 h-4 w-4" />
                        Notifications
                    </TabsTrigger>
                    <TabsTrigger value="security" className="flex-1 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">
                        <Shield className="mr-2 h-4 w-4" />
                        Security
                    </TabsTrigger>
                    <TabsTrigger value="data" className="flex-1 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">
                        <Database className="mr-2 h-4 w-4" />
                        Data
                    </TabsTrigger>
                </TabsList>

                {/* Account Tab */}
                <TabsContent value="account" className="space-y-6">
                    <SpotlightCard className="p-6">
                        <h2 className="text-lg font-semibold text-white">Profile Information</h2>
                        <p className="mt-1 text-sm text-slate-400">Update your personal details</p>

                        <div className="mt-6 grid gap-6 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label className="text-slate-300">Full Name</Label>
                                <Input
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="border-white/10 bg-white/5 text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-300">Email</Label>
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="border-white/10 bg-white/5 text-white"
                                />
                                <p className="text-xs text-slate-500">Used for login and notifications</p>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-300">Company Name (optional)</Label>
                                <Input
                                    value={company}
                                    onChange={(e) => setCompany(e.target.value)}
                                    placeholder="Your company"
                                    className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-300">Phone Number (optional)</Label>
                                <Input
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+1 (555) 000-0000"
                                    className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <Button
                                onClick={handleSaveProfile}
                                disabled={isSaving}
                                className="gradient-primary text-white"
                            >
                                {isSaving ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </SpotlightCard>

                    {/* Change Password */}
                    <SpotlightCard className="p-6">
                        <h2 className="text-lg font-semibold text-white">Change Password</h2>
                        <p className="mt-1 text-sm text-slate-400">Update your account password</p>

                        <div className="mt-6 max-w-md space-y-4">
                            <div className="space-y-2">
                                <Label className="text-slate-300">Current Password</Label>
                                <div className="relative">
                                    <Input
                                        type={showPasswords ? "text" : "password"}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="border-white/10 bg-white/5 pr-10 text-white"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords(!showPasswords)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                    >
                                        {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-300">New Password</Label>
                                <Input
                                    type={showPasswords ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="border-white/10 bg-white/5 text-white"
                                />
                                {newPassword && (
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-700">
                                            <div className={cn("h-full transition-all", passwordStrength.color)} style={{ width: passwordStrength.width }} />
                                        </div>
                                        <span className={cn("text-xs", {
                                            "text-red-400": passwordStrength.label === "Weak",
                                            "text-yellow-400": passwordStrength.label === "Medium",
                                            "text-green-400": passwordStrength.label === "Strong",
                                        })}>{passwordStrength.label}</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-300">Confirm New Password</Label>
                                <Input
                                    type={showPasswords ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="border-white/10 bg-white/5 text-white"
                                />
                            </div>

                            {passwordError && (
                                <p className="text-sm text-red-400">{passwordError}</p>
                            )}

                            <Button
                                onClick={handleChangePassword}
                                disabled={!currentPassword || !newPassword || !confirmPassword}
                                className="gradient-primary text-white"
                            >
                                Update Password
                            </Button>
                        </div>
                    </SpotlightCard>

                    {/* Danger Zone */}
                    <SpotlightCard className="border-red-500/20 p-6">
                        <h2 className="flex items-center gap-2 text-lg font-semibold text-red-400">
                            <AlertTriangle className="h-5 w-5" />
                            Danger Zone
                        </h2>
                        <p className="mt-1 text-sm text-slate-400">Irreversible actions</p>

                        <div className="mt-6">
                            <Button
                                variant="ghost"
                                onClick={() => setShowDeleteModal(true)}
                                className="border border-red-500/30 text-red-400 hover:bg-red-500/10"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Account
                            </Button>
                        </div>
                    </SpotlightCard>
                </TabsContent>

                {/* API Connections Tab */}
                <TabsContent value="api" className="space-y-6">
                    {/* Instantly */}
                    <SpotlightCard className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20">
                                    <span className="text-lg font-bold text-blue-400">⚡</span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">Instantly</h3>
                                    <p className="text-sm text-slate-400">Send cold emails at scale</p>
                                </div>
                            </div>
                            <div className={cn(
                                "inline-flex items-center gap-2 rounded-full px-3 py-1",
                                isInstantlyConnected ? "bg-green-500/10" : "bg-slate-800"
                            )}>
                                <div className={cn("h-2 w-2 rounded-full", isInstantlyConnected ? "bg-green-400" : "bg-slate-500")} />
                                <span className={cn("text-xs font-medium", isInstantlyConnected ? "text-green-400" : "text-slate-400")}>
                                    {isInstantlyConnected ? "Connected" : "Not Connected"}
                                </span>
                            </div>
                        </div>

                        {isInstantlyConnected ? (
                            <div className="mt-4 rounded-xl bg-slate-800/30 p-4">
                                <p className="text-sm text-slate-300">Connected as: john@example.com</p>
                                <p className="text-xs text-slate-500">Connected on Jan 20, 2025</p>
                                <div className="mt-3 flex gap-2">
                                    <Button variant="ghost" size="sm" className="border border-white/10 text-slate-300">
                                        Test Connection
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleDisconnectInstantly}
                                        className="text-red-400 hover:bg-red-500/10"
                                    >
                                        Disconnect
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-4">
                                <Button onClick={handleConnectInstantly} className="gradient-primary text-white">
                                    <Plug className="mr-2 h-4 w-4" />
                                    Connect Instantly
                                </Button>
                            </div>
                        )}
                    </SpotlightCard>

                    {/* Bland AI */}
                    <SpotlightCard className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20">
                                    <span className="text-lg">🎙️</span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">Bland AI</h3>
                                    <p className="text-sm text-slate-400">AI-powered voice calling</p>
                                </div>
                            </div>
                            <div className={cn(
                                "inline-flex items-center gap-2 rounded-full px-3 py-1",
                                isBlandConnected ? "bg-green-500/10" : "bg-slate-800"
                            )}>
                                <div className={cn("h-2 w-2 rounded-full", isBlandConnected ? "bg-green-400" : "bg-slate-500")} />
                                <span className={cn("text-xs font-medium", isBlandConnected ? "text-green-400" : "text-slate-400")}>
                                    {isBlandConnected ? "Connected" : "Not Connected"}
                                </span>
                            </div>
                        </div>

                        {isBlandConnected ? (
                            <div className="mt-4 rounded-xl bg-slate-800/30 p-4">
                                <p className="text-sm text-slate-300">Connected as: john@example.com</p>
                                <p className="text-xs text-slate-500">Connected on Jan 20, 2025</p>
                                <div className="mt-3 flex gap-2">
                                    <Button variant="ghost" size="sm" className="border border-white/10 text-slate-300">
                                        Test Connection
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleDisconnectBland}
                                        className="text-red-400 hover:bg-red-500/10"
                                    >
                                        Disconnect
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-4">
                                <Button onClick={handleConnectBland} className="gradient-primary text-white">
                                    <Plug className="mr-2 h-4 w-4" />
                                    Connect Bland AI
                                </Button>
                            </div>
                        )}
                    </SpotlightCard>

                    {/* Coming Soon Integrations */}
                    <div className="grid gap-4 sm:grid-cols-3">
                        {[
                            { name: "Salesforce", desc: "Sync leads to CRM", icon: "💼" },
                            { name: "HubSpot", desc: "Export contacts", icon: "🟠" },
                            { name: "Zapier", desc: "Connect 5,000+ apps", icon: "⚡" },
                        ].map((integration) => (
                            <SpotlightCard key={integration.name} className="p-4 opacity-60">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800">
                                        <span>{integration.icon}</span>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-white">{integration.name}</h4>
                                        <p className="text-xs text-slate-500">{integration.desc}</p>
                                    </div>
                                </div>
                                <span className="mt-2 inline-block rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
                                    Coming Soon
                                </span>
                            </SpotlightCard>
                        ))}
                    </div>
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent value="notifications" className="space-y-6">
                    <SpotlightCard className="p-6">
                        <h2 className="text-lg font-semibold text-white">Email Notifications</h2>
                        <p className="mt-1 text-sm text-slate-400">Choose what you want to be notified about</p>

                        <div className="mt-6 space-y-4">
                            {[
                                { key: "scrapeCompleted", label: "Scrape completed", desc: "When a lead scrape finishes" },
                                { key: "newReplies", label: "New email replies", desc: "When someone replies to your campaign" },
                                { key: "callCompleted", label: "AI call completed", desc: "After each AI calling session" },
                                { key: "weeklySummary", label: "Weekly summary", desc: "Usage report every Monday" },
                                { key: "promotional", label: "Promotional emails", desc: "Product updates and tips" },
                            ].map((item) => (
                                <div key={item.key} className="flex items-center justify-between rounded-xl bg-slate-800/30 p-4">
                                    <div>
                                        <p className="font-medium text-white">{item.label}</p>
                                        <p className="text-sm text-slate-400">{item.desc}</p>
                                    </div>
                                    <Switch
                                        checked={notifications[item.key as keyof typeof notifications]}
                                        onCheckedChange={(checked) =>
                                            setNotifications((prev) => ({ ...prev, [item.key]: checked }))
                                        }
                                    />
                                </div>
                            ))}
                        </div>
                    </SpotlightCard>

                    <SpotlightCard className="p-6">
                        <h2 className="text-lg font-semibold text-white">Browser Notifications</h2>
                        <p className="mt-1 text-sm text-slate-400">Get real-time updates in your browser</p>

                        <div className="mt-6">
                            <div className="flex items-center justify-between rounded-xl bg-slate-800/30 p-4">
                                <div>
                                    <p className="font-medium text-white">Enable desktop notifications</p>
                                    <p className="text-sm text-slate-400">Requires browser permission</p>
                                </div>
                                <Switch
                                    checked={notifications.browserNotifications}
                                    onCheckedChange={(checked) => {
                                        if (checked && "Notification" in window) {
                                            Notification.requestPermission();
                                        }
                                        setNotifications((prev) => ({ ...prev, browserNotifications: checked }));
                                    }}
                                />
                            </div>
                        </div>
                    </SpotlightCard>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security" className="space-y-6">
                    {/* 2FA */}
                    <SpotlightCard className="p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-white">Two-Factor Authentication</h2>
                                <p className="mt-1 text-sm text-slate-400">Add an extra layer of security</p>
                            </div>
                            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">Coming Soon</span>
                        </div>
                        <div className="mt-4">
                            <Button disabled className="opacity-50">
                                Enable 2FA
                            </Button>
                        </div>
                    </SpotlightCard>

                    {/* Active Sessions */}
                    <SpotlightCard className="p-6">
                        <h2 className="text-lg font-semibold text-white">Active Sessions</h2>
                        <p className="mt-1 text-sm text-slate-400">Manage your logged-in devices</p>

                        <div className="mt-6 space-y-3">
                            {sessions.map((session) => (
                                <div
                                    key={session.id}
                                    className="flex items-center justify-between rounded-xl bg-slate-800/30 p-4"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800">
                                            {session.device.includes("Chrome") && <Globe className="h-5 w-5 text-slate-400" />}
                                            {session.device.includes("Safari") && <Smartphone className="h-5 w-5 text-slate-400" />}
                                            {session.device.includes("Firefox") && <Monitor className="h-5 w-5 text-slate-400" />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-white">{session.device}</p>
                                                {session.current && (
                                                    <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400">
                                                        This device
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-400">
                                                {session.location} • {session.ip}
                                            </p>
                                            <p className="text-xs text-slate-500">Last active: {session.lastActive}</p>
                                        </div>
                                    </div>
                                    {!session.current && (
                                        <Button variant="ghost" size="sm" className="text-red-400 hover:bg-red-500/10">
                                            Revoke
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </SpotlightCard>
                </TabsContent>

                {/* Data & Privacy Tab */}
                <TabsContent value="data" className="space-y-6">
                    <SpotlightCard className="p-6">
                        <h2 className="text-lg font-semibold text-white">Export Your Data</h2>
                        <p className="mt-1 text-sm text-slate-400">
                            Download all your data (leads, campaigns, call logs) in CSV format
                        </p>
                        <div className="mt-4">
                            <Button onClick={handleExportData} className="gradient-primary text-white">
                                <Download className="mr-2 h-4 w-4" />
                                Request Export
                            </Button>
                        </div>
                    </SpotlightCard>

                    <SpotlightCard className="p-6">
                        <h2 className="text-lg font-semibold text-white">Data Retention</h2>
                        <p className="mt-1 text-sm text-slate-400">How long we keep your data</p>

                        <div className="mt-4 rounded-xl bg-slate-800/30 p-4 text-sm text-slate-300">
                            <ul className="space-y-2">
                                <li>• <span className="text-white">Leads:</span> Stored indefinitely</li>
                                <li>• <span className="text-white">Call recordings:</span> 90 days</li>
                                <li>• <span className="text-white">Email logs:</span> 30 days</li>
                                <li>• <span className="text-white">Deleted accounts:</span> Data removed after 30 days</li>
                            </ul>
                        </div>
                    </SpotlightCard>

                    <SpotlightCard className="p-6">
                        <h2 className="text-lg font-semibold text-white">GDPR Compliance</h2>
                        <p className="mt-1 text-sm text-slate-400">Request data deletion under GDPR</p>
                        <div className="mt-4">
                            <a
                                href="mailto:privacy@lumflow.ai?subject=GDPR%20Data%20Deletion%20Request"
                                className="inline-flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300"
                            >
                                Contact Support for GDPR requests
                                <ExternalLink className="h-4 w-4" />
                            </a>
                        </div>
                    </SpotlightCard>
                </TabsContent>
            </Tabs>

            {/* Delete Account Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                        onClick={() => setShowDeleteModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-md rounded-2xl bg-slate-900 p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
                                    <AlertTriangle className="h-6 w-6 text-red-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">Delete Account</h3>
                                    <p className="text-sm text-slate-400">This action cannot be undone</p>
                                </div>
                            </div>

                            <div className="mt-6 rounded-xl bg-red-500/10 p-4 text-sm text-slate-300">
                                <p className="font-medium text-red-400">Warning: All data will be permanently deleted</p>
                                <ul className="mt-2 space-y-1 text-slate-400">
                                    <li>• All leads and campaigns</li>
                                    <li>• Call recordings and transcripts</li>
                                    <li>• Billing history</li>
                                </ul>
                            </div>

                            <div className="mt-6 space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Type DELETE to confirm</Label>
                                    <Input
                                        value={deleteConfirmText}
                                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                                        placeholder="DELETE"
                                        className="border-white/10 bg-white/5 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Enter your password</Label>
                                    <Input
                                        type="password"
                                        value={deletePassword}
                                        onChange={(e) => setDeletePassword(e.target.value)}
                                        className="border-white/10 bg-white/5 text-white"
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex gap-3">
                                <Button
                                    variant="ghost"
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 border border-white/10 text-slate-300"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    disabled={deleteConfirmText !== "DELETE" || !deletePassword}
                                    className="flex-1 bg-red-500 text-white hover:bg-red-600"
                                >
                                    Delete Account
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
