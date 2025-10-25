"use client";

import { motion, useInView } from "framer-motion";
import {
    Bell,
    Users,
    ArrowRight,
    Brain,
    TrendingUp,
    CheckCircle,
    Star,
    MessageSquare,
    BookOpen,
    BarChart3,
    Sparkles,
    Heart,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import React, { useRef } from "react";

// --- Main Page Component ---
export default function HomePage() {
    const { user, loading } = useAuth();

    // Loading State
    if (loading) {
        return (
            <div className="min-h-screen bg-white text-slate-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800 mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading...</p>
                </div>
            </div>
        );
    }

    // --- Landing Page ---
    return (
        <main className="min-h-screen bg-white text-slate-800 flex flex-col items-center overflow-x-hidden">
            <NavBar />

            {/* Hero Section */}
            <section className="w-full max-w-6xl text-center px-6 pt-32 pb-24">
                <h1
                    className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-slate-900"
                >
                    Find your calm in the chaos
                </h1>
                <p
                    className="text-lg md:text-xl text-slate-600 mb-10 max-w-3xl mx-auto"
                >
                    Your daily space for mental clarity and well-being. Discover guided
                    exercises, track your mood, and connect with a community that
                    understands.
                </p>
                <div
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                    <Link
                        href="/auth"
                        className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-7 py-3 rounded-2xl text-lg font-medium hover:from-teal-600 hover:to-cyan-700 transition shadow-lg"
                    >
                        Get Started for Free
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link
                        href="/auth"
                        className="inline-flex items-center justify-center gap-2 bg-white text-slate-700 px-7 py-3 rounded-2xl text-lg font-medium border border-slate-300 hover:bg-slate-50 transition shadow-sm"
                    >
                        Sign In
                    </Link>
                </div>
            </section>

            {/* Social Proof / Featured In */}
            <SectionWrapper>
                <div className="w-full max-w-5xl mx-auto px-6 py-12">
                    <p className="text-center text-sm font-semibold text-slate-500 tracking-wider uppercase mb-6">
                        As featured in
                    </p>
                    <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-4">
                        <span className="font-medium text-lg text-slate-400">TechCrunch</span>
                        <span className="font-medium text-lg text-slate-400">Wellness Weekly</span>
                        <span className="font-medium text-lg text-slate-400">The Verge</span>
                        <span className="font-medium text-lg text-slate-400">Mindful.org</span>
                    </div>
                </div>
            </SectionWrapper>

            {/* Feature 1: Guided Exercises */}
            <SectionWrapper>
                <div className="w-full max-w-6xl mx-auto px-6 py-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <FeaturePill icon={<Brain />} text="Guided Exercises" />
                        <h2 className="text-4xl font-bold text-slate-900">
                            Build a mindfulness routine that sticks.
                        </h2>
                        <p className="text-lg text-slate-600">
                            Access a complete library of guided meditations, breathing
                            exercises, and journaling prompts designed by experts to reduce
                            anxiety and improve focus.
                        </p>
                        <ul className="space-y-3">
                            <FeatureListItem text="5-minute stress relief sessions" />
                            <FeatureListItem text="Guided journals for gratitude" />
                            <FeatureListItem text="Breathing exercises for immediate calm" />
                        </ul>
                    </div>
                    <FeatureVisual
                        className="bg-teal-50 border-2 border-teal-200"
                        aria-label="App screenshot showing guided exercises"
                    >
                        <div className="p-6 space-y-4">
                            <div className="font-semibold text-teal-800">Your Daily Practice</div>
                            <div className="p-4 bg-white rounded-xl shadow-sm border border-teal-100 flex items-center gap-4">
                                <div className="p-3 bg-teal-100 rounded-lg text-teal-700"><BookOpen /></div>
                                <div>
                                    <div className="font-medium text-slate-800">Morning Gratitude</div>
                                    <div className="text-sm text-slate-500">5 min Journal Prompt</div>
                                </div>
                            </div>
                            <div className="p-4 bg-white rounded-xl shadow-sm border border-teal-100 flex items-center gap-4">
                                <div className="p-3 bg-teal-100 rounded-lg text-teal-700"><Heart /></div>
                                <div>
                                    <div className="font-medium text-slate-800">Mindful Breathing</div>
                                    <div className="text-sm text-slate-500">10 min Meditation</div>
                                </div>
                            </div>
                        </div>
                    </FeatureVisual>
                </div>
            </SectionWrapper>

            {/* Feature 2: Wellness Tracking */}
            <SectionWrapper>
                <div className="w-full max-w-6xl mx-auto px-6 py-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <FeatureVisual
                        className="bg-cyan-50 border-2 border-cyan-200 md:order-last"
                        aria-label="App screenshot showing mood tracking charts"
                    >
                        <div className="p-6 space-y-4">
                            <div className="font-semibold text-cyan-800">Your Progress</div>
                            <div className="p-4 bg-white rounded-xl shadow-sm border border-cyan-100">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="font-medium text-slate-800">Mood Over Time</div>
                                    <div className="text-sm text-slate-500">Last 30 Days</div>
                                </div>
                                <div className="h-32 bg-gradient-to-t from-cyan-100 to-white rounded-lg flex items-end p-2">
                                    {/* Fake bar chart */}
                                    <div className="w-1/6 h-1/2 bg-cyan-300 rounded-t-sm mx-1"></div>
                                    <div className="w-1/6 h-1/3 bg-cyan-300 rounded-t-sm mx-1"></div>
                                    <div className="w-1/6 h-2/3 bg-cyan-300 rounded-t-sm mx-1"></div>
                                    <div className="w-1/6 h-3/4 bg-cyan-300 rounded-t-sm mx-1"></div>
                                    <div className="w-1/6 h-1/2 bg-cyan-300 rounded-t-sm mx-1"></div>
                                    <div className="w-1/6 h-4/5 bg-cyan-300 rounded-t-sm mx-1"></div>
                                </div>
                            </div>
                        </div>
                    </FeatureVisual>
                    <div className="space-y-6">
                        <FeaturePill icon={<TrendingUp />} text="Wellness Tracking" />
                        <h2 className="text-4xl font-bold text-slate-900">
                            Understand your patterns, celebrate your growth.
                        </h2>
                        <p className="text-lg text-slate-600">
                            Visually track your mood, habits, and sleep quality. Our smart
                            analytics help you connect the dots between your actions and your
                            feelings.
                        </p>
                        <ul className="space-y-3">
                            <FeatureListItem text="Daily mood check-ins" />
                            <FeatureListItem text="Habit streak tracking" />
                            <FeatureListItem text="Personalized insights and reports" />
                        </ul>
                    </div>
                </div>
            </SectionWrapper>

            {/* Feature 3: Community */}
            <SectionWrapper>
                <div className="w-full max-w-6xl mx-auto px-6 py-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <FeaturePill icon={<Users />} text="Supportive Community" />
                        <h2 className="text-4xl font-bold text-slate-900">
                            You are not alone on this journey.
                        </h2>
                        <p className="text-lg text-slate-600">
                            Join private, moderated community groups. Share your wins, ask
                            for advice, and find encouragement from others who are on the
                            same path.
                        </p>
                        <ul className="space-y-3">
                            <FeatureListItem text="Topic-based discussion groups" />
                            <FeatureListItem text="Anonymous sharing options" />
                            <FeatureListItem text="Peer-led challenges and events" />
                        </ul>
                    </div>
                    <FeatureVisual
                        className="bg-purple-50 border-2 border-purple-200"
                        aria-label="App screenshot showing community forums"
                    >
                        <div className="p-6 space-y-4">
                            <div className="font-semibold text-purple-800">Community Groups</div>
                            <div className="p-4 bg-white rounded-xl shadow-sm border border-purple-100 space-y-3">
                                <div className="font-medium text-slate-800">#AnxietySupport</div>
                                <p className="text-sm text-slate-600">"Just wanted to share a small win today! I used the 5-minute breathing exercise..."</p>
                                <div className="flex items-center gap-4 text-sm text-slate-500">
                                    <span>12 Likes</span>
                                    <span>4 Replies</span>
                                </div>
                            </div>
                        </div>
                    </FeatureVisual>
                </div>
            </SectionWrapper>

            {/* How It Works */}
            <SectionWrapper>
                <div className="w-full max-w-5xl mx-auto px-6 py-24 text-center">
                    <h2 className="text-4xl font-bold text-slate-900 mb-6">
                        Start your journey in 3 easy steps
                    </h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-16">
                        We make it simple to get started and build a routine that
                        works for you.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <HowItWorksStep
                            icon={<Sparkles />}
                            step="1"
                            title="Take Your Assessment"
                            text="Answer a few simple questions to personalize your wellness plan."
                        />
                        <HowItWorksStep
                            icon={<Bell />}
                            step="2"
                            title="Set Your Goals"
                            text="Choose what to focus on, from better sleep to reduced stress."
                        />
                        <HowItWorksStep
                            icon={<CheckCircle />}
                            step="3"
                            title="Follow Your Plan"
                            text="Engage with daily exercises and track your progress along the way."
                        />
                    </div>
                </div>
            </SectionWrapper>

            {/* Testimonials */}
            <SectionWrapper>
                <div className="w-full bg-slate-50 py-24">
                    <div className="w-full max-w-6xl mx-auto px-6">
                        <h2 className="text-4xl font-bold text-slate-900 text-center mb-16">
                            Loved by people just like you
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <TestimonialCard
                                name="Sarah K."
                                role="Designer"
                                text="This app has been a game-changer for my anxiety. The 5-minute exercises are perfect for my busy schedule."
                            />
                            <TestimonialCard
                                name="Michael B."
                                role="Developer"
                                text="I love the mood tracking. Seeing the data helped me realize my triggers and build healthier habits."
                            />
                            <TestimonialCard
                                name="Emily R."
                                role="Student"
                                text="The community is so supportive. It's the first place I've felt comfortable sharing my mental health journey."
                            />
                        </div>
                    </div>
                </div>
            </SectionWrapper>

            {/* FAQ Section */}
            <SectionWrapper>
                <div className="w-full max-w-4xl mx-auto px-6 py-24">
                    <h2 className="text-4xl font-bold text-slate-900 text-center mb-16">
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-10">
                        <FAQItem
                            q="Is this app a replacement for therapy?"
                            a="No. This app is designed to be a tool for self-care, mindfulness, and well-being. It is not a replacement for professional medical advice, diagnosis, or treatment from a qualified healthcare provider."
                        />
                        <FAQItem
                            q="How much does it cost?"
                            a="We offer a free tier with access to core features like mood tracking and basic guided exercises. Our Premium plan unlocks the full library, advanced analytics, and all community groups."
                        />
                        <FAQItem
                            q="How is my data and privacy protected?"
                            a="Your privacy is our top priority. All your data is encrypted in transit and at rest. Your personal journal entries and mood data are private to you and never shared without your explicit consent."
                        />
                    </div>
                </div>
            </SectionWrapper>

            {/* Final CTA Section */}
            <section className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 py-24 flex flex-col items-center text-center px-6">
                <h2 className="text-4xl font-bold text-white mb-4">
                    Ready to prioritize your well-being?
                </h2>
                <p className="text-cyan-100 mb-10 max-w-md text-lg">
                    Start your journey with a single step. Our tools are here to support
                    you, every day.
                </p>
                <Link
                    href="/auth"
                    className="inline-flex items-center gap-2 bg-white text-teal-600 px-8 py-4 rounded-2xl text-lg font-bold hover:bg-slate-50 transition shadow-lg transform hover:-translate-y-0.5"
                >
                    Start for Free
                    <ArrowRight className="w-5 h-5" />
                </Link>
            </section>

            {/* Footer */}
            <footer className="w-full bg-slate-900 text-slate-400 py-16">
                <div className="w-full max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-5 gap-10">
                    <div className="col-span-2 md:col-span-2">
                        <h3 className="text-lg font-semibold text-white mb-4">HackPSU Wellness</h3>
                        <p className="text-sm max-w-xs">
                            Your daily space for mental clarity and well-being.
                        </p>
                        <div className="text-xs mt-6">
                            © {new Date().getFullYear()} HackPSU — All rights reserved.
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-white mb-4">Product</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="#" className="hover:text-white">Features</Link></li>
                            <li><Link href="#" className="hover:text-white">Pricing</Link></li>
                            <li><Link href="#" className="hover:text-white">Community</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-white mb-4">Company</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="#" className="hover:text-white">About Us</Link></li>
                            <li><Link href="#" className="hover:text-white">Careers</Link></li>
                            <li><Link href="#" className="hover:text-white">Blog</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-white mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="#" className="hover:text-white">Privacy Policy</Link></li>
                            <li><Link href="#" className="hover:text-white">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>
            </footer>
        </main>
    );
}

// --- Reusable Components ---

// Sticky Navigation Bar
function NavBar() {
    return (
        <header className="fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
            <nav className="w-full max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
                <Link href="/" className="text-xl font-bold text-slate-900">
                    HackPSU Wellness
                </Link>
                <div className="hidden md:flex items-center gap-6">
                    <Link href="#features" className="text-slate-600 hover:text-slate-900">Features</Link>
                    <Link href="#pricing" className="text-slate-600 hover:text-slate-900">Pricing</Link>
                    <Link href="#faq" className="text-slate-600 hover:text-slate-900">FAQ</Link>
                </div>
                <div className="flex items-center gap-4">
                    <Link
                        href="/auth"
                        className="text-slate-600 hover:text-slate-900 text-sm font-medium"
                    >
                        Sign In
                    </Link>
                    <Link
                        href="/auth"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:from-teal-600 hover:to-cyan-700 transition shadow-md hover:shadow-cyan-500/30"
                    >
                        Get Started
                    </Link>
                </div>
            </nav>
        </header>
    );
}

// Wrapper for scroll animations
function SectionWrapper({ children }: { children: React.ReactNode }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.2 });

    return (
        <motion.section
            ref={ref}
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full"
        >
            {children}
        </motion.section>
    );
}

