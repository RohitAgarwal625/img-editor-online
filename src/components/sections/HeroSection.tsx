"use client";

import React from "react";
import { Zap, Lock, Sparkles } from "lucide-react";
import { UploadZone } from "@/components/upload/UploadZone";

interface HeroSectionProps {
  onFileSelected: (file: File) => void;
}

export function HeroSection({ onFileSelected }: HeroSectionProps) {
  return (
    <section className="pt-8 pb-14 md:pt-12 md:pb-16 border-b border-zinc-800/60">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Crisp, content-first heading */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-8">
          <div className="inline-flex items-center gap-1.5 rounded-md bg-zinc-800/80 border border-zinc-700/60 px-2.5 py-1 text-xs font-medium text-zinc-300">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            <span>Free Client-Side Alternative to remove.bg</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-zinc-100">
            Remove image background in seconds
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
            Automatic background removal powered by in-browser neural networks. 
            No sign-up, zero watermarks, and your images never leave your computer.
          </p>
        </div>

        {/* Upload Zone (The primary tool) */}
        <UploadZone onFileSelected={onFileSelected} />

        {/* Value metrics strip */}
        <div className="mt-10 max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
            <div className="text-sm font-semibold text-zinc-200">100% Free</div>
            <div className="text-[11px] text-zinc-500 mt-0.5">No subscription limits</div>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
            <div className="text-sm font-semibold text-zinc-200 flex items-center justify-center gap-1">
              <Lock className="h-3.5 w-3.5 text-emerald-400" />
              <span>Private</span>
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Zero cloud uploads</div>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
            <div className="text-sm font-semibold text-zinc-200">Full HD</div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Original pixel resolution</div>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
            <div className="text-sm font-semibold text-zinc-200 flex items-center justify-center gap-1">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span>WASM AI</span>
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Cached in browser</div>
          </div>
        </div>
      </div>
    </section>
  );
}
