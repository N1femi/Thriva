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
const getOrCreateProfile = async (userId: string): Promise<Profile> => {
    // Try to get profile
    const { data: existingProfile, error: fetchError } = await supabase
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
        const { data: newProfile, error: insertError } = await supabase
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
export const getFriends = async (userId: string): Promise<Profile[]> => {
    // Ensure current user has a profile
    await getOrCreateProfile(userId);

    const { data, error } = await supabase
        .from("Friends")
        .select("profile_one, profile_two")
        .or(`profile_one.eq.${userId},profile_two.eq.${userId}`);

    if (error) throw new Error(error.message);
    
    if (!data || data.length === 0) return [];
    
    // Get friend IDs
    const friendIds = data.map(friend => 
        friend.profile_one === userId ? friend.profile_two : friend.profile_one
    );
    
    // Get or create profiles for all friends
    const profiles = await Promise.all(
        friendIds.map(id => getOrCreateProfile(id))
    );
    
    return profiles;
};

// Add a friend relationship
export const addFriend = async (userId: string, friendId: string): Promise<Friend> => {
    // Ensure both users have profiles
    await getOrCreateProfile(userId);
    await getOrCreateProfile(friendId);

    // Check if friendship already exists
    const { data: existing, error: checkError } = await supabase
        .from("Friends")
        .select("*")
        .or(`and(profile_one.eq.${userId},profile_two.eq.${friendId}),and(profile_one.eq.${friendId},profile_two.eq.${userId})`)
        .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
        throw new Error(checkError.message);
    }

    if (existing) {
        throw new Error("Friendship already exists");
    }

    const { data, error } = await supabase
        .from("Friends")
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
export const removeFriend = async (userId: string, friendId: string): Promise<void> => {
    const { error } = await supabase
        .from("Friends")
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

// Search for users by name (excluding current user and existing friends)
export const searchUsers = async (searchTerm: string, currentUserId: string): Promise<Profile[]> => {
    // First, get current user's friends
    const friends = await getFriends(currentUserId);
    const friendIds = friends.map(f => f.id);
    
    // Search for profiles
    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .ilike("name", `%${searchTerm}%`)
        .neq("id", currentUserId)
        .not("id", "in", `(${friendIds.join(',')})`);

    if (error) throw new Error(error.message);
    
    return data || [];
};