// Feature Pill
function FeaturePill({ icon, text }: { icon: React.ReactNode; text: string }) {
    return (
        <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-800 font-medium px-4 py-1 rounded-full">
            {React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5" })}
            <span>{text}</span>
        </div>
    );
}

// Feature List Item
function FeatureListItem({ text }: { text: string }) {
    return (
        <li className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-teal-500" />
            <span className="text-lg text-slate-700">{text}</span>
        </li>
    );
}

// Visual for Feature Sections
function FeatureVisual({
                           children,
                           className,
                           ...props
                       }: {
    children: React.ReactNode;
    className?: string;
    [key: string]: any;
}) {
    return (
        <div
            className={`w-full h-96 rounded-3xl shadow-lg overflow-hidden ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}

// How It Works Step
function HowItWorksStep({
                            icon,
                            step,
                            title,
                            text,
                        }: {
    icon: React.ReactNode;
    step: string;
    title: string;
    text: string;
}) {
    return (
        <div className="flex flex-col items-center text-center">
            <div className="p-4 rounded-full bg-teal-100 mb-5 text-teal-600">
                {React.cloneElement(icon as React.ReactElement, { className: "w-10 h-10" })}
            </div>
            <div className="mb-4 text-lg font-bold text-slate-900">
                <span className="text-teal-500">Step {step}:</span> {title}
            </div>
            <p className="text-slate-600">{text}</p>
        </div>
    );
}

// Testimonial Card
function TestimonialCard({
                             name,
                             role,
                             text,
                         }: {
    name: string;
    role: string;
    text: string;
}) {
    return (
        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-100 border border-slate-100">
            <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
            </div>
            <p className="text-lg text-slate-700 mb-6 font-medium">{text}</p>
            <div className="flex items-center">
                {/* Placeholder for user avatar */}
                <div className="w-12 h-12 rounded-full bg-teal-200 mr-4"></div>
                <div>
                    <div className="font-semibold text-slate-900">{name}</div>
                    <div className="text-slate-500">{role}</div>
                </div>
            </div>
        </div>
    );
}

// FAQ Item
function FAQItem({ q, a }: { q: string; a: string }) {
    return (
        <div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">{q}</h3>
            <p className="text-lg text-slate-600">{a}</p>
        </div>
    );
}