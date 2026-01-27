import type { Campaign, CampaignStats } from './types';

// Format large numbers with commas
export function formatNumber(num: number): string {
    return num.toLocaleString();
}

// Calculate percentage
export function calculatePercentage(part: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((part / total) * 100 * 10) / 10; // Round to 1 decimal
}

// Format percentage string
export function formatPercentage(part: number, total: number): string {
    const pct = calculatePercentage(part, total);
    return `${pct}%`;
}

// Calculate campaign completion estimate
export function calculateCompletionDate(
    totalLeads: number,
    sent: number,
    dailyLimit: number
): Date {
    const remaining = totalLeads - sent;
    const daysNeeded = Math.ceil(remaining / dailyLimit);

    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + daysNeeded);

    return completionDate;
}

// Calculate days until completion
export function daysUntilCompletion(
    totalLeads: number,
    sent: number,
    dailyLimit: number
): number {
    const remaining = totalLeads - sent;
    return Math.ceil(remaining / dailyLimit);
}

// Get campaign health score (0-100)
export function getCampaignHealth(stats: CampaignStats): number {
    // Factors: delivery rate, open rate, reply rate, bounce rate
    const deliveryRate = stats.sent > 0 ? stats.delivered / stats.sent : 1;
    const openRate = stats.delivered > 0 ? stats.opened / stats.delivered : 0;
    const replyRate = stats.opened > 0 ? stats.replied / stats.opened : 0;
    const bounceRate = stats.sent > 0 ? stats.bounced / stats.sent : 0;

    // Weighted health score
    let health = 0;
    health += deliveryRate * 30; // 30 points for delivery
    health += openRate * 40; // 40 points for opens
    health += replyRate * 20; // 20 points for replies
    health += (1 - bounceRate) * 10; // 10 points for low bounces

    return Math.min(Math.round(health), 100);
}

// Get health color based on score
export function getHealthColor(score: number): string {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
}

// Get health label
export function getHealthLabel(score: number): string {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
}

// Validate email template
export function validateEmailTemplate(subject: string, body: string): {
    valid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    if (!subject || subject.trim().length === 0) {
        errors.push('Subject line is required');
    }

    if (subject.length > 100) {
        errors.push('Subject line is too long (max 100 characters)');
    }

    if (!body || body.trim().length === 0) {
        errors.push('Email body is required');
    }

    if (body.length > 2000) {
        errors.push('Email body is too long (max 2000 characters for cold emails)');
    }

    // Check for unsubscribe link
    if (!body.includes('unsubscribe') && !body.includes('{{unsubscribe}}')) {
        errors.push('Email should include unsubscribe option');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

// Extract personalization tokens from text
export function extractTokens(text: string): string[] {
    const regex = /\{\{(\w+)\}\}/g;
    const tokens: string[] = [];
    let match;

    while ((match = regex.exec(text)) !== null) {
        if (!tokens.includes(match[1])) {
            tokens.push(match[1]);
        }
    }

    return tokens;
}

// Replace tokens with sample data
export function renderPreview(
    text: string,
    data: Record<string, string> = {}
): string {
    const defaultData = {
        firstName: 'John',
        lastName: 'Smith',
        businessName: "John's Restaurant",
        city: 'New York',
        rating: '4.5',
        ...data,
    };

    let result = text;
    Object.entries(defaultData).forEach(([key, value]) => {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        result = result.replace(regex, value);
    });

    return result;
}

// Get status badge color
export function getStatusColor(status: Campaign['status']): string {
    switch (status) {
        case 'active':
            return 'bg-green-500/10 text-green-500 border-green-500/20';
        case 'paused':
            return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
        case 'completed':
            return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
        case 'draft':
            return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
        default:
            return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
}

// Format relative time (e.g., "2 hours ago")
export function formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString();
}

// Format date for display
export function formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

// Calculate estimated replies based on stats
export function estimateReplies(totalLeads: number): { min: number; max: number } {
    // Industry standard: 1-10% reply rate for cold emails
    return {
        min: Math.round(totalLeads * 0.01),
        max: Math.round(totalLeads * 0.10),
    };
}
