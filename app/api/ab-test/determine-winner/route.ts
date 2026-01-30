/**
 * API Route: Determine A/B Test Winner
 * Checks A/B test campaigns after 24 hours and determines the winner
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { determineWinner, isABTestReady } from '@/lib/ab-testing';

function getSupabaseClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase configuration missing');
    }

    return createClient(supabaseUrl, supabaseKey);
}

export async function POST(req: NextRequest) {
    try {
        const { campaignId } = await req.json();

        if (!campaignId) {
            return NextResponse.json({ error: 'Campaign ID required' }, { status: 400 });
        }

        // Get campaign from database
        const supabase = getSupabaseClient();
        const { data: campaign } = await supabase
            .from('campaigns')
            .select(`
        *,
        instantly_connections (api_key)
      `)
            .eq('id', campaignId)
            .single();

        if (!campaign) {
            return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
        }

        // Check if this is an A/B test
        if (!campaign.is_ab_test) {
            return NextResponse.json(
                { error: 'Campaign is not an A/B test' },
                { status: 400 }
            );
        }

        // Check if 24 hours have elapsed
        const isReady = await isABTestReady(campaignId);
        if (!isReady) {
            return NextResponse.json(
                {
                    error: 'A/B test is not ready yet. Must wait 24 hours after creation.',
                    ready: false,
                },
                { status: 400 }
            );
        }

        // Determine the winner
        const results = await determineWinner(campaignId, campaign.instantly_connections.api_key);

        return NextResponse.json({
            success: true,
            winner: results[0],
            allResults: results,
            message: `Variant ${results[0].variant.variant_letter} is the winner with a score of ${results[0].score.toFixed(1)}`,
        });
    } catch (error) {
        console.error('Failed to determine A/B test winner:', error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Failed to determine winner',
            },
            { status: 500 }
        );
    }
}

// GET endpoint to check results without triggering winner determination
export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const campaignId = url.searchParams.get('campaignId');

        if (!campaignId) {
            return NextResponse.json({ error: 'Campaign ID required' }, { status: 400 });
        }

        // Get campaign
        const supabase = getSupabaseClient();
        const { data: campaign } = await supabase
            .from('campaigns')
            .select(`
        *,
        instantly_connections (api_key)
      `)
            .eq('id', campaignId)
            .single();

        if (!campaign || !campaign.is_ab_test) {
            return NextResponse.json({ error: 'Invalid campaign' }, { status: 404 });
        }

        // Check if ready
        const isReady = await isABTestReady(campaignId);

        // Get current results (imported from ab-testing module)
        const { getABTestResults } = await import('@/lib/ab-testing');
        const results = await getABTestResults(campaignId, campaign.instantly_connections.api_key);

        return NextResponse.json({
            ready: isReady,
            results,
            winner: results.find((r) => r.isWinner) || null,
        });
    } catch (error) {
        console.error('Failed to fetch A/B test results:', error);
        return NextResponse.json(
            { error: 'Failed to fetch results' },
            { status: 500 }
        );
    }
}
