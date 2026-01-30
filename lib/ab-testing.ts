/**
 * A/B Testing Module for Campaign Subject Lines
 * Handles variant creation, lead splitting, and winner determination
 */

import { InstantlyClient } from './instantly';
import { classifySentimentOnly } from './ai-reply-classifier';
import { createClient } from '@supabase/supabase-js';

// ====================
// Types
// ====================

export interface ABTestVariant {
    id: string;
    subject: string;
    campaign_id: string;
    instantly_campaign_id: string;
    lead_count: number;
    variant_letter: string; // A, B, C
}

export interface ABTestResult {
    variant: ABTestVariant;
    stats: {
        sent: number;
        opened: number;
        replied: number;
        openRate: number;
        replyRate: number;
        positiveReplies: number;
        positiveReplyRate: number;
    };
    score: number;
    isWinner: boolean;
}

export interface CreateABTestParams {
    campaignName: string;
    subjects: string[];
    leads: any[];
    fromEmail: string;
    emailBody: string;
    calendarLink: string;
    userId: string;
    apiKey: string;
}

// ====================
// Supabase Client
// ====================

function getSupabaseClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase configuration missing');
    }

    return createClient(supabaseUrl, supabaseKey);
}

// ====================
// A/B Test Creation
// ====================

/**
 * Create A/B test campaigns with multiple subject line variants
 * Splits leads into equal groups and creates separate Instantly campaigns
 */
export async function createABTest(params: CreateABTestParams): Promise<ABTestVariant[]> {
    const {
        campaignName,
        subjects,
        leads,
        fromEmail,
        emailBody,
        calendarLink,
        userId,
        apiKey,
    } = params;

    const supabase = getSupabaseClient();

    if (subjects.length < 2 || subjects.length > 3) {
        throw new Error('A/B testing requires 2-3 subject line variants');
    }

    if (leads.length < subjects.length * 10) {
        throw new Error(
            `Not enough leads for A/B testing. Need at least ${subjects.length * 10} leads (minimum 10 per variant)`
        );
    }

    const instantly = new InstantlyClient(apiKey);
    const variants: ABTestVariant[] = [];

    // Shuffle leads for random distribution
    const shuffledLeads = [...leads].sort(() => Math.random() - 0.5);

    // Calculate group size
    const groupSize = Math.floor(shuffledLeads.length / subjects.length);

    // Create parent campaign record for tracking
    const { data: parentCampaign } = await supabase
        .from('campaigns')
        .insert({
            user_id: userId,
            name: campaignName,
            status: 'ab_testing',
            is_ab_test: true,
            ab_test_variants: subjects.length,
            total_leads: leads.length,
            calendar_link: calendarLink,
        })
        .select()
        .single();

    if (!parentCampaign) {
        throw new Error('Failed to create parent campaign');
    }

    // Create a campaign for each variant
    for (let i = 0; i < subjects.length; i++) {
        const variantLetter = String.fromCharCode(65 + i); // A, B, C
        const subject = subjects[i];
        const variantLeads = shuffledLeads.slice(i * groupSize, (i + 1) * groupSize);

        // Create campaign in Instantly
        const instantlyCampaign = await instantly.createCampaign({
            name: `${campaignName} - Variant ${variantLetter}`,
            from_email: fromEmail,
            subject: subject,
            body: emailBody.replace(/\{\{calendarLink\}\}/g, calendarLink),
        });

        // Add leads to this variant
        await instantly.addLeadsToCampaign(
            instantlyCampaign.id,
            variantLeads.map((lead) => ({
                email: lead.email,
                first_name: lead.business_name?.split(' ')[0] || lead.business_name,
                company_name: lead.business_name,
                website: lead.website,
            }))
        );

        // Save variant to database
        const { data: variant } = await supabase
            .from('ab_test_variants')
            .insert({
                parent_campaign_id: parentCampaign.id,
                subject_line: subject,
                variant_letter: variantLetter,
                instantly_campaign_id: instantlyCampaign.id,
                lead_count: variantLeads.length,
            })
            .select()
            .single();

        if (variant) {
            variants.push({
                id: variant.id,
                subject: subject,
                campaign_id: parentCampaign.id,
                instantly_campaign_id: instantlyCampaign.id,
                lead_count: variantLeads.length,
                variant_letter: variantLetter,
            });
        }

        // Link leads to variant
        await supabase.from('campaign_leads').insert(
            variantLeads.map((lead) => ({
                campaign_id: parentCampaign.id,
                lead_id: lead.id,
                ab_variant_id: variant?.id,
            }))
        );
    }

    return variants;
}

// ====================
// Winner Determination
// ====================

/**
 * Determine the winning A/B test variant after 24 hours
 * Scoring: 30% open rate + 70% positive reply rate
 */
