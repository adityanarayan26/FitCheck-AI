"use client";

import React from "react";

export default function AuthLayout({ children }) {
    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-mesh-gradient relative overflow-hidden">
            {/* Ambient background blobs */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none mix-blend-screen animate-float" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-pink-500/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none mix-blend-screen animate-float-delayed" />

            <div className="relative z-10 w-full max-w-md transition-all duration-500 ease-out">
                {children}
            </div>
        </div>
    );
}
