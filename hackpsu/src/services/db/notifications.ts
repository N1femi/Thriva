import { supabase } from "@/lib/supabase";

export type NotificationType = 
    | "friend_request"
    | "friend_added" 
    | "journal_entry"
    | "badge_earned"
    | "calendar_event";

export interface Notification {
    id: string;
    user_id: string;
    type: NotificationType;
    title: string;
    message: string;
    read: boolean;
    metadata?: Record<string, any>;
    created_at?: string;
    updated_at?: string;
}

// Get all notifications for a user
export const getNotifications = async (userId: string): Promise<Notification[]> => {
    const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
};

// Get unread notifications count
export const getUnreadNotificationCount = async (userId: string): Promise<number> => {
    const { data, error } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("read", false);

    if (error) throw new Error(error.message);
    return data?.length || 0;
};

// Create a notification
export const createNotification = async (
    notification: Omit<Notification, "id" | "created_at" | "updated_at">
): Promise<Notification> => {
    const { data, error } = await supabase
        .from("notifications")
        .insert({
            ...notification,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (error) throw new Error(error.message);
    if (!data) throw new Error("Notification insert returned no data");

    return data;
};

// Mark notification as read
export const markNotificationAsRead = async (
    id: string,
    userId: string
): Promise<Notification> => {
    const { data, error } = await supabase
        .from("notifications")
        .update({ 
            read: true,
            updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .eq("user_id", userId)
        .select()
        .single();

    if (error) throw new Error(error.message);
    if (!data) throw new Error("Notification not found");

    return data;
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (
    userId: string
): Promise<void> => {
    const { error } = await supabase
        .from("notifications")
        .update({ 
            read: true,
            updated_at: new Date().toISOString()
        })
        .eq("user_id", userId)
        .eq("read", false);

    if (error) throw new Error(error.message);
};

// Delete a notification
export const deleteNotification = async (
    id: string,
    userId: string
): Promise<void> => {
    const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

    if (error) throw new Error(error.message);
};

// Helper functions to create specific notification types
export const notifyFriendRequest = async (
    userId: string,
    friendName: string,
    metadata?: Record<string, any>
): Promise<void> => {
    await createNotification({
        user_id: userId,
        type: "friend_request",
        title: "New Friend Request",
        message: `${friendName} sent you a friend request`,
        read: false,
        metadata,
    });
};

export const notifyFriendAdded = async (
    userId: string,
    friendName: string,
    metadata?: Record<string, any>
): Promise<void> => {
    await createNotification({
        user_id: userId,
        type: "friend_added",
        title: "Friend Added",
        message: `You and ${friendName} are now friends`,
        read: false,
        metadata,
    });
};

export const notifyJournalEntry = async (
    userId: string,
    entryTitle: string,
    metadata?: Record<string, any>
): Promise<void> => {
    await createNotification({
        user_id: userId,
        type: "journal_entry",
        title: "Journal Entry Created",
        message: `You created a new journal entry: "${entryTitle}"`,
        read: false,
        metadata,
    });
};

export const notifyBadgeEarned = async (
    userId: string,
    badgeName: string,
    metadata?: Record<string, any>
): Promise<void> => {
    await createNotification({
        user_id: userId,
        type: "badge_earned",
        title: "Badge Earned! 🏆",
        message: `Congratulations! You earned the "${badgeName}" badge`,
        read: false,
        metadata,
    });
};

export const notifyCalendarEvent = async (
    userId: string,
    eventTitle: string,
    metadata?: Record<string, any>
): Promise<void> => {
    await createNotification({
        user_id: userId,
        type: "calendar_event",
        title: "Calendar Event",
        message: `You have a new event: "${eventTitle}"`,
        read: false,
        metadata,
    });
};
