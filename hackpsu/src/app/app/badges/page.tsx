"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    Trophy,
    Award,
    Flame,
    Clock,
    BookOpen,
    Sunrise,
    Moon,
    Shield,
    Star,
    Target,
    Book,
    Calendar,
    CalendarPlus,
    CalendarCheck,
    CalendarRange,
    Users,
    CheckCircle,
    Coffee,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const iconMap: Record<string, any> = {
    'book-open': BookOpen,
    'flame': Flame,
    'sunrise': Sunrise,
    'moon': Moon,
    'shield': Shield,
    'star': Star,
    'target': Target,
    'book': Book,
    'calendar': Calendar,
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
}

export default function BadgesPage() {
    const { user, loading } = useAuth();
    const [badges, setBadges] = useState<Badge[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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
                        setBadges(data.data);
                    }
                }
            } catch (error) {
                console.error('Error fetching badges:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBadges();
    }, [user]);

    if (loading || isLoading) {
        return (
            <div className="h-screen bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading your badges...</p>
                </div>
            </div>
        );
    }

    const completedBadges = badges.filter(b => b.earned);
    const inProgressBadges = badges.filter(b => !b.earned);

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50">
            <div className="max-w-7xl mx-auto px-6 py-12 pb-24">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <Link href="/app/home">
                            <Button variant="ghost" size="sm">
                                ← Back
                            </Button>
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl">
                                <Trophy className="w-8 h-8 text-yellow-600" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold text-slate-900">Your Badges</h1>
                                <p className="text-slate-500">Track your progress and achievements</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-6">
                        <div className="bg-white rounded-2xl p-4 shadow-sm">
                            <div className="text-sm text-slate-500 mb-1">Total Badges</div>
                            <div className="text-3xl font-bold text-slate-900">{badges.length}</div>
                        </div>
                        <div className="bg-white rounded-2xl p-4 shadow-sm">
                            <div className="text-sm text-slate-500 mb-1">Completed</div>
                            <div className="text-3xl font-bold text-teal-600">{completedBadges.length}</div>
                        </div>
                        <div className="bg-white rounded-2xl p-4 shadow-sm">
                            <div className="text-sm text-slate-500 mb-1">In Progress</div>
                            <div className="text-3xl font-bold text-slate-600">{inProgressBadges.length}</div>
                        </div>
                    </div>
                </div>

                {/* Completed Badges */}
                {completedBadges.length > 0 && (
                    <div className="mb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-xl">
                                <Award className="w-6 h-6 text-teal-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">Completed Badges</h2>
                            <div className="flex-1 h-px bg-gradient-to-r from-teal-200 to-transparent"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {completedBadges.map((badge, index) => {
                                const Icon = iconMap[badge.icon_name] || Award;
                                return (
                                    <motion.div
                                        key={badge.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.1 }}
                                        className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 shadow-sm border-2 border-yellow-200 hover:border-yellow-300 transition-all cursor-pointer hover:scale-105"
                                    >
                                        <div className="flex items-start gap-4 mb-3">
                                            <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-lg">
                                                <Icon className="w-8 h-8 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-lg text-slate-900 mb-1">{badge.name}</h3>
                                                <p className="text-sm text-slate-600 mb-2">{badge.description}</p>
                                            </div>
                                        </div>
                                        <div className="text-xs text-slate-500 bg-white/50 rounded-lg p-2 font-mono">
                                            ✓ {badge.requirement}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* In Progress Badges */}
                {inProgressBadges.length > 0 && (
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-gradient-to-br from-slate-100 to-gray-100 rounded-xl">
                                <Clock className="w-6 h-6 text-slate-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">Badges In Progress</h2>
                            <div className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {inProgressBadges.map((badge, index) => {
                                const Icon = iconMap[badge.icon_name] || Award;
                                return (
                                    <motion.div
                                        key={badge.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.1 }}
                                        className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:border-teal-300 transition-all cursor-pointer hover:scale-105"
                                    >
                                        <div className="flex items-start gap-4 mb-3">
                                            <div className="p-3 bg-slate-200 rounded-xl">
                                                <Icon className="w-8 h-8 text-slate-400" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-lg text-slate-900 mb-1">{badge.name}</h3>
                                                <p className="text-sm text-slate-600 mb-2">{badge.description}</p>
                                            </div>
                                        </div>
                                        <div className="text-xs text-slate-500 bg-slate-50 rounded-lg p-2 font-mono">
                                            {badge.requirement}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

