import React from "react";
import { Scissors, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-zinc-950 py-10 text-xs text-zinc-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-zinc-800/80">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-600 text-white font-bold">
              <Scissors className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-semibold text-zinc-200">
              Remove<span className="text-blue-500">BG</span> Studio
            </span>
          </div>

          {/* Privacy status */}
          <div className="flex items-center gap-1.5 text-zinc-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span>100% Client-Side WebAssembly • Zero Remote Image Uploads</span>
          </div>

          {/* Quick links */}
          <div className="flex items-center gap-4 text-zinc-400">
            <a href="#upload" className="hover:text-zinc-200 transition-colors">
              Upload
            </a>
            <a href="#demo" className="hover:text-zinc-200 transition-colors">
              Demo
            </a>
            <a href="#formats" className="hover:text-zinc-200 transition-colors">
              Formats
            </a>
            <a href="#faq" className="hover:text-zinc-200 transition-colors">
              FAQ
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-500">
          <p>© {new Date().getFullYear()} RemoveBG. Free, in-browser AI image background removal.</p>
          <p>Full resolution PNG & WebP export • No watermarks</p>
        </div>
      </div>
    </footer>
  );
}
