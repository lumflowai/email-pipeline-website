/**
 * AI Email Generation Module
 * Uses Google Gemini API to generate personalized cold email sequences
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// ====================
// Types & Interfaces
// ====================

export interface BusinessProfile {
    businessName: string;
    services: string[];
    targetAudience: string;
    caseStudies: string;
    uniqueSellingPoints: string[];
    pricingInfo?: string;
    websiteUrl?: string;
}

export interface Lead {
    businessName: string;
    email?: string;
    rating?: number;
    reviewCount?: number;
    website?: string;
    category?: string;
    location?: string;
    phone?: string;
}

export interface EmailResult {
    subject: string;
    body: string;
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
function parseAIResponse(text: string): EmailResult {
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
        if (!parsed.subject || !parsed.body) {
            throw new Error('Missing subject or body in AI response');
        }

        return {
            subject: String(parsed.subject).trim(),
            body: String(parsed.body).trim(),
        };
    } catch (error) {
        console.error('Failed to parse AI response:', text);
        throw new Error('AI generated invalid JSON response');
    }
}

// ====================
// Email Generation Functions
// ====================

/**
 * EMAIL 1: Curiosity-Driven First Touch
 * Goal: Get a reply by raising genuine curiosity
 * NO sales pitch, just compliment + question
 */
export async function generateEmail1Curiosity(
    businessProfile: BusinessProfile,
    lead: Lead
): Promise<EmailResult> {
    const ai = getAIClient();
    const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `You are writing the FIRST email in a cold outreach sequence for ${businessProfile.businessName}.

TARGET BUSINESS:
- Name: ${lead.businessName}
- Category: ${lead.category || 'local business'}
- Rating: ${lead.rating || 'N/A'} stars (${lead.reviewCount || 0} reviews)
- Website: ${lead.website || 'Not found'}
- Location: ${lead.location || 'N/A'}

YOUR BUSINESS:
- Name: ${businessProfile.businessName}
- Services: ${businessProfile.services.join(', ')}
- Target Audience: ${businessProfile.targetAudience}

CRITICAL RULES:
1. Email must be 5-7 sentences MAXIMUM (keep it SHORT)
2. Goal: Get a reply by raising curiosity or asking a genuine question
3. Compliment something specific about their business (reviews, longevity, location, etc.)
4. NO sales pitch whatsoever - don't even mention what you do yet
5. End with a question that naturally requires a response
6. Sound conversational and human, NOT like a marketer
7. Use their business name naturally in the email
8. Avoid spam words: "amazing", "excited", "opportunity", "help you grow"
9. Keep subject line casual and intriguing (NOT salesy)

GOOD EXAMPLES:
- "Hey John, saw Tony's Pizzeria has 230+ five-star reviews — that's impressive in Brooklyn. Quick question: are you handling all your online marketing in-house, or working with anyone on that?"
- "Hi Sarah, noticed Bloom Dental has been around since 2015 and you're rated 4.8 stars. Curious — what's been your biggest challenge with getting new patients lately?"

BAD EXAMPLES (don't do this):
- "I'd love to help you grow your business!" (too salesy)
- "We're a leading marketing agency..." (too formal)
- "This is an amazing opportunity..." (spam words)

Now write Email 1 for ${lead.businessName}. Be genuinely curious and conversational.

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "subject": "quick question about [their business]",
  "body": "email text here"
}`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return parseAIResponse(text);
    } catch (error) {
        console.error('Email 1 generation failed:', error);
        throw new Error('Failed to generate curiosity email');
    }
}

/**
 * EMAIL 2: The Pitch (After They Reply)
 * Goal: Introduce your service with proof, get them to book a call
 * Include 1 case study + clear CTA
 */
