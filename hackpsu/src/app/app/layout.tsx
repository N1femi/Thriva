"use client";

import ProtectedRoute from "@/components/protected-route"; // default import!
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
            if (error) throw error;
            toast.success("Successfully signed out!");
            router.push("/");
        } catch (error: any) {
            toast.error(error.message || "Failed to sign out");
        }
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                <header className="bg-white border-b border-slate-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center gap-2">
                                <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
                                    <Target className="size-5" />
                                </div>
                                <h1 className="text-xl font-semibold">HackPSU</h1>
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
                {children}
            </div>
        </ProtectedRoute>
    );
}