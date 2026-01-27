import type { Campaign, CampaignStatus, CampaignActivity, EmailTemplate, CampaignLead } from './types';

// Generate mock campaigns
export function getMockCampaigns(): Campaign[] {
    const baseDate = new Date('2026-01-20T10:00:00');

    return [
        {
            id: 'camp-1',
            name: 'NYC Restaurants Outreach',
            status: 'active',
            leadListId: 'list-1',
            leadListName: 'NYC Restaurants (500 leads)',
            fromDomain: 'mail.lumflow.ai',
            emails: [
                {
                    id: 'email-1',
                    subject: 'Quick question about {{businessName}}',
                    body: `Hi {{firstName}},\n\nI noticed {{businessName}} has great reviews in {{city}}. I help  restaurants like yours increase online orders by 30-50% with automated SMS campaigns.\n\nWould you be interested in a quick 10-minute call this week?\n\nBest,\nAlex`,
                    delayDays: 0,
                    conditionNoReply: false,
                },
                {
                    id: 'email-2',
                    subject: 'Re: Quick question',
                    body: `Hey {{firstName}},\n\nI wanted to follow up on my previous email about increasing your online orders.\n\nJust to be brief - we've helped similar restaurants in {{city}} boost revenue by 40% on average.\n\nWorth a quick chat?\n\nBest,\nAlex`,
                    delayDays: 3,
                    conditionNoReply: true,
                },
                {
                    id: 'email-3',
                    subject: 'Last follow-up',
                    body: `{{firstName}},\n\nI don't want to be a bother, so this is my last email.\n\nIf you're ever interested in growing your online orders, just reply to this email.\n\nCheers,\nAlex`,
                    delayDays: 7,
                    conditionNoReply: true,
                },
            ],
            settings: {
                dailyLimit: 50,
                sendingHours: [9, 17],
                daysOfWeek: [1, 2, 3, 4, 5],
                pauseOnReply: true,
                autoTag: true,
            },
            stats: {
                sent: 245,
                delivered: 237,
                opened: 98,
                clicked: 23,
                replied: 12,
                bounced: 8,
                unsubscribed: 2,
            },
            createdAt: baseDate,
            launchedAt: new Date('2026-01-21T09:00:00'),
            updatedAt: new Date(),
        },
        {
            id: 'camp-2',
            name: 'SaaS Startup Pitch',
            status: 'draft',
            leadListId: 'list-2',
            leadListName: 'Tech Startups (150 leads)',
            fromDomain: 'hello.lumflow.ai',
            emails: [
                {
                    id: 'email-4',
                    subject: 'Increase conversions by 2x in 30 days',
                    body: `Hi {{firstName}},\n\nI help SaaS companies like {{businessName}} double their lead conversion rates using AI-powered automation.\n\nInterested in learning how?`,
                    delayDays: 0,
                    conditionNoReply: false,
                },
            ],
            settings: {
                dailyLimit: 25,
                sendingHours: [10, 16],
                daysOfWeek: [1, 2, 3, 4, 5],
                pauseOnReply: true,
                autoTag: false,
            },
            stats: {
                sent: 0,
                delivered: 0,
                opened: 0,
                clicked: 0,
                replied: 0,
                bounced: 0,
                unsubscribed: 0,
            },
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'camp-3',
            name: 'Real Estate Agents - LA',
            status: 'completed',
            leadListId: 'list-3',
            leadListName: 'LA Real Estate (200 leads)',
            fromDomain: 'mail.lumflow.ai',
            emails: [
                {
                    id: 'email-5',
                    subject: 'Generate 10+ qualified leads per week',
                    body: `{{firstName}},\n\nAs a real estate agent in {{city}}, getting consistent leads is tough.\n\nWe've helped agents like you generate 10+ qualified leads weekly using automated Google Maps scraping.\n\nWant to see how?`,
                    delayDays: 0,
                    conditionNoReply: false,
                },
            ],
            settings: {
                dailyLimit: 40,
                sendingHours: [9, 18],
                daysOfWeek: [1, 2, 3, 4, 5],
                pauseOnReply: true,
                autoTag: true,
            },
            stats: {
                sent: 200,
                delivered: 195,
                opened: 82,
                clicked: 18,
                replied: 9,
                bounced: 5,
                unsubscribed: 1,
            },
            createdAt: new Date('2026-01-10T10:00:00'),
            launchedAt: new Date('2026-01-11T09:00:00'),
            completedAt: new Date('2026-01-20T17:00:00'),
            updatedAt: new Date('2026-01-20T17:00:00'),
        },
    ];
}

