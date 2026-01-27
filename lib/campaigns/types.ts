// Campaign Status Types
export type CampaignStatus = 'active' | 'paused' | 'completed' | 'draft';

// Email in campaign sequence
export interface CampaignEmail {
    id: string;
    subject: string;
    body: string;
    delayDays: number; // Days to wait before sending
    conditionNoReply: boolean; // Only send if no reply
}

// Campaign Statistics
export interface CampaignStats {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    replied: number;
    bounced: number;
    unsubscribed: number;
}

// Campaign Settings
export interface CampaignSettings {
    dailyLimit: number; // Max emails per day
    sendingHours: [number, number]; // e.g., [9, 17] for 9am-5pm
    daysOfWeek: number[]; // 0-6, where 0 is Sunday
    pauseOnReply: boolean;
    autoTag: boolean;
}

// Main Campaign Interface
export interface Campaign {
    id: string;
    name: string;
    status: CampaignStatus;
    leadListId: string;
    leadListName?: string;
    fromDomain: string;
    emails: CampaignEmail[];
    settings: CampaignSettings;
    stats: CampaignStats;
    createdAt: Date;
    launchedAt?: Date;
    completedAt?: Date;
    updatedAt: Date;
}

// Activity Feed Item
export interface CampaignActivity {
    id: string;
    campaignId: string;
    type: 'sent' | 'opened' | 'clicked' | 'replied' | 'bounced' | 'unsubscribed';
    leadName: string;
    leadEmail: string;
    timestamp: Date;
    metadata?: Record<string, unknown>;
}

// Template for email campaigns
export interface EmailTemplate {
    id: string;
    name: string;
    category: 'service_pitch' | 'partnership' | 'feedback' | 'follow_up';
    subject: string;
    body: string;
    previewImage?: string;
}

// Lead with campaign-specific fields
export interface CampaignLead {
    id: string;
    businessName: string;
    contactName?: string;
    email: string;
    city?: string;
    rating?: number;
    status: 'pending' | 'sent' | 'opened' | 'replied' | 'bounced' | 'unsubscribed';
    openCount: number;
    clickCount: number;
    lastActivity?: Date;
}

// Inbox Message
export interface InboxMessage {
    id: string;
    campaignId: string;
    leadId: string;
    from: string;
    subject: string;
    body: string;
    receivedAt: Date;
    read: boolean;
    category: 'interested' | 'not_interested' | 'out_of_office' | 'unsubscribe' | 'other';
    sentiment?: 'positive' | 'neutral' | 'negative';
}
