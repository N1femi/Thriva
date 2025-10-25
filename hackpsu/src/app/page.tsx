"use client";

import { motion } from "framer-motion";
import { Calendar, Bell, Users, ArrowRight, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function HomePage() {
    const { user, loading } = useAuth();

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-50 text-neutral-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-800 mx-auto mb-4"></div>
                    <p className="text-neutral-600">Loading...</p>
                </div>
            </div>
        );
    }

    // If user is authenticated, redirect to dashboard
    if (user) {
        return (
            <div className="min-h-screen bg-neutral-50 text-neutral-800 flex items-center justify-center">
                <div className="text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <h1 className="text-4xl font-bold">Welcome back!</h1>
                        <p className="text-lg text-neutral-600 mb-8">
                            You&#39;re already signed in. Ready to continue your journey?
                        </p>
                        <Link
                            href="/app/home"
                            className="inline-flex items-center gap-2 bg-neutral-800 text-white px-6 py-3 rounded-2xl text-lg font-medium hover:bg-neutral-700 transition"
                        >
                            Go to Dashboard
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-neutral-50 text-neutral-800 flex flex-col items-center justify-center">
            {/* Hero Section */}
            <section className="w-full max-w-5xl text-center px-6 py-24">
                <motion.h1
                    className="text-5xl md:text-6xl font-bold tracking-tight mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    Build better habits, one day at a time
                </motion.h1>
                <motion.p
                    className="text-lg md:text-xl text-neutral-600 mb-10 max-w-2xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    Stay consistent with friendly reminders, challenge your friends, and
                    schedule what matters most.
                </motion.p>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                    <Link
                        href="/auth"
                        className="inline-flex items-center gap-2 bg-neutral-800 text-white px-6 py-3 rounded-2xl text-lg font-medium hover:bg-neutral-700 transition"
                    >
                        Get Started
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link
                        href="/auth"
                        className="inline-flex items-center gap-2 border border-neutral-300 text-neutral-800 px-6 py-3 rounded-2xl text-lg font-medium hover:bg-neutral-100 transition"
                    >
                        Sign In
                    </Link>
                </motion.div>
            </section>

            {/* Feature Section */}
            <section className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-6 pb-24">
                <FeatureCard
                    icon={<Bell className="w-8 h-8" />}
                    title="Reminders"
                    text="Stay on track with gentle nudges designed to help you stay consistent."
                />
                <FeatureCard
                    icon={<Sparkles className="w-8 h-8" />}
                    title="Self-Improvement"
                    text="Set goals, track progress, and celebrate growth every step of the way."
                />
                <FeatureCard
                    icon={<Users className="w-8 h-8" />}
                    title="Compete with Friends"
                    text="Friendly competition keeps you motivated — earn points and climb the leaderboard."
                />
                <FeatureCard
                    icon={<Calendar className="w-8 h-8" />}
                    title="Smart Scheduling"
                    text="Plan habits and routines that fit seamlessly into your day."
                />
            </section>

            {/* CTA Section */}
            <section className="w-full bg-neutral-100 py-16 flex flex-col items-center text-center">
                <h2 className="text-3xl font-semibold mb-4">
                    Ready to become your best self?
                </h2>
                <p className="text-neutral-600 mb-8 max-w-md">
                    Join thousands improving their lives one habit at a time.
                </p>
                <Link
                    href="/auth"
                    className="inline-flex items-center gap-2 bg-neutral-800 text-white px-6 py-3 rounded-2xl text-lg font-medium hover:bg-neutral-700 transition"
                >
                    Start for Free
                    <ArrowRight className="w-5 h-5" />
                </Link>
            </section>

            <footer className="w-full py-6 text-center text-sm text-neutral-500">
                © {new Date().getFullYear()} HackPSU — All rights reserved.
            </footer>
        </main>
    );
}

function FeatureCard({
                         icon,
                         title,
                         text,
                     }: {
    icon: React.ReactNode;
    title: string;
    text: string;
}) {
    return (
        <motion.div
            className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition border border-neutral-100 flex flex-col items-center text-center"
            whileHover={{ y: -4 }}
        >
            <div className="p-3 rounded-full bg-neutral-100 mb-4 text-neutral-700">
                {icon}
            </div>
            <h3 className="font-semibold text-lg mb-2">{title}</h3>
            <p className="text-neutral-600 text-sm">{text}</p>
        </motion.div>
    );
}
