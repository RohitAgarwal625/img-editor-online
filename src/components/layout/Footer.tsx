import React from "react";
import { Scissors, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-12 text-xs text-slate-500">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-100">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
              <Scissors className="h-4 w-4" />
            </div>
            <span className="text-base font-extrabold text-slate-900">
              remove<span className="text-blue-600">bg</span>
            </span>
          </div>

          {/* Privacy status */}
          <div className="flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-800">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>100% Client-Side WebAssembly • Zero Remote Image Storage</span>
          </div>

          {/* Quick links */}
          <div className="flex items-center gap-6 font-semibold text-slate-600">
            <a href="#upload" className="hover:text-blue-600 transition-colors">
              Upload
            </a>
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">
              How It Works
            </a>
            <a href="#features" className="hover:text-blue-600 transition-colors">
              Features
            </a>
            <a href="#formats" className="hover:text-blue-600 transition-colors">
              Formats
            </a>
            <a href="#faq" className="hover:text-blue-600 transition-colors">
              FAQ
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} RemoveBG. Free, in-browser AI image background removal.</p>
          <p>Full original resolution PNG & WebP export • No watermarks</p>
        </div>
      </div>
    </footer>
  );
}
