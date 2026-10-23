"use client";

import React, { useState } from "react";
import { Sparkles, ArrowRight, User, ShoppingBag, Dog } from "lucide-react";

interface BeforeAfterDemoProps {
  onSelectSample: (sampleUrl: string, sampleName: string) => void;
}

const DEMO_CASES = [
  {
    id: "person",
    title: "Portraits & People",
    category: "Hair & Edge Precision",
    description: "Preserves natural stray hairs, intricate shoulder lines, and subtle facial silhouettes without harsh halos.",
    url: "/samples/sample-person.jpg",
    icon: User,
  },
  {
    id: "product",
    title: "E-Commerce Products",
    category: "Amazon & Shopify Ready",
    description: "Get crisp, studio-ready product isolation for catalog listings, marketplaces, and advertising campaigns.",
    url: "/samples/sample-product.jpg",
    icon: ShoppingBag,
  },
  {
    id: "animal",
    title: "Pets & Fine Fur",
    category: "Complex Texture Matting",
    description: "Handles tricky soft edges, whiskers, and fluffy fur that traditional magnetic lasso tools struggle with.",
    url: "/samples/sample-animal.jpg",
    icon: Dog,
  },
];

export function BeforeAfterDemo({ onSelectSample }: BeforeAfterDemoProps) {
  const [activeTab, setActiveTab] = useState<string>("person");
  const [sliderPos, setSliderPos] = useState<number>(50);

  const activeDemo = DEMO_CASES.find((d) => d.id === activeTab) || DEMO_CASES[0];

  return (
    <section id="demo" className="py-20 bg-slate-900/50 border-y border-slate-800/80 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1 text-xs font-semibold text-indigo-300">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>Interactive Showcase</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Exceptional Quality Across Every Subject
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            From fine flyaway hair and pet fur to clean e-commerce product edges. See how our AI isolates details effortlessly.
          </p>

          {/* Subject Tab Selector */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            {DEMO_CASES.map((demo) => {
              const Icon = demo.icon;
              const isActive = activeTab === demo.id;
              return (
                <button
                  key={demo.id}
                  type="button"
                  onClick={() => setActiveTab(demo.id)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 scale-105"
                      : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{demo.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Demo Interactive Viewer */}
        <div className="max-w-4xl mx-auto bg-slate-950 rounded-3xl border border-slate-800 p-4 sm:p-6 shadow-2xl">
          <div className="relative h-[340px] sm:h-[460px] md:h-[520px] rounded-2xl overflow-hidden select-none border border-slate-800 group">
            {/* Background Layer (Checkerboard with cut preview) */}
            <div className="absolute inset-0 w-full h-full flex items-center justify-center checkerboard-pattern">
              <img
                src={activeDemo.url}
                alt={activeDemo.title}
                className="w-full h-full object-contain filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
              />
              <div className="absolute top-4 right-4 z-10 rounded-md bg-slate-950/80 backdrop-blur-md px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/30">
                Transparent Cutout
              </div>
            </div>

            {/* Foreground Layer (Original) clipped by slider */}
            <div
              className="absolute inset-0 w-full h-full overflow-hidden bg-slate-900 pointer-events-none"
              style={{ width: `${sliderPos}%` }}
            >
              <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                <img
                  src={activeDemo.url}
                  alt={activeDemo.title}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="absolute top-4 left-4 z-10 rounded-md bg-slate-950/80 backdrop-blur-md px-3 py-1 text-xs font-semibold text-slate-300 border border-slate-700/60">
                Original Image
              </div>
            </div>

            {/* Slider Range Input */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPos}
              onChange={(e) => setSliderPos(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
              aria-label="Before and after split slider"
            />

            {/* Divider visual line */}
            <div
              className="absolute top-0 bottom-0 z-20 w-0.5 bg-white pointer-events-none"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-900 shadow-xl border-2 border-indigo-600">
                <span className="text-[10px] font-bold">◄►</span>
              </div>
            </div>
          </div>

          {/* Description & Action Footer */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{activeDemo.title}</h3>
                <span className="text-xs font-semibold text-indigo-400">• {activeDemo.category}</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
                {activeDemo.description}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onSelectSample(activeDemo.url, `${activeDemo.id}-demo.jpg`)}
              className="shrink-0 flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold px-5 py-2.5 text-xs sm:text-sm shadow-md shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <span>Test AI on this Image</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
