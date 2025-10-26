import { supabase } from "@/lib/supabase";

export type NotificationType = 
    | "friend_request"
    | "friend_added" 
    | "journal_entry"
    | "badge_earned"
    | "calendar_event";

export interface NotificationPreference {
    id: string;
    user_id: string;
    notification_type: NotificationType;
    enabled: boolean;
    created_at?: string;
    updated_at?: string;
}

// Get all notification preferences for a user
export const getNotificationPreferences = async (userId: string): Promise<NotificationPreference[]> => {
    const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", userId);

    if (error) throw new Error(error.message);
    return data || [];
};

// Check if a user wants to receive a specific type of notification
export const isNotificationTypeEnabled = async (
    userId: string, 
    type: NotificationType
): Promise<boolean> => {
    const { data, error } = await supabase
        .from("notification_preferences")
        .select("enabled")
        .eq("user_id", userId)
        .eq("notification_type", type)
        .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    
    // If no preference exists, default to enabled
    return data?.enabled ?? true;
};

// Update notification preferences
export const updateNotificationPreferences = async (
    userId: string,
    preferences: { type: NotificationType; enabled: boolean }[]
): Promise<NotificationPreference[]> => {
    const { data, error } = await supabase
        .from("notification_preferences")
        .upsert(
            preferences.map(pref => ({
                user_id: userId,
                notification_type: pref.type,
                enabled: pref.enabled,
            })),
            { onConflict: 'user_id,notification_type' }
        )
        .select();

    if (error) throw new Error(error.message);
    if (!data) throw new Error("Failed to update preferences");

    return data;
};

// Update a single notification preference
export const updateNotificationPreference = async (
    userId: string,
    type: NotificationType,
    enabled: boolean
): Promise<NotificationPreference> => {
    const { data, error } = await supabase
        .from("notification_preferences")
        .upsert({
            user_id: userId,
            notification_type: type,
            enabled: enabled,
        }, { onConflict: 'user_id,notification_type' })
        .select()
        .single();

    if (error) throw new Error(error.message);
    if (!data) throw new Error("Failed to update preference");

    return data;
};

// Get all available notification types
export const getAllNotificationTypes = (): { type: NotificationType; label: string }[] => {
    return [
        { type: "friend_request", label: "Friend Requests" },
        { type: "friend_added", label: "Friend Additions" },
        { type: "journal_entry", label: "Journal Entries" },
        { type: "badge_earned", label: "Badge Earnings" },
        { type: "calendar_event", label: "Calendar Events" },
    ];
};

