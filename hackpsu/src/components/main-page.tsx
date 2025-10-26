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
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

// --- Dashboard Main Screen ---
export default function DashboardPageComponent() {
    const { user, loading } = useAuth();

    // Mock data - replace with real data from your API
    const userName = user?.name || "User";
    const todaysFocus = "Practice mindful breathing and complete your gratitude journal";

    const badges = [
        { id: 1, name: "7-Day Streak", icon: <Flame />, color: "bg-orange-100 text-orange-600" },
        { id: 2, name: "Early Bird", icon: <Award />, color: "bg-blue-100 text-blue-600" },
        { id: 3, name: "Wellness Warrior", icon: <Trophy />, color: "bg-yellow-100 text-yellow-600" },
    ];

    const upcomingEvents = [
        { id: 1, title: "Morning Meditation", time: "8:00 AM", date: "Today" },
        { id: 2, title: "Gratitude Journaling", time: "9:30 AM", date: "Today" },
        { id: 3, title: "Evening Reflection", time: "7:00 PM", date: "Today" },
    ];

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
        <div>
            {/* Main Dashboard Content */}
            <main className="max-w-7xl mx-auto px-6 py-12">
                {/* 2x2 Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)] min-h-[600px]">

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
                        <div className="flex items-center gap-3 mb-6">
                            <Target className="w-8 h-8" />
                            <h2 className="text-2xl font-bold">Today's Focus</h2>
                        </div>
                        <p className="text-lg leading-relaxed text-white/90">
                            {todaysFocus}
                        </p>
                        <div className="mt-6 pt-6 border-t border-white/20">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-white/80">Daily Progress</span>
                                <span className="font-semibold">2 of 3 completed</span>
                            </div>
                            <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
                                <div className="h-full w-2/3 bg-white rounded-full"></div>
                            </div>
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
                        <div className="space-y-4">
                            {badges.map((badge, index) => (
                                <motion.div
                                    key={badge.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                                    className={`flex items-center gap-4 p-4 rounded-2xl ${badge.color} transition hover:scale-105 cursor-pointer`}
                                >
                                    <div className="p-3 bg-white/50 rounded-xl">
                                        {badge.icon}
                                    </div>
                                    <span className="font-semibold text-lg">{badge.name}</span>
                                </motion.div>
                            ))}
                        </div>
                        <div className="mt-6 pt-6 border-t border-slate-200">
                            <Link
                                href="/badges"
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
                            {upcomingEvents.map((event, index) => (
                                <motion.div
                                    key={event.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition cursor-pointer border border-slate-100"
                                >
                                    <div className="p-2 bg-cyan-100 rounded-lg">
                                        <Clock className="w-4 h-4 text-cyan-600" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium text-slate-900">{event.title}</div>
                                        <div className="text-sm text-slate-500">{event.time}</div>
                                    </div>
                                    <div className="text-xs font-semibold text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full">
                                        {event.date}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                </div>
            </main>
        </div>
    );
}