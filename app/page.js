"use client";

import { ShaderBackground } from "@/components/ui/hero-shader";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function HomePage() {
  const { user, loading } = useAuth();

  return (
    <ShaderBackground>
      <div className="h-screen w-full flex items-end">
        <main className="z-20 w-full max-w-lg p-8">
          <div className="text-left">
            <div
              className="inline-flex items-center px-3 py-1 rounded-full bg-white/5 backdrop-blur-sm mb-4 relative"
            >
              <div className="absolute top-0 left-1 right-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full" />
              <span className="text-white/90 text-xs font-light relative z-10">
                ✨ AI-Powered Fashion Tools
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl leading-tight tracking-tight text-white mb-4">
              Discover Your Perfect Style,
              <br />
              <span className="tracking-tight text-white font-bold">
                with AI-Powered Insights
              </span>
            </h1>

            <p className="text-sm font-light text-white/70 mb-6 leading-relaxed">
              Unlock your personal style with AI. Get expert fashion advice on your outfits with our Image Advisor, and see how clothes look on you with the Virtual Try-On feature. Your style journey starts here.
            </p>

            <div className="flex items-center gap-4 flex-wrap">
               {loading ? (
                    <div className="h-11 w-48 rounded-full bg-white/10 animate-pulse" />
                ) : user ? (
                    <Link href="/dashboard" passHref>
                        <button className="px-8 py-3 rounded-full bg-white text-black font-semibold text-xs transition-all duration-200 hover:bg-white/90 cursor-pointer">
                            Go to Dashboard
                        </button>
                    </Link>
                ) : (
                    <>
                        <Link href="/sign-up" passHref>
                            <button className="px-8 py-3 rounded-full bg-white text-black font-semibold text-xs transition-all duration-200 hover:bg-white/90 cursor-pointer">
                                Get Started
                            </button>
                        </Link>
                        <Link href="/sign-in" passHref>
                             <button className="px-8 py-3 rounded-full bg-transparent border border-white/30 text-white font-normal text-xs transition-all duration-200 hover:bg-white/10 hover:border-white/50 cursor-pointer">
                                Sign In
                            </button>
                        </Link>
                    </>
                )}
            </div>
          </div>
        </main>
      </div>
    </ShaderBackground>
  );
}