export async function determineWinner(
    parentCampaignId: string,
    apiKey: string
): Promise<ABTestResult[]> {
    const supabase = getSupabaseClient();

    // Get all variants for this campaign
    const { data: variants } = await supabase
        .from('ab_test_variants')
        .select('*')
        .eq('parent_campaign_id', parentCampaignId);

    if (!variants || variants.length === 0) {
        throw new Error('No A/B test variants found');
    }

    const instantly = new InstantlyClient(apiKey);
    const results: ABTestResult[] = [];

    // Analyze each variant
    for (const variant of variants) {
        // Get campaign stats from Instantly
        const stats = await instantly.getCampaignStats(variant.instantly_campaign_id);

        // Get all replies
        const replies = await instantly.getCampaignReplies(variant.instantly_campaign_id);

        // Classify replies using AI
        let positiveReplies = 0;
        if (replies && replies.length > 0) {
            const sentiments = await Promise.all(
                replies.map((reply) => classifySentimentOnly(reply.message))
            );
            positiveReplies = sentiments.filter((s) => s === 'positive').length;
        }

        // Calculate metrics
        const sent = stats.sent || 0;
        const opened = stats.opened || 0;
        const replied = stats.replied || 0;

        const openRate = sent > 0 ? (opened / sent) * 100 : 0;
        const replyRate = sent > 0 ? (replied / sent) * 100 : 0;
        const positiveReplyRate = sent > 0 ? (positiveReplies / sent) * 100 : 0;

        // Calculate composite score (30% open rate + 70% positive reply rate)
        const score = openRate * 0.3 + positiveReplyRate * 0.7;

        results.push({
            variant: {
                id: variant.id,
                subject: variant.subject_line,
                campaign_id: variant.parent_campaign_id,
                instantly_campaign_id: variant.instantly_campaign_id,
                lead_count: variant.lead_count,
                variant_letter: variant.variant_letter,
            },
            stats: {
                sent,
                opened,
                replied,
                openRate,
                replyRate,
                positiveReplies,
                positiveReplyRate,
            },
            score,
            isWinner: false, // Will be set below
        });
    }

    // Sort by score (highest first)
    results.sort((a, b) => b.score - a.score);

    // Mark the winner
    if (results.length > 0) {
        results[0].isWinner = true;

        // Save winner to database
        await supabase
            .from('ab_test_variants')
            .update({ is_winner: true })
            .eq('id', results[0].variant.id);

        // Update parent campaign status
        await supabase
            .from('campaigns')
            .update({
                status: 'active',
                winning_variant_id: results[0].variant.id,
            })
            .eq('id', parentCampaignId);
    }

    return results;
}

/**
 * Check if an A/B test is ready for winner determination (24 hours elapsed)
 */
export async function isABTestReady(parentCampaignId: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    const { data: campaign } = await supabase
        .from('campaigns')
        .select('created_at')
        .eq('id', parentCampaignId)
        .single();

    if (!campaign) return false;

    const createdAt = new Date(campaign.created_at);
    const now = new Date();
    const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

    return hoursSinceCreation >= 24;
}

/**
 * Get A/B test results for display in dashboard
 */
export async function getABTestResults(
    parentCampaignId: string,
    apiKey: string
): Promise<ABTestResult[]> {
    const supabase = getSupabaseClient();
    const { data: variants } = await supabase
        .from('ab_test_variants')
        .select('*')
        .eq('parent_campaign_id', parentCampaignId);

    if (!variants || variants.length === 0) {
        return [];
    }

    const instantly = new InstantlyClient(apiKey);
    const results: ABTestResult[] = [];

    for (const variant of variants) {
        const stats = await instantly.getCampaignStats(variant.instantly_campaign_id);
        const replies = await instantly.getCampaignReplies(variant.instantly_campaign_id);

        let positiveReplies = 0;
        if (replies && replies.length > 0) {
            const sentiments = await Promise.all(
                replies.map((reply) => classifySentimentOnly(reply.message))
            );
            positiveReplies = sentiments.filter((s) => s === 'positive').length;
        }

        const sent = stats.sent || 0;
        const opened = stats.opened || 0;
        const replied = stats.replied || 0;

        const openRate = sent > 0 ? (opened / sent) * 100 : 0;
        const replyRate = sent > 0 ? (replied / sent) * 100 : 0;
        const positiveReplyRate = sent > 0 ? (positiveReplies / sent) * 100 : 0;
        const score = openRate * 0.3 + positiveReplyRate * 0.7;

        results.push({
            variant: {
                id: variant.id,
                subject: variant.subject_line,
                campaign_id: variant.parent_campaign_id,
                instantly_campaign_id: variant.instantly_campaign_id,
                lead_count: variant.lead_count,
                variant_letter: variant.variant_letter,
            },
            stats: {
                sent,
                opened,
                replied,
                openRate,
                replyRate,
                positiveReplies,
                positiveReplyRate,
            },
            score,
            isWinner: variant.is_winner || false,
        });
    }

    return results.sort((a, b) => b.score - a.score);
}
