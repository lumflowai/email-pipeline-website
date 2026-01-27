"use client";

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DNSRecordsTable } from './DNSRecordsTable';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Info, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { isValidDomain } from '@/lib/domains/dns-generator';
import { generateDNSRecords } from '@/lib/domains/dns-generator';
import { simulateVerification } from '@/lib/domains/mock-data';
import { DNSRecord } from '@/lib/domains/types';
import { motion, AnimatePresence } from 'framer-motion';

interface AddDomainModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onDomainAdded: (domain: string) => void;
}

type Step = 1 | 2 | 3;

export function AddDomainModal({ open, onOpenChange, onDomainAdded }: AddDomainModalProps) {
    const [step, setStep] = useState<Step>(1);
    const [domain, setDomain] = useState('');
    const [error, setError] = useState('');
    const [dnsRecords, setDnsRecords] = useState<DNSRecord[]>([]);
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState<'checking' | 'success' | 'failed' | null>(null);
    const [verificationMessage, setVerificationMessage] = useState('');

    const resetModal = () => {
        setStep(1);
        setDomain('');
        setError('');
        setDnsRecords([]);
        setIsVerifying(false);
        setVerificationStatus(null);
        setVerificationMessage('');
    };

    const handleClose = () => {
        resetModal();
        onOpenChange(false);
    };

    const handleContinue = () => {
        const trimmedDomain = domain.trim().toLowerCase();

        if (!trimmedDomain) {
            setError('Please enter a domain name');
            return;
        }

        if (!isValidDomain(trimmedDomain)) {
            setError('Please enter a valid domain (e.g., mail.yourdomain.com)');
            return;
        }

        setError('');
        setDomain(trimmedDomain);
        setDnsRecords(generateDNSRecords(trimmedDomain));
        setStep(2);
    };

    const handleVerify = async () => {
        setIsVerifying(true);
        setVerificationStatus('checking');
        setStep(3);

        const result = await simulateVerification(domain);

        setIsVerifying(false);

        if (result.success) {
            setVerificationStatus('success');
            setVerificationMessage(result.message);
            setTimeout(() => {
                onDomainAdded(domain);
                handleClose();
            }, 2000);
        } else {
            setVerificationStatus('failed');
            setVerificationMessage(result.message);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px] bg-[#1a1a24] border-[#2a2a3a]">
                <AnimatePresence mode="wait">
                    {/* Step 1: Enter Domain */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <DialogHeader>
                                <DialogTitle className="text-white">Connect New Domain</DialogTitle>
                                <DialogDescription className="text-slate-400">
                                    Enter the domain you'll use to send emails
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="domain" className="text-slate-300">
                                        Domain Name
                                    </Label>
                                    <Input
                                        id="domain"
                                        placeholder="mail.yourdomain.com"
                                        value={domain}
                                        onChange={(e) => {
                                            setDomain(e.target.value);
                                            setError('');
                                        }}
                                        className={`border-white/10 bg-[#0a0a0f] text-white ${error ? 'border-red-500' : ''}`}
                                        onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
                                    />
                                    {error && (
                                        <p className="text-sm text-red-400">{error}</p>
                                    )}
                                    <p className="text-xs text-slate-500">
                                        Enter a subdomain like mail.yourdomain.com or send.yourdomain.com
                                    </p>
                                </div>

                                <Alert className="border-purple-500/20 bg-purple-500/5">
                                    <Info className="h-4 w-4 text-purple-400" />
                                    <AlertDescription className="text-sm text-slate-300">
                                        <strong className="text-white">Recommended:</strong> Use a subdomain (like mail.yourdomain.com)
                                        instead of your main domain to protect your domain reputation.
                                    </AlertDescription>
                                </Alert>
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={handleClose}>
                                    Cancel
                                </Button>
                                <Button onClick={handleContinue} className="bg-purple-600 hover:bg-purple-700">
                                    Continue
                                </Button>
                            </DialogFooter>
                        </motion.div>
                    )}

                    {/* Step 2: DNS Configuration */}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <DialogHeader>
                                <DialogTitle className="text-white">Add These DNS Records</DialogTitle>
                                <DialogDescription className="text-slate-400">
                                    Copy these records to your DNS provider (Cloudflare, Namecheap, etc.)
                                </DialogDescription>
                                <div className="flex items-center gap-2 pt-2">
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                                        <span className="text-xs text-slate-500">Step 2 of 3</span>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                                <DNSRecordsTable records={dnsRecords} />

                                <Accordion type="single" collapsible className="border-none">
                                    <AccordionItem value="help" className="border-[#2a2a3a]">
                                        <AccordionTrigger className="text-slate-300 hover:text-white">
                                            How to add DNS records?
                                        </AccordionTrigger>
                                        <AccordionContent className="text-slate-400 space-y-3">
                                            <div>
                                                <h4 className="text-white font-medium mb-1">Cloudflare</h4>
                                                <ol className="text-sm space-y-1 list-decimal list-inside">
                                                    <li>Log in to your Cloudflare account</li>
                                                    <li>Select your domain</li>
                                                    <li>Go to DNS → Records</li>
                                                    <li>Click "Add record" and paste the values above</li>
                                                </ol>
                                            </div>
                                            <div>
                                                <h4 className="text-white font-medium mb-1">Namecheap</h4>
                                                <ol className="text-sm space-y-1 list-decimal list-inside">
                                                    <li>Log in to Namecheap</li>
                                                    <li>Go to Domain List → Manage</li>
                                                    <li>Navigate to Advanced DNS</li>
                                                    <li>Add new records with the values above</li>
                                                </ol>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={() => setStep(1)}>
                                    Back
                                </Button>
                                <Button onClick={handleVerify} className="bg-purple-600 hover:bg-purple-700">
                                    I've Added the Records
                                </Button>
                            </DialogFooter>
                        </motion.div>
                    )}

                    {/* Step 3: Verification */}
                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                        >
                            <DialogHeader>
                                <DialogTitle className="text-white">
                                    {verificationStatus === 'checking' && 'Verifying Your Domain'}
                                    {verificationStatus === 'success' && 'Domain Verified!'}
                                    {verificationStatus === 'failed' && 'Verification Failed'}
                                </DialogTitle>
                            </DialogHeader>

                            <div className="py-8">
                                {verificationStatus === 'checking' && (
                                    <div className="flex flex-col items-center space-y-4">
                                        <Loader2 className="h-12 w-12 text-purple-500 animate-spin" />
                                        <div className="space-y-2 text-center">
                                            <p className="text-sm text-slate-300">Checking DNS records...</p>
                                            <div className="space-y-1 text-xs text-slate-500">
                                                <p className="flex items-center justify-center gap-2">
                                                    <span className="inline-block w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                                                    Checking SPF record...
                                                </p>
                                                <p className="flex items-center justify-center gap-2">
                                                    <span className="inline-block w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                                                    Checking DKIM record...
                                                </p>
                                                <p className="flex items-center justify-center gap-2">
                                                    <span className="inline-block w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                                                    Checking CNAME record...
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {verificationStatus === 'success' && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                                        className="flex flex-col items-center space-y-4"
                                    >
                                        <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
                                            <CheckCircle2 className="h-10 w-10 text-green-500" />
                                        </div>
                                        <div className="text-center space-y-2">
                                            <h3 className="text-lg font-semibold text-white">
                                                Domain Verified Successfully!
                                            </h3>
                                            <p className="text-sm text-slate-400">
                                                Your domain is ready to send emails
                                            </p>
                                        </div>
                                    </motion.div>
                                )}

                                {verificationStatus === 'failed' && (
                                    <div className="flex flex-col items-center space-y-4">
                                        <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center">
                                            <AlertCircle className="h-10 w-10 text-red-500" />
                                        </div>
                                        <div className="text-center space-y-2">
                                            <h3 className="text-lg font-semibold text-white">
                                                Verification Failed
                                            </h3>
                                            <p className="text-sm text-slate-400">
                                                {verificationMessage}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {verificationStatus === 'failed' && (
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setStep(2)}>
                                        Edit DNS Records
                                    </Button>
                                    <Button onClick={handleVerify} className="bg-purple-600 hover:bg-purple-700">
                                        Retry Verification
                                    </Button>
                                </DialogFooter>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}
