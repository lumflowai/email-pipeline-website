"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
    CreditCard,
    Check,
    Download,
    ArrowRight,
    AlertTriangle,
    X,
    Sparkles,
    Crown,
    Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Plan {
    name: string;
    price: number;
    leads: number;
    emails: string;
    aiCalls: number | string;
    features: string[];
    popular?: boolean;
}

const plans: Plan[] = [
    {
        name: "Starter",
        price: 149,
        leads: 2500,
        emails: "1 campaign (500 contacts)",
        aiCalls: 100,
        features: ["Basic support", "CSV export", "7-day history"],
    },
    {
        name: "Pro",
        price: 349,
        leads: 10000,
        emails: "Unlimited",
        aiCalls: 500,
        features: ["Priority support", "API access", "30-day history", "CRM sync"],
        popular: true,
    },
    {
        name: "Enterprise",
        price: 899,
        leads: 50000,
        emails: "Unlimited",
        aiCalls: "Unlimited",
        features: ["Dedicated manager", "Custom integrations", "SLA", "White-label"],
    },
];

const invoices = [
    { id: "INV-001", date: "Jan 25, 2025", amount: 349, status: "paid", description: "Pro Plan - January 2025" },
    { id: "INV-002", date: "Dec 25, 2024", amount: 349, status: "paid", description: "Pro Plan - December 2024" },
    { id: "INV-003", date: "Nov 25, 2024", amount: 349, status: "paid", description: "Pro Plan - November 2024" },
    { id: "INV-004", date: "Oct 25, 2024", amount: 349, status: "paid", description: "Pro Plan - October 2024" },
];

