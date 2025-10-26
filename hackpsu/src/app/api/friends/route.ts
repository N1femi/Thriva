import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import * as friendsService from "@/services/db/friends";
import { handleServerError } from "@/lib/error";
import { checkFriendsBadges } from "@/lib/badge-helper";

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

// GET /api/friends - Get all friends for the current user
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
        return NextResponse.json(
            { success: false, error: 'Unauthorized' },
            { status: 401 }
        );
    }

    const token = authHeader.replace('Bearer ', '');
    const { supabase, user } = await getAuthenticatedClient(token);

    // Get friends using the service
    const friends = await friendsService.getFriends(user.id, supabase);

    return NextResponse.json({
      success: true,
      data: friends
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.error("Error fetching friends:", error);
    return handleServerError(error);
  }
}

// POST /api/friends - Add a friend
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
        return NextResponse.json(
            { success: false, error: 'Unauthorized' },
            { status: 401 }
        );
    }

    const token = authHeader.replace('Bearer ', '');
    const { supabase, user } = await getAuthenticatedClient(token);

    const { friendId } = await request.json();

    if (!friendId) {
      return NextResponse.json(
        { success: false, error: "friendId is required" },
        { status: 400 }
      );
    }

    // Add friend
    // Note: Notifications for friend additions are automatically created by database triggers
    const friend = await friendsService.addFriend(user.id, friendId, supabase);

    // Check for badge eligibility
    try {
        await checkFriendsBadges(supabase, user.id);
    } catch (badgeError) {
        console.error('Badge check error:', badgeError);
        // Don't fail the request if badge check fails
    }

    return NextResponse.json({
      success: true,
      data: friend
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.error("Error adding friend:", error);
    return handleServerError(error);
  }
}

// PUT /api/friends - Search for users
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
        return NextResponse.json(
            { success: false, error: 'Unauthorized' },
            { status: 401 }
        );
    }

    const token = authHeader.replace('Bearer ', '');
    const { supabase, user } = await getAuthenticatedClient(token);

    const { searchTerm } = await request.json();

    if (!searchTerm || typeof searchTerm !== 'string') {
      return NextResponse.json(
        { success: false, error: "searchTerm is required" },
        { status: 400 }
      );
    }

    // Search for users
    const results = await friendsService.searchUsers(searchTerm, user.id, supabase);

    return NextResponse.json({
      success: true,
      data: results
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.error("Error searching users:", error);
    return handleServerError(error);
  }
}

// DELETE /api/friends - Remove a friend
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
        return NextResponse.json(
            { success: false, error: 'Unauthorized' },
            { status: 401 }
        );
    }

    const token = authHeader.replace('Bearer ', '');
    const { supabase, user } = await getAuthenticatedClient(token);

    const { searchParams } = new URL(request.url);
    const friendId = searchParams.get("friendId");

    if (!friendId) {
      return NextResponse.json(
        { success: false, error: "friendId is required" },
        { status: 400 }
      );
    }

    // Remove friend
    await friendsService.removeFriend(user.id, friendId, supabase);

    return NextResponse.json({
      success: true,
      message: "Friend removed successfully"
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.error("Error removing friend:", error);
    return handleServerError(error);
  }
}

