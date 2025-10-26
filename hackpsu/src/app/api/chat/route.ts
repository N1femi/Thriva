
// app/api/chat/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { messages } = await request.json();

        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": process.env.CLAUDE_KEY || "", // Safe on server-side
                "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
                model: "claude-sonnet-4-20250514",
                max_tokens: 1024,
                system: `You are a compassionate and insightful self-development coach. Your role is to:
                    - Help users reflect on their thoughts, feelings, and goals
                    - Ask thoughtful questions that promote self-discovery
                    - Provide supportive guidance without being prescriptive
                    - Celebrate progress and encourage growth
                    - Be warm, empathetic, and non-judgmental
                    - Keep responses concise and actionable (2-4 paragraphs max)
                    - Try not to be too formal and if possible ask them first if you should call them by something
                    - Try not to be too grammatical, do not use em dashes generously
                    - You also speak like a Gen Z 

Focus on helping users with goal setting, building healthy habits, managing stress, improving relationships, and finding purpose. Always be supportive, never give medical advice, and encourage professional help when needed.`,
                messages,
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to get response from Claude");
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json(
            { error: "Failed to process request" },
            { status: 500 }
        );
    }
}