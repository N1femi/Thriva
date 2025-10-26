
// app/api/chat/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { messages } = await request.json();

        // Validate messages array
        if (!Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json(
                { error: "Invalid messages format" },
                { status: 400 }
            );
        }

        // Validate each message structure
        for (const msg of messages) {
            if (!msg.role || !msg.content) {
                return NextResponse.json(
                    { error: "Each message must have 'role' and 'content' fields" },
                    { status: 400 }
                );
            }
            if (!['user', 'assistant'].includes(msg.role)) {
                return NextResponse.json(
                    { error: "Message role must be either 'user' or 'assistant'" },
                    { status: 400 }
                );
            }
            if (typeof msg.content !== 'string') {
                return NextResponse.json(
                    { error: "Message content must be a string" },
                    { status: 400 }
                );
            }
            // Limit message length to prevent abuse
            if (msg.content.length > 5000) {
                return NextResponse.json(
                    { error: "Message content too long. Please keep messages under 5000 characters." },
                    { status: 400 }
                );
            }
        }

        // Limit conversation length
        if (messages.length > 50) {
            return NextResponse.json(
                { error: "Conversation too long. Please start a new conversation." },
                { status: 400 }
            );
        }

        // Check if API key is configured
        if (!process.env.CLAUDE_KEY) {
            console.error("CLAUDE_KEY environment variable is not set");
            return NextResponse.json(
                { error: "API key not configured" },
                { status: 500 }
            );
        }

        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": process.env.CLAUDE_KEY,
                "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
                model: "claude-sonnet-4-20250514",
                max_tokens: 1024,
                system: `You are a compassionate self-development coach focused exclusively on health, wellness, mental health, and personal growth.

TOPIC BOUNDARIES - You MUST ONLY discuss:
- Mental health and emotional wellbeing
- Physical health and fitness goals
- Personal growth and self-improvement
- Healthy habits and lifestyle changes
- Stress management and coping strategies
- Goal setting and achievement
- Relationship wellness and communication
- Mindfulness and self-reflection
- Productivity and time management
- Sleep, nutrition, and self-care

PROHIBITED TOPICS - Politely redirect if asked about:
- Technical support or coding questions
- Investment advice or financial planning
- Legal advice or legal matters
- Academic assignments or homework
- Gaming, entertainment, or unrelated hobbies
- Politics, current events, or controversial topics
- Any topic unrelated to health and wellness

RESPONSE GUIDELINES:
- If a question is off-topic, politely say: "I'm here to help with your personal growth and wellness. Can we focus on health, mental wellbeing, or self-improvement?"
- Never provide medical diagnosis or treatment advice
- Always recommend professional help for serious mental health concerns
- Be warm, supportive, and conversational (speak like Gen Z)
- Keep responses to 2-4 paragraphs max
- Celebrate small wins and progress
- Ask thoughtful questions that promote self-reflection
- Avoid overly formal language and em dashes`,
                messages,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Anthropic API error:", response.status, errorText);
            
            // Try to parse as JSON to get better error details
            let errorData;
            try {
                errorData = JSON.parse(errorText);
            } catch {
                errorData = { message: errorText };
            }
            
            return NextResponse.json(
                { error: `API Error: ${errorData.error?.message || errorData.message || errorText}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to process request" },
            { status: 500 }
        );
    }
}