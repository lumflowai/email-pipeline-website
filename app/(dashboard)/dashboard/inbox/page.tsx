'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { InstantlyClient } from '@/lib/instantly';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Inbox,
    CheckCircle2,
    XCircle,
    Edit3,
    Loader2,
    RefreshCw,
    MessageSquare,
    Clock,
} from 'lucide-react';

// Types
interface QueuedReply {
    id: string;
    prospect_message: string;
    ai_draft_reply: string;
    sentiment: 'positive' | 'neutral' | 'negative' | 'complex';
    created_at: string;
    campaign_id: string;
    lead_id: string;
    leads: {
        business_name: string;
        email: string;
    };
    campaigns: {
        name: string;
        instantly_campaign_id: string;
    };
}

export default function InboxPage() {
    const [queuedReplies, setQueuedReplies] = useState<QueuedReply[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editedReplies, setEditedReplies] = useState<Record<string, string>>({});
    const [error, setError] = useState('');

    const fetchQueuedReplies = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError('');

        try {
            const { data, error: fetchError } = await supabase
                .from('ai_reply_queue')
                .select(`
          *,
          leads (business_name, email),
          campaigns (name, instantly_campaign_id)
        `)
                .eq('auto_sent', false)
                .is('approved_at', null)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;

            setQueuedReplies(data || []);
        } catch (err) {
            console.error('Failed to fetch queued replies:', err);
            setError('Failed to load inbox');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchQueuedReplies();
        const interval = setInterval(() => fetchQueuedReplies(true), 30 * 1000);
        return () => clearInterval(interval);
    }, []);

    const handleApprove = async (reply: QueuedReply) => {
        setProcessingId(reply.id);
        setError('');

        try {
            const { data: connection } = await supabase
                .from('instantly_connections')
                .select('api_key')
                .single();

            if (!connection) throw new Error('Instantly API key not found');

            const instantly = new InstantlyClient(connection.api_key);
            const replyText = editedReplies[reply.id] || reply.ai_draft_reply;

            await instantly.sendReply({
                campaign_id: reply.campaigns.instantly_campaign_id,
                lead_email: reply.leads.email,
                reply_body: replyText,
            });

            await supabase
                .from('ai_reply_queue')
                .update({
                    approved_at: new Date().toISOString(),
                    sent_at: new Date().toISOString(),
                    final_reply: replyText,
                })
                .eq('id', reply.id);

            setQueuedReplies((prev) => prev.filter((r) => r.id !== reply.id));
            setEditingId(null);
            const newEdited = { ...editedReplies };
            delete newEdited[reply.id];
            setEditedReplies(newEdited);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send reply');
        } finally {
            setProcessingId(null);
        }
    };

    const handleDecline = async (replyId: string) => {
        setProcessingId(replyId);
        try {
            await supabase
                .from('ai_reply_queue')
                .update({
                    approved_at: new Date().toISOString(),
                    declined: true,
                })
                .eq('id', replyId);

            setQueuedReplies((prev) => prev.filter((r) => r.id !== replyId));
        } catch (err) {
            setError('Failed to decline reply');
        } finally {
            setProcessingId(null);
        }
    };

    const sentimentConfig = {
        positive: {
            label: 'Positive',
            color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
            borderColor: 'border-green-200 dark:border-green-800',
        },
        neutral: {
            label: 'Neutral',
            color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
            borderColor: 'border-blue-200 dark:border-blue-800',
        },
        negative: {
            label: 'Negative',
            color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
            borderColor: 'border-red-200 dark:border-red-800',
        },
        complex: {
            label: 'Complex',
            color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
            borderColor: 'border-yellow-200 dark:border-yellow-800',
        },
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
                <div className="max-w-5xl mx-auto flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <Inbox className="w-8 h-8 text-primary" />
                            <h1 className="text-3xl font-bold">Inbox</h1>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            {queuedReplies.length} {queuedReplies.length === 1 ? 'reply' : 'replies'} awaiting
                            approval
                        </p>
                    </div>
                    <Button onClick={() => fetchQueuedReplies(true)} disabled={refreshing} variant="outline">
                        {refreshing ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <RefreshCw className="w-4 h-4 mr-2" />
                        )}
                        Refresh
                    </Button>
                </div>

                {/* Error */}
                {error && (
                    <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                        <CardContent className="p-4">
                            <p className="text-red-800 dark:text-red-200">{error}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Empty State */}
                {queuedReplies.length === 0 && !error && (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium mb-2">All caught up!</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                No replies waiting for your approval right now.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Queued Replies */}
                {queuedReplies.map((reply) => {
                    const isEditing = editingId === reply.id;
                    const isProcessing = processingId === reply.id;
                    const currentReplyText = editedReplies[reply.id] || reply.ai_draft_reply;
                    const config = sentimentConfig[reply.sentiment];

                    return (
                        <Card key={reply.id} className={config.borderColor}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            {reply.leads.business_name}
                                            <Badge variant="outline" className={config.color}>
                                                {reply.sentiment}
                                            </Badge>
                                        </CardTitle>
                                        <CardDescription className="mt-1">
                                            Campaign: {reply.campaigns.name} • {reply.leads.email}
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                        <Clock className="w-3 h-3" />
                                        {new Date(reply.created_at).toLocaleString()}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/*  Their Message */}
                                <div>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Their message:
                                    </p>
                                    <blockquote className="border-l-4 border-gray-300 dark:border-gray-700 pl-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-r">
                                        <p className="italic text-gray-700 dark:text-gray-300">
                                            "{reply.prospect_message}"
                                        </p>
                                    </blockquote>
                                </div>

                                {/* AI's Draft */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            AI's suggested reply:
                                        </p>
                                        {!isEditing && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setEditingId(reply.id)}
                                                disabled={isProcessing}
                                            >
                                                <Edit3 className="w-3 h-3 mr-1" />
                                                Edit
                                            </Button>
                                        )}
                                    </div>
                                    <textarea
                                        value={currentReplyText}
                                        onChange={(e) =>
                                            setEditedReplies({ ...editedReplies, [reply.id]: e.target.value })
                                        }
                                        disabled={!isEditing || isProcessing}
                                        rows={5}
                                        className={`w-full p-3 border dark:border-gray-700 rounded-md font-mono text-sm ${isEditing
                                            ? 'bg-white dark:bg-gray-800'
                                            : 'bg-gray-50 dark:bg-gray-900'
                                            } transition-colors`}
                                    />
                                    {isEditing && (
                                        <div className="flex justify-end mt-2">
                                            <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>
                                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                                Done Editing
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-2">
                                    <Button
                                        onClick={() => handleApprove(reply)}
                                        disabled={isProcessing || isEditing}
                                        className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                                Approve & Send
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => handleDecline(reply.id)}
                                        disabled={isProcessing || isEditing}
                                    >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Decline
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
