import React from "react";
import { Sparkles, Shield, Cpu, Zap, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 pt-16 pb-12 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800/60">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 p-0.5 shadow-md shadow-indigo-500/20">
                <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950/60">
                  <Sparkles className="h-4 w-4 text-indigo-300" />
                </div>
              </div>
              <span className="text-xl font-bold text-white">
                Remove<span className="text-indigo-400">BG</span>
              </span>
            </div>
            <p className="max-w-md text-sm text-slate-400 leading-relaxed">
              The next-generation, high-performance in-browser AI background remover. Built as a 
              zero-cost, completely private alternative to remove.bg. Your files never leave your device.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 border border-slate-800 px-3 py-1 text-xs text-slate-300">
                <Cpu className="h-3.5 w-3.5 text-indigo-400" />
                WebAssembly + WebGPU
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 border border-slate-800 px-3 py-1 text-xs text-slate-300">
                <Shield className="h-3.5 w-3.5 text-emerald-400" />
                100% Client-Side Privacy
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 border border-slate-800 px-3 py-1 text-xs text-slate-300">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                Unlimited Free Usage
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-4">Product</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#demo" className="hover:text-white transition-colors">
                  Interactive Demo
                </a>
              </li>
              <li>
                <a href="#formats" className="hover:text-white transition-colors">
                  Supported Formats
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Architecture & Features
                </a>
              </li>
            </ul>
          </div>

          {/* Technology & Privacy */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-4">Security & Tech</h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-1.5 text-emerald-400">
                <Shield className="h-4 w-4" />
                <span>Zero Server Uploads</span>
              </li>
              <li>Runs via ONNX Runtime Web</li>
              <li>ISNet Neural Network</li>
              <li>Commercial & Personal Free Use</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} RemoveBG. Free, open, private image background removal.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Crafted with</span>
            <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" />
            <span>for creators, marketers & developers worldwide</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
