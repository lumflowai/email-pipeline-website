"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { extractTokens, renderPreview } from "@/lib/campaigns/utils";
import { Type, Eye, Sparkles } from "lucide-react";

interface EmailEditorProps {
    subject: string;
    body: string;
    onSubjectChange: (value: string) => void;
    onBodyChange: (value: string) => void;
    showPreview?: boolean;
}

export function EmailEditor({
    subject,
    body,
    onSubjectChange,
    onBodyChange,
    showPreview = true,
}: EmailEditorProps) {
    const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

    const insertToken = (token: string) => {
        onBodyChange(body + `{{${token}}}`);
    };

    const personalizationTokens = [
        { token: "firstName", label: "First Name" },
        { token: "lastName", label: "Last Name" },
        { token: "businessName", label: "Business Name" },
        { token: "city", label: "City" },
        { token: "rating", label: "Rating" },
    ];

    const usedTokens = extractTokens(subject + " " + body);
    const subjectCharCount = subject.length;
    const bodyCharCount = body.length;

    return (
        <div className="space-y-4">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "edit" | "preview")}>
                <TabsList>
                    <TabsTrigger value="edit">
                        <Type className="h-4 w-4 mr-2" />
                        Edit
                    </TabsTrigger>
                    {showPreview && (
                        <TabsTrigger value="preview">
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                        </TabsTrigger>
                    )}
                </TabsList>

                <TabsContent value="edit" className="space-y-4">
                    {/* Subject Line */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>Subject Line</Label>
                            <span className={`text-xs ${subjectCharCount > 100 ? 'text-destructive' : 'text-muted-foreground'}`}>
                                {subjectCharCount}/100
                            </span>
                        </div>
                        <Input
                            placeholder="e.g., Quick question about {{businessName}}"
                            value={subject}
                            onChange={(e) => onSubjectChange(e.target.value)}
                            className="font-medium"
                        />
                    </div>

                    {/* Email Body */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>Email Body</Label>
                            <span className={`text-xs ${bodyCharCount > 2000 ? 'text-destructive' : 'text-muted-foreground'}`}>
                                {bodyCharCount}/2000
                            </span>
                        </div>
                        <textarea
                            placeholder={`Hi {{firstName}},\n\nI noticed {{businessName}} has great reviews in {{city}}...\n\nBest regards,\nYour Name`}
                            value={body}
                            onChange={(e) => onBodyChange(e.target.value)}
                            className="w-full min-h-[200px] px-3 py-2 text-sm rounded-md border border-input bg-background focus:ring-2 focus:ring-ring focus:border-input resize-none"
                            style={{ fontFamily: 'inherit' }}
                        />
                    </div>

                    {/* Personalization Tokens */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Sparkles className="h-4 w-4 text-primary" />
                                <Label className="text-sm font-medium">Personalization Tokens</Label>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {personalizationTokens.map(({ token, label }) => (
                                    <Button
                                        key={token}
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => insertToken(token)}
                                        className={usedTokens.includes(token) ? "bg-primary/10" : ""}
                                    >
                                        {label}
                                    </Button>
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-3">
                                Click to insert tokens. They will be replaced with actual data when sent.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>

                {showPreview && (
                    <TabsContent value="preview">
                        <Card>
                            <CardContent className="p-6 space-y-4">
                                <div>
                                    <Label className="text-xs text-muted-foreground">SUBJECT</Label>
                                    <p className="font-semibold mt-1">
                                        {renderPreview(subject)}
                                    </p>
                                </div>
                                <div className="border-t pt-4">
                                    <Label className="text-xs text-muted-foreground">BODY</Label>
                                    <div className="mt-2 whitespace-pre-line text-sm">
                                        {renderPreview(body)}
                                    </div>
                                </div>
                                <div className="border-t pt-4">
                                    <p className="text-xs text-muted-foreground italic">
                                        Preview shows sample data. Actual emails will use real lead information.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}
