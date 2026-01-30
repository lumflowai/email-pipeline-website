/**
 * API Route: Test Notifications
 * Send test notifications to Slack and Telegram
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { type, webhook_url, bot_token, chat_id } = await req.json();

        if (type === 'slack') {
            if (!webhook_url) {
                return NextResponse.json({ error: 'Webhook URL required' }, { status: 400 });
            }

            // Send test message to Slack
            const response = await fetch(webhook_url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: '🔔 Test Notification from Lumflow AI',
                    blocks: [
                        {
                            type: 'header',
                            text: {
                                type: 'plain_text',
                                text: '✅ Slack Integration Successful!',
                            },
                        },
                        {
                            type: 'section',
                            text: {
                                type: 'mrkdwn',
                                text: 'Your Slack notifications are now configured correctly. You will receive updates here when:\n\n• Prospects reply to your campaigns\n• Booking intent is detected\n• Complex replies need approval',
                            },
                        },
                        {
                            type: 'context',
                            elements: [
                                {
                                    type: 'mrkdwn',
                                    text: `Sent at ${new Date().toLocaleString()}`,
                                },
                            ],
                        },
                    ],
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to send Slack notification');
            }

            return NextResponse.json({ success: true, message: 'Test notification sent to Slack' });
        }

        if (type === 'telegram') {
            if (!bot_token || !chat_id) {
                return NextResponse.json(
                    { error: 'Bot token and chat ID required' },
                    { status: 400 }
                );
            }

            // Send test message to Telegram
            const response = await fetch(
                `https://api.telegram.org/bot${bot_token}/sendMessage`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: chat_id,
                        text: `🔔 *Test Notification from Lumflow AI*\n\n✅ Telegram integration successful!\n\nYou will receive notifications here when:\n• Prospects reply to campaigns\n• Booking intent detected\n• Complex replies need approval\n\nSent at ${new Date().toLocaleString()}`,
                        parse_mode: 'Markdown',
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok || !result.ok) {
                throw new Error(result.description || 'Failed to send Telegram notification');
            }

            return NextResponse.json({ success: true, message: 'Test notification sent to Telegram' });
        }

        return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 });
    } catch (error) {
        console.error('Test notification failed:', error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Failed to send test notification',
            },
            { status: 500 }
        );
    }
}
