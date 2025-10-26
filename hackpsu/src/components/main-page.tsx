"use client";

import { motion } from "framer-motion";
import {
    Calendar,
    Trophy,
    Target,
    Award,
    Flame,
    Heart,
    Clock,
    BookOpen,
    Sunrise,
    Moon,
    Shield,
    Star,
    Book,
    Calendar as CalendarIcon,
    CalendarPlus,
    CalendarCheck,
    CalendarRange,
    Users,
    CheckCircle,
    Coffee,
    ChevronDown,
    X,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const iconMap: Record<string, any> = {
    'book-open': BookOpen,
    'flame': Flame,
    'sunrise': Sunrise,
    'moon': Moon,
    'shield': Shield,
    'star': Star,
    'target': Target,
    'book': Book,
    'calendar': CalendarIcon,
    'calendar-plus': CalendarPlus,
    'calendar-check': CalendarCheck,
    'calendar-range': CalendarRange,
    'check': CheckCircle,
    'coffee': Coffee,
    'users': Users,
};

interface Badge {
    id: string;
    name: string;
    description: string;
    icon_name: string;
    requirement: string;
    earned?: boolean;
    progress?: number;
    earned_at?: string;
}

interface UpcomingEvent {
    id: string;
    title: string;
    start_time: string;
    end_time: string;
    notes?: string;
}

interface DailyFocusOption {
    id: string;
    title: string;
    description: string;
    category: string;
    icon_name: string;
}

interface DailyFocusSelection {
    id: string;
    focus_id: string;
    selected_date: string;
    completed: boolean;
    daily_focus: DailyFocusOption;
}

// --- Dashboard Main Screen ---
export default function DashboardPageComponent() {
    const { user, loading } = useAuth();
    const [badges, setBadges] = useState<Badge[]>([]);
    const [isLoadingBadges, setIsLoadingBadges] = useState(true);
    const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
    const [dailyFocusOptions, setDailyFocusOptions] = useState<DailyFocusOption[]>([]);
    const [selectedFocus, setSelectedFocus] = useState<DailyFocusSelection | null>(null);
    const [selectedFocuses, setSelectedFocuses] = useState<DailyFocusSelection[]>([]);
    const [showFocusModal, setShowFocusModal] = useState(false);
    const [showLimitDialog, setShowLimitDialog] = useState(false);
    const [todaysFocus, setTodaysFocus] = useState("Practice mindful breathing and complete your gratitude journal");

    // Fetch badges from API
    useEffect(() => {
        const fetchBadges = async () => {
            try {
                if (!user) return;

                // Get fresh session to ensure we have latest token
                const { data: { session: freshSession }, error: sessionError } = await supabase.auth.getSession();
                
                if (sessionError || !freshSession) {
                    console.error('Session error:', sessionError);
                    setBadges([]);
                    return;
                }
                
                // Get access token from fresh session
                const accessToken = freshSession?.access_token;
                
                if (!accessToken) {
                    console.error('No access token available');
                    setBadges([]);
                    return;
                }

                const response = await fetch('/api/badges', {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        // Only show earned badges or first 3 badges
                        const earnedBadges = data.data.filter((b: Badge) => b.earned).slice(0, 3);
                        setBadges(earnedBadges);
                    }
                }
            } catch (error) {
                console.error('Error fetching badges:', error);
            } finally {
                setIsLoadingBadges(false);
            }
        };

        fetchBadges();
    }, [user]);

    const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || "User";

    // Fetch upcoming events and daily focus
    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;

            try {
                // Get fresh session
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                
                if (sessionError || !session) {
                    console.error('Session error:', sessionError);
                    return;
                }
                
                const accessToken = session?.access_token;
                
                if (!accessToken) {
                    console.error('No access token available');
                    return;
                }

                // Fetch upcoming events (next 7 days)
                const today = new Date();
                const nextWeek = new Date();
                nextWeek.setDate(today.getDate() + 7);
                
                const eventsResponse = await fetch('/api/calendar', {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                
                if (eventsResponse.ok) {
                    const eventsData = await eventsResponse.json();
                    if (eventsData.success) {
                        // Filter for upcoming events and limit to 3
                        const now = new Date();
                        const upcoming = (eventsData.data || []).filter((event: any) => {
                            const eventTime = new Date(event.start_time);
                            return eventTime >= now;
                        }).slice(0, 3);
                        setUpcomingEvents(upcoming);
                    }
                }

                // Fetch daily focus options and today's selections
                const todayDate = new Date().toISOString().split('T')[0];
                const focusResponse = await fetch(`/api/daily-focus?date=${todayDate}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });

                if (focusResponse.ok) {
                    const focusData = await focusResponse.json();
                    if (focusData.success) {
                        setDailyFocusOptions(focusData.data.options || []);
                        
                        // Set all today's selections
                        if (focusData.data.selections && focusData.data.selections.length > 0) {
                            setSelectedFocuses(focusData.data.selections);
                            // Set primary focus (first one)
                            const primaryFocus = focusData.data.selections[0];
                            setSelectedFocus(primaryFocus);
                            if (primaryFocus.daily_focus) {
                                if (focusData.data.selections.length > 1) {
                                    setTodaysFocus(`${primaryFocus.daily_focus.title} and ${focusData.data.selections.length - 1} more`);
                                } else {
                                    setTodaysFocus(primaryFocus.daily_focus.title);
                                }
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [user]);

    // Format upcoming events for display
    const formatUpcomingEvent = (event: UpcomingEvent) => {
        const eventDate = new Date(event.start_time);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        let dateLabel = "Today";
        if (eventDate.toDateString() === today.toDateString()) {
            dateLabel = "Today";
        } else if (eventDate.toDateString() === tomorrow.toDateString()) {
            dateLabel = "Tomorrow";
        } else {
            dateLabel = eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
        
        const timeStr = eventDate.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });

        return {
            title: event.title,
            time: timeStr,
            date: dateLabel
        };
    };

    const handleSelectFocus = async (focusOption: DailyFocusOption) => {
        if (!user) return;

        // Check if already selected
        const isAlreadySelected = selectedFocuses.some(f => f.focus_id === focusOption.id);
        
        // Check if already have 2 focuses selected (and trying to add a new one)
        if (!isAlreadySelected && selectedFocuses.length >= 2) {
            setShowLimitDialog(true);
            return;
        }

        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            
            if (sessionError || !session) {
                toast.error('Not authenticated');
                return;
            }
            
            const accessToken = session?.access_token;
            
            if (!accessToken) {
                toast.error('Not authenticated');
                return;
            }

            const todayDate = new Date().toISOString().split('T')[0];
            
            const response = await fetch('/api/daily-focus', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    focus_id: focusOption.id,
                    selected_date: todayDate,
                }),
            });

            const result = await response.json();

            if (result.success) {
                // Update local state with new selection
                const newSelection: DailyFocusSelection = {
                    id: result.data.id,
                    focus_id: focusOption.id,
                    selected_date: todayDate,
                    completed: false,
                    daily_focus: focusOption
                };
                
                setSelectedFocuses(prev => [...prev, newSelection]);
                
                // Update display
                if (selectedFocuses.length === 0) {
                    setTodaysFocus(focusOption.title);
                } else {
                    setTodaysFocus(`${selectedFocuses.length + 1} focuses selected`);
                }
                
                toast.success('Focus added!');
            } else {
                toast.error('Failed to set daily focus');
            }
        } catch (error: any) {
            console.error('Error selecting focus:', error);
            toast.error('Failed to set daily focus');
        }
    };

    const handleToggleComplete = async (selection: DailyFocusSelection) => {
        if (!user) return;

        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            
            if (sessionError || !session) {
                toast.error('Not authenticated');
                return;
            }
            
            const accessToken = session?.access_token;
            
            if (!accessToken) {
                toast.error('Not authenticated');
                return;
            }

            const response = await fetch('/api/daily-focus', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    selection_id: selection.id,
                    completed: !selection.completed,
                }),
            });

            const result = await response.json();

            if (result.success) {
                // Update local state
                setSelectedFocuses(prev => 
                    prev.map((s: DailyFocusSelection) => s.id === selection.id ? { ...s, completed: !s.completed } : s)
                );
                
                if (selection.id === selectedFocus?.id) {
                    setSelectedFocus({ ...selection, completed: !selection.completed });
                }
            } else {
                toast.error('Failed to update focus');
            }
        } catch (error: any) {
            console.error('Error toggling focus:', error);
            toast.error('Failed to update focus');
        }
    };

    const handleRemoveFocus = async (selection: DailyFocusSelection) => {
        if (!user) return;

        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            
            if (sessionError || !session) {
                toast.error('Not authenticated');
                return;
            }
            
            const accessToken = session?.access_token;
            
            if (!accessToken) {
                toast.error('Not authenticated');
                return;
            }

            const response = await fetch(`/api/daily-focus?id=${selection.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            const result = await response.json();

            if (result.success) {
                // Remove from local state
                setSelectedFocuses(prev => prev.filter(s => s.id !== selection.id));
                
                // Update display
                const remaining = selectedFocuses.filter(s => s.id !== selection.id);
                if (remaining.length === 0) {
                    setTodaysFocus("Practice mindful breathing and complete your gratitude journal");
                } else if (remaining.length === 1) {
                    setTodaysFocus(remaining[0].daily_focus?.title || "Focus");
                } else {
                    setTodaysFocus(`${remaining.length} focuses selected`);
                }
                
                toast.success('Focus removed');
            } else {
                toast.error('Failed to remove focus');
            }
        } catch (error: any) {
            console.error('Error removing focus:', error);
            toast.error('Failed to remove focus');
        }
    };

    // Calculate progress
    const completedCount = selectedFocuses.filter(f => f.completed).length;
    const totalCount = selectedFocuses.length;
    const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    // Loading State
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading your wellness dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen overflow-y-auto">
            {/* Main Dashboard Content */}
            <main className="max-w-7xl mx-auto px-6 py-12 pb-24">
                {/* 2x2 Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[600px]">

                    {/* TOP LEFT - Welcome Note */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-white rounded-3xl shadow-lg p-8 flex flex-col justify-center"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-2xl">
                                <Heart className="w-8 h-8 text-teal-600" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold text-slate-900">
                                    Hello, {userName}
                                </h1>
                                <p className="text-slate-500 text-sm mt-1">
                                    {new Date().toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            Welcome back to your wellness journey. You're doing great!
                            Remember to take things one step at a time and celebrate your progress.
                        </p>
                    </motion.div>

                    {/* TOP RIGHT - Today's Focus */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-3xl shadow-lg p-8 flex flex-col justify-center text-white"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <Target className="w-8 h-8" />
                                <h2 className="text-2xl font-bold">Today's Focus</h2>
                            </div>
                            <button
                                onClick={() => setShowFocusModal(true)}
                                className="p-2 hover:bg-white/10 rounded-lg transition"
                                title="Change focus"
                            >
                                <ChevronDown className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-lg leading-relaxed text-white/90">
                            {todaysFocus}
                        </p>
                        <div className="mt-6 pt-6 border-t border-white/20">
                            <div className="flex items-center justify-between text-sm mb-3">
                                <span className="text-white/80">Daily Progress</span>
                                <span className="font-semibold">{completedCount} of {totalCount || 0} completed</span>
                            </div>
                            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-white rounded-full transition-all duration-300"
                                    style={{ width: `${progressPercentage}%` }}
                                ></div>
                            </div>
                            
                            {/* Show selected focuses with checkboxes */}
                            {selectedFocuses.length > 0 && (
                                <div className="mt-4 space-y-2 max-h-32 overflow-y-auto">
                                    {selectedFocuses.map((focus, index) => (
                                        <div
                                            key={`focus-${focus.id}-${index}`}
                                            className="flex items-center gap-2 group"
                                        >
                                            <label className="flex items-center gap-2 cursor-pointer hover:bg-white/10 rounded-lg p-2 transition flex-1">
                                                <input
                                                    type="checkbox"
                                                    checked={focus.completed}
                                                    onChange={() => handleToggleComplete(focus)}
                                                    className="w-4 h-4 rounded border-white/30 bg-white/10 text-teal-600 focus:ring-teal-500 focus:ring-offset-0"
                                                />
                                                <span className={`text-sm ${focus.completed ? 'line-through opacity-60' : ''}`}>
                                                    {focus.daily_focus?.title || 'Focus'}
                                                </span>
                                            </label>
                                            <button
                                                onClick={() => handleRemoveFocus(focus)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/20 rounded"
                                                title="Remove focus"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* BOTTOM LEFT - Badges */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-white rounded-3xl shadow-lg p-8"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <Trophy className="w-7 h-7 text-yellow-600" />
                            <h2 className="text-2xl font-bold text-slate-900">Your Badges</h2>
                        </div>
                        {isLoadingBadges ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
                            </div>
                        ) : badges.length > 0 ? (
                            <div className="space-y-4">
                                {badges.map((badge, index) => {
                                    const Icon = iconMap[badge.icon_name] || Award;
                                    return (
                                        <Link key={badge.id} href="/app/badges">
                                            <motion.div
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                                                className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 transition hover:scale-105 cursor-pointer"
                                            >
                                                <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-lg">
                                                    <Icon className="w-6 h-6 text-white" />
                                                </div>
                                                <span className="font-semibold text-lg text-slate-900">{badge.name}</span>
                                            </motion.div>
                                        </Link>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-500">
                                <Trophy className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                <p>No badges earned yet</p>
                                <p className="text-sm mt-1">Keep working towards your goals!</p>
                            </div>
                        )}
                        <div className="mt-6 pt-6 border-t border-slate-200">
                            <Link
                                href="/app/badges"
                                className="text-teal-600 hover:text-teal-700 font-medium flex items-center gap-2"
                            >
                                View all badges
                                <span>→</span>
                            </Link>
                        </div>
                    </motion.div>

                    {/* BOTTOM RIGHT - Upcoming Events */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="bg-white rounded-3xl shadow-lg p-8"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <Calendar className="w-7 h-7 text-cyan-600" />
                            <h2 className="text-2xl font-bold text-slate-900">Upcoming Events</h2>
                        </div>

                        {/* Mini Calendar Visual */}
                        <div className="mb-6 p-4 bg-gradient-to-br from-cyan-50 to-teal-50 rounded-2xl">
                            <div className="text-center">
                                <div className="text-sm font-semibold text-slate-600 mb-2">
                                    {new Date().toLocaleDateString('en-US', { month: 'long' })}
                                </div>
                                <div className="text-4xl font-bold text-cyan-600">
                                    {new Date().getDate()}
                                </div>
                                <div className="text-sm text-slate-600 mt-1">
                                    {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
                                </div>
                            </div>
                        </div>

                        {/* Events List */}
                        <div className="space-y-3">
                            {upcomingEvents.length > 0 ? upcomingEvents.map((event, index) => {
                                const formatted = formatUpcomingEvent(event);
                                return (
                                    <Link key={event.id} href="/app/calendar">
                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition cursor-pointer border border-slate-100"
                                        >
                                            <div className="p-2 bg-cyan-100 rounded-lg">
                                                <Clock className="w-4 h-4 text-cyan-600" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-medium text-slate-900">{formatted.title}</div>
                                                <div className="text-sm text-slate-500">{formatted.time}</div>
                                            </div>
                                            <div className="text-xs font-semibold text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full">
                                                {formatted.date}
                                            </div>
                                        </motion.div>
                                    </Link>
                                );
                            }) : (
                                <div className="text-center py-4 text-slate-500">
                                    <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                    <p className="text-sm">No upcoming events</p>
                                    <Link href="/app/calendar" className="text-teal-600 hover:text-teal-700 text-sm mt-2 inline-block">
                                        Schedule something →
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.div>

                </div>
            </main>

            {/* Daily Focus Selection Modal */}
            {showFocusModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-xl">
                                    <Target className="w-6 h-6 text-teal-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900">Select Your Daily Focus</h2>
                            </div>
                            <button
                                onClick={() => setShowFocusModal(false)}
                                className="p-2 hover:bg-slate-100 rounded-lg transition"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {dailyFocusOptions.map((option) => {
                                const Icon = iconMap[option.icon_name] || Target;
                                const isSelected = selectedFocuses.some(f => f.focus_id === option.id);
                                return (
                                    <button
                                        key={option.id}
                                        onClick={() => handleSelectFocus(option)}
                                        className={`p-4 rounded-xl border-2 transition text-left group ${
                                            isSelected 
                                                ? 'border-teal-500 bg-teal-50' 
                                                : 'border-slate-200 hover:border-teal-500 hover:bg-teal-50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className={`p-2 rounded-lg group-hover:from-teal-200 group-hover:to-cyan-200 transition ${
                                                isSelected 
                                                    ? 'bg-gradient-to-br from-teal-200 to-cyan-200' 
                                                    : 'bg-gradient-to-br from-teal-100 to-cyan-100'
                                            }`}>
                                                <Icon className="w-5 h-5 text-teal-600" />
                                            </div>
                                            <h3 className="font-semibold text-slate-900">{option.title}</h3>
                                            {isSelected && (
                                                <CheckCircle className="w-5 h-5 text-teal-600 ml-auto" />
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-600">{option.description}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Limit Exceeded Dialog */}
            <AlertDialog open={showLimitDialog} onOpenChange={setShowLimitDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Focus Limit Reached</AlertDialogTitle>
                        <AlertDialogDescription>
                            You can only have a maximum of 2 daily focuses at a time. Please remove one of your current focuses before adding a new one.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => setShowLimitDialog(false)}>
                            OK
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}