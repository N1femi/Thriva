import { NextResponse } from 'next/server';
import { handleServerError } from "@/lib/error";
import { createClient } from '@supabase/supabase-js';

// Helper to get authenticated Supabase client
async function getAuthenticatedClient(authToken: string) {
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
        throw new Error('Unauthorized');
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error('Server configuration error: SUPABASE_SERVICE_ROLE_KEY is required');
    }

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

// GET - Fetch notification preferences for the user
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
            .from('notification_preferences')
            .select('*')
            .eq('user_id', user.id);

        if (error) {
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
        return handleServerError(error);
    }
}

// POST - Create or update notification preferences
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { preferences } = body;
        
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        if (!preferences || !Array.isArray(preferences)) {
            return NextResponse.json(
                { success: false, error: 'Preferences array is required' },
                { status: 400 }
            );
        }

        const { supabase, user } = await getAuthenticatedClient(authHeader.replace('Bearer ', ''));

        // Insert or update preferences using upsert
        const { data, error } = await supabase
            .from('notification_preferences')
            .upsert(
                preferences.map((pref: { type: string; enabled: boolean }) => ({
                    user_id: user.id,
                    notification_type: pref.type,
                    enabled: pref.enabled,
                })),
                { onConflict: 'user_id,notification_type' }
            )
            .select();

        if (error) {
            return NextResponse.json(
                { success: false, error: error.message || 'Failed to update preferences' },
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
        return handleServerError(error);
    }
}

// PATCH - Update a single notification preference
export async function PATCH(req: Request) {
    try {
        const body = await req.json();
        const { type, enabled } = body;
        
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        if (!type || typeof enabled !== 'boolean') {
            return NextResponse.json(
                { success: false, error: 'Type and enabled status are required' },
                { status: 400 }
            );
        }

        const { supabase, user } = await getAuthenticatedClient(authHeader.replace('Bearer ', ''));

        const { data, error } = await supabase
            .from('notification_preferences')
            .upsert({
                user_id: user.id,
                notification_type: type,
                enabled: enabled,
            }, { onConflict: 'user_id,notification_type' })
            .select()
            .single();

        if (error) {
            return NextResponse.json(
                { success: false, error: error.message || 'Failed to update preference' },
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
        return handleServerError(error);
    }
}

