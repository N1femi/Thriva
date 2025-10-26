export async function checkAndAwardBadges(supabase: any, userId: string, entryText: string, entryDate?: Date) {
    const currentDate = entryDate || new Date();
    const currentHour = currentDate.getHours();
    const wordCount = entryText.split(/\s+/).filter(word => word.length > 0).length;

    // Initialize or update user stats
    let { data: userStats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (!userStats) {
        const { data: newStats } = await supabase
            .from('user_stats')
            .insert({ user_id: userId })
            .select()
            .single();
        userStats = newStats;
    }

    // Update total entries
    const totalEntries = userStats.total_entries + 1;
    const totalWords = userStats.total_words + wordCount;

    // Calculate streak
    const entryDateOnly = currentDate.toISOString().split('T')[0];
    let currentStreak = 0;
    let longestStreak = userStats.longest_streak;

    if (userStats.last_entry_date) {
        const lastDate = new Date(userStats.last_entry_date);
        const yesterday = new Date(currentDate);
        yesterday.setDate(yesterday.getDate() - 1);

        if (entryDateOnly === lastDate.toISOString().split('T')[0]) {
            // Same day entry, maintain streak
            currentStreak = userStats.current_streak;
        } else if (entryDateOnly === yesterday.toISOString().split('T')[0]) {
            // Entry yesterday, increment streak
            currentStreak = userStats.current_streak + 1;
            if (currentStreak > longestStreak) {
                longestStreak = currentStreak;
            }
        } else {
            // Streak broken, start new streak
            currentStreak = 1;
        }
    } else {
        currentStreak = 1;
    }

    // Get week boundaries
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    // Count entries this week
    const { count: entriesThisWeek } = await supabase
        .from('entries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', startOfWeek.toISOString());

    // Count entries this month
    const { count: entriesThisMonth } = await supabase
        .from('entries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', startOfMonth.toISOString());

    // Update user stats
    const updates: any = {
        total_entries: totalEntries,
        total_words: totalWords,
        current_streak: currentStreak,
        longest_streak: longestStreak,
        last_entry_date: entryDateOnly,
        entries_this_week: entriesThisWeek,
        entries_this_month: entriesThisMonth,
        updated_at: new Date().toISOString()
    };

    // Track time-based badges
    if (currentHour < 7) {
        updates.entries_before_7am = (userStats.entries_before_7am || 0) + 1;
    }
    if (currentHour >= 22) {
        updates.entries_after_10pm = (userStats.entries_after_10pm || 0) + 1;
    }
    if (currentHour >= 0 && currentHour < 6) {
        updates.entries_after_midnight = (userStats.entries_after_midnight || 0) + 1;
    }

    await supabase
        .from('user_stats')
        .update(updates)
        .eq('user_id', userId);

    // Award badges based on updated stats
    await updateBadgeProgress(supabase, userId, 'First Steps', totalEntries, 1);
    await updateBadgeProgress(supabase, userId, 'Wellness Warrior', Math.min(totalEntries, 30), 30);
    await updateBadgeProgress(supabase, userId, 'Reflection Master', Math.min(totalEntries, 100), 100);
    await updateBadgeProgress(supabase, userId, 'Journal Journey', Math.min(totalEntries, 250), 250);

    // Word count badges
    await updateBadgeProgress(supabase, userId, 'Deep Thinker', Math.min(wordCount, 500), 500);
    await updateBadgeProgress(supabase, userId, 'Expressive Writer', Math.min(wordCount, 1000), 1000);
    await updateBadgeProgress(supabase, userId, 'Word Wizard', Math.min(totalWords, 50000), 50000);

    // Streak badges
    await updateBadgeProgress(supabase, userId, 'Consistency King', Math.min(currentStreak, 7), 7);
    await updateBadgeProgress(supabase, userId, 'Consistent Contributor', Math.min(currentStreak, 30), 30);
    await updateBadgeProgress(supabase, userId, 'Perfect Week', Math.min(currentStreak, 7), 7);
    await updateBadgeProgress(supabase, userId, 'Perfect Month', Math.min(currentStreak, 30), 30);
    await updateBadgeProgress(supabase, userId, 'Dedication Demon', Math.min(currentStreak, 90), 90);

    // Time-based badges
    await updateBadgeProgress(supabase, userId, 'Early Bird', currentHour < 7 ? 1 : 0, 1);
    await updateBadgeProgress(supabase, userId, 'Midnight Owl', currentHour >= 22 ? 1 : 0, 1);
    await updateBadgeProgress(supabase, userId, 'Morning Person', Math.min(updates.entries_before_7am || 0, 5), 5);
    await updateBadgeProgress(supabase, userId, 'Night Writer', Math.min(updates.entries_after_midnight || 0, 5), 5);

    // Week and month badges
    await updateBadgeProgress(supabase, userId, 'Week Warrior', Math.min(entriesThisWeek || 0, 7), 7);
    await updateBadgeProgress(supabase, userId, 'Monthly Champion', Math.min(entriesThisMonth || 0, 20), 20);

    // Check for multiple entries in a day
    const todayStart = new Date(currentDate);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(currentDate);
    todayEnd.setHours(23, 59, 59, 999);

    const { count: entriesToday } = await supabase
        .from('entries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', todayStart.toISOString())
        .lte('created_at', todayEnd.toISOString());

    await updateBadgeProgress(supabase, userId, 'Reflection Ready', Math.min(entriesToday || 0, 5), 5);
}

export async function checkCalendarBadges(supabase: any, userId: string) {
    // Get total events
    const { count: totalEvents } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

    // Award calendar badges
    await updateBadgeProgress(supabase, userId, 'Organized Mind', Math.min(totalEvents || 0, 5), 5);
    await updateBadgeProgress(supabase, userId, 'Planner Pro', Math.min(totalEvents || 0, 10), 10);
    await updateBadgeProgress(supabase, userId, 'Organizer Extraordinaire', Math.min(totalEvents || 0, 50), 50);

    // Check for events on different days
    const { data: events } = await supabase
        .from('events')
        .select('start_time')
        .eq('user_id', userId);

    if (events) {
        const uniqueDays = new Set(events.map((e: { start_time: string | null }) => e.start_time?.split('T')[0]));
        await updateBadgeProgress(supabase, userId, 'Time Master', Math.min(uniqueDays.size, 7), 7);
    }
}

export async function checkFriendsBadges(supabase: any, userId: string) {
    // Get total friends
    const { count: totalFriends } = await supabase
        .from('friends')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

    // Award friend badges
    await updateBadgeProgress(supabase, userId, 'Social Butterfly', Math.min(totalFriends || 0, 3), 3);
    await updateBadgeProgress(supabase, userId, 'Community Builder', Math.min(totalFriends || 0, 10), 10);
    await updateBadgeProgress(supabase, userId, 'Networker Extraordinaire', Math.min(totalFriends || 0, 25), 25);
}

export async function checkChatBadges(supabase: any, userId: string) {
    // Get total chat conversations
    const { count: totalChats } = await supabase
        .from('chats')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

    // Get message count for user's chats
    const { data: userChats } = await supabase
        .from('chats')
        .select('id')
        .eq('user_id', userId);

    let messageCount = 0;
    if (userChats && userChats.length > 0) {
        const chatIds = userChats.map((c: { id: string }) => c.id);
        const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .in('chat_id', chatIds);
        messageCount = count || 0;
    }

    // Award chat badges
    await updateBadgeProgress(supabase, userId, 'Conversation Starter', Math.min(totalChats || 0, 5), 5);
    await updateBadgeProgress(supabase, userId, 'Chat Champion', Math.min(totalChats || 0, 20), 20);
    await updateBadgeProgress(supabase, userId, 'Communication Master', Math.min(messageCount, 100), 100);
}

export async function checkDailyFocusBadges(supabase: any, userId: string) {
    // Get total completed focus items
    const { count: completedFocus } = await supabase
        .from('user_daily_focus')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('completed', true);

    // Get total focus items
    const { count: totalFocus } = await supabase
        .from('user_daily_focus')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

    // Award daily focus badges
    await updateBadgeProgress(supabase, userId, 'Focus Starter', Math.min(completedFocus || 0, 10), 10);
    await updateBadgeProgress(supabase, userId, 'Goal Achiever', Math.min(completedFocus || 0, 50), 50);
    await updateBadgeProgress(supabase, userId, 'Focus Master', Math.min(completedFocus || 0, 100), 100);
}

/**
 * Check and award all badges for a user
 * Useful for periodic checks or ensuring all badges are up to date
 */
export async function checkAllBadges(supabase: any, userId: string) {
    try {
        // Get the latest entry to check journal badges
        const { data: latestEntry } = await supabase
            .from('entries')
            .select('text, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (latestEntry) {
            await checkAndAwardBadges(supabase, userId, latestEntry.text || '', new Date(latestEntry.created_at));
        }

        // Check all other badge types
        await checkCalendarBadges(supabase, userId);
        await checkFriendsBadges(supabase, userId);
        await checkChatBadges(supabase, userId);
        await checkDailyFocusBadges(supabase, userId);
    } catch (error) {
        console.error('Error checking all badges:', error);
        // Don't throw, just log the error
    }
}

async function updateBadgeProgress(supabase: any, userId: string, badgeName: string, progress: number, maxProgress: number) {
    // Find the badge
    const { data: badge } = await supabase
        .from('badges')
        .select('id')
        .eq('name', badgeName)
        .single();

    if (!badge) return;

    // Check if user already has this badge
    const { data: existingBadge } = await supabase
        .from('user_badges')
        .select('id, progress, earned')
        .eq('user_id', userId)
        .eq('badge_id', badge.id)
        .single();

    if (existingBadge) {
        // Update progress if it's higher than current
        const currentProgress = existingBadge.progress || 0;
        if (progress > currentProgress) {
            const earned = progress >= maxProgress;
            await supabase
                .from('user_badges')
                .update({ 
                    progress: progress,
                    earned: earned,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existingBadge.id);
        }
    } else {
        // Create new badge entry with progress
        const earned = progress >= maxProgress;
        await supabase
            .from('user_badges')
            .insert({
                user_id: userId,
                badge_id: badge.id,
                progress: progress,
                earned: earned,
                created_at: new Date().toISOString()
            });
    }
}

async function awardBadge(supabase: any, userId: string, badgeName: string, condition: boolean, oneTimeCheck: boolean = false) {
    if (!condition) return;

    // Find the badge
    const { data: badge } = await supabase
        .from('badges')
        .select('id')
        .eq('name', badgeName)
        .single();

    if (!badge) return;

    // Check if user already has this badge
    const { data: existingBadge } = await supabase
        .from('user_badges')
        .select('id, earned')
        .eq('user_id', userId)
        .eq('badge_id', badge.id)
        .single();

    if (!existingBadge || !existingBadge.earned) {
        // Award the badge
        // Note: Notifications for badge earnings are automatically created by database triggers
        if (existingBadge) {
            await supabase
                .from('user_badges')
                .update({
                    earned: true,
                    progress: 100,
                    earned_at: new Date().toISOString()
                })
                .eq('id', existingBadge.id);
        } else {
            await supabase
                .from('user_badges')
                .insert({
                    user_id: userId,
                    badge_id: badge.id,
                    progress: 100,
                    earned: true,
                    earned_at: new Date().toISOString()
                });
        }
    }
}

