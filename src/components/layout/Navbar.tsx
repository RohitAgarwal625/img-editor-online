"use client";

import React from "react";
import { Scissors, ShieldCheck, ArrowLeft, Plus } from "lucide-react";

interface NavbarProps {
  onReset?: () => void;
  showReset?: boolean;
}

export function Navbar({ onReset, showReset }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <button
            onClick={onReset}
            className="flex items-center gap-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md py-1"
            aria-label="RemoveBG Home"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold shadow-sm">
              <Scissors className="h-4 w-4" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-semibold tracking-tight text-zinc-100">
                Remove<span className="text-blue-500">BG</span>
              </span>
              <span className="text-[10px] font-medium tracking-wide uppercase px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                Studio
              </span>
            </div>
          </button>

          {/* Privacy badge */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-400 pl-3 border-l border-zinc-800">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span>In-Browser Neural Engine (WASM)</span>
          </div>
        </div>

        {/* Center / Navigation Links (only on landing page) */}
        {!showReset && (
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-zinc-400">
            <a
              href="#upload"
              className="hover:text-zinc-100 transition-colors focus-visible:outline-none focus-visible:text-blue-400"
            >
              Upload
            </a>
            <a
              href="#demo"
              className="hover:text-zinc-100 transition-colors focus-visible:outline-none focus-visible:text-blue-400"
            >
              Interactive Demo
            </a>
            <a
              href="#how-it-works"
              className="hover:text-zinc-100 transition-colors focus-visible:outline-none focus-visible:text-blue-400"
            >
              How It Works
            </a>
            <a
              href="#formats"
              className="hover:text-zinc-100 transition-colors focus-visible:outline-none focus-visible:text-blue-400"
            >
              Formats
            </a>
            <a
              href="#faq"
              className="hover:text-zinc-100 transition-colors focus-visible:outline-none focus-visible:text-blue-400"
            >
              FAQ
            </a>
          </nav>
        )}

        {/* Right Action */}
        <div className="flex items-center gap-3">
          {showReset ? (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white px-3 py-1.5 text-xs font-medium border border-zinc-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              id="btn-nav-upload-another"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Upload Another Photo</span>
            </button>
          ) : (
            <a
              href="#upload"
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 text-xs font-medium transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Remove Background</span>
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
