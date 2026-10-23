"use client";

import React from "react";
import { Sparkles, Zap, Lock } from "lucide-react";
import { UploadZone } from "@/components/upload/UploadZone";

interface HeroSectionProps {
  onFileSelected: (file: File) => void;
}

export function HeroSection({ onFileSelected }: HeroSectionProps) {
  return (
    <section className="relative pt-12 pb-20 md:pt-16 md:pb-28 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-indigo-600/15 via-violet-600/10 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero Headings */}
        <div className="text-center max-w-3xl mx-auto space-y-5 mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 text-xs font-semibold text-indigo-300 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>The Free, Private Alternative to Remove.bg</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
            Remove Image Backgrounds{" "}
            <span className="text-gradient-primary">Free with AI</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Instant, high-resolution background removal powered by in-browser neural networks. 
            No sign-up required, zero watermarks, and your images never leave your computer.
          </p>
        </div>

        {/* Upload Zone */}
        <UploadZone onFileSelected={onFileSelected} />

        {/* Value Proposition Grid / Stats Bar */}
        <div className="mt-14 max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="rounded-2xl bg-slate-900/40 border border-slate-800/80 p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold text-white flex items-center justify-center gap-1">
              <span>100%</span>
              <span className="text-xs font-semibold text-emerald-400 uppercase">Free</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">No subscriptions or credit limits</p>
          </div>

          <div className="rounded-2xl bg-slate-900/40 border border-slate-800/80 p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold text-white flex items-center justify-center gap-1">
              <Lock className="h-5 w-5 text-indigo-400 inline" />
              <span>Private</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Runs locally on device</p>
          </div>

          <div className="rounded-2xl bg-slate-900/40 border border-slate-800/80 p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold text-white flex items-center justify-center gap-1">
              <span>HD</span>
              <span className="text-xs font-semibold text-indigo-400">Quality</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Full resolution without downscaling</p>
          </div>

          <div className="rounded-2xl bg-slate-900/40 border border-slate-800/80 p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold text-white flex items-center justify-center gap-1">
              <Zap className="h-5 w-5 text-amber-400 inline" />
              <span>Instant</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Cached WebAssembly engine</p>
          </div>
        </div>
      </div>
    </section>
  );
}