// Get campaign by ID
export function getMockCampaignById(id: string): Campaign | null {
    const campaigns = getMockCampaigns();
    return campaigns.find((c) => c.id === id) || null;
}

// Generate activity feed for a campaign
export function generateMockActivity(campaignId: string, days: number = 14): CampaignActivity[] {
    const activities: CampaignActivity[] = [];
    const businessNames = [
        "Tony's Pizzeria",
        "Bella's Bistro",
        "Mike's Burgers",
        "Sunset Grill",
        "The Daily Bread",
        "Ocean View Cafe",
        "Maria's Tacos",
        "Golden Dragon",
    ];

    for (let i = 0; i < days * 5; i++) {
        const daysAgo = Math.floor(i / 5);
        const hoursAgo = Math.random() < 0.5 ? 0 : Math.floor(Math.random() * 8);
        const timestamp = new Date();
        timestamp.setDate(timestamp.getDate() - daysAgo);
        timestamp.setHours(timestamp.getHours() - hoursAgo);

        const businessName = businessNames[Math.floor(Math.random() * businessNames.length)];
        const email = `contact@${businessName.toLowerCase().replace(/['\s]/g, '')}.com`;

        // Weighted activity types (more opens than replies)
        const rand = Math.random();
        let type: CampaignActivity['type'];
        if (rand < 0.5) type = 'opened';
        else if (rand < 0.7) type = 'sent';
        else if (rand < 0.8) type = 'clicked';
        else if (rand < 0.95) type = 'replied';
        else type = 'bounced';

        activities.push({
            id: `activity-${i}`,
            campaignId,
            type,
            leadName: businessName,
            leadEmail: email,
            timestamp,
        });
    }

    return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

// Email Templates
export function getMockTemplates(): EmailTemplate[] {
    return [
        {
            id: 'template-1',
            name: 'Service Pitch - Restaurant',
            category: 'service_pitch',
            subject: 'Quick question about {{businessName}}',
            body: `Hi {{firstName}},\n\nI noticed {{businessName}} has great reviews in {{city}}. I help restaurants increase online orders by 30-50%.\n\nWould you be interested in a quick call?\n\nBest,\nYour Name`,
        },
        {
            id: 'template-2',
            name: 'Partnership Proposal',
            category: 'partnership',
            subject: 'Partnership opportunity for {{businessName}}',
            body: `Hi {{firstName}},\n\nI'm reaching out to explore a potential partnership between {{businessName}} and our company.\n\nWould you be open to a brief conversation?\n\nBest regards,\nYour Name`,
        },
        {
            id: 'template-3',
            name: 'Feedback Request',
            category: 'feedback',
            subject: 'Quick feedback on {{businessName}}?',
            body: `Hey {{firstName}},\n\nI'm doing research on businesses in {{city}} and would love your input.\n\n5 minute call this week?\n\nThanks,\nYour Name`,
        },
    ];
}

// Mock function to simulate campaign creation
export function createMockCampaign(data: Partial<Campaign>): Campaign {
    return {
        id: `camp-${Date.now()}`,
        name: data.name || 'New Campaign',
        status: data.status || 'draft',
        leadListId: data.leadListId || '',
        leadListName: data.leadListName,
        fromDomain: data.fromDomain || 'mail.lumflow.ai',
        emails: data.emails || [],
        settings: data.settings || {
            dailyLimit: 50,
            sendingHours: [9, 17],
            daysOfWeek: [1, 2, 3, 4, 5],
            pauseOnReply: true,
            autoTag: true,
        },
        stats: {
            sent: 0,
            delivered: 0,
            opened: 0,
            clicked: 0,
            replied: 0,
            bounced: 0,
            unsubscribed: 0,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
    };
}

// Simulate campaign sending (increment stats over time)
export function simulateCampaignProgress(campaign: Campaign): Campaign {
    if (campaign.status !== 'active') return campaign;

    const updatedStats = { ...campaign.stats };

    // Simulate sending a few emails
    const newSent = Math.min(campaign.stats.sent + 5, 500); // Max 500 for demo
    updatedStats.sent = newSent;

    // Simulate delivery (97% success rate)
    updatedStats.delivered = Math.floor(newSent * 0.97);

    // Simulate opens (40% open rate)
    updatedStats.opened = Math.floor(updatedStats.delivered * 0.40);

    // Simulate clicks (10% of opens)
    updatedStats.clicked = Math.floor(updatedStats.opened * 0.10);

    // Simulate replies (5% of opens)
    updatedStats.replied = Math.floor(updatedStats.opened * 0.05);

    // Simulate bounces
    updatedStats.bounced = newSent - updatedStats.delivered;

    return {
        ...campaign,
        stats: updatedStats,
        updatedAt: new Date(),
    };
}

// Generate mock leads for campaign
export function generateMockLeads(count: number = 50): CampaignLead[] {
    const leads: CampaignLead[] = [];
    const firstNames = ['John', 'Maria', 'Tony', 'Sarah', 'Mike', 'Lisa', 'David', 'Anna'];
    const lastNames = ['Smith', 'Johnson', 'Garcia', 'Martinez', 'Brown', 'Lee', 'Wilson'];
    const cities = ['New York', 'Los Angeles', 'Chicago', 'Miami', 'Boston'];

    for (let i = 0; i < count; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const businessName = `${firstName}'s Business`;

        const statuses: CampaignLead['status'][] = ['pending', 'sent', 'opened', 'replied', 'bounced'];
        const statusWeights = [0.2, 0.3, 0.3, 0.15, 0.05];
        const rand = Math.random();
        let cumulativeWeight = 0;
        let status: CampaignLead['status'] = 'pending';

        for (let j = 0; j < statuses.length; j++) {
            cumulativeWeight += statusWeights[j];
            if (rand < cumulativeWeight) {
                status = statuses[j];
                break;
            }
        }

        leads.push({
            id: `lead-${i + 1}`,
            businessName,
            contactName: `${firstName} ${lastName}`,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${businessName.toLowerCase().replace(/['\s]/g, '')}.com`,
            city: cities[Math.floor(Math.random() * cities.length)],
            rating: 3.5 + Math.random() * 1.5,
            status,
            openCount: status === 'opened' || status === 'replied' ? Math.floor(Math.random() * 3) + 1 : 0,
            clickCount: status === 'replied' ? Math.floor(Math.random() * 2) : 0,
            lastActivity: status !== 'pending' ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : undefined,
        });
    }

    return leads;
}

// Generate mock inbox replies
export interface InboxReply {
    id: string;
    campaignId: string;
    leadName: string;
    leadEmail: string;
    subject: string;
    body: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    isRead: boolean;
    receivedAt: Date;
}

export function generateMockInboxReplies(campaignId: string, count: number = 12): InboxReply[] {
    const replies: InboxReply[] = [];

    const positiveReplies = [
        { subject: "Re: Quick question", body: "Hey! Yes, I'd love to chat. When works for you?", sentiment: 'positive' as const },
        { subject: "Re: Partnership opportunity", body: "This sounds interesting. Can we schedule a call next week?", sentiment: 'positive' as const },
        { subject: "Re: Quick question", body: "Absolutely! I'm free Thursday afternoon.", sentiment: 'positive' as const },
        { subject: "Interested!", body: "Your email caught my attention. Let's discuss further.", sentiment: 'positive' as const },
    ];

    const neutralReplies = [
        { subject: "Re: Quick question", body: "Can you send more information first?", sentiment: 'neutral' as const },
        { subject: "More details?", body: "I'd like to see a case study or pricing info.", sentiment: 'neutral' as const },
        { subject: "Re: Partnership opportunity", body: "Who else are you working with in our industry?", sentiment: 'neutral' as const },
    ];

    const negativeReplies = [
        { subject: "Not interested", body: "Thanks but we're not looking for this right now.", sentiment: 'negative' as const },
        { subject: "Unsubscribe", body: "Please remove me from your list.", sentiment: 'negative' as const },
        { subject: "Re: Quick question", body: "Not interested. Please don't contact us again.", sentiment: 'negative' as const },
    ];

    const allReplies = [...positiveReplies, ...neutralReplies, ...negativeReplies];
    const businessNames = ["Tony's Pizzeria", "Bella's Bistro", "Mike's Burgers", "Sunset Grill", "The Daily Bread"];

    for (let i = 0; i < Math.min(count, allReplies.length); i++) {
        const reply = allReplies[i];
        const businessName = businessNames[i % businessNames.length];
        const email = `contact@${businessName.toLowerCase().replace(/['\\s]/g, '')}.com`;
        const daysAgo = Math.floor(Math.random() * 7);
        const receivedAt = new Date();
        receivedAt.setDate(receivedAt.getDate() - daysAgo);

        replies.push({
            id: `reply-${i + 1}`,
            campaignId,
            leadName: businessName,
            leadEmail: email,
            subject: reply.subject,
            body: reply.body,
            sentiment: reply.sentiment,
            isRead: Math.random() > 0.3,
            receivedAt,
        });
    }

    return replies.sort((a, b) => b.receivedAt.getTime() - a.receivedAt.getTime());
}
