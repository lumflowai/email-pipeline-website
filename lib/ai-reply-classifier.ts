/**
 * AI Reply Classification Module
 * Analyzes prospect replies and determines auto-send vs human approval
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { BusinessProfile } from './ai-email-generator';

// ====================
// Types & Interfaces
// ====================

export type ReplySentiment = 'positive' | 'neutral' | 'negative' | 'complex';

export interface ReplyClassification {
    sentiment: ReplySentiment;
    autoSend: boolean;
    suggestedResponse: string;
    reasoning: string;
    confidence?: number; // 0-100
}

// ====================
// AI Client Setup
// ====================

let genAI: GoogleGenerativeAI | null = null;

function getAIClient(): GoogleGenerativeAI {
    if (!genAI) {
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY not found in environment variables');
        }
        genAI = new GoogleGenerativeAI(apiKey);
    }
    return genAI;
}

/**
 * Helper to clean AI responses and extract JSON
 */
function parseClassificationResponse(text: string): ReplyClassification {
    // Remove markdown code blocks if present
    let cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Try to extract JSON if it's wrapped in other text
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        cleanedText = jsonMatch[0];
    }

    try {
        const parsed = JSON.parse(cleanedText);

        // Validate structure
        if (!parsed.sentiment || typeof parsed.autoSend !== 'boolean' || !parsed.suggestedResponse) {
            throw new Error('Missing required fields in classification response');
        }

        // Validate sentiment values
        const validSentiments: ReplySentiment[] = ['positive', 'neutral', 'negative', 'complex'];
        if (!validSentiments.includes(parsed.sentiment)) {
            throw new Error('Invalid sentiment value');
        }

        return {
            sentiment: parsed.sentiment as ReplySentiment,
            autoSend: Boolean(parsed.autoSend),
            suggestedResponse: String(parsed.suggestedResponse).trim(),
            reasoning: String(parsed.reasoning || 'No reasoning provided').trim(),
            confidence: parsed.confidence ? Number(parsed.confidence) : undefined,
        };
    } catch (error) {
        console.error('Failed to parse classification response:', text);
        throw new Error('AI generated invalid classification response');
    }
}

// ====================
// Reply Classification
// ====================

/**
 * Classify prospect reply and generate appropriate response
 * Determines if reply can be auto-sent or needs human approval
 * 
 * @param prospectReply - The prospect's email reply text
 * @param businessProfile - Your business profile for context
 * @param conversationHistory - Previous email exchange context
 * @returns ReplyClassification with sentiment, auto-send decision, and drafted response
 */
