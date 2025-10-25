"use client";

import { GalleryVerticalEnd } from "lucide-react";
import { AuthForm } from "@/components/auth-form";

export default function AuthPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex items-center justify-center mb-8">
                    <a href="/" className="flex items-center gap-2 font-semibold text-xl">
                        <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
                            <GalleryVerticalEnd className="size-5" />
                        </div>
                        HackPSU
                    </a>
                </div>
                
                {/* Auth Form */}
                <AuthForm />
            </div>
        </div>
    );
}
