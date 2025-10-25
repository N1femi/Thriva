"use client";

import { GalleryVerticalEnd } from "lucide-react";
import { AuthForm } from "@/components/auth-form";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function AuthPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            router.push("/app/home");
        }
    }, [user, loading, router]);

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    // Don't render auth form if user is already authenticated
    if (user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex items-center justify-center mb-8">
                    <Link href="/" className="flex items-center gap-2 font-semibold text-xl">
                        <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
                            <GalleryVerticalEnd className="size-5" />
                        </div>
                        HackPSU
                    </Link>
                </div>
                
                {/* Auth Form */}
                <AuthForm onSuccess={() => router.push("/app/home")} />
            </div>
        </div>
    );
}