export async function classifyAndGenerateReply(
    prospectReply: string,
    businessProfile: BusinessProfile,
    conversationHistory: string
): Promise<ReplyClassification> {
    const ai = getAIClient();
    const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `You are an AI sales assistant analyzing a prospect's reply to determine if it can be auto-responded or needs human review.

PROSPECT'S REPLY:
"${prospectReply}"

CONVERSATION HISTORY:
${conversationHistory}

YOUR BUSINESS CONTEXT:
- Name: ${businessProfile.businessName}
- Services: ${businessProfile.services.join(', ')}
- Target Audience: ${businessProfile.targetAudience}
- Case Studies: ${businessProfile.caseStudies || 'N/A'}
- USPs: ${businessProfile.uniqueSellingPoints.filter(Boolean).join(', ')}

YOUR TASK:
1. Classify the sentiment of their reply
2. Decide if this can be AUTO-SENT or needs HUMAN APPROVAL
3. Generate an appropriate response draft

CLASSIFICATION RULES:

AUTO-SEND (autoSend: true) - Simple, positive/neutral replies:
✅ Interest/curiosity: "Sounds interesting", "Tell me more", "I'm curious"
✅ Information requests: "What are your prices?", "How does this work?", "Send me more info"
✅ Positive signals: "Sure, I'm interested", "Let's chat", "When can we talk?"
✅ Availability questions: "What's your calendar link?", "When are you free?"

QUEUE FOR HUMAN (autoSend: false) - Complex/sensitive replies:
❌ Objections: "We already have an agency", "Not interested right now", "We tried this before"
❌ Budget concerns: "Too expensive", "We can't afford this", "What's the cost?"
❌ Angry/rude: "Stop emailing me", "How did you get my email?", "Unsubscribe me"
❌ Custom requests: "Can you send a proposal?", "Need to see case studies first"
❌ Vague/ambiguous: "Maybe later", "Not sure", replies that are unclear
❌ Questions requiring technical/detailed answers

SENTIMENT MAPPING:
- "positive": They're interested and engaged
- "neutral": They're asking questions but no strong signal either way
- "negative": They're not interested or annoyed
- "complex": Requires nuanced handling (objections, custom requests, etc.)

RESPONSE GUIDELINES:
- Keep responses short and conversational (3-5 sentences)
- If they ask "what do you do?", briefly explain and include {{calendarLink}}
- If they ask pricing, give ballpark if available, or say "depends on scope" + offer call
- If they're interested, push for calendar booking with {{calendarLink}}
- Always sound human and friendly, never robotic
- Match their tone (if casual, be casual; if formal, be professional)

EXAMPLES:

Example 1 (AUTO-SEND):
Prospect: "I'm interested, tell me more"
Classification: { sentiment: "positive", autoSend: true }
Response: "Awesome! We help [category] businesses like yours with [service]. Just helped [similar business] achieve [result]. Want to hop on a quick 15-min call? {{calendarLink}}"

Example 2 (QUEUE FOR HUMAN):
Prospect: "We already work with another agency"
Classification: { sentiment: "negative", autoSend: false }
Response: "No worries! Totally get it. If you ever want a second opinion or your current setup isn't delivering, feel free to reach out. Best of luck!"
Reasoning: "Objection requires nuanced handling - could be a soft no or they might switch later"

Example 3 (AUTO-SEND):
Prospect: "What are your prices?"
Classification: { sentiment: "neutral", autoSend: true }
Response: "Great question! Pricing depends on scope, but most [category] clients start around [ballpark from profile]. Happy to give you exact pricing on a quick call: {{calendarLink}}"

Example 4 (QUEUE FOR HUMAN):
Prospect: "Can you send me a detailed proposal first?"
Classification: { sentiment: "complex", autoSend: false }
Response: "Happy to! I'll need to understand your goals first. Can we do a quick 15-min discovery call? {{calendarLink}}"
Reasoning: "Custom proposal request requires human to gather requirements properly"

Now analyze the prospect's reply and provide your classification.

Return ONLY valid JSON in this exact format:
{
  "sentiment": "positive|neutral|negative|complex",
  "autoSend": true/false,
  "suggestedResponse": "your drafted reply here (include {{calendarLink}} where appropriate)",
  "reasoning": "brief explanation (1-2 sentences) of why auto-send or queue for human",
  "confidence": 85
}`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return parseClassificationResponse(text);
    } catch (error) {
        console.error('Reply classification failed:', error);

        // Fallback: queue for human if AI fails
        return {
            sentiment: 'complex',
            autoSend: false,
            suggestedResponse: 'Thanks for your reply! Let me get back to you shortly.',
            reasoning: 'AI classification failed - defaulting to human review for safety',
            confidence: 0,
        };
    }
}

/**
 * Quick sentiment check without generating response (faster)
 * Useful for analytics/filtering
 */
export async function classifySentimentOnly(
    prospectReply: string
): Promise<ReplySentiment> {
    const ai = getAIClient();
    const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `Classify the sentiment of this prospect reply in ONE word: positive, neutral, negative, or complex.

Reply: "${prospectReply}"

Return ONLY: positive, neutral, negative, or complex (no other text)`;

    try {
        const result = await model.generateContent(prompt);
        const sentiment = result.response.text().trim().toLowerCase();

        const validSentiments: ReplySentiment[] = ['positive', 'neutral', 'negative', 'complex'];
        if (validSentiments.includes(sentiment as ReplySentiment)) {
            return sentiment as ReplySentiment;
        }

        return 'neutral'; // Default fallback
    } catch (error) {
        console.error('Sentiment classification failed:', error);
        return 'neutral';
    }
}
