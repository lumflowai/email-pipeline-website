// Email campaigns utilities - mock data and localStorage

export interface EmailCampaign {
    id: string;
    name: string;
    leadListId: string;
    leadListName: string;
    totalLeads: number;
    emailsSent: number;
    template: string;
    subject: string;
    status: "draft" | "sending" | "paused" | "completed" | "stopped";
    emailsPerDay: number;
    delayMinutes: number;
    trackOpens: boolean;
    stats: {
        sent: number;
        opened: number;
        replied: number;
        clicked: number;
    };
    createdAt: string;
    startedAt: string | null;
    completedAt: string | null;
}

export interface EmailReply {
    id: string;
    campaignId: string;
    from: {
        name: string;
        email: string;
    };
    subject: string;
    preview: string;
    fullContent: string;
    status: "new" | "read" | "starred";
    receivedAt: string;
}

const CAMPAIGNS_KEY = "lumflow_email_campaigns";
const REPLIES_KEY = "lumflow_email_replies";

// Mock lead lists from scrapes
export function getLeadLists(): { id: string; name: string; leads: number; date: string }[] {
    const scrapes = localStorage.getItem("lumflow_scrapes");
    if (!scrapes) return [];

    const parsed = JSON.parse(scrapes);
    return parsed
        .filter((s: { status: string; leadsWithEmail: number }) => s.status === "completed" && s.leadsWithEmail > 0)
        .map((s: { id: string; keyword: string; location: string; leadsWithEmail: number; createdAt: string }) => ({
            id: s.id,
            name: `${s.keyword} in ${s.location}`,
            leads: s.leadsWithEmail,
            date: new Date(s.createdAt).toLocaleDateString(),
        }));
}

export function getCampaigns(): EmailCampaign[] {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem(CAMPAIGNS_KEY);
    return saved ? JSON.parse(saved) : [];
}

export function saveCampaign(campaign: EmailCampaign): void {
    if (typeof window === "undefined") return;
    const campaigns = getCampaigns();
    const existingIndex = campaigns.findIndex((c) => c.id === campaign.id);

    if (existingIndex >= 0) {
        campaigns[existingIndex] = campaign;
    } else {
        campaigns.unshift(campaign);
    }

    localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(campaigns));
}

export function deleteCampaign(id: string): void {
    if (typeof window === "undefined") return;
    const campaigns = getCampaigns().filter((c) => c.id !== id);
    localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(campaigns));
}

export function createCampaign(
    name: string,
    leadListId: string,
    leadListName: string,
    totalLeads: number,
    template: string,
    subject: string,
    emailsPerDay: number = 50,
    delayMinutes: number = 2
): EmailCampaign {
    return {
        id: `campaign_${Date.now()}`,
        name,
        leadListId,
        leadListName,
        totalLeads,
        emailsSent: 0,
        template,
        subject,
        status: "draft",
        emailsPerDay,
        delayMinutes,
        trackOpens: true,
        stats: { sent: 0, opened: 0, replied: 0, clicked: 0 },
        createdAt: new Date().toISOString(),
        startedAt: null,
        completedAt: null,
    };
}

export function getReplies(): EmailReply[] {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem(REPLIES_KEY);
    return saved ? JSON.parse(saved) : [];
}

export function saveReply(reply: EmailReply): void {
    if (typeof window === "undefined") return;
    const replies = getReplies();
    const existingIndex = replies.findIndex((r) => r.id === reply.id);

    if (existingIndex >= 0) {
        replies[existingIndex] = reply;
    } else {
        replies.unshift(reply);
    }

    localStorage.setItem(REPLIES_KEY, JSON.stringify(replies));
}

// Generate mock replies for demo
export function generateMockReplies(campaignId: string, count: number): EmailReply[] {
    const names = ["Joe's Pizza", "Brooklyn Bagels", "Manhattan Deli", "Central Park Cafe", "SoHo Sushi"];
    const responses = [
        "Hi there! Thanks for reaching out. We'd be interested in learning more about your services.",
        "Hello, I received your email. Could you send me more information about pricing?",
        "Thank you for the offer. We're currently reviewing options. Can we schedule a call?",
        "Interesting! We've been looking for a solution like this. When are you available to chat?",
        "Hi, we're not interested at this time, but please keep us in your mailing list.",
    ];

    return Array.from({ length: count }, (_, i) => {
        const name = names[i % names.length];
        const email = `contact@${name.toLowerCase().replace(/[^a-z]/g, "")}.com`;

        return {
            id: `reply_${Date.now()}_${i}`,
            campaignId,
            from: { name, email },
            subject: `Re: ${name} - Quick Question`,
            preview: responses[i % responses.length].slice(0, 80) + "...",
            fullContent: responses[i % responses.length],
            status: i === 0 ? "new" : "read",
            receivedAt: new Date(Date.now() - i * 3600000).toISOString(),
        };
    });
}