export async function generateEmail2Pitch(
    businessProfile: BusinessProfile,
    lead: Lead,
    theirReply: string
): Promise<EmailResult> {
    const ai = getAIClient();
    const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `You are writing the SECOND email in a sequence. The prospect REPLIED to your first email.

THEIR REPLY:
"${theirReply}"

YOUR BUSINESS:
- Name: ${businessProfile.businessName}
- Services: ${businessProfile.services.join(', ')}
- Case Studies/Results: ${businessProfile.caseStudies || 'No case studies provided'}
- Unique Value: ${businessProfile.uniqueSellingPoints.filter(Boolean).join(', ')}
- Pricing: ${businessProfile.pricingInfo || 'Custom pricing'}

TARGET BUSINESS:
- Name: ${lead.businessName}
- Category: ${lead.category || 'local business'}

CRITICAL RULES:
1. Acknowledge their reply naturally (don't be robotic)
2. Now introduce what you do - keep it to 8-10 sentences max
3. Include ONE specific result/case study relevant to their industry
4. If no case study available, use a specific benefit instead
5. Include clear CTA: either calendar link or "Can I send you a quick example?"
6. Use {{calendarLink}} as placeholder for booking link
7. Maintain conversational tone - still sound human
8. Avoid spam words: "excited", "thrilled", "amazing opportunity"
9. Give them an easy out if not interested

GOOD EXAMPLE:
"Thanks for getting back, John!

So we help pizzerias like yours get more delivery orders through targeted local ads. Just wrapped up a campaign for Bella's in Manhattan — they saw 40% more online orders in the first month.

Would love to show you what we could do for Tony's. Here's my calendar if you want to chat for 15 mins: {{calendarLink}}

No pressure either way!"

Now write Email 2 for ${lead.businessName}. Reference their reply and pitch naturally.

Return ONLY valid JSON:
{
  "subject": "re: [reference their reply topic]",
  "body": "email text with {{calendarLink}} placeholder"
}`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return parseAIResponse(text);
    } catch (error) {
        console.error('Email 2 generation failed:', error);
        throw new Error('Failed to generate pitch email');
    }
}

/**
 * EMAIL 3: Final Followup (Soft Nudge)
 * Goal: Last chance to engage, give them easy out
 * Reference previous conversation + restate value
 */
export async function generateEmail3Followup(
    businessProfile: BusinessProfile,
    lead: Lead,
    conversationHistory: string
): Promise<EmailResult> {
    const ai = getAIClient();
    const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `You are writing the THIRD (final) email in a cold outreach sequence.

CONVERSATION SO FAR:
${conversationHistory}

YOUR BUSINESS:
- Name: ${businessProfile.businessName}
- Services: ${businessProfile.services.join(', ')}
- Value Prop: ${businessProfile.uniqueSellingPoints.filter(Boolean).join(', ')}

TARGET BUSINESS:
- Name: ${lead.businessName}

CRITICAL RULES:
1. This is a soft final nudge - keep it to 4-6 sentences
2. Reference something from their previous reply if available
3. Restate value briefly (one line max)
4. Give them an easy out: "No worries if timing isn't right"
5. Include CTA again ({{calendarLink}})
6. Sound friendly and non-pushy
7. Avoid desperation or guilt-tripping

GOOD EXAMPLE:
"Hey John, just wanted to follow up one last time.

I know you mentioned wanting to increase delivery orders — we're running a Feb promo where setup is half off. If you're interested, grab 15 mins here: {{calendarLink}}

If not, no worries at all. Best of luck with Tony's!"

BAD EXAMPLE (don't do this):
"This is the last time I'll reach out..." (guilt trip)
"You're missing out on..." (pushy)

Now write Email 3 for ${lead.businessName}. Be friendly and give them an out.

Return ONLY valid JSON:
{
  "subject": "following up - [topic]",
  "body": "email text with {{calendarLink}} placeholder"
}`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return parseAIResponse(text);
    } catch (error) {
        console.error('Email 3 generation failed:', error);
        throw new Error('Failed to generate followup email');
    }
}

/**
 * Generate all 3 emails at once for a campaign sequence
 * Returns array: [email1, email2, email3]
 */
export async function generateEmailSequence(
    businessProfile: BusinessProfile,
    lead: Lead
): Promise<[EmailResult, EmailResult, EmailResult]> {
    // Generate emails sequentially to maintain context
    const email1 = await generateEmail1Curiosity(businessProfile, lead);

    // Simulate a positive reply for email 2 context
    const simulatedReply = `Sure, I'm interested. What do you do?`;
    const email2 = await generateEmail2Pitch(businessProfile, lead, simulatedReply);

    // Build conversation history for email 3
    const conversationHistory = `
Email 1: ${email1.body}
Their Reply: ${simulatedReply}
Email 2: ${email2.body}
[No reply yet]
`;
    const email3 = await generateEmail3Followup(businessProfile, lead, conversationHistory);

    return [email1, email2, email3];
}
