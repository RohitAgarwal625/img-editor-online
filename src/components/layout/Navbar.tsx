"use client";

import React from "react";
import { Scissors, ShieldCheck, ArrowLeft, Upload } from "lucide-react";

interface NavbarProps {
  onReset?: () => void;
  showReset?: boolean;
}

export function Navbar({ onReset, showReset }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/90 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <button
            onClick={onReset}
            className="flex items-center gap-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg p-1"
            aria-label="RemoveBG Home"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white font-bold shadow-xs">
              <Scissors className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold tracking-tight text-slate-900 leading-tight">
                remove<span className="text-blue-600">bg</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                In-Browser AI
              </span>
            </div>
          </button>

          {/* Privacy badge */}
          <div className="hidden lg:flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-medium text-emerald-800">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>100% In-Browser Privacy • Your files never leave your device</span>
          </div>
        </div>

        {/* Center Nav Links */}
        {!showReset && (
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a
              href="#how-it-works"
              className="hover:text-blue-600 transition-colors focus-visible:outline-none focus-visible:text-blue-600"
            >
              How It Works
            </a>
            <a
              href="#features"
              className="hover:text-blue-600 transition-colors focus-visible:outline-none focus-visible:text-blue-600"
            >
              E-Commerce Ready
            </a>
            <a
              href="#formats"
              className="hover:text-blue-600 transition-colors focus-visible:outline-none focus-visible:text-blue-600"
            >
              Supported Formats
            </a>
            <a
              href="#faq"
              className="hover:text-blue-600 transition-colors focus-visible:outline-none focus-visible:text-blue-600"
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
              className="flex items-center gap-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 px-3.5 py-2 text-xs sm:text-sm font-semibold border border-slate-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              id="btn-nav-upload-another"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Upload New Photo</span>
            </button>
          ) : (
            <a
              href="#upload"
              className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs sm:text-sm font-semibold shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 active:scale-98"
            >
              <Upload className="h-4 w-4" />
              <span>Upload Image</span>
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
