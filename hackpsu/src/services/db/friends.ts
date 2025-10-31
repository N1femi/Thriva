import { supabase } from "@/lib/supabase";

export interface Friend {
    id: string;
    profile_one: string;
    profile_two: string;
}

export interface Profile {
    id: string;
    name: string;
    created_at?: string;
}

// Helper: Get or create profile for a user
const getOrCreateProfile = async (userId: string, supabaseClient?: any): Promise<Profile> => {
    const client = supabaseClient || supabase;
    
    // Try to get profile
    const { data: existingProfile, error: fetchError } = await client
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

    if (existingProfile) {
        return existingProfile;
    }

    // Profile doesn't exist, create a fallback
    // Note: In production, you'd want a database trigger to auto-create profiles
    const userName = `User ${userId.substring(0, 8)}`;

    try {
        // Try to insert profile
        const { data: newProfile, error: insertError } = await client
            .from("profiles")
            .insert({
                id: userId,
                name: userName
            })
            .select()
            .single();

        if (!insertError && newProfile) {
            return newProfile;
        }
    } catch (error) {
        console.error("Error creating profile:", error);
    }

    // Return a fallback profile if insert fails
    return {
        id: userId,
        name: userName
    };
};

// Get all friends for a user (both directions)
export const getFriends = async (userId: string, supabaseClient?: any): Promise<Profile[]> => {
    const client = supabaseClient || supabase;
    
    // Ensure current user has a profile
    await getOrCreateProfile(userId, client);

    const { data, error } = await client
        .from("friends")
        .select("profile_one, profile_two")
        .or(`profile_one.eq.${userId},profile_two.eq.${userId}`);

    if (error) throw new Error(error.message);
    
    if (!data || data.length === 0) return [];
    
    // Get friend IDs
    const friendIds: string[] = data.map((friend: Friend) => 
        friend.profile_one === userId ? friend.profile_two : friend.profile_one
    );
    
    // Get or create profiles for all friends
    const profiles = await Promise.all(
        friendIds.map((id: string) => getOrCreateProfile(id, client))
    );
    
    return profiles;
};

// Add a friend relationship
export const addFriend = async (userId: string, friendId: string, supabaseClient?: any): Promise<Friend> => {
    const client = supabaseClient || supabase;
    
    // Ensure both users have profiles
    await getOrCreateProfile(userId, client);
    await getOrCreateProfile(friendId, client);

    // Check if friendship already exists
    const { data: existing, error: checkError } = await client
        .from("friends")
        .select("*")
        .or(`and(profile_one.eq.${userId},profile_two.eq.${friendId}),and(profile_one.eq.${friendId},profile_two.eq.${userId})`)
        .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
        throw new Error(checkError.message);
    }

    if (existing) {
        throw new Error("Friendship already exists");
    }

    const { data, error } = await client
        .from("friends")
        .insert({
            profile_one: userId,
            profile_two: friendId
        })
        .select()
        .single();

    if (error) throw new Error(error.message);
    if (!data) throw new Error("Failed to add friend");

    return data;
};

// Remove a friend relationship
export const removeFriend = async (userId: string, friendId: string, supabaseClient?: any): Promise<void> => {
    const client = supabaseClient || supabase;
    
    const { error } = await client
        .from("friends")
        .delete()
        .or(`and(profile_one.eq.${userId},profile_two.eq.${friendId}),and(profile_one.eq.${friendId},profile_two.eq.${userId})`);

    if (error) throw new Error(error.message);
};

// Get user profile by ID
export const getUserProfile = async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return null;
        }
        throw new Error(error.message);
    }

    return data;
};

// Search for users by name or email (excluding current user and existing friends)
export const searchUsers = async (searchTerm: string, currentUserId: string, supabaseClient?: any): Promise<Profile[]> => {
    const client = supabaseClient || supabase;
    
    // First, get current user's friends
    let friendIds: string[] = [];
    try {
        const friends = await getFriends(currentUserId, client);
        friendIds = friends.map((f: { id: string }) => f.id);
    } catch (error) {
        console.error("Error getting friends list:", error);
        // Continue with empty friend list if there's an error
    }
    
    // Search for users by email using raw SQL (when using admin client)
    // This allows us to search auth.users which has email addresses
    try {
        // Try to use raw SQL if we have an admin client
        if (client.rpc) {
            const { data: usersByEmail, error: emailError } = await client.rpc('search_users_by_email_or_name', {
                search_term: `%${searchTerm}%`,
                current_user_id: currentUserId
            });
            
            // If RPC function doesn't exist or has an error, fall through to basic search
            if (!emailError && usersByEmail && Array.isArray(usersByEmail) && usersByEmail.length > 0) {
                // Filter out existing friends
                return usersByEmail.filter((profile: Profile) => !friendIds.includes(profile.id));
            }
        }
    } catch (error: any) {
        // RPC function may not exist, log and continue to fallback
        console.log("RPC function not available or error occurred, falling back to basic search:", error?.message);
    }
    
    // Fallback: Search for profiles by name only
    const { data, error } = await client
        .from("profiles")
        .select("*")
        .ilike("name", `%${searchTerm}%`)
        .neq("id", currentUserId);

    if (error) {
        console.error("Error searching profiles:", error);
        throw new Error(error.message);
    }
    
    // Filter out existing friends
    const filteredData = (data || []).filter((profile: Profile) => !friendIds.includes(profile.id));
    
    return filteredData;
};

