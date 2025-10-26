"use client";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { Toaster } from "@/components/ui/sonner";
import ProtectedRoute from "@/components/protected-route";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { LogOut, Target, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import React from "react";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});


export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
            {children}
            <Toaster />
        </AuthProvider>
        </body>
        </html>
    );
}

/**
 * Dashboard layout including sidebar, header, and protected route
 */
function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, signOut } = useAuth();
    const router = useRouter();

    const handleSignOut = async () => {
        try {
            const { error } = await signOut();
            if (error) throw error;
            toast.success("Successfully signed out!");
            router.push("/");
        } catch (error: any) {
            toast.error(error.message || "Failed to sign out");
        }
    };

    return (
        <ProtectedRoute>
            <SidebarProvider>
                <div className="flex min-h-screen">
                    {/* Sidebar */}
                    <AppSidebar
                        user={{
                            name: user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User",
                            email: user?.email || "",
                            avatar: user?.user_metadata?.avatar_url,
                        }}
                    />

                    {/* Main content area */}
                    <SidebarInset>
                        {/* Header */}
                        <header className="bg-white border-b border-slate-200 w-full h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
                            {/* Left: App title + Sidebar toggle */}
                            <div className="flex items-center gap-4">
                                <SidebarTrigger className="-ml-1">
                                    <Button variant="ghost" size="sm">
                                        ☰
                                    </Button>
                                </SidebarTrigger>
                                <div className="flex items-center gap-2">
                                    <div className="bg-primary text-primary-foreground flex w-8 h-8 items-center justify-center rounded-lg">
                                        <Target className="w-5 h-5" />
                                    </div>
                                    <h1 className="text-xl font-semibold">Thriva</h1>
                                </div>
                            </div>

                            {/* Right: User info + Sign Out */}
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <User className="w-4 h-4" />
                                    <span>{user?.email}</span>
                                </div>
                                <Button variant="outline" size="sm" onClick={handleSignOut}>
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Sign Out
                                </Button>
                            </div>
                        </header>

                        {/* Main content */}
                        <main className="flex-1 p-6 bg-gradient-to-br from-slate-50 to-slate-100 overflow-auto">
                            {children}
                        </main>
                    </SidebarInset>
                </div>
            </SidebarProvider>
        </ProtectedRoute>
    );
}
