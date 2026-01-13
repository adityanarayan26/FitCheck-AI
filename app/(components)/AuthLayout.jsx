"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function AuthLayout({ children }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            router.push("/dashboard");
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-zinc-50">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-lime border-t-transparent" />
            </div>
        );
    }

    if (user) {
        return null; // Don't render anything while redirecting
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-zinc-50">
            <div className="w-full max-w-md">
                {children}
            </div>
        </div>
    );
}
