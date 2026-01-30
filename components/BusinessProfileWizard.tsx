'use client';

import { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Building2, Globe, Target, Sparkles, Award, Zap } from 'lucide-react';

// Common services for local business marketing agencies
const COMMON_SERVICES = [
    'SEO',
    'PPC/Google Ads',
    'Web Design',
    'Social Media Marketing',
    'Content Marketing',
    'Email Marketing',
    'Branding',
    'Video Production',
    'Graphic Design',
    'Local SEO',
    'E-commerce',
    'Consulting',
];

interface BusinessProfile {
    businessName: string;
    services: string[];
    targetAudience: string;
    pricingInfo: string;
    websiteUrl: string;
    caseStudies: string;
    uniqueSellingPoints: [string, string, string];
}

interface BusinessProfileWizardProps {
    onComplete: (data: BusinessProfile) => void;
}

export function BusinessProfileWizard({ onComplete }: BusinessProfileWizardProps) {
    const [step, setStep] = useState(1);
    const [profile, setProfile] = useState<BusinessProfile>({
        businessName: '',
        services: [],
        targetAudience: '',
        pricingInfo: '',
        websiteUrl: '',
        caseStudies: '',
        uniqueSellingPoints: ['', '', ''],
    });

    const toggleService = (service: string) => {
        setProfile((prev) => ({
            ...prev,
            services: prev.services.includes(service)
                ? prev.services.filter((s) => s !== service)
                : [...prev.services, service],
        }));
    };

    const updateUSP = (index: number, value: string) => {
        const newUSPs: [string, string, string] = [...profile.uniqueSellingPoints] as [
            string,
            string,
            string
        ];
        newUSPs[index] = value;
        setProfile({ ...profile, uniqueSellingPoints: newUSPs });
    };

    const canContinue = () => {
        if (step === 1) {
            return profile.businessName.trim() !== '' && profile.targetAudience.trim() !== '';
        }
        if (step === 2) {
            return profile.services.length > 0;
        }
        return true;
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            {/* Progress Indicator */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                    {[1, 2, 3, 4].map((s) => (
                        <div
                            key={s}
                            className={`flex-1 h-2 rounded-full transition-all duration-200 ${s <= step
                                    ? 'bg-primary'
                                    : 'bg-gray-200 dark:bg-gray-700'
                                }`}
                        />
                    ))}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Step {step} of 4
                </p>
            </div>

            {/* Step 1: Basic Info */}
            {step === 1 && (
                <Card className="border-gray-200 dark:border-gray-800 transition-all duration-200">
                    <CardHeader className="space-y-1">
                        <div className="flex items-center gap-2 mb-2">
                            <Building2 className="w-6 h-6 text-primary" />
                            <h2 className="text-2xl font-bold">Tell us about your business</h2>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                            This helps our AI personalize your outreach
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div>
                            <label className="block mb-2 font-medium text-sm">
                                Business Name <span className="text-red-500">*</span>
                            </label>
                            <Input
                                placeholder="e.g., Acme Digital Marketing"
                                value={profile.businessName}
                                onChange={(e) =>
                                    setProfile({ ...profile, businessName: e.target.value })
                                }
                                className="transition-all duration-200"
                            />
                        </div>
                        <div>
                            <label className="block mb-2 font-medium text-sm">
                                <Globe className="w-4 h-4 inline mr-1" />
                                Website URL
                            </label>
                            <Input
                                type="url"
                                placeholder="https://yourwebsite.com"
                                value={profile.websiteUrl}
                                onChange={(e) =>
                                    setProfile({ ...profile, websiteUrl: e.target.value })
                                }
                                className="transition-all duration-200"
                            />
                        </div>
                        <div>
                            <label className="block mb-2 font-medium text-sm">
                                <Target className="w-4 h-4 inline mr-1" />
                                Who is your target audience? <span className="text-red-500">*</span>
                            </label>
                            <Textarea
                                placeholder="e.g., Local restaurants and cafes in urban areas with 10-50 employees"
                                value={profile.targetAudience}
                                onChange={(e) =>
                                    setProfile({ ...profile, targetAudience: e.target.value })
                                }
                                rows={3}
                                className="transition-all duration-200 resize-none"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Be specific - this helps AI write better cold emails
                            </p>
                        </div>
                        <Button
                            onClick={() => setStep(2)}
                            disabled={!canContinue()}
                            className="w-full transition-all duration-200"
                        >
                            Continue →
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Step 2: Services */}
            {step === 2 && (
                <Card className="border-gray-200 dark:border-gray-800 transition-all duration-200">
                    <CardHeader className="space-y-1">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-6 h-6 text-primary" />
                            <h2 className="text-2xl font-bold">What services do you offer?</h2>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                            Select all that apply
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="grid grid-cols-2 gap-3">
                            {COMMON_SERVICES.map((service) => (
                                <Badge
                                    key={service}
                                    variant={
                                        profile.services.includes(service) ? 'default' : 'outline'
                                    }
                                    className="cursor-pointer p-3 justify-center text-center hover:scale-105 transition-all duration-200"
                                    onClick={() => toggleService(service)}
                                >
                                    {service}
                                </Badge>
                            ))}
                        </div>
                        <div>
                            <label className="block mb-2 font-medium text-sm">
                                Pricing (ballpark)
                            </label>
                            <Textarea
                                placeholder="e.g., SEO packages start at $1,500/month, Website design $3,000-$10,000"
                                value={profile.pricingInfo}
                                onChange={(e) =>
                                    setProfile({ ...profile, pricingInfo: e.target.value })
                                }
                                rows={3}
                                className="transition-all duration-200 resize-none"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Optional - helps AI handle pricing questions
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setStep(1)}
                                className="transition-all duration-200"
                            >
                                ← Back
                            </Button>
                            <Button
                                onClick={() => setStep(3)}
                                disabled={!canContinue()}
                                className="flex-1 transition-all duration-200"
                            >
                                Continue →
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Step 3: Social Proof */}
            {step === 3 && (
                <Card className="border-gray-200 dark:border-gray-800 transition-all duration-200">
                    <CardHeader className="space-y-1">
                        <div className="flex items-center gap-2 mb-2">
                            <Award className="w-6 h-6 text-primary" />
                            <h2 className="text-2xl font-bold">Social Proof & Results</h2>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                            Help us showcase your wins
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div>
                            <label className="block mb-2 font-medium text-sm">
                                Case Studies / Results
                            </label>
                            <Textarea
                                placeholder="Example: Increased ABC Dental's website traffic by 300% in 6 months, Generated $50K in new revenue for XYZ Restaurant through Google Ads"
                                value={profile.caseStudies}
                                onChange={(e) =>
                                    setProfile({ ...profile, caseStudies: e.target.value })
                                }
                                rows={6}
                                className="transition-all duration-200 resize-none"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                💡 AI will use these to personalize Email 2 (the pitch)
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setStep(2)}
                                className="transition-all duration-200"
                            >
                                ← Back
                            </Button>
                            <Button
                                onClick={() => setStep(4)}
                                className="flex-1 transition-all duration-200"
                            >
                                Continue →
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Step 4: Unique Value */}
            {step === 4 && (
                <Card className="border-gray-200 dark:border-gray-800 transition-all duration-200">
                    <CardHeader className="space-y-1">
                        <div className="flex items-center gap-2 mb-2">
                            <Zap className="w-6 h-6 text-primary" />
                            <h2 className="text-2xl font-bold">What makes you different?</h2>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                            Your unique selling points
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        {[0, 1, 2].map((i) => (
                            <div key={i}>
                                <label className="block mb-2 font-medium text-sm">
                                    USP #{i + 1}
                                </label>
                                <Input
                                    placeholder={
                                        i === 0
                                            ? 'e.g., We only work with local businesses (no generic agencies)'
                                            : i === 1
                                                ? 'e.g., 30-day money-back guarantee'
                                                : 'e.g., Same-day response time'
                                    }
                                    value={profile.uniqueSellingPoints[i]}
                                    onChange={(e) => updateUSP(i, e.target.value)}
                                    className="transition-all duration-200"
                                />
                            </div>
                        ))}
                        <div className="flex gap-3 pt-4">
                            <Button
                                variant="outline"
                                onClick={() => setStep(3)}
                                className="transition-all duration-200"
                            >
                                ← Back
                            </Button>
                            <Button
                                onClick={() => onComplete(profile)}
                                className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 transition-all duration-200"
                            >
                                Complete Setup ✓
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
