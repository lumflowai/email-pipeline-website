"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { StepIndicator } from "@/components/campaigns/StepIndicator";
import { EmailEditor } from "@/components/campaigns/EmailEditor";
import { getSavedLeadLists } from "@/lib/scraper-utils";
import { createMockCampaign } from "@/lib/campaigns/mock-data";
import { useToast } from "@/components/ui/toast";
import {
    ArrowLeft,
    ArrowRight,
    Check,
    Users,
    Mail,
    Settings,
    Eye,
    Plus,
    Trash2,
    Globe,
    Clock,
    Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

const WIZARD_STEPS = [
    { label: "Select Leads", description: "Choose your audience" },
    { label: "Design Email", description: "Create your message" },
    { label: "Configure", description: "Setup campaign" },
    { label: "Review", description: "Launch campaign" },
];

interface EmailInSequence {
    subject: string;
    body: string;
    delayDays: number;
}

export default function NewCampaignPage() {
    const router = useRouter();
    const { addToast } = useToast();
    const [currentStep, setCurrentStep] = useState(1);

    // Step 1: Lead Selection
    const [campaignName, setCampaignName] = useState("");
    const [selectedLeadListId, setSelectedLeadListId] = useState<string>("");
    const leadLists = getSavedLeadLists();

    // Step 2: Email Design
    const [emailSequence, setEmailSequence] = useState<EmailInSequence[]>([
        { subject: "", body: "", delayDays: 0 },
    ]);

    // Step 3: Configuration
    const [domain, setDomain] = useState("");
    const [emailsPerDay] = useState([50]);
    const [delayBetweenEmails] = useState([2]);
    const [trackOpens, setTrackOpens] = useState(true);
    const [trackClicks, setTrackClicks] = useState(true);

    const selectedLeadList = leadLists.find((list) => list.id === selectedLeadListId);

    const updateEmail = (index: number, field: keyof EmailInSequence, value: string | number) => {
        const updated = [...emailSequence];
        updated[index] = { ...updated[index], [field]: value };
        setEmailSequence(updated);
    };

    const addEmail = () => {
        setEmailSequence([
            ...emailSequence,
            { subject: "", body: "", delayDays: emailSequence.length > 0 ? 2 : 0 },
        ]);
    };

    const removeEmail = (index: number) => {
        if (emailSequence.length > 1) {
            setEmailSequence(emailSequence.filter((_, i) => i !== index));
        }
    };

    const canProceed = () => {
        switch (currentStep) {
            case 1:
                return campaignName.trim() && selectedLeadListId;
            case 2:
                return emailSequence.every((email) => email.subject.trim() && email.body.trim());
            case 3:
                return domain.trim();
            case 4:
                return true;
            default:
                return false;
        }
    };

    const handleNext = () => {
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleLaunch = () => {
        // Create campaign (in real app, this would save to DB)
        const newCampaign = createMockCampaign({
            name: campaignName,
        });

        addToast({
            message: `Campaign "${campaignName}" launched successfully! 🚀`,
            type: "success",
        });

        // Redirect to campaigns list
        setTimeout(() => {
            router.push("/dashboard/campaigns");
        }, 1500);
    };

    return (
        <div className="container max-w-5xl mx-auto py-8">
            {/* Header */}
            <div className="mb-8">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push("/dashboard/campaigns")}
                    className="mb-4"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Campaigns
                </Button>
                <h1 className="text-3xl font-bold">Create New Campaign</h1>
                <p className="text-muted-foreground mt-1">
                    Follow the steps to launch your email outreach campaign
                </p>
            </div>

            {/* Step Indicator */}
            <StepIndicator currentStep={currentStep} totalSteps={4} steps={WIZARD_STEPS} />

            {/* Step Content */}
            <div className="mt-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Step 1: Select Leads */}
                        {currentStep === 1 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Select Your Leads
                                    </CardTitle>
                                    <CardDescription>
                                        Choose a lead list from your scraped data to target
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Campaign Name */}
                                    <div className="space-y-2">
                                        <Label>Campaign Name *</Label>
                                        <Input
                                            placeholder="e.g., NYC Restaurants Outreach - Jan 2026"
                                            value={campaignName}
                                            onChange={(e) => setCampaignName(e.target.value)}
                                        />
                                    </div>

                                    {/* Lead List Selection */}
                                    <div className="space-y-2">
                                        <Label>Lead List *</Label>
                                        <Select value={selectedLeadListId} onValueChange={setSelectedLeadListId}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a lead list" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {leadLists.length === 0 ? (
                                                    <SelectItem value="none" disabled>
                                                        No lead lists available. Create one from the scraper first.
                                                    </SelectItem>
                                                ) : (
                                                    leadLists.map((list) => (
                                                        <SelectItem key={list.id} value={list.id}>
                                                            {list.name} ({list.totalLeads} leads)
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                        {selectedLeadList && (
                                            <div className="mt-4 p-4 bg-muted rounded-lg">
                                                <p className="text-sm font-medium">Selected List Details</p>
                                                <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                                                    <div>
                                                        <span className="text-muted-foreground">Total Leads:</span>
                                                        <span className="ml-2 font-semibold">{selectedLeadList.totalLeads}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">Created:</span>
                                                        <span className="ml-2">{new Date(selectedLeadList.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Step 2: Design Email */}
                        {currentStep === 2 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Mail className="h-5 w-5" />
                                        Design Your Email Sequence
                                    </CardTitle>
                                    <CardDescription>
                                        Create one or more emails to send to your leads
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {emailSequence.map((email, index) => (
                                        <div key={index} className="border rounded-lg p-4 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-semibold">
                                                    {index === 0 ? "Initial Email" : `Follow-up #${index}`}
                                                </h3>
                                                {emailSequence.length > 1 && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeEmail(index)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>

                                            {index > 0 && (
                                                <div className="space-y-2">
                                                    <Label>Send after (days)</Label>
                                                    <Input
                                                        type="number"
                                                        min={1}
                                                        value={email.delayDays}
                                                        onChange={(e) => updateEmail(index, "delayDays", parseInt(e.target.value) || 1)}
                                                    />
                                                </div>
                                            )}

                                            <EmailEditor
                                                subject={email.subject}
                                                body={email.body}
                                                onSubjectChange={(value) => updateEmail(index, "subject", value)}
                                                onBodyChange={(value) => updateEmail(index, "body", value)}
                                            />
                                        </div>
                                    ))}

                                    <Button
                                        variant="outline"
                                        onClick={addEmail}
                                        className="w-full"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Follow-up Email
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {/* Step 3: Configure */}
                        {currentStep === 3 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Settings className="h-5 w-5" />
                                        Configure Campaign Settings
                                    </CardTitle>
                                    <CardDescription>
                                        Set up sending parameters and tracking options
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Domain */}
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <Globe className="h-4 w-4" />
                                            Sending Domain *
                                        </Label>
                                        <Input
                                            placeholder="e.g., yourcompany.com"
                                            value={domain}
                                            onChange={(e) => setDomain(e.target.value)}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Emails will be sent from your domain
                                        </p>
                                    </div>

                                    {/* Sending Limits */}
                                    <div className="space-y-4 pt-4 border-t">
                                        <h4 className="font-medium flex items-center gap-2">
                                            <Zap className="h-4 w-4" />
                                            Sending Limits
                                        </h4>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label>Emails per day</Label>
                                                <span className="text-sm font-semibold">{emailsPerDay[0]}</span>
                                            </div>
                                            <Slider
                                                value={emailsPerDay}
                                                min={10}
                                                max={500}
                                                step={10}
                                                disabled
                                                className="opacity-50 cursor-not-allowed"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Fixed at 50 emails/day for optimal deliverability
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label>Delay between emails</Label>
                                                <span className="text-sm font-semibold">{delayBetweenEmails[0]} min</span>
                                            </div>
                                            <Slider
                                                value={delayBetweenEmails}
                                                min={1}
                                                max={10}
                                                step={1}
                                                disabled
                                                className="opacity-50 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>

                                    {/* Tracking Options */}
                                    <div className="space-y-4 pt-4 border-t">
                                        <h4 className="font-medium flex items-center gap-2">
                                            <Eye className="h-4 w-4" />
                                            Tracking Options
                                        </h4>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <Label>Track Opens</Label>
                                                    <p className="text-xs text-muted-foreground">
                                                        Know when recipients open your emails
                                                    </p>
                                                </div>
                                                <Switch checked={trackOpens} onCheckedChange={setTrackOpens} />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <Label>Track Clicks</Label>
                                                    <p className="text-xs text-muted-foreground">
                                                        Track when links in your emails are clicked
                                                    </p>
                                                </div>
                                                <Switch checked={trackClicks} onCheckedChange={setTrackClicks} />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Step 4: Review & Launch */}
                        {currentStep === 4 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Check className="h-5 w-5" />
                                        Review & Launch
                                    </CardTitle>
                                    <CardDescription>
                                        Review your campaign details before launching
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Campaign Overview */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-muted rounded-lg">
                                            <p className="text-sm text-muted-foreground">Campaign Name</p>
                                            <p className="font-semibold mt-1">{campaignName}</p>
                                        </div>
                                        <div className="p-4 bg-muted rounded-lg">
                                            <p className="text-sm text-muted-foreground">Lead List</p>
                                            <p className="font-semibold mt-1">{selectedLeadList?.name}</p>
                                        </div>
                                        <div className="p-4 bg-muted rounded-lg">
                                            <p className="text-sm text-muted-foreground">Total Leads</p>
                                            <p className="font-semibold mt-1">{selectedLeadList?.totalLeads}</p>
                                        </div>
                                        <div className="p-4 bg-muted rounded-lg">
                                            <p className="text-sm text-muted-foreground">Sending Domain</p>
                                            <p className="font-semibold mt-1">{domain}</p>
                                        </div>
                                    </div>

                                    {/* Email Sequence Summary */}
                                    <div className="border-t pt-4">
                                        <h4 className="font-medium mb-3">Email Sequence ({emailSequence.length} emails)</h4>
                                        <div className="space-y-3">
                                            {emailSequence.map((email, index) => (
                                                <div key={index} className="p-3 bg-muted rounded-lg">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium">
                                                                {index === 0 ? "Initial Email" : `Follow-up #${index}`}
                                                                {index > 0 && (
                                                                    <span className="text-muted-foreground ml-2">
                                                                        (sent after {email.delayDays} days)
                                                                    </span>
                                                                )}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground mt-1">
                                                                Subject: {email.subject}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Settings Summary */}
                                    <div className="border-t pt-4">
                                        <h4 className="font-medium mb-3">Settings</h4>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div className="flex items-center justify-between p-2 bg-muted rounded">
                                                <span className="text-muted-foreground">Emails per day:</span>
                                                <span className="font-medium">{emailsPerDay[0]}</span>
                                            </div>
                                            <div className="flex items-center justify-between p-2 bg-muted rounded">
                                                <span className="text-muted-foreground">Delay between:</span>
                                                <span className="font-medium">{delayBetweenEmails[0]} min</span>
                                            </div>
                                            <div className="flex items-center justify-between p-2 bg-muted rounded">
                                                <span className="text-muted-foreground">Track Opens:</span>
                                                <span className="font-medium">{trackOpens ? "Yes" : "No"}</span>
                                            </div>
                                            <div className="flex items-center justify-between p-2 bg-muted rounded">
                                                <span className="text-muted-foreground">Track Clicks:</span>
                                                <span className="font-medium">{trackClicks ? "Yes" : "No"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Launch Warning */}
                                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                                        <p className="text-sm">
                                            <strong>Ready to launch?</strong> Your campaign will start sending immediately
                                            after you click the launch button below.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8">
                <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={currentStep === 1}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>

                <div className="flex gap-2">
                    {currentStep < 4 ? (
                        <Button onClick={handleNext} disabled={!canProceed()}>
                            Next
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    ) : (
                        <Button onClick={handleLaunch} disabled={!canProceed()}>
                            <Zap className="h-4 w-4 mr-2" />
                            Launch Campaign
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