export default function BillingPage() {
    const [currentPlan] = useState("Pro");
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [showDowngradeModal, setShowDowngradeModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [cancelStep, setCancelStep] = useState(1);
    const [cancelReason, setCancelReason] = useState("");
    const [downgradeConfirmed, setDowngradeConfirmed] = useState(false);

    const currentPlanData = plans.find((p) => p.name === currentPlan) || plans[1];
    const usedLeads = 7500;
    const usedEmails = 450;
    const usedCalls = 320;

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">Billing</h1>
                <p className="mt-1 text-slate-400">
                    Manage your subscription and payment methods
                </p>
            </div>

            {/* Current Plan */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <SpotlightCard className="p-6">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-500">
                                    <Crown className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">{currentPlan} Plan</h2>
                                    <p className="text-sm text-slate-400">
                                        ${currentPlanData.price}/month • Renews Feb 25, 2025
                                    </p>
                                </div>
                            </div>

                            {/* Usage Stats */}
                            <div className="mt-6 grid gap-4 sm:grid-cols-3">
                                <div className="rounded-xl bg-slate-800/30 p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-400">Leads</span>
                                        <span className="text-sm text-purple-400">
                                            {usedLeads.toLocaleString()} / {currentPlanData.leads.toLocaleString()}
                                        </span>
                                    </div>
                                    <Progress value={(usedLeads / currentPlanData.leads) * 100} className="mt-2" />
                                </div>
                                <div className="rounded-xl bg-slate-800/30 p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-400">Emails</span>
                                        <span className="text-sm text-blue-400">{usedEmails} sent</span>
                                    </div>
                                    <Progress value={45} className="mt-2" />
                                </div>
                                <div className="rounded-xl bg-slate-800/30 p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-400">AI Calls</span>
                                        <span className="text-sm text-green-400">
                                            {usedCalls} / {currentPlanData.aiCalls}
                                        </span>
                                    </div>
                                    <Progress value={typeof currentPlanData.aiCalls === "number" ? (usedCalls / currentPlanData.aiCalls) * 100 : 50} className="mt-2" />
                                </div>
                            </div>

                            {/* Features */}
                            <div className="mt-6">
                                <h3 className="text-sm font-medium text-slate-300">Included Features</h3>
                                <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                                    {currentPlanData.features.map((feature) => (
                                        <li key={feature} className="flex items-center gap-2 text-sm text-slate-400">
                                            <Check className="h-4 w-4 text-green-400" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2 lg:min-w-[200px]">
                            <Button
                                onClick={() => setShowUpgradeModal(true)}
                                className="gradient-primary text-white"
                            >
                                <Sparkles className="mr-2 h-4 w-4" />
                                Upgrade Plan
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => setShowDowngradeModal(true)}
                                className="border border-white/10 text-slate-300"
                            >
                                Change Plan
                            </Button>
                            <button
                                onClick={() => setShowCancelModal(true)}
                                className="mt-2 text-sm text-red-400 hover:text-red-300"
                            >
                                Cancel Subscription
                            </button>
                        </div>
                    </div>
                </SpotlightCard>
            </motion.div>

            {/* Payment Method */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <SpotlightCard className="p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-white">Payment Method</h2>
                            <div className="mt-4 flex items-center gap-4">
                                <div className="flex h-12 w-20 items-center justify-center rounded-lg bg-slate-800">
                                    <span className="text-sm font-bold text-blue-400">VISA</span>
                                </div>
                                <div>
                                    <p className="text-sm text-white">Visa ending in 4242</p>
                                    <p className="text-xs text-slate-400">Expires 12/26</p>
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            onClick={() => setShowPaymentModal(true)}
                            className="text-purple-400 hover:text-purple-300"
                        >
                            Update Card
                        </Button>
                    </div>
                </SpotlightCard>
            </motion.div>

            {/* Invoices */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <SpotlightCard className="p-6">
                    <h2 className="text-lg font-semibold text-white">Invoice History</h2>
                    <div className="mt-4 overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="pb-3 text-left text-xs font-medium text-slate-400">Invoice</th>
                                    <th className="pb-3 text-left text-xs font-medium text-slate-400">Description</th>
                                    <th className="pb-3 text-left text-xs font-medium text-slate-400">Date</th>
                                    <th className="pb-3 text-left text-xs font-medium text-slate-400">Amount</th>
                                    <th className="pb-3 text-left text-xs font-medium text-slate-400">Status</th>
                                    <th className="pb-3 text-right text-xs font-medium text-slate-400">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {invoices.map((invoice) => (
                                    <tr key={invoice.id} className="group">
                                        <td className="py-3 text-sm text-white">{invoice.id}</td>
                                        <td className="py-3 text-sm text-slate-400">{invoice.description}</td>
                                        <td className="py-3 text-sm text-slate-400">{invoice.date}</td>
                                        <td className="py-3 text-sm text-white">${invoice.amount}</td>
                                        <td className="py-3">
                                            <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-xs text-green-400">
                                                <Check className="h-3 w-3" />
                                                Paid
                                            </span>
                                        </td>
                                        <td className="py-3 text-right">
                                            <button className="text-sm text-purple-400 hover:text-purple-300">
                                                <Download className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </SpotlightCard>
            </motion.div>

            {/* Upgrade Modal */}
            <AnimatePresence>
                {showUpgradeModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                        onClick={() => setShowUpgradeModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-4xl rounded-2xl bg-slate-900 p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-white">Upgrade Your Plan</h3>
                                    <p className="text-sm text-slate-400">Get more leads, calls, and features</p>
                                </div>
                                <button onClick={() => setShowUpgradeModal(false)} className="text-slate-400 hover:text-white">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Plan Comparison */}
                            <div className="mt-6 grid gap-4 md:grid-cols-3">
                                {plans.map((plan) => (
                                    <div
                                        key={plan.name}
                                        className={cn(
                                            "relative rounded-xl border p-6",
                                            plan.name === currentPlan
                                                ? "border-purple-500/50 bg-purple-500/10"
                                                : plan.popular
                                                    ? "border-blue-500/50 bg-blue-500/10"
                                                    : "border-white/10 bg-slate-800/30"
                                        )}
                                    >
                                        {plan.name === currentPlan && (
                                            <span className="absolute -top-3 left-4 rounded-full bg-purple-500 px-2 py-0.5 text-xs font-medium text-white">
                                                Current
                                            </span>
                                        )}
                                        {plan.popular && plan.name !== currentPlan && (
                                            <span className="absolute -top-3 left-4 rounded-full bg-blue-500 px-2 py-0.5 text-xs font-medium text-white">
                                                Popular
                                            </span>
                                        )}
                                        <h4 className="text-lg font-semibold text-white">{plan.name}</h4>
                                        <p className="mt-1 text-3xl font-bold text-white">
                                            ${plan.price}<span className="text-sm text-slate-400">/mo</span>
                                        </p>
                                        <ul className="mt-4 space-y-2 text-sm">
                                            <li className="text-slate-300">{plan.leads.toLocaleString()} leads/month</li>
                                            <li className="text-slate-300">{plan.emails}</li>
                                            <li className="text-slate-300">{plan.aiCalls} AI calls</li>
                                        </ul>
                                        {plan.name !== currentPlan && (
                                            <Button
                                                className={cn(
                                                    "mt-4 w-full",
                                                    plan.price > currentPlanData.price
                                                        ? "gradient-primary text-white"
                                                        : "border border-white/10 bg-transparent text-slate-300"
                                                )}
                                                onClick={() => {
                                                    setShowUpgradeModal(false);
                                                    if (plan.price < currentPlanData.price) {
                                                        setShowDowngradeModal(true);
                                                    }
                                                }}
                                            >
                                                {plan.price > currentPlanData.price ? "Upgrade" : "Downgrade"}
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Upgrade Summary */}
                            <div className="mt-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 p-4">
                                <h4 className="font-medium text-white">Upgrading to Enterprise</h4>
                                <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-300">
                                    <span>✅ 5x more leads (50,000 vs 10,000)</span>
                                    <span>✅ Unlimited AI calls</span>
                                    <span>✅ Dedicated account manager</span>
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-400">Pro-rated credit: -$175</p>
                                        <p className="text-lg font-bold text-white">Total due today: $724</p>
                                    </div>
                                    <Button className="gradient-primary text-white">
                                        Confirm Upgrade
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Downgrade Modal */}
            <AnimatePresence>
                {showDowngradeModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                        onClick={() => setShowDowngradeModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-lg rounded-2xl bg-slate-900 p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/20">
                                    <AlertTriangle className="h-6 w-6 text-yellow-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">Downgrade to Starter?</h3>
                                    <p className="text-sm text-slate-400">You&apos;re using features not in Starter</p>
                                </div>
                            </div>

                            <div className="mt-6 rounded-xl bg-slate-800/30 p-4 text-sm text-slate-300">
                                <p>You&apos;re currently using <span className="text-white font-medium">7,500 leads</span> this month.</p>
                                <p className="mt-2">Starter plan includes only <span className="text-yellow-400 font-medium">2,500 leads</span>.</p>
                                <div className="mt-4 space-y-2">
                                    <p className="text-slate-400">What happens:</p>
                                    <ul className="space-y-1 text-slate-400">
                                        <li>• You&apos;ll keep Pro features until Feb 25</li>
                                        <li>• Starting Feb 25, limited to Starter features</li>
                                        <li>• Unused credits will be lost</li>
                                    </ul>
                                </div>
                            </div>

                            <label className="mt-4 flex items-center gap-2">
                                <Checkbox checked={downgradeConfirmed} onCheckedChange={(c) => setDowngradeConfirmed(!!c)} />
                                <span className="text-sm text-slate-300">I understand I may lose access to data</span>
                            </label>

                            <div className="mt-6 flex gap-3">
                                <Button
                                    variant="ghost"
                                    onClick={() => setShowDowngradeModal(false)}
                                    className="flex-1 border border-white/10 text-slate-300"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => setShowDowngradeModal(false)}
                                    disabled={!downgradeConfirmed}
                                    className="flex-1 bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                >
                                    Downgrade Anyway
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Cancel Modal */}
            <AnimatePresence>
                {showCancelModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                        onClick={() => { setShowCancelModal(false); setCancelStep(1); }}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-lg rounded-2xl bg-slate-900 p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {cancelStep === 1 && (
                                <>
                                    <h3 className="text-xl font-bold text-white">We&apos;re Sorry to See You Go</h3>
                                    <p className="mt-2 text-sm text-slate-400">Help us improve by telling us why you&apos;re leaving</p>

                                    <div className="mt-6">
                                        <Label className="text-slate-300">Why are you canceling?</Label>
                                        <select
                                            value={cancelReason}
                                            onChange={(e) => setCancelReason(e.target.value)}
                                            className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
                                        >
                                            <option value="">Select a reason...</option>
                                            <option value="expensive">Too expensive</option>
                                            <option value="features">Not enough features</option>
                                            <option value="alternative">Found alternative</option>
                                            <option value="results">Not getting results</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    <div className="mt-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 p-4">
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="h-5 w-5 text-purple-400" />
                                            <span className="font-medium text-white">Before you go: Get 20% off for 3 months!</span>
                                        </div>
                                        <Button className="mt-3 w-full gradient-primary text-white">
                                            Claim Discount
                                        </Button>
                                    </div>

                                    <div className="mt-6 flex gap-3">
                                        <Button
                                            className="flex-1 gradient-primary text-white"
                                            onClick={() => { setShowCancelModal(false); setCancelStep(1); }}
                                        >
                                            Keep Subscription
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            onClick={() => setCancelStep(2)}
                                            className="flex-1 text-red-400 hover:bg-red-500/10"
                                        >
                                            Cancel Subscription
                                        </Button>
                                    </div>
                                </>
                            )}

                            {cancelStep === 2 && (
                                <>
                                    <h3 className="text-xl font-bold text-white">Are You Sure?</h3>
                                    <div className="mt-4 rounded-xl bg-red-500/10 p-4 text-sm text-slate-300">
                                        <p className="font-medium text-red-400">Your subscription will be canceled immediately.</p>
                                        <ul className="mt-2 space-y-1 text-slate-400">
                                            <li>• You&apos;ll lose access to all features</li>
                                            <li>• Your data will be deleted after 30 days</li>
                                            <li>• You can resubscribe anytime</li>
                                        </ul>
                                    </div>

                                    <div className="mt-6 flex gap-3">
                                        <Button
                                            className="flex-1 gradient-primary text-white"
                                            onClick={() => { setShowCancelModal(false); setCancelStep(1); }}
                                        >
                                            Keep My Account
                                        </Button>
                                        <Button
                                            onClick={() => { setShowCancelModal(false); setCancelStep(1); }}
                                            className="flex-1 bg-red-500 text-white hover:bg-red-600"
                                        >
                                            Yes, Cancel
                                        </Button>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Payment Method Modal */}
            <AnimatePresence>
                {showPaymentModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                        onClick={() => setShowPaymentModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-md rounded-2xl bg-slate-900 p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-lg font-semibold text-white">Update Payment Method</h3>

                            <div className="mt-6 space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Card Number</Label>
                                    <Input
                                        placeholder="4242 4242 4242 4242"
                                        className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-slate-300">Expiry Date</Label>
                                        <Input
                                            placeholder="MM/YY"
                                            className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-300">CVV</Label>
                                        <Input
                                            placeholder="123"
                                            className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Billing Zip Code</Label>
                                    <Input
                                        placeholder="10001"
                                        className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                                    />
                                </div>
                            </div>

                            <Button
                                onClick={() => setShowPaymentModal(false)}
                                className="mt-6 w-full gradient-primary text-white"
                            >
                                Update Payment Method
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
