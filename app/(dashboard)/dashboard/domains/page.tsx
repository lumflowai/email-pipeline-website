"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DomainCard } from '@/components/domains/DomainCard';
import { AddDomainModal } from '@/components/domains/AddDomainModal';
import { getMockDomains, addMockDomain } from '@/lib/domains/mock-data';
import { Domain } from '@/lib/domains/types';
import { Plus, Mail, Shield, TrendingUp, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DomainsPage() {
    const [domains, setDomains] = useState<Domain[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate loading
        setTimeout(() => {
            setDomains(getMockDomains());
            setIsLoading(false);
        }, 500);
    }, []);

    const handleDomainAdded = (domainName: string) => {
        const newDomain = addMockDomain(domainName);
        setDomains([...domains, newDomain]);
    };

    const isEmpty = domains.length === 0 && !isLoading;

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Email Domains</h1>
                    <p className="mt-1 text-slate-400">
                        Connect and verify your email sending domains
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Credits Badge */}
                    <Badge className="px-3 py-1.5 bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20">
                        <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                        8,420 Credits
                    </Badge>
                    {!isEmpty && (
                        <Button
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Domain
                        </Button>
                    )}
                </div>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="h-64 bg-[#1a1a24] border-[#2a2a3a] p-6">
                            <div className="skeleton h-6 w-3/4 mb-4"></div>
                            <div className="skeleton h-4 w-1/2 mb-6"></div>
                            <div className="space-y-3">
                                <div className="skeleton h-4 w-full"></div>
                                <div className="skeleton h-4 w-full"></div>
                                <div className="skeleton h-4 w-2/3"></div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {isEmpty && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col items-center justify-center py-16"
                >
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-purple-500/10 mb-6">
                        <Mail className="h-12 w-12 text-purple-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                        No Domains Connected Yet
                    </h2>
                    <p className="text-slate-400 mb-8 text-center max-w-md">
                        Connect your first email domain to start sending campaigns.
                        We will guide you through the setup process.
                    </p>
                    <Button
                        onClick={() => setIsAddModalOpen(true)}
                        size="lg"
                        className="bg-purple-600 hover:bg-purple-700 text-white mb-12"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Connect Your First Domain
                    </Button>

                    {/* Benefits Cards */}
                    <div className="grid gap-6 md:grid-cols-3 w-full max-w-4xl">
                        {[
                            {
                                icon: Mail,
                                title: 'Professional Emails',
                                description: 'Send from your own domain for a professional appearance',
                            },
                            {
                                icon: TrendingUp,
                                title: 'Better Deliverability',
                                description: 'Higher inbox rates with proper DNS configuration',
                            },
                            {
                                icon: Shield,
                                title: 'Brand Trust',
                                description: 'Recipients see and trust your brand in every email',
                            },
                        ].map((benefit, index) => (
                            <motion.div
                                key={benefit.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 + 0.3, duration: 0.4 }}
                            >
                                <Card className="p-6 bg-[#1a1a24] border-[#2a2a3a] hover:border-purple-500/30 transition-colors">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10 mb-4">
                                        <benefit.icon className="h-6 w-6 text-purple-500" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mb-2">
                                        {benefit.title}
                                    </h3>
                                    <p className="text-sm text-slate-400">
                                        {benefit.description}
                                    </p>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Active State - Domain Grid */}
            {!isEmpty && !isLoading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                >
                    {domains.map((domain, index) => (
                        <motion.div
                            key={domain.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05, duration: 0.3 }}
                        >
                            <DomainCard domain={domain} />
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {/* Add Domain Modal */}
            <AddDomainModal
                open={isAddModalOpen}
                onOpenChange={setIsAddModalOpen}
                onDomainAdded={handleDomainAdded}
            />
        </div>
    );
}
