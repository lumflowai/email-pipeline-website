// AI Calling utilities - mock data and localStorage

export interface CallCampaign {
    id: string;
    name: string;
    leadListId: string;
    leadListName: string;
    totalLeads: number;
    callsMade: number;
    script: string;
    objective: "qualify" | "book" | "message" | "custom";
    voice: "male" | "female";
    speakingSpeed: number;
    callsPerDay: number;
    status: "draft" | "calling" | "paused" | "completed" | "stopped";
    stats: {
        interested: number;
        notInterested: number;
        noAnswer: number;
        voicemail: number;
    };
    createdAt: string;
    startedAt: string | null;
    completedAt: string | null;
}

export interface CallLog {
    id: string;
    campaignId: string;
    businessName: string;
    phone: string;
    status: "interested" | "not_interested" | "no_answer" | "voicemail";
    duration: number; // seconds
    transcript: string;
    summary: string;
    recordingUrl: string | null;
    calledAt: string;
}

const CALL_CAMPAIGNS_KEY = "lumflow_call_campaigns";
const CALL_LOGS_KEY = "lumflow_call_logs";

// Mock lead lists from scrapes (with phones)
export function getPhoneLeadLists(): { id: string; name: string; leads: number; date: string }[] {
    const scrapes = localStorage.getItem("lumflow_scrapes");
    if (!scrapes) return [];

    const parsed = JSON.parse(scrapes);
    return parsed
        .filter((s: { status: string; leadsWithPhone: number }) => s.status === "completed" && s.leadsWithPhone > 0)
        .map((s: { id: string; keyword: string; location: string; leadsWithPhone: number; createdAt: string }) => ({
            id: s.id,
            name: `${s.keyword} in ${s.location}`,
            leads: s.leadsWithPhone,
            date: new Date(s.createdAt).toLocaleDateString(),
        }));
}

export function getCallCampaigns(): CallCampaign[] {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem(CALL_CAMPAIGNS_KEY);
    return saved ? JSON.parse(saved) : [];
}

export function saveCallCampaign(campaign: CallCampaign): void {
    if (typeof window === "undefined") return;
    const campaigns = getCallCampaigns();
    const existingIndex = campaigns.findIndex((c) => c.id === campaign.id);

    if (existingIndex >= 0) {
        campaigns[existingIndex] = campaign;
    } else {
        campaigns.unshift(campaign);
    }

    localStorage.setItem(CALL_CAMPAIGNS_KEY, JSON.stringify(campaigns));
}

export function deleteCallCampaign(id: string): void {
    if (typeof window === "undefined") return;
    const campaigns = getCallCampaigns().filter((c) => c.id !== id);
    localStorage.setItem(CALL_CAMPAIGNS_KEY, JSON.stringify(campaigns));
}

export function createCallCampaign(
    name: string,
    leadListId: string,
    leadListName: string,
    totalLeads: number,
    script: string,
    objective: CallCampaign["objective"]
): CallCampaign {
    return {
        id: `call_campaign_${Date.now()}`,
        name,
        leadListId,
        leadListName,
        totalLeads,
        callsMade: 0,
        script,
        objective,
        voice: "female",
        speakingSpeed: 1.0,
        callsPerDay: 50,
        status: "draft",
        stats: { interested: 0, notInterested: 0, noAnswer: 0, voicemail: 0 },
        createdAt: new Date().toISOString(),
        startedAt: null,
        completedAt: null,
    };
}

export function getCallLogs(campaignId?: string): CallLog[] {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem(CALL_LOGS_KEY);
    const logs: CallLog[] = saved ? JSON.parse(saved) : [];

    if (campaignId) {
        return logs.filter((l) => l.campaignId === campaignId);
    }
    return logs;
}

export function saveCallLog(log: CallLog): void {
    if (typeof window === "undefined") return;
    const logs = getCallLogs();
    logs.unshift(log);
    localStorage.setItem(CALL_LOGS_KEY, JSON.stringify(logs.slice(0, 500)));
}

// Generate mock call logs for demo
export function generateMockCallLogs(campaignId: string, count: number): CallLog[] {
    const names = ["Joe's Pizza", "Brooklyn Bagels", "Manhattan Deli", "Central Park Cafe", "SoHo Sushi", "Empire Steakhouse", "Hudson River Grill"];
    const transcripts = [
        `AI: Hi, is this the owner of the business?\nCustomer: Yes, speaking.\nAI: Great! I'm calling about our lead generation service...\nCustomer: That sounds interesting, tell me more.`,
        `AI: Hi, is this the manager?\nCustomer: Yes, how can I help?\nAI: I'm reaching out about...\nCustomer: Sorry, we're not interested right now.`,
        `AI: Hi, this is a call about...\n[No answer - voicemail reached]`,
    ];
    const summaries = [
        "Customer expressed interest in learning more. Requested a follow-up email.",
        "Customer declined, mentioned they have an existing solution.",
        "No answer. Left voicemail with callback information.",
        "Customer is interested but busy. Requested call back next week.",
    ];

    const statuses: CallLog["status"][] = ["interested", "not_interested", "no_answer", "voicemail"];

    return Array.from({ length: count }, (_, i) => {
        const name = names[i % names.length];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const duration = status === "no_answer" ? 15 : 60 + Math.floor(Math.random() * 180);

        return {
            id: `call_${Date.now()}_${i}`,
            campaignId,
            businessName: name,
            phone: `+1 (${212 + i}) 555-${1000 + i}`,
            status,
            duration,
            transcript: transcripts[i % transcripts.length],
            summary: summaries[i % summaries.length],
            recordingUrl: null,
            calledAt: new Date(Date.now() - i * 1800000).toISOString(),
        };
    });
}

export function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
}
