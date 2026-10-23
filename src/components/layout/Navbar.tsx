"use client";

import React from "react";
import { Sparkles, ShieldCheck, Zap, RotateCcw } from "lucide-react";

interface NavbarProps {
  onReset?: () => void;
  showReset?: boolean;
}

export function Navbar({ onReset, showReset }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div 
          onClick={onReset}
          className="flex items-center gap-2.5 cursor-pointer group transition-transform active:scale-95"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 p-0.5 shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-all duration-300">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950/60 backdrop-blur-sm">
              <Sparkles className="h-5 w-5 text-indigo-300 transition-transform group-hover:rotate-12" />
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-indigo-200 transition-colors">
              Remove<span className="text-indigo-400">BG</span>
            </span>
            <span className="rounded-md bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-300 border border-indigo-500/20">
              AI PRO
            </span>
          </div>
        </div>

        {/* Navigation Links (Hidden on small screens when in editor mode) */}
        {!showReset && (
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#how-it-works" className="hover:text-white transition-colors">
              How it Works
            </a>
            <a href="#demo" className="hover:text-white transition-colors">
              Interactive Demo
            </a>
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#formats" className="hover:text-white transition-colors">
              Supported Formats
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              FAQ
            </a>
          </nav>
        )}

        {/* Right Action */}
        <div className="flex items-center gap-3">
          {showReset ? (
            <button
              onClick={onReset}
              className="flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-3.5 py-2 text-xs sm:text-sm font-medium transition-all duration-200 border border-slate-700/60 shadow-sm"
              id="nav-new-image-btn"
            >
              <RotateCcw className="h-4 w-4 text-indigo-400" />
              <span>New Image</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>100% In-Browser Privacy</span>
              </div>
              <a
                href="#upload"
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-all active:scale-95"
              >
                <Zap className="h-3.5 w-3.5 fill-current" />
                <span>Try Free</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
