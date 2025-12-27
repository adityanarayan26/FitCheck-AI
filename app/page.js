"use client";

import { ShaderBackground } from "@/components/ui/hero-shader";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  const { user, loading } = useAuth();

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-black text-white">
      {/* Background Shader */}
      <div className="absolute inset-0 z-0 opacity-80">
        <ShaderBackground>
          <div className="absolute inset-0 bg-black/40 pointer-events-none" />
        </ShaderBackground>
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 z-10 flex flex-col justify-end pb-4 px-8 md:px-16 lg:px-24">
        <main className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-10 duration-1000">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 mb-8 w-fit shadow-glow">
            <span className="flex h-2 w-2 rounded-full bg-accent mr-3 animate-pulse"></span>
            <span className="text-white/90 text-sm font-medium tracking-wide uppercase">
              AI-Powered Fashion Intelligence
            </span>
          </div>

          {/* Hero Title */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.1] tracking-tighter mb-6 text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/60 drop-shadow-sm">
            Discover Your <br />
            <span className="italic text-white">Perfect Style</span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl font-light text-white/80 mb-10 leading-relaxed max-w-2xl drop-shadow-md">
            Unlock your personal style evolution. Experience expert fashion advice with our <span className="text-white font-medium">Image Advisor</span> and see the future of fitting with <span className="text-white font-medium">Virtual Try-On</span>.
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center gap-5 flex-wrap">
            {loading ? (
              <div className="h-14 w-48 rounded-full bg-white/10 animate-pulse" />
            ) : user ? (
              <Link href="/dashboard" passHref>
                <button className="group relative px-8 py-4 rounded-full bg-white text-black font-bold text-sm tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.7)] flex items-center gap-2">
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </Link>
            ) : (
              <>
                <Link href="/sign-up" passHref>
                  <button className="group relative px-8 py-4 rounded-full bg-white text-black font-bold text-sm tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.7)] flex items-center gap-2">
                    Get Started
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </Link>
                <Link href="/sign-in" passHref>
                  <button className="px-8 py-4 rounded-full bg-white/5 backdrop-blur-sm border border-white/20 text-white font-medium text-sm tracking-wide transition-all duration-300 hover:bg-white/10 hover:border-white/40 hover:scale-105">
                    Sign In
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Stats / Trust (Optional Visual Flair) */}
          <div className="mt-16 flex gap-8 border-t border-white/10 pt-8 w-fit text-white/60 text-xs tracking-widest uppercase font-medium">
            <div>
              <span className="block text-white text-lg font-bold mb-1">20k+</span>
              Styles Generated
            </div>
            <div>
              <span className="block text-white text-lg font-bold mb-1">99%</span>
              Match Accuracy
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
