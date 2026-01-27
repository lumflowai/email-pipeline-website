"use client";

import { motion } from "framer-motion";
import { Eye, MessageSquare, Send, MousePointerClick, AlertCircle } from "lucide-react";
import type { CampaignActivity } from "@/lib/campaigns/types";
import { formatRelativeTime } from "@/lib/campaigns/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ActivityFeedProps {
    activities: CampaignActivity[];
    maxHeight?: string;
}

export function ActivityFeed({ activities, maxHeight = "400px" }: ActivityFeedProps) {
    const getActivityIcon = (type: CampaignActivity['type']) => {
        switch (type) {
            case 'sent':
                return <Send className="h-4 w-4 text-blue-500" />;
            case 'opened':
                return <Eye className="h-4 w-4 text-green-500" />;
            case 'clicked':
                return <MousePointerClick className="h-4 w-4 text-purple-500" />;
            case 'replied':
                return <MessageSquare className="h-4 w-4 text-emerald-500" />;
            case 'bounced':
                return <AlertCircle className="h-4 w-4 text-red-500" />;
            default:
                return <Send className="h-4 w-4 text-gray-500" />;
        }
    };

    const getActivityText = (activity: CampaignActivity) => {
        switch (activity.type) {
            case 'sent':
                return 'received email';
            case 'opened':
                return 'opened email';
            case 'clicked':
                return 'clicked link';
            case 'replied':
                return 'replied';
            case 'bounced':
                return 'email bounced';
            case 'unsubscribed':
                return 'unsubscribed';
            default:
                return activity.type;
        }
    };

    if (activities.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground text-center py-8">
                        No activity yet
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea style={{ height: maxHeight }}>
                    <div className="px-6 pb-4 space-y-3">
                        {activities.map((activity, index) => (
                            <motion.div
                                key={activity.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2, delay: index * 0.02 }}
                                className="flex items-start gap-3 pb-3 border-b border-border/50 last:border-0"
                            >
                                <div className="mt-0.5">
                                    {getActivityIcon(activity.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm">
                                        <span className="font-medium text-foreground">
                                            {activity.leadName}
                                        </span>
                                        {' '}
                                        <span className="text-muted-foreground">
                                            {getActivityText(activity)}
                                        </span>
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {formatRelativeTime(activity.timestamp)}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
