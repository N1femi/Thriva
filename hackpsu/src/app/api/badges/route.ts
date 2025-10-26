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

        // Get all badges
        const { data: allBadges, error: badgesError } = await supabase
            .from('badges')
            .select('*')
            .order('name');

        if (badgesError) {
            return NextResponse.json(
                { success: false, error: badgesError.message },
                { status: 500 }
            );
        }

        // Get user's badge progress
        const { data: userBadges, error: userBadgesError } = await supabase
            .from('user_badges')
            .select('*')
            .eq('user_id', user.id);

        if (userBadgesError) {
            return NextResponse.json(
                { success: false, error: userBadgesError.message },
                { status: 500 }
            );
        }

        // Create a map of badge_id -> badge data for quick lookup
        const badgeProgressMap = new Map(
            userBadges?.map(ub => [ub.badge_id, ub]) || []
        );

        // Combine data with progress
        const badgesWithStatus = allBadges?.map(badge => {
            const userBadge = badgeProgressMap.get(badge.id);
            return {
                ...badge,
                earned: userBadge?.earned || false,
                progress: userBadge?.progress || 0,
                earned_at: userBadge?.earned_at
            };
        }) || [];

        return NextResponse.json(
            { success: true, data: badgesWithStatus },
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

