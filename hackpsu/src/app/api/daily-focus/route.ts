import { NextResponse } from 'next/server';
import { handleServerError } from "@/lib/error";
import { createClient } from '@supabase/supabase-js';
import { checkDailyFocusBadges } from "@/lib/badge-helper";

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

    return { supabase: supabaseAdmin, user };
}

// Get all available focus options
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

        // Get all available focus options
        const { data: focusOptions, error: focusError } = await supabase
            .from('daily_focus')
            .select('*')
            .order('title', { ascending: true });

        if (focusError) {
            console.error('Database error:', focusError);
            return NextResponse.json(
                { success: false, error: focusError.message || 'Database error occurred' },
                { status: 500 }
            );
        }

        // Get user's selected focus for today if date is provided
        let userSelections = null;
        if (date) {
            const { data: selections, error: selectionsError } = await supabase
                .from('user_daily_focus')
                .select('*, daily_focus(*)')
                .eq('user_id', user.id)
                .eq('selected_date', date);

            if (!selectionsError) {
                userSelections = selections;
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                options: focusOptions || [],
                selections: userSelections || [],
            }
        }, { status: 200 });

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

// Create or update daily focus selection
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { focus_id, selected_date, completed } = body;
        
        // Get auth token from headers
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { supabase, user } = await getAuthenticatedClient(authHeader.replace('Bearer ', ''));

        const targetDate = selected_date || new Date().toISOString().split('T')[0];

        // Check if selection already exists
        const { data: existing } = await supabase
            .from('user_daily_focus')
            .select('id')
            .eq('user_id', user.id)
            .eq('focus_id', focus_id)
            .eq('selected_date', targetDate)
            .single();

        if (existing) {
            // Update existing selection
            const { data, error } = await supabase
                .from('user_daily_focus')
                .update({ completed: completed !== undefined ? completed : false })
                .eq('id', existing.id)
                .select()
                .single();

            if (error) {
                console.error('Database error:', error);
                return NextResponse.json(
                    { success: false, error: error.message || 'Failed to update focus' },
                    { status: 500 }
                );
            }

            // Check for badge eligibility
            try {
                await checkDailyFocusBadges(supabase, user.id);
            } catch (badgeError) {
                console.error('Badge check error:', badgeError);
                // Don't fail the request if badge check fails
            }

            return NextResponse.json({ success: true, data }, { status: 200 });
        } else {
            // Create new selection
            const { data, error } = await supabase
                .from('user_daily_focus')
                .insert({
                    user_id: user.id,
                    focus_id,
                    selected_date: targetDate,
                    completed: completed ?? false,
                })
                .select()
                .single();

            if (error) {
                console.error('Database error:', error);
                return NextResponse.json(
                    { success: false, error: error.message || 'Failed to create focus selection' },
                    { status: 500 }
                );
            }

            // Check for badge eligibility
            try {
                await checkDailyFocusBadges(supabase, user.id);
            } catch (badgeError) {
                console.error('Badge check error:', badgeError);
                // Don't fail the request if badge check fails
            }

            return NextResponse.json({ success: true, data }, { status: 201 });
        }

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

// Update completion status
export async function PATCH(req: Request) {
    try {
        const body = await req.json();
        const { selection_id, completed } = body;
        
        // Get auth token from headers
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { supabase, user } = await getAuthenticatedClient(authHeader.replace('Bearer ', ''));

        const { data, error } = await supabase
            .from('user_daily_focus')
            .update({ completed })
            .eq('id', selection_id)
            .eq('user_id', user.id)
            .select()
            .single();

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json(
                { success: false, error: error.message || 'Failed to update completion' },
                { status: 500 }
            );
        }

        // Check for badge eligibility
        try {
            await checkDailyFocusBadges(supabase, user.id);
        } catch (badgeError) {
            console.error('Badge check error:', badgeError);
            // Don't fail the request if badge check fails
        }

        return NextResponse.json({ success: true, data }, { status: 200 });

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

// Delete a daily focus selection
export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        
        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Selection ID is required' },
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
            .from('user_daily_focus')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json(
                { success: false, error: error.message || 'Failed to delete focus selection' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true }, { status: 200 });

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

