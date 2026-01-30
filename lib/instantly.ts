/**
 * Instantly.ai API Client
 * Handles all interactions with the Instantly.ai API for email campaign management
 */

// ====================
// Types & Interfaces
// ====================

interface InstantlyConfig {
    apiKey: string;
    baseUrl: string;
}

export interface CreateCampaignParams {
    name: string;
    from_email: string;
    subject: string;
    body: string;
    schedule?: {
        timezone?: string;
        days?: string[];
        start_hour?: number;
        end_hour?: number;
    };
}

export interface Lead {
    email: string;
    first_name?: string;
    last_name?: string;
    company_name?: string;
    personalization?: string;
    phone?: string;
    website?: string;
    [key: string]: string | undefined; // Allow custom fields
}

export interface SendReplyParams {
    lead_email: string;
    reply_body: string;
    campaign_id: string;
}

export interface CampaignResponse {
    id: string;
    name: string;
    status: string;
    created_at: string;
}

export interface CampaignStats {
    campaign_id: string;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    replied: number;
    bounced: number;
    unsubscribed: number;
    open_rate: number;
    click_rate: number;
    reply_rate: number;
}

export interface CampaignReply {
    id: string;
    lead_email: string;
    campaign_id: string;
    message: string;
    timestamp: string;
    sentiment?: 'positive' | 'neutral' | 'negative';
}

export interface ApiError {
    error: string;
    message?: string;
    statusCode: number;
}

// ====================
// Instantly Client
// ====================

export class InstantlyClient {
    private config: InstantlyConfig;

    constructor(apiKey: string) {
        if (!apiKey || apiKey.trim() === '') {
            throw new Error('Instantly API key is required');
        }

        this.config = {
            apiKey: apiKey.trim(),
            baseUrl: 'https://api.instantly.ai/api/v1',
        };
    }

    /**
     * Private helper to make API requests with error handling
     */
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.config.baseUrl}${endpoint}`;

        const response = await fetch(url, {
            ...options,
            headers: {
                Authorization: `Bearer ${this.config.apiKey}`,
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const error: ApiError = {
                error: errorData.error || 'API request failed',
                message: errorData.message || response.statusText,
                statusCode: response.status,
            };
            throw error;
        }

        return response.json();
    }

    /**
     * Test if API key is valid by fetching account details
     * @returns Promise<boolean> - true if connection successful
     */
    async verifyConnection(): Promise<boolean> {
        try {
            await this.request('/account', { method: 'GET' });
            return true;
        } catch (error) {
            console.error('Instantly API connection failed:', error);
            return false;
        }
    }

    /**
     * Create a new email campaign in Instantly
     * @param params - Campaign configuration
     * @returns Promise<CampaignResponse> - Created campaign details
     */
    async createCampaign(
        params: CreateCampaignParams
    ): Promise<CampaignResponse> {
        return this.request<CampaignResponse>('/campaigns/create', {
            method: 'POST',
            body: JSON.stringify(params),
        });
    }

    /**
     * Add leads to an existing campaign
     * @param campaignId - Campaign ID
     * @param leads - Array of lead objects
     * @returns Promise<{ added: number; failed: number }> - Result summary
     */
    async addLeadsToCampaign(
        campaignId: string,
        leads: Lead[]
    ): Promise<{ added: number; failed: number; errors?: string[] }> {
        if (!campaignId || leads.length === 0) {
            throw new Error('Campaign ID and leads are required');
        }

        return this.request(`/campaigns/${campaignId}/leads`, {
            method: 'POST',
            body: JSON.stringify({ leads }),
        });
    }

    /**
     * Get analytics and statistics for a campaign
     * @param campaignId - Campaign ID
     * @returns Promise<CampaignStats> - Campaign performance metrics
     */
    async getCampaignStats(campaignId: string): Promise<CampaignStats> {
        if (!campaignId) {
            throw new Error('Campaign ID is required');
        }

        return this.request<CampaignStats>(`/campaigns/${campaignId}/stats`, {
            method: 'GET',
        });
    }

    /**
     * Get all replies for a campaign (for AI processing)
     * @param campaignId - Campaign ID
     * @returns Promise<CampaignReply[]> - Array of replies
     */
    async getCampaignReplies(campaignId: string): Promise<CampaignReply[]> {
        if (!campaignId) {
            throw new Error('Campaign ID is required');
        }

        return this.request<CampaignReply[]>(`/campaigns/${campaignId}/replies`, {
            method: 'GET',
        });
    }

    /**
     * Send an individual reply to a lead (AI-generated response)
     * @param params - Reply parameters
     * @returns Promise<{ success: boolean; message_id?: string }> - Send result
     */
    async sendReply(
        params: SendReplyParams
    ): Promise<{ success: boolean; message_id?: string }> {
        if (!params.lead_email || !params.reply_body || !params.campaign_id) {
            throw new Error('lead_email, reply_body, and campaign_id are required');
        }

        return this.request('/campaigns/reply', {
            method: 'POST',
            body: JSON.stringify(params),
        });
    }

    /**
     * Get list of all campaigns
     * @returns Promise<CampaignResponse[]> - Array of campaigns
     */
    async getCampaigns(): Promise<CampaignResponse[]> {
        return this.request<CampaignResponse[]>('/campaigns', {
            method: 'GET',
        });
    }

    /**
     * Get connected email accounts/domains
     * @returns Promise<any[]> - Array of connected accounts
     */
    async getAccounts(): Promise<any[]> {
        return this.request<any[]>('/accounts', {
            method: 'GET',
        });
    }
}

/**
 * Factory function to create InstantlyClient from Supabase instantly_connections table
 * @param apiKey - Instantly API key
 * @returns InstantlyClient instance
 */
export function createInstantlyClient(apiKey: string): InstantlyClient {
    return new InstantlyClient(apiKey);
}
