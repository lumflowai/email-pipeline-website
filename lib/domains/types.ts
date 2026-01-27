export type DomainStatus = 'verified' | 'pending' | 'failed' | 'warming';

export interface DNSRecord {
    type: 'TXT' | 'CNAME' | 'MX';
    host: string;
    value: string;
    priority?: number;
}

export interface Domain {
    id: string;
    domain: string;
    status: DomainStatus;
    warmupProgress: number;
    dailyLimit: number;
    dailySent: number;
    healthScore: number;
    verifiedAt?: Date;
    createdAt: Date;
    dnsRecords: DNSRecord[];
    stats?: {
        totalSent: number;
        opened: number;
        clicked: number;
        bounced: number;
    };
}

export interface DomainActivity {
    date: string;
    sent: number;
    opened: number;
    clicked: number;
}

export interface VerificationResult {
    success: boolean;
    failedRecords?: string[];
    message: string;
}
