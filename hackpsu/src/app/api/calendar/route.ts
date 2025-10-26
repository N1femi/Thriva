import { NextResponse } from 'next/server';
import { handleServerError } from "@/lib/error";
import { checkCalendarBadges } from "@/lib/badge-helper";
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
    
    if (error || !user) {
        console.error('Auth error:', error);
        throw new Error('Unauthorized');
    }

    // Check if service role key is configured
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error('SUPABASE_SERVICE_ROLE_KEY is not set');
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

    // Return the admin client and verified user
    // Note: We manually verify user_id in all queries to maintain security
    return { supabase: supabaseAdmin, user };
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const date = searchParams.get('date');
        
        // Get auth token from headers
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { supabase, user } = await getAuthenticatedClient(authHeader.replace('Bearer ', ''));

        let query = supabase
            .from('events')
            .select('*')
            .eq('user_id', user.id)
            .order('start_time', { ascending: true });

        // Filter by date if provided
        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            query = query
                .gte('start_time', startOfDay.toISOString())
                .lte('start_time', endOfDay.toISOString());
        }

        const { data, error } = await query;

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
        const { title, notes, start_time, end_time } = body;
        
        // Get auth token from headers
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Validate required fields
        if (!title || !start_time || !end_time) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields: title, start_time, and end_time are required' },
                { status: 400 }
            );
        }

        const { supabase, user } = await getAuthenticatedClient(authHeader.replace('Bearer ', ''));

        console.log('Inserting event with user_id:', user.id);
        console.log('User object:', JSON.stringify(user, null, 2));

        const { data, error } = await supabase
            .from('events')
            .insert({
                user_id: user.id,
                title,
                notes: notes || '',
                start_time: new Date(start_time).toISOString(),
                end_time: new Date(end_time).toISOString(),
            })
            .select()
            .single();

        if (error) {
            console.error('Database error:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
            return NextResponse.json(
                { success: false, error: error.message || 'Failed to create event' },
                { status: 500 }
            );
        }

        // Check for badge eligibility
        try {
            await checkCalendarBadges(supabase, user.id);
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

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        
        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Event ID is required' },
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
            .from('events')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json(
                { success: false, error: error.message || 'Failed to delete event' },
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
