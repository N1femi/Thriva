import { NextResponse } from 'next/server';
import { handleServerError } from "@/lib/error";
import { checkAndAwardBadges } from "@/lib/badge-helper";
import { createClient } from '@supabase/supabase-js';

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
    
    console.log('User fetch result:', { hasUser: !!user, error: error?.message });
    
    if (error || !user) {
        console.error('Auth error:', error);
        console.error('User data:', user);
        throw new Error('Unauthorized');
    }
    
    console.log('User authenticated:', user.id);

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

export async function GET(req: Request) {
    try {
        // Get auth token from headers
        const authHeader = req.headers.get('authorization');
        console.log('Auth header present:', !!authHeader);
        console.log('Auth header length:', authHeader?.length);
        
        if (!authHeader) {
            console.log('No authorization header found');
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const token = authHeader.replace('Bearer ', '');
        console.log('Token length:', token.length);
        console.log('Token prefix:', token.substring(0, 20));
        
        const { supabase, user } = await getAuthenticatedClient(token);

        const { data, error } = await supabase
            .from('entries')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

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

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { title, text } = body;
        
        // Get auth token from headers
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Validate required fields
        if (!title || !text) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields: title and text are required' },
                { status: 400 }
            );
        }

        const { supabase, user } = await getAuthenticatedClient(authHeader.replace('Bearer ', ''));

        console.log('Inserting entry with user_id:', user.id);
        console.log('User object:', JSON.stringify(user, null, 2));

        const { data, error } = await supabase
            .from('entries')
            .insert({
                user_id: user.id,
                title,
                text,
                created_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            console.error('Database error:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
            return NextResponse.json(
                { success: false, error: error.message || 'Failed to create entry' },
                { status: 500 }
            );
        }

        // Check for badge eligibility
        try {
            await checkAndAwardBadges(supabase, user.id, text);
        } catch (badgeError) {
            console.error('Badge check error:', badgeError);
            // Don't fail the request if badge check fails
        }

        return NextResponse.json(
            { success: true, data },
            { status: 201 }
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

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { id, title, text } = body;
        
        // Get auth token from headers
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Entry ID is required' },
                { status: 400 }
            );
        }

        const { supabase, user } = await getAuthenticatedClient(authHeader.replace('Bearer ', ''));

        const updates: { title?: string; text?: string } = {};
        if (title !== undefined) updates.title = title;
        if (text !== undefined) updates.text = text;

        const { data, error } = await supabase
            .from('entries')
            .update(updates)
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single();

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json(
                { success: false, error: error.message || 'Failed to update entry' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { success: true, data },
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

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        
        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Entry ID is required' },
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
            .from('entries')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json(
                { success: false, error: error.message || 'Failed to delete entry' },
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
