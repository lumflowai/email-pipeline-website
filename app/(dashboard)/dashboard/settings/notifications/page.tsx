'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Bell,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Send,
    Save,
} from 'lucide-react';

interface NotificationSettings {
    id?: string;
    user_id: string;
    slack_webhook_url?: string;
    telegram_bot_token?: string;
    telegram_chat_id?: string;
    email_notifications: boolean;
    notify_on_every_reply: boolean;
    notify_on_booking_intent: boolean;
};


export default function NotificationSettingsPage() {
    const [settings, setSettings] = useState<NotificationSettings>({
        user_id: '',
        email_notifications: true,
        notify_on_every_reply: false,
        notify_on_booking_intent: true,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testingSlack, setTestingSlack] = useState(false);
    const [testingTelegram, setTestingTelegram] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) {
                setError('Not authenticated');
                return;
            }

            const { data, error: fetchError } = await supabase
                .from('notification_settings')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

            if (data) {
                setSettings(data);
            } else {
                setSettings((prev) => ({ ...prev, user_id: user.id }));
            }
        } catch (err) {
            console.error('Failed to load notification settings:', err);
            setError('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSaveSuccess(false);

        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { error: upsertError } = await supabase
                .from('notification_settings')
                .upsert({
                    ...settings,
                    user_id: user.id,
                    updated_at: new Date().toISOString(),
                });

            if (upsertError) throw upsertError;

            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const testSlackNotification = async () => {
        if (!settings.slack_webhook_url) {
            setError('Please enter a Slack webhook URL first');
            return;
        }

        setTestingSlack(true);
        setError('');

        try {
            const response = await fetch('/api/notifications/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'slack',
                    webhook_url: settings.slack_webhook_url,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to send test notification');
            }

            alert('✅ Test notification sent to Slack!');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send test notification');
        } finally {
            setTestingSlack(false);
        }
    };

    const testTelegramNotification = async () => {
        if (!settings.telegram_bot_token || !settings.telegram_chat_id) {
            setError('Please enter both Telegram bot token and chat ID first');
            return;
        }

        setTestingTelegram(true);
        setError('');

        try {
            const response = await fetch('/api/notifications/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'telegram',
                    bot_token: settings.telegram_bot_token,
                    chat_id: settings.telegram_chat_id,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to send test notification');
            }

            alert('✅ Test notification sent to Telegram!');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send test notification');
        } finally {
            setTestingTelegram(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
                <div className="max-w-3xl mx-auto flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Bell className="w-8 h-8 text-primary" />
                        <h1 className="text-3xl font-bold">Notification Settings</h1>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                        Configure how and when you want to be notified
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                        <CardContent className="p-4 flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                            <p className="text-red-800 dark:text-red-200">{error}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Success */}
                {saveSuccess && (
                    <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
                        <CardContent className="p-4 flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                            <p className="text-green-800 dark:text-green-200">Settings saved successfully!</p>
                        </CardContent>
                    </Card>
                )}

                {/* Slack */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            Slack Integration
                            <Badge variant="outline">Recommended</Badge>
                        </CardTitle>
                        <CardDescription>
                            Get rich notifications in Slack when prospects reply or show booking intent
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="block mb-2 font-medium text-sm">Slack Webhook URL</label>
                            <Input
                                type="url"
                                placeholder="https://hooks.slack.com/services/..."
                                value={settings.slack_webhook_url || ''}
                                onChange={(e) =>
                                    setSettings({ ...settings, slack_webhook_url: e.target.value })
                                }
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Create a webhook at{' '}
                                <a
                                    href="https://api.slack.com/messaging/webhooks"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary underline"
                                >
                                    api.slack.com/messaging/webhooks
                                </a>
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={testSlackNotification}
                            disabled={!settings.slack_webhook_url || testingSlack}
                            size="sm"
                        >
                            {testingSlack ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Sending Test...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Send Test Notification
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Telegram */}
                <Card>
                    <CardHeader>
                        <CardTitle>Telegram Integration</CardTitle>
                        <CardDescription>
                            Receive instant notifications via Telegram bot
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="block mb-2 font-medium text-sm">Telegram Bot Token</label>
                            <Input
                                type="password"
                                placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                                value={settings.telegram_bot_token || ''}
                                onChange={(e) =>
                                    setSettings({ ...settings, telegram_bot_token: e.target.value })
                                }
                            />
                        </div>
                        <div>
                            <label className="block mb-2 font-medium text-sm">Telegram Chat ID</label>
                            <Input
                                placeholder="123456789"
                                value={settings.telegram_chat_id || ''}
                                onChange={(e) =>
                                    setSettings({ ...settings, telegram_chat_id: e.target.value })
                                }
                            />
                        </div>
                        <Button
                            variant="outline"
                            onClick={testTelegramNotification}
                            disabled={
                                !settings.telegram_bot_token || !settings.telegram_chat_id || testingTelegram
                            }
                            size="sm"
                        >
                            {testingTelegram ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Sending Test...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Send Test Notification
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Preferences */}
                <Card>
                    <CardHeader>
                        <CardTitle>Notification Preferences</CardTitle>
                        <CardDescription>Choose when to receive notifications</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[
                            {
                                key: 'email_notifications',
                                title: 'Email Notifications',
                                description: 'Receive email updates (coming soon)',
                                highlight: false,
                            },
                            {
                                key: 'notify_on_every_reply',
                                title: 'Notify on Every Reply',
                                description: 'Get notified for all prospect replies',
                                highlight: false,
                            },
                            {
                                key: 'notify_on_booking_intent',
                                title: 'Notify on Booking Intent',
                                description: 'Get alerted when prospects show interest in booking',
                                highlight: true,
                            },
                        ].map((pref) => (
                            <div
                                key={pref.key}
                                className={`flex items-center justify-between p-3 rounded-lg ${pref.highlight
                                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                                    : 'bg-gray-50 dark:bg-gray-800'
                                    }`}
                            >
                                <div>
                                    <p
                                        className={`font-medium ${pref.highlight ? 'text-green-900 dark:text-green-100' : ''
                                            }`}
                                    >
                                        {pref.title}
                                    </p>
                                    <p
                                        className={`text-sm ${pref.highlight
                                            ? 'text-green-700 dark:text-green-300'
                                            : 'text-gray-600 dark:text-gray-400'
                                            }`}
                                    >
                                        {pref.description}
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings[pref.key as keyof NotificationSettings] as boolean}
                                        onChange={(e) =>
                                            setSettings({ ...settings, [pref.key]: e.target.checked })
                                        }
                                        className="sr-only peer"
                                    />
                                    <div
                                        className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 ${pref.highlight
                                            ? 'peer-focus:ring-green-200 dark:peer-focus:ring-green-800 peer-checked:bg-green-600'
                                            : 'peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 peer-checked:bg-primary'
                                            }`}
                                    ></div>
                                </label>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Save Button */}
                <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={saving} size="lg">
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Settings
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
