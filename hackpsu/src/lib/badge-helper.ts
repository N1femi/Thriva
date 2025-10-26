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
    await awardBadge(supabase, userId, 'First Steps', totalEntries === 1);
    await awardBadge(supabase, userId, 'Wellness Warrior', totalEntries === 30);
    await awardBadge(supabase, userId, 'Reflection Master', totalEntries === 100);
    await awardBadge(supabase, userId, 'Journal Journey', totalEntries === 250);

    // Word count badges
    await awardBadge(supabase, userId, 'Deep Thinker', wordCount > 500, true);
    await awardBadge(supabase, userId, 'Expressive Writer', wordCount > 1000, true);
    await awardBadge(supabase, userId, 'Word Wizard', totalWords >= 50000);

    // Streak badges
    await awardBadge(supabase, userId, 'Consistency King', currentStreak >= 7);
    await awardBadge(supabase, userId, 'Consistent Contributor', currentStreak >= 30);
    await awardBadge(supabase, userId, 'Perfect Week', currentStreak >= 7);
    await awardBadge(supabase, userId, 'Perfect Month', currentStreak >= 30);
    await awardBadge(supabase, userId, 'Dedication Demon', currentStreak >= 90);

    // Time-based badges
    await awardBadge(supabase, userId, 'Early Bird', currentHour < 7, true);
    await awardBadge(supabase, userId, 'Midnight Owl', currentHour >= 22, true);
    await awardBadge(supabase, userId, 'Morning Person', updates.entries_before_7am >= 5);
    await awardBadge(supabase, userId, 'Night Writer', updates.entries_after_midnight >= 5);

    // Week and month badges
    await awardBadge(supabase, userId, 'Week Warrior', entriesThisWeek >= 7);
    await awardBadge(supabase, userId, 'Monthly Champion', entriesThisMonth >= 20);

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

    await awardBadge(supabase, userId, 'Reflection Ready', entriesToday >= 5);
}

export async function checkCalendarBadges(supabase: any, userId: string) {
    // Get total events
    const { count: totalEvents } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

    // Award calendar badges
    await awardBadge(supabase, userId, 'Organized Mind', totalEvents >= 5);
    await awardBadge(supabase, userId, 'Planner Pro', totalEvents >= 10);
    await awardBadge(supabase, userId, 'Organizer Extraordinaire', totalEvents >= 50);

    // Check for events on different days
    const { data: events } = await supabase
        .from('events')
        .select('start_time')
        .eq('user_id', userId);

    if (events) {
        const uniqueDays = new Set(events.map(e => e.start_time?.split('T')[0]));
        await awardBadge(supabase, userId, 'Time Master', uniqueDays.size >= 7);
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
        .select('id')
        .eq('user_id', userId)
        .eq('badge_id', badge.id)
        .single();

    if (!existingBadge) {
        await supabase
            .from('user_badges')
            .insert({
                user_id: userId,
                badge_id: badge.id
            });
    }
}

