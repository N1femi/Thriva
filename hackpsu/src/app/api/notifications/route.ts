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

// GET - Fetch all notifications
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
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

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

// POST - Create a notification
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { type, title, message, metadata } = body;
        
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        if (!type || !title || !message) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const { supabase, user } = await getAuthenticatedClient(authHeader.replace('Bearer ', ''));

        const { data, error } = await supabase
            .from('notifications')
            .insert({
                user_id: user.id,
                type,
                title,
                message,
                metadata: metadata || {},
                read: false,
                created_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json(
                { success: false, error: error.message || 'Failed to create notification' },
                { status: 500 }
            );
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
        return handleServerError(error);
    }
}

// PATCH - Mark notification as read or update
export async function PATCH(req: Request) {
    try {
        const body = await req.json();
        const { id, read, metadata } = body;
        
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Notification ID is required' },
                { status: 400 }
            );
        }

        const { supabase, user } = await getAuthenticatedClient(authHeader.replace('Bearer ', ''));

        const updates: any = {
            updated_at: new Date().toISOString(),
        };
        
        if (read !== undefined) updates.read = read;
        if (metadata !== undefined) updates.metadata = metadata;

        const { data, error } = await supabase
            .from('notifications')
            .update(updates)
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single();

        if (error) {
            return NextResponse.json(
                { success: false, error: error.message || 'Failed to update notification' },
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

// PUT - Mark all as read
export async function PUT(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { supabase, user } = await getAuthenticatedClient(authHeader.replace('Bearer ', ''));

        const { error } = await supabase
            .from('notifications')
            .update({ 
                read: true,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id)
            .eq('read', false);

        if (error) {
            return NextResponse.json(
                { success: false, error: error.message || 'Failed to mark notifications as read' },
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
        return handleServerError(error);
    }
}

// DELETE - Delete a notification
export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        
        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Notification ID is required' },
                { status: 400 }
            );
        }

        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { supabase, user } = await getAuthenticatedClient(authHeader.replace('Bearer ', ''));

        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) {
            return NextResponse.json(
                { success: false, error: error.message || 'Failed to delete notification' },
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
        return handleServerError(error);
    }
}
