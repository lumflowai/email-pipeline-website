import { DNSRecord } from './types';

/**
 * Generates DNS records required for email sending domain setup
 */
export function generateDNSRecords(domain: string): DNSRecord[] {
    // Generate a mock DKIM public key (in production, this would be real)
    const dkimPublicKey = generateMockDKIMKey();

    return [
        {
            type: 'TXT',
            host: '@',
            value: 'v=spf1 include:instantly.ai ~all',
        },
        {
            type: 'TXT',
            host: 'instantly._domainkey',
            value: `k=rsa; p=${dkimPublicKey}`,
        },
        {
            type: 'CNAME',
            host: 'track',
            value: 'track.instantly.ai',
        },
    ];
}

/**
 * Generate a mock DKIM public key
 */
function generateMockDKIMKey(): string {
    // This is a shortened mock key for display purposes
    // In production, use a real RSA public key
    return 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDGMjj3nvkdSXBwl' +
        'h9JnDPP4XPZQxYbK5h5GjTwPkiRnRQqLkKMlpqzfHYBmQGxwqKZ4xY' +
        'vN6LxH3kK5h5GjTwPkiRnRQqLkKMlpqzfHYBmQGxwqKZ4xYvN6LxH3';
}

/**
 * Validate domain format
 */
export function isValidDomain(domain: string): boolean {
    const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;
    return domainRegex.test(domain);
}

/**
 * Extract subdomain from full domain
 */
export function getSubdomain(domain: string): string | null {
    const parts = domain.split('.');
    if (parts.length > 2) {
        return parts.slice(0, -2).join('.');
    }
    return null;
}
