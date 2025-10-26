import { supabase } from "@/lib/supabase";

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon_name: string;
    requirement: string;
}

export interface UserBadge {
    id: string;
    user_id: string;
    badge_id: string;
    progress?: number;
    earned?: boolean;
    earned_at?: string;
    created_at?: string;
    updated_at?: string;
}

export const getAllBadges = async (): Promise<Badge[]> => {
    const { data, error } = await supabase
        .from("badges")
        .select("*")
        .order("name");

    if (error) throw new Error(error.message);
    return data || [];
};

export const getUserBadges = async (userId: string): Promise<UserBadge[]> => {
    const { data, error } = await supabase
        .from("user_badges")
        .select("*")
        .eq("user_id", userId);

    if (error) throw new Error(error.message);
    return data || [];
};

export const getBadgesWithUserStatus = async (userId: string): Promise<Badge[]> => {
    const [allBadges, userBadges] = await Promise.all([
        getAllBadges(),
        getUserBadges(userId)
    ]);

    const badgeProgressMap = new Map(
        userBadges.map(ub => [ub.badge_id, ub])
    );
    
    return allBadges.map(badge => {
        const userBadge = badgeProgressMap.get(badge.id);
        return {
            ...badge,
            earned: userBadge?.earned || false,
            progress: userBadge?.progress || 0,
            earned_at: userBadge?.earned_at
        };
    });
};

export const addUserBadge = async (
    userId: string,
    badgeId: string
): Promise<UserBadge> => {
    const { data, error } = await supabase
        .from("user_badges")
        .insert({
            user_id: userId,
            badge_id: badgeId
        })
        .select()
        .single();

    if (error) throw new Error(error.message);
    if (!data) throw new Error("Failed to add user badge");

    return data;
};

