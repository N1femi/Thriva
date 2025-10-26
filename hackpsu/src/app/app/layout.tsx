"use client";

import ProtectedRoute from "@/components/protected-route";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { LogOut, Target, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { user, signOut } = useAuth();
    const router = useRouter();

    const handleSignOut = async () => {
        try {
            const { error } = await signOut();
            // Clear local storage as well
            if (typeof window !== 'undefined') {
                localStorage.clear();
            }
            if (error) {
                console.error('Sign out error:', error);
                // Still redirect even if there's an error
            }
            toast.success("Successfully signed out!");
            router.push("/");
        } catch (error: any) {
            console.error('Sign out error:', error);
            // Clear local storage even if there's an error
            if (typeof window !== 'undefined') {
                localStorage.clear();
            }
            // Still redirect to ensure user is logged out
            router.push("/");
        }
    };

    return (
        <ProtectedRoute>
            <SidebarProvider>
                <AppSidebar 
                    user={{
                        name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User',
                        email: user?.email || '',
                        avatar: user?.user_metadata?.avatar_url
                    }}
                />
                <SidebarInset>
                    <header className="bg-white border-b border-slate-200">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex justify-between items-center h-16">
                                <div className="flex items-center gap-4">
                                    <SidebarTrigger className="-ml-1" />
                                    <div className="flex items-center gap-2">
                                        <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
                                            <Target className="size-5" />
                                        </div>
                                        <h1 className="text-xl font-semibold">Thriva</h1>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <User className="size-4" />
                                        <span>{user?.email}</span>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={handleSignOut}>
                                        <LogOut className="size-4 mr-2" />
                                        Sign Out
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </header>
                    <main className="h-[calc(100vh-4rem)] overflow-y-auto bg-gradient-to-br from-slate-50 to-slate-100">
                        {children}
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </ProtectedRoute>
    );
}