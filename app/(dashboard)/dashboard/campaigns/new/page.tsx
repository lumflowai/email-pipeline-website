'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import {
    generateEmail1Curiosity,
    generateEmail2Pitch,
    generateEmail3Followup,
} from '@/lib/ai-email-generator';
import { InstantlyClient } from '@/lib/instantly';
import { createABTest } from '@/lib/ab-testing';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    Loader2,
    Sparkles,
    Users,
    Calendar,
    Rocket,
    Mail,
    CheckCircle2,
    AlertCircle,
} from 'lucide-react';

// ====================
// Types
// ====================

interface Lead {
    id: string;
    email: string;
    business_name: string;
    category?: string;
    rating?: number;
    review_count?: number;
    website?: string;
}

interface BusinessProfile {
    businessName: string;
    services: string[];
    targetAudience: string;
    caseStudies: string;
    uniqueSellingPoints: string[];
    pricingInfo?: string;
}

interface GeneratedEmails {
    email1: { subject: string; body: string };
    email2: { subject: string; body: string };
    email3: { subject: string; body: string };
}

interface Domain {
    id: string;
    domain: string;
    status: string;
}

// ====================
// Supabase Client
// ====================

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ====================
// Component
// ====================

export default function NewCampaignPage() {
    const router = useRouter();

    // Step management
    const [step, setStep] = useState(1);

    // Data
    const [leads, setLeads] = useState<Lead[]>([]);
    const [selectedLeads, setSelectedLeads] = useState<Lead[]>([]);
    const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
    const [domains, setDomains] = useState<Domain[]>([]);
    const [generatedEmails, setGeneratedEmails] = useState<GeneratedEmails | null>(null);

    // Form fields
    const [campaignName, setCampaignName] = useState('');
    const [calendarLink, setCalendarLink] = useState('');
    const [selectedDomain, setSelectedDomain] = useState('');

    // A/B Testing fields
    const [enableABTest, setEnableABTest] = useState(false);
    const [abTestSubjects, setABTestSubjects] = useState<string[]>(['', '']);

    // UI states
    const [isGenerating, setIsGenerating] = useState(false);
    const [isLaunching, setIsLaunching] = useState(false);
    const [error, setError] = useState('');

    // ====================
    // Load Data on Mount
    // ====================

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // Get current user
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            // Load leads
            const { data: leadsData } = await supabase
                .from('leads')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            setLeads(leadsData || []);

            // Load business profile
            const { data: profileData } = await supabase
                .from('business_profiles')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (profileData) {
                setBusinessProfile(profileData);
            } else {
                // Redirect to onboarding if no profile
                router.push('/onboarding');
            }

            // Load domains
            const { data: domainsData } = await supabase
                .from('domains')
                .select('*')
                .eq('user_id', user.id)
                .eq('status', 'active');

            setDomains(domainsData || []);
        } catch (err) {
            console.error('Failed to load data:', err);
            setError('Failed to load campaign data');
        }
    };

    // ====================
    // Step 2: Generate Emails
    // ====================

    const handleGenerateSequence = async () => {
        if (!businessProfile || selectedLeads.length === 0) {
            setError('Please select leads and ensure your business profile is set up');
            return;
        }

        setIsGenerating(true);
        setError('');

        try {
            // Use first lead as sample for template generation
            const sampleLead = selectedLeads[0];

            // Map to AI generator Lead interface
            const aiLead = {
                businessName: sampleLead.business_name,
                email: sampleLead.email,
                rating: sampleLead.rating,
                reviewCount: sampleLead.review_count,
                website: sampleLead.website,
                category: sampleLead.category,
            };

            // Generate Email 1 (Curiosity)
            const email1 = await generateEmail1Curiosity(businessProfile, aiLead);

            // Generate Email 2 (Pitch) - mock a positive reply
            const email2 = await generateEmail2Pitch(
                businessProfile,
                aiLead,
                "Sounds interesting! Tell me more about what you do."
            );

            // Generate Email 3 (Followup) - mock conversation history
            const conversationHistory = `
Email 1: ${email1.body}
Their Reply: Sounds interesting! Tell me more about what you do.
Email 2: ${email2.body}
[No reply yet]
`;
            const email3 = await generateEmail3Followup(
                businessProfile,
                aiLead,
                conversationHistory
            );

            setGeneratedEmails({ email1, email2, email3 });
            setStep(3); // Move to review step
        } catch (err) {
            console.error('Failed to generate emails:', err);
            setError('Failed to generate email sequence. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    // ====================
    // Step 4: Launch Campaign (Normal or A/B Test)
    // ====================

    const handleLaunch = async () => {
        if (!generatedEmails || !selectedDomain || !campaignName) {
            setError('Please complete all fields');
            return;
        }

        // Validate A/B test subjects if enabled
        if (enableABTest) {
            const validSubjects = abTestSubjects.filter(s => s.trim() !== '');
            if (validSubjects.length < 2) {
                setError('A/B testing requires at least 2 subject line variants');
                return;
            }
            if (selectedLeads.length < validSubjects.length * 10) {
                setError(`Not enough leads for A/B testing. Need at least ${validSubjects.length * 10} leads (minimum 10 per variant)`);
                return;
            }
        }

        setIsLaunching(true);
        setError('');

        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // Get Instantly API key
            const { data: connection } = await supabase
                .from('instantly_connections')
                .select('api_key')
                .eq('user_id', user.id)
                .single();

            if (!connection) {
                throw new Error('Instantly API key not found. Please connect your account.');
            }

            const instantly = new InstantlyClient(connection.api_key);

            // Replace calendar link in emails
            const email1Body = generatedEmails.email1.body.replace(
                /\{\{calendarLink\}\}/g,
                calendarLink
            );

            // ====================
            // A/B TEST PATH
            // ====================
            if (enableABTest) {
                const validSubjects = abTestSubjects.filter(s => s.trim() !== '');

                // Create A/B test campaigns
                await createABTest({
                    campaignName,
                    subjects: validSubjects,
                    leads: selectedLeads,
                    fromEmail: selectedDomain,
                    emailBody: email1Body,
                    calendarLink,
                    userId: user.id,
                    apiKey: connection.api_key,
                });

                // Success! Redirect to campaigns list
                router.push('/dashboard/campaigns');
                return;
            }

            // ====================
            // NORMAL CAMPAIGN PATH
            // ====================
            const email2Body = generatedEmails.email2.body.replace(
                /\{\{calendarLink\}\}/g,
                calendarLink
            );
            const email3Body = generatedEmails.email3.body.replace(
                /\{\{calendarLink\}\}/g,
                calendarLink
            );

            // 1. Create campaign in Instantly
            const instantlyCampaign = await instantly.createCampaign({
                name: campaignName,
                from_email: selectedDomain,
                subject: generatedEmails.email1.subject,
                body: email1Body,
            });

            // 2. Add leads to campaign
            await instantly.addLeadsToCampaign(
                instantlyCampaign.id,
                selectedLeads.map((lead) => ({
                    email: lead.email,
                    first_name: lead.business_name.split(' ')[0] || lead.business_name,
                    company_name: lead.business_name,
                    website: lead.website,
                    personalization: `${lead.category || 'business'} with ${lead.rating || 'great'} rating`,
                }))
            );

            // 3. Save to our database
            const { data: savedCampaign } = await supabase
                .from('campaigns')
                .insert({
                    user_id: user.id,
                    name: campaignName,
                    instantly_campaign_id: instantlyCampaign.id,
                    status: 'active',
                    calendar_link: calendarLink,
                    email_1_subject: generatedEmails.email1.subject,
                    email_1_body: email1Body,
                    email_2_subject: generatedEmails.email2.subject,
                    email_2_body: email2Body,
                    email_3_subject: generatedEmails.email3.subject,
                    email_3_body: email3Body,
                    total_leads: selectedLeads.length,
                })
                .select()
                .single();

            // 4. Link leads to campaign
            await supabase.from('campaign_leads').insert(
                selectedLeads.map((lead) => ({
                    campaign_id: savedCampaign.id,
                    lead_id: lead.id,
                }))
            );

            // Success! Redirect to campaign dashboard
            router.push(`/dashboard/campaigns/${savedCampaign.id}/analytics`);
        } catch (err) {
            console.error('Failed to launch campaign:', err);
            setError(
                err instanceof Error ? err.message : 'Failed to launch campaign. Please try again.'
            );
        } finally {
            setIsLaunching(false);
        }
    };

    // ====================
    // Lead Selection Handlers
    // ====================

    const toggleLeadSelection = (lead: Lead) => {
        setSelectedLeads((prev) =>
            prev.find((l) => l.id === lead.id)
                ? prev.filter((l) => l.id !== lead.id)
                : [...prev, lead]
        );
    };

    const selectAllLeads = () => {
        setSelectedLeads(leads);
    };

    const clearSelection = () => {
        setSelectedLeads([]);
    };

    // ====================
    // Render
    // ====================

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Create New Campaign</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Launch AI-powered email sequences with Instantly
                    </p>
                </div>

                {/* Progress Indicator */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-3">
                        {[1, 2, 3, 4].map((s) => (
                            <div key={s} className="flex items-center flex-1">
                                <div
                                    className={`flex-1 h-2 rounded-full transition-all duration-200 ${s <= step ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
                                        }`}
                                />
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className={step >= 1 ? 'text-primary font-medium' : 'text-gray-500'}>
                            Select Leads
                        </span>
                        <span className={step >= 2 ? 'text-primary font-medium' : 'text-gray-500'}>
                            Generate Emails
                        </span>
                        <span className={step >= 3 ? 'text-primary font-medium' : 'text-gray-500'}>
                            Configure
                        </span>
                        <span className={step >= 4 ? 'text-primary font-medium' : 'text-gray-500'}>
                            Launch
                        </span>
                    </div>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        <p className="text-red-800 dark:text-red-200">{error}</p>
                    </div>
                )}

                {/* Step 1: Select Leads */}
                {step === 1 && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2 mb-2">
                                <Users className="w-6 h-6 text-primary" />
                                <CardTitle>Select Leads</CardTitle>
                            </div>
                            <CardDescription>
                                Choose leads from your scraped lists ({leads.length} available)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {selectedLeads.length} selected
                                </p>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={selectAllLeads}>
                                        Select All
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={clearSelection}>
                                        Clear
                                    </Button>
                                </div>
                            </div>

                            {/* Leads Table */}
                            <div className="border dark:border-gray-700 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                                        <tr>
                                            <th className="p-3 text-left text-sm font-medium">#</th>
                                            <th className="p-3 text-left text-sm font-medium">Business</th>
                                            <th className="p-3 text-left text-sm font-medium">Email</th>
                                            <th className="p-3 text-left text-sm font-medium">Rating</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {leads.map((lead) => (
                                            <tr
                                                key={lead.id}
                                                className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${selectedLeads.find((l) => l.id === lead.id)
                                                    ? 'bg-primary/10'
                                                    : ''
                                                    }`}
                                                onClick={() => toggleLeadSelection(lead)}
                                            >
                                                <td className="p-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={!!selectedLeads.find((l) => l.id === lead.id)}
                                                        onChange={() => { }}
                                                        className="rounded"
                                                    />
                                                </td>
                                                <td className="p-3 font-medium">{lead.business_name}</td>
                                                <td className="p-3 text-sm text-gray-600 dark:text-gray-400">
                                                    {lead.email}
                                                </td>
                                                <td className="p-3">
                                                    {lead.rating && (
                                                        <Badge variant="outline">
                                                            ⭐ {lead.rating} ({lead.review_count || 0})
                                                        </Badge>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button
                                    onClick={() => setStep(2)}
                                    disabled={selectedLeads.length === 0}
                                >
                                    Continue → ({selectedLeads.length} leads)
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Step 2: Generate AI Emails */}
                {step === 2 && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-6 h-6 text-primary" />
                                <CardTitle>Generate Email Sequence</CardTitle>
                            </div>
                            <CardDescription>
                                AI will create personalized 3-email sequences
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                    💡 Your AI assistant will generate:
                                </p>
                                <ul className="mt-2 text-sm text-blue-700 dark:text-blue-300 space-y-1 ml-4">
                                    <li>• Email 1: Curiosity-driven first touch (no pitch)</li>
                                    <li>• Email 2: Value proposition with case study</li>
                                    <li>• Email 3: Soft final followup</li>
                                </ul>
                            </div>

                            {!generatedEmails && (
                                <Button
                                    onClick={handleGenerateSequence}
                                    disabled={isGenerating}
                                    className="w-full"
                                    size="lg"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Generating with AI...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4 mr-2" />
                                            Generate 3-Email Sequence
                                        </>
                                    )}
                                </Button>
                            )}

                            <div className="flex gap-3 pt-4">
                                <Button variant="outline" onClick={() => setStep(1)}>
                                    ← Back
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Step 3: Review & Configure */}
                {step === 3 && generatedEmails && (
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Campaign Configuration</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="block mb-2 font-medium text-sm">
                                        Campaign Name
                                    </label>
                                    <Input
                                        placeholder="e.g., Local Restaurants - SEO Outreach"
                                        value={campaignName}
                                        onChange={(e) => setCampaignName(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block mb-2 font-medium text-sm">
                                        <Calendar className="w-4 h-4 inline mr-1" />
                                        Calendar Link (Calendly/Cal.com)
                                    </label>
                                    <Input
                                        type="url"
                                        placeholder="https://calendly.com/your-link"
                                        value={calendarLink}
                                        onChange={(e) => setCalendarLink(e.target.value)}
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        This will replace {'{'}
                                        {'{'}calendarLink{'}}'}
                                    </p>
                                </div>

                                <div>
                                    <label className="block mb-2 font-medium text-sm">
                                        Sending Domain
                                    </label>
                                    <select
                                        className="w-full p-2 border dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                                        value={selectedDomain}
                                        onChange={(e) => setSelectedDomain(e.target.value)}
                                    >
                                        <option value="">Select domain...</option>
                                        {domains.map((domain) => (
                                            <option key={domain.id} value={domain.domain}>
                                                {domain.domain}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* A/B Testing Section */}
                                <div className="border-t dark:border-gray-700 pt-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <input
                                            type="checkbox"
                                            id="ab-test-toggle"
                                            checked={enableABTest}
                                            onChange={(e) => setEnableABTest(e.target.checked)}
                                            className="w-4 h-4 rounded"
                                        />
                                        <label htmlFor="ab-test-toggle" className="font-medium text-sm cursor-pointer">
                                            Enable A/B Testing
                                        </label>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                                        Test 2-3 subject line variants to find the best performer
                                    </p>

                                    {enableABTest && (
                                        <div className="space-y-3 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                                            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                                Subject Line Variants
                                            </p>
                                            {[0, 1, 2].map((index) => (
                                                <div key={index}>
                                                    <label className="block mb-1 text-xs text-blue-800 dark:text-blue-200">
                                                        Variant {String.fromCharCode(65 + index)} {index >= 2 && '(Optional)'}
                                                    </label>
                                                    <Input
                                                        placeholder={`Subject line variant ${String.fromCharCode(65 + index)}`}
                                                        value={abTestSubjects[index] || ''}
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                            const newSubjects = [...abTestSubjects];
                                                            newSubjects[index] = e.target.value;
                                                            setABTestSubjects(newSubjects);
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                            <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                                                💡 Winner determined after 24 hours based on open rate (30%) + positive reply rate (70%)
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Email Previews */}
                        {['email1', 'email2', 'email3'].map((key, index) => {
                            const email = generatedEmails[key as keyof GeneratedEmails];
                            return (
                                <Card key={key}>
                                    <CardHeader>
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-5 h-5 text-primary" />
                                            <CardTitle className="text-lg">Email {index + 1}</CardTitle>
                                            <Badge variant="outline">
                                                {index === 0
                                                    ? 'Curiosity'
                                                    : index === 1
                                                        ? 'Pitch'
                                                        : 'Followup'}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div>
                                            <label className="block mb-1 text-sm font-medium">Subject</label>
                                            <Input
                                                value={email.subject}
                                                onChange={(e) =>
                                                    setGeneratedEmails({
                                                        ...generatedEmails,
                                                        [key]: { ...email, subject: e.target.value },
                                                    })
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label className="block mb-1 text-sm font-medium">Body</label>
                                            <Textarea
                                                rows={8}
                                                value={email.body}
                                                onChange={(e) =>
                                                    setGeneratedEmails({
                                                        ...generatedEmails,
                                                        [key]: { ...email, body: e.target.value },
                                                    })
                                                }
                                                className="font-mono text-sm"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}

                        <div className="flex gap-3 pt-4">
                            <Button variant="outline" onClick={() => setStep(2)}>
                                ← Back
                            </Button>
                            <Button onClick={() => setStep(4)} className="flex-1">
                                Review & Launch →
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 4: Launch */}
                {step === 4 && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2 mb-2">
                                <Rocket className="w-6 h-6 text-primary" />
                                <CardTitle>Ready to Launch</CardTitle>
                            </div>
                            <CardDescription>Review your campaign details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                        Campaign Name
                                    </p>
                                    <p className="font-medium">{campaignName}</p>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                        Total Leads
                                    </p>
                                    <p className="font-medium">{selectedLeads.length}</p>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                        Sending From
                                    </p>
                                    <p className="font-medium">{selectedDomain}</p>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                        Email Sequence
                                    </p>
                                    <p className="font-medium">3 emails</p>
                                </div>
                            </div>

                            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-green-800 dark:text-green-200">
                                            Campaign Ready
                                        </p>
                                        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                                            Clicking Launch will:
                                        </p>
                                        <ul className="mt-2 text-sm text-green-700 dark:text-green-300 space-y-1 ml-4">
                                            <li>• Create campaign in Instantly</li>
                                            <li>• Upload {selectedLeads.length} leads</li>
                                            <li>• Set up 3-email sequence</li>
                                            <li>• Start sending automatically</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button variant="outline" onClick={() => setStep(3)}>
                                    ← Back
                                </Button>
                                <Button
                                    onClick={handleLaunch}
                                    disabled={isLaunching}
                                    className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
                                    size="lg"
                                >
                                    {isLaunching ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Launching Campaign...
                                        </>
                                    ) : (
                                        <>
                                            <Rocket className="w-4 h-4 mr-2" />
                                            Launch Campaign
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
