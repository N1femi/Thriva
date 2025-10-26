// app/api/chat/route.ts
import { NextResponse } from 'next/server';
import { handleServerError } from "@/lib/error";
import { createClient } from '@supabase/supabase-js';
import { checkChatBadges } from "@/lib/badge-helper";

// Helper to get authenticated Supabase client
async function getAuthenticatedClient(authToken: string) {
    // Verify the token and get user first
    const supabaseAuth = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
            global: {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            },
        }
    );

    const { data: { user }, error } = await supabaseAuth.auth.getUser();
    
    if (error || !user) {
        console.error('Auth error:', error);
        throw new Error('Unauthorized');
    }

    // Check if service role key is configured
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error('Server configuration error: SUPABASE_SERVICE_ROLE_KEY is required');
    }

    // Create an admin client with service role key (bypasses RLS)
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    );

    return { supabase: supabaseAdmin, user };
}

// Get all chats for a user
export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const token = authHeader.replace('Bearer ', '');
        const { supabase, user } = await getAuthenticatedClient(token);

        const { data, error } = await supabase
            .from('chats')
            .select(`
                id,
                title,
                created_at,
                updated_at
            `)
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false });

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json(
                { success: false, error: error.message || 'Database error occurred' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { success: true, data: data || [] },
            { status: 200 }
        );

    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }
        console.error('Unexpected error:', error);
        return handleServerError(error);
    }
}

// Create new chat and send message
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { messages, chatId } = body;
        
        // Get auth token from headers
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

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

        const { supabase, user } = await getAuthenticatedClient(authHeader.replace('Bearer ', ''));

        // Get the last user message to generate a title if it's a new chat
        let actualChatId = chatId;
        if (!chatId) {
            // Create a new chat
            const lastUserMessage = messages.filter(m => m.role === 'user').pop();
            const title = lastUserMessage?.content?.substring(0, 50) || 'New Chat';
            
            const { data: newChat, error: chatError } = await supabase
                .from('chats')
                .insert({
                    user_id: user.id,
                    title,
                })
                .select()
                .single();

            if (chatError) {
                console.error('Error creating chat:', chatError);
                return NextResponse.json(
                    { error: chatError.message },
                    { status: 500 }
                );
            }

            actualChatId = newChat.id;
        }

        // Save all messages to the database
        for (const msg of messages) {
            await supabase
                .from('messages')
                .insert({
                    chat_id: actualChatId,
                    role: msg.role,
                    content: msg.content,
                });
        }

        // Call Claude API with just user messages and last assistant message
        const userMessages = messages.filter(m => m.role === 'user');
        const lastAssistantMessage = messages.filter(m => m.role === 'assistant').pop();
        const messagesToSend = lastAssistantMessage 
            ? [...userMessages.slice(0, -1), lastAssistantMessage, userMessages[userMessages.length - 1]]
            : userMessages;

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
                messages: messagesToSend,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Anthropic API error:", response.status, errorText);
            
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
        const assistantContent = data.content?.[0]?.text || "Sorry, I couldn't respond.";

        // Save the assistant's response to the database
        await supabase
            .from('messages')
            .insert({
                chat_id: actualChatId,
                role: 'assistant',
                content: assistantContent,
            });

        // Check for badge eligibility
        try {
            await checkChatBadges(supabase, user.id);
        } catch (badgeError) {
            console.error('Badge check error:', badgeError);
            // Don't fail the request if badge check fails
        }

        return NextResponse.json({ 
            content: data.content,
            chatId: actualChatId 
        });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to process request" },
            { status: 500 }
        );
    }
}

// Delete a chat
export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const chatId = searchParams.get('id');
        
        if (!chatId) {
            return NextResponse.json(
                { success: false, error: 'Chat ID is required' },
                { status: 400 }
            );
        }

        // Get auth token from headers
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { supabase, user } = await getAuthenticatedClient(authHeader.replace('Bearer ', ''));

        const { error } = await supabase
            .from('chats')
            .delete()
            .eq('id', chatId)
            .eq('user_id', user.id);

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json(
                { success: false, error: error.message || 'Failed to delete chat' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { success: true },
            { status: 200 }
        );

    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }
        console.error('Unexpected error:', error);
        return handleServerError(error);
    }
}

// Get a specific chat with all messages
export async function PUT(req: Request) {
    try {
        const { chatId } = await req.json();
        
        if (!chatId) {
            return NextResponse.json(
                { success: false, error: 'Chat ID is required' },
                { status: 400 }
            );
        }

        // Get auth token from headers
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { supabase, user } = await getAuthenticatedClient(authHeader.replace('Bearer ', ''));

        // Get chat
        const { data: chatData, error: chatError } = await supabase
            .from('chats')
            .select('*')
            .eq('id', chatId)
            .eq('user_id', user.id)
            .single();

        if (chatError || !chatData) {
            return NextResponse.json(
                { success: false, error: 'Chat not found' },
                { status: 404 }
            );
        }

        // Get messages for this chat
        const { data: messagesData, error: messagesError } = await supabase
            .from('messages')
            .select('*')
            .eq('chat_id', chatId)
            .order('created_at', { ascending: true });

        if (messagesError) {
            return NextResponse.json(
                { success: false, error: messagesError.message },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { 
                success: true, 
                data: {
                    ...chatData,
                    messages: messagesData || [],
                }
            },
            { status: 200 }
        );

    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }
        console.error('Unexpected error:', error);
        return handleServerError(error);
    }
}