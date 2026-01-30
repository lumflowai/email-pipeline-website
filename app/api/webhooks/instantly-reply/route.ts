/**
 * Instantly.ai Reply Webhook Handler
 * Receives prospect replies, classifies them with AI, and either auto-sends or queues for approval
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { classifyAndGenerateReply } from '@/lib/ai-reply-classifier';
import { InstantlyClient } from '@/lib/instantly';

// ====================
// Types
// ====================

interface InstantlyWebhook {
    campaign_id: string;
    lead_email: string;
    reply_text: string;
    timestamp: string;
    message_id?: string;
}

interface NotificationPayload {
    type: 'booking_intent' | 'approval_needed' | 'reply_received';
    message: string;
    leadEmail: string;
    leadName?: string;
    campaignName?: string;
}

// ====================
// Supabase Client
// ====================

// Force dynamic rendering to prevent build-time evaluation
export const dynamic = 'force-dynamic';

function getSupabaseClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase configuration missing');
    }

    return createClient(supabaseUrl, supabaseKey);
}

// ====================
// Webhook Handler
// ====================

export async function POST(request: Request) {
    try {
        const supabase = getSupabaseClient();
        const webhook: InstantlyWebhook = await request.json();

        // Validate webhook payload
        const { campaign_id, lead_email, reply_text, timestamp } = webhook;

        if (!campaign_id || !lead_email || !reply_text) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        console.log('[Webhook] Received reply:', { campaign_id, lead_email });

        // 1. Find the campaign and user
        const { data: campaign, error: campaignError } = await supabase
            .from('campaigns')
            .select(`
        *,
        business_profiles (*),
        instantly_connections (*)
      `)
            .eq('instantly_campaign_id', campaign_id)
            .single();

        if (campaignError || !campaign) {
            console.error('[Webhook] Campaign not found:', campaignError);
            return NextResponse.json(
                { error: 'Campaign not found' },
                { status: 404 }
            );
        }

        // 2. Find the lead
        const { data: lead, error: leadError } = await supabase
            .from('leads')
            .select('*')
            .eq('email', lead_email)
            .single();

        if (leadError || !lead) {
            console.error('[Webhook] Lead not found:', leadError);
            return NextResponse.json(
                { error: 'Lead not found' },
                { status: 404 }
            );
        }

        // 3. Get conversation history from email_activities
        const { data: history } = await supabase
            .from('email_activities')
            .select('*')
            .eq('lead_id', lead.id)
            .eq('campaign_id', campaign.id)
            .order('created_at', { ascending: true });

        const conversationText =
            history
                ?.map((h) => `[${h.event_type}] ${h.event_data || ''}`)
                .join('\n') || 'No previous conversation';

        // Log the reply event
        await supabase.from('email_activities').insert({
            campaign_id: campaign.id,
            lead_id: lead.id,
            event_type: 'reply',
            event_data: reply_text,
            timestamp: timestamp || new Date().toISOString(),
        });

        // 4. Detect booking intent BEFORE AI classification
        const hasBookingIntent = detectBookingIntent(reply_text);

        if (hasBookingIntent) {
            await supabase.from('calendar_clicks').insert({
                campaign_id: campaign.id,
                lead_id: lead.id,
                clicked_at: new Date().toISOString(),
                intent_signal: reply_text.substring(0, 200), // Store snippet
            });

            await sendNotification(campaign.user_id, {
                type: 'booking_intent',
                message: `🎯 ${lead.business_name || lead.email} wants to schedule a call!`,
                leadEmail: lead_email,
                leadName: lead.business_name,
                campaignName: campaign.name,
            });
        }

        // 5. Run AI classification
        console.log('[Webhook] Running AI classification...');
        const classification = await classifyAndGenerateReply(
            reply_text,
            campaign.business_profiles,
            conversationText
        );

        console.log('[Webhook] Classification:', {
            sentiment: classification.sentiment,
            autoSend: classification.autoSend,
            reasoning: classification.reasoning,
        });

        // 6. Auto-send or queue for approval
        if (classification.autoSend) {
            // AUTO-SEND PATH
            try {
                const instantly = new InstantlyClient(
                    campaign.instantly_connections.api_key
                );

                // Replace calendar link placeholder
                const finalReply = classification.suggestedResponse.replace(
                    /\{\{calendarLink\}\}/g,
                    campaign.calendar_link || 'https://calendly.com/your-link'
                );

                await instantly.sendReply({
                    lead_email,
                    reply_body: finalReply,
                    campaign_id,
                });

                // Log to ai_reply_queue
                await supabase.from('ai_reply_queue').insert({
                    campaign_id: campaign.id,
                    lead_id: lead.id,
                    prospect_message: reply_text,
                    ai_draft_reply: finalReply,
                    sentiment: classification.sentiment,
                    auto_sent: true,
                    sent_at: new Date().toISOString(),
                    classification_reasoning: classification.reasoning,
                });

                console.log('[Webhook] ✅ Auto-sent reply to', lead_email);
            } catch (error) {
                console.error('[Webhook] Failed to auto-send reply:', error);

                // Fallback: queue for manual review if auto-send fails
                await supabase.from('ai_reply_queue').insert({
                    campaign_id: campaign.id,
                    lead_id: lead.id,
                    prospect_message: reply_text,
                    ai_draft_reply: classification.suggestedResponse,
                    sentiment: classification.sentiment,
                    auto_sent: false,
                    classification_reasoning: `Auto-send failed: ${error}`,
                });
            }
        } else {
            // QUEUE FOR HUMAN APPROVAL
            await supabase.from('ai_reply_queue').insert({
                campaign_id: campaign.id,
                lead_id: lead.id,
                prospect_message: reply_text,
                ai_draft_reply: classification.suggestedResponse,
                sentiment: classification.sentiment,
                auto_sent: false,
                classification_reasoning: classification.reasoning,
            });

            // Notify user to review
            await sendNotification(campaign.user_id, {
                type: 'approval_needed',
                message: `⚠️ Complex reply from ${lead.business_name || lead_email} needs your review`,
                leadEmail: lead_email,
                leadName: lead.business_name,
                campaignName: campaign.name,
            });

            console.log('[Webhook] ⏸️ Queued for approval:', lead_email);
        }

        return NextResponse.json({
            success: true,
            autoSent: classification.autoSend,
            sentiment: classification.sentiment,
        });
    } catch (error) {
        console.error('[Webhook] Error processing reply:', error);
        return NextResponse.json(
            {
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

// ====================
// Helper Functions
// ====================

/**
 * Detect booking intent from reply text
 * Looks for calendar/scheduling keywords
 */
function detectBookingIntent(replyText: string): boolean {
    const keywords = [
        'schedule',
        'calendar',
        'book',
        'meeting',
        'call',
        'available',
        'when can',
        'what time',
        'free',
        'calendly',
    ];

    const lowerText = replyText.toLowerCase();
    return keywords.some((keyword) => lowerText.includes(keyword));
}

/**
 * Send notification to user via configured channels
 * Supports Slack webhooks, Telegram, and respects user preferences
 */
async function sendNotification(
    userId: string,
    notification: NotificationPayload
): Promise<void> {
    try {
        const supabase = getSupabaseClient();
        // Get user's notification settings
        const { data: settings } = await supabase
            .from('notification_settings')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (!settings) {
            console.log('[Notification] No settings found for user:', userId);
            return;
        }

        // Check if we should send based on notification type and preferences
        const shouldNotify =
            (notification.type === 'booking_intent' && settings.notify_on_booking_intent) ||
            (notification.type === 'approval_needed') || // Always notify for approval needed
            (notification.type === 'reply_received' && settings.notify_on_every_reply);

        if (!shouldNotify) {
            console.log('[Notification] Skipped based on user preferences');
            return;
        }

        // Send to Slack if configured
        if (settings.slack_webhook_url) {
            try {
                const color =
                    notification.type === 'booking_intent'
                        ? 'good' // Green
                        : notification.type === 'approval_needed'
                            ? 'warning' // Yellow
                            : '#7C3AED'; // Purple

                const emoji =
                    notification.type === 'booking_intent'
                        ? '🎯'
                        : notification.type === 'approval_needed'
                            ? '⚠️'
                            : '💬';

                await fetch(settings.slack_webhook_url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text: `${emoji} ${notification.message}`,
                        blocks: [
                            {
                                type: 'header',
                                text: {
                                    type: 'plain_text',
                                    text: notification.message,
                                },
                            },
                            {
                                type: 'section',
                                fields: [
                                    {
                                        type: 'mrkdwn',
                                        text: `*Lead:*\n${notification.leadName || notification.leadEmail}`,
                                    },
                                    {
                                        type: 'mrkdwn',
                                        text: `*Campaign:*\n${notification.campaignName || 'N/A'}`,
                                    },
                                ],
                            },
                            {
                                type: 'context',
                                elements: [
                                    {
                                        type: 'mrkdwn',
                                        text: `Lumflow AI | ${new Date().toLocaleString()}`,
                                    },
                                ],
                            },
                        ],
                        attachments: [
                            {
                                color,
                                footer: 'Lumflow AI',
                                ts: Math.floor(Date.now() / 1000),
                            },
                        ],
                    }),
                });

                console.log('[Notification] ✅ Sent to Slack');
            } catch (error) {
                console.error('[Notification] Slack failed:', error);
            }
        }

        // Send to Telegram if configured
        if (settings.telegram_bot_token && settings.telegram_chat_id) {
            try {
                const emoji =
                    notification.type === 'booking_intent'
                        ? '🎯'
                        : notification.type === 'approval_needed'
                            ? '⚠️'
                            : '💬';

                await fetch(
                    `https://api.telegram.org/bot${settings.telegram_bot_token}/sendMessage`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            chat_id: settings.telegram_chat_id,
                            text: `${emoji} *${notification.message}*\n\n*Lead:* ${notification.leadName || notification.leadEmail}\n*Campaign:* ${notification.campaignName || 'N/A'}\n\n_Sent by Lumflow AI at ${new Date().toLocaleString()}_`,
                            parse_mode: 'Markdown',
                        }),
                    }
                );

                console.log('[Notification] ✅ Sent to Telegram');
            } catch (error) {
                console.error('[Notification] Telegram failed:', error);
            }
        }

        // Email notification (future: integrate with Resend)
        if (settings.email_notifications) {
            // TODO: Integrate with Resend or similar email service
            console.log('[Notification] Email notifications not yet implemented');
        }
    } catch (error) {
        console.error('[Notification] Failed to send notification:', error);
        // Don't throw - notifications are non-critical
    }
}
