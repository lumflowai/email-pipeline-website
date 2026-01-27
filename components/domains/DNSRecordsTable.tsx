"use client";

import { useState } from 'react';
import { DNSRecord } from '@/lib/domains/types';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

interface DNSRecordsTableProps {
    records: DNSRecord[];
    className?: string;
}

export function DNSRecordsTable({ records, className }: DNSRecordsTableProps) {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const { addToast } = useToast();

    const copyToClipboard = async (value: string, index: number) => {
        try {
            await navigator.clipboard.writeText(value);
            setCopiedIndex(index);
            addToast({
                type: "success",
                message: "DNS record copied to clipboard",
            });
            setTimeout(() => setCopiedIndex(null), 2000);
        } catch (err) {
            addToast({
                type: "error",
                message: "Failed to copy. Please copy manually",
            });
        }
    };

    return (
        <div className={cn("rounded-lg border border-[#2a2a3a] overflow-hidden", className)}>
            <Table>
                <TableHeader>
                    <TableRow className="bg-[#1a1a24] border-[#2a2a3a] hover:bg-[#1a1a24]">
                        <TableHead className="text-slate-300 font-semibold">Type</TableHead>
                        <TableHead className="text-slate-300 font-semibold">Host</TableHead>
                        <TableHead className="text-slate-300 font-semibold">Value</TableHead>
                        <TableHead className="text-slate-300 font-semibold w-[100px]">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {records.map((record, index) => (
                        <TableRow
                            key={index}
                            className="border-[#2a2a3a] hover:bg-white/5 transition-colors"
                        >
                            <TableCell className="font-medium text-white">
                                <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-purple-500/10 text-purple-400 text-xs font-mono">
                                    {record.type}
                                </span>
                            </TableCell>
                            <TableCell className="text-slate-300 font-mono text-sm">
                                {record.host}
                            </TableCell>
                            <TableCell className="text-slate-400 font-mono text-xs max-w-md truncate">
                                {record.value}
                            </TableCell>
                            <TableCell>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(record.value, index)}
                                    className="text-slate-400 hover:text-white hover:bg-white/5"
                                >
                                    {copiedIndex === index ? (
                                        <>
                                            <Check className="h-4 w-4 mr-1 text-green-400" />
                                            <span className="text-green-400">Copied</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-4 w-4 mr-1" />
                                            Copy
                                        </>
                                    )}
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
