import { Domain, DomainActivity, VerificationResult } from './types';
import { generateDNSRecords } from './dns-generator';

/**
 * Mock domains for testing
 */
export function getMockDomains(): Domain[] {
    return [
        {
            id: '1',
            domain: 'mail.lumflow.ai',
            status: 'verified',
            warmupProgress: 85,
            dailyLimit: 50,
            dailySent: 42,
            healthScore: 95,
            verifiedAt: new Date('2025-01-20'),
            createdAt: new Date('2025-01-15'),
            dnsRecords: generateDNSRecords('mail.lumflow.ai'),
            stats: {
                totalSent: 294,
                opened: 127,
                clicked: 34,
                bounced: 3,
            },
        },
        {
            id: '2',
            domain: 'hello.chumro.com',
            status: 'pending',
            warmupProgress: 0,
            dailyLimit: 50,
            dailySent: 0,
            healthScore: 0,
            createdAt: new Date(),
            dnsRecords: generateDNSRecords('hello.chumro.com'),
            stats: {
                totalSent: 0,
                opened: 0,
                clicked: 0,
                bounced: 0,
            },
        },
        {
            id: '3',
            domain: 'outreach.lumflow.ai',
            status: 'warming',
            warmupProgress: 45,
            dailyLimit: 30,
            dailySent: 28,
            healthScore: 78,
            verifiedAt: new Date('2025-01-25'),
            createdAt: new Date('2025-01-24'),
            dnsRecords: generateDNSRecords('outreach.lumflow.ai'),
            stats: {
                totalSent: 168,
                opened: 72,
                clicked: 15,
                bounced: 2,
            },
        },
    ];
}

/**
 * Get domain by ID
 */
export function getMockDomainById(id: string): Domain | undefined {
    return getMockDomains().find((d) => d.id === id);
}

/**
 * Simulate DNS verification (80% success rate)
 */
export async function simulateVerification(domain: string): Promise<VerificationResult> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const isSuccess = Math.random() > 0.2; // 80% success rate

    if (isSuccess) {
        return {
            success: true,
            message: 'All DNS records verified successfully!',
        };
    } else {
        // Random failure
        const failedRecords = ['SPF', 'DKIM', 'CNAME'];
        const failedRecord = failedRecords[Math.floor(Math.random() * failedRecords.length)];

        return {
            success: false,
            failedRecords: [failedRecord],
            message: `${failedRecord} record not found or incorrect. Please check your DNS settings.`,
        };
    }
}

/**
 * Generate mock activity data for charts (14 days)
 */
export function generateMockActivity(domainId: string): DomainActivity[] {
    const activities: DomainActivity[] = [];
    const today = new Date();

    for (let i = 13; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        // Generate random but realistic numbers
        const sent = Math.floor(Math.random() * 50) + 10;
        const opened = Math.floor(sent * (0.3 + Math.random() * 0.3)); // 30-60% open rate
        const clicked = Math.floor(opened * (0.1 + Math.random() * 0.2)); // 10-30% click rate

        activities.push({
            date: date.toISOString().split('T')[0],
            sent,
            opened,
            clicked,
        });
    }

    return activities;
}

/**
 * Add a new domain to the list (mock)
 */
export function addMockDomain(domain: string): Domain {
    return {
        id: Date.now().toString(),
        domain,
        status: 'pending',
        warmupProgress: 0,
        dailyLimit: 50,
        dailySent: 0,
        healthScore: 0,
        createdAt: new Date(),
        dnsRecords: generateDNSRecords(domain),
        stats: {
            totalSent: 0,
            opened: 0,
            clicked: 0,
            bounced: 0,
        },
    };
}
