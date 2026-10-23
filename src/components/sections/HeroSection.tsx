"use client";

import React, { useState } from "react";
import { User, ShoppingBag, Dog, Sparkles, CheckCircle2, SlidersHorizontal } from "lucide-react";
import { UploadZone } from "@/components/upload/UploadZone";

interface HeroSectionProps {
  onFileSelected: (file: File) => void;
}

const HERO_DEMOS = [
  {
    id: "person",
    name: "People",
    subtitle: "Portrait & Flyaway Hair",
    url: "/samples/sample-person.jpg",
    cutoutUrl: "/samples/sample-person-cutout.png",
    icon: User,
    desc: "Sub-pixel isolation preserving natural flyaway hair, clothing fibers, and shoulder silhouettes.",
  },
  {
    id: "product",
    name: "Products",
    subtitle: "Amazon & Shopify Ready",
    url: "/samples/sample-product.jpg",
    cutoutUrl: "/samples/sample-product-cutout.png",
    icon: ShoppingBag,
    desc: "Clean studio-grade product isolation ready for e-commerce catalogs and marketplace listings.",
  },
  {
    id: "animal",
    name: "Animals",
    subtitle: "Complex Fur & Whiskers",
    url: "/samples/sample-animal.jpg",
    cutoutUrl: "/samples/sample-animal-cutout.png",
    icon: Dog,
    desc: "Seamless texture matting separating fine fur strands and whiskers from busy backgrounds.",
  },
];

export function HeroSection({ onFileSelected }: HeroSectionProps) {
  const [activeTab, setActiveTab] = useState<string>("person");
  const [sliderPos, setSliderPos] = useState<number>(50);

  const activeDemo = HERO_DEMOS.find((d) => d.id === activeTab) || HERO_DEMOS[0];

  return (
    <section className="pt-8 pb-16 md:pt-14 md:pb-24 border-b border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-12">
        {/* Top Header & Upload Area */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3.5 py-1 text-xs font-bold text-blue-700 shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>Next-Gen In-Browser AI Engine</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 leading-[1.1]">
            Remove Image Background
          </h1>

          <p className="text-lg sm:text-xl font-semibold text-slate-600">
            100% Automatically and <span className="text-blue-600">Free</span>
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-1 text-xs sm:text-sm text-slate-600 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>No account needed</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Full HD resolution</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Zero server uploads</span>
            </span>
          </div>

          {/* Centered Upload Hub */}
          <div className="pt-4 max-w-xl mx-auto">
            <UploadZone onFileSelected={onFileSelected} />
          </div>
        </div>

        {/* Picsart-Style Grand Enlarged Interactive Showcase Window (max-w-6xl) */}
        <div className="w-full max-w-5xl xl:max-w-6xl mx-auto rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-6 shadow-xl space-y-4">
          {/* Showcase Header with Category Tabs */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
                <SlidersHorizontal className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Interactive Before / After Showcase
                </h3>
                <p className="text-xs text-slate-500 hidden sm:block">
                  Drag the slider to inspect edge transparency and hair separation
                </p>
              </div>
            </div>

            {/* Category Tabs (People, Products, Animals) */}
            <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 p-1 border border-slate-200">
              {HERO_DEMOS.map((demo) => {
                const Icon = demo.icon;
                const isActive = activeTab === demo.id;
                return (
                  <button
                    key={demo.id}
                    type="button"
                    onClick={() => setActiveTab(demo.id)}
                    className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                      isActive
                        ? "bg-white text-blue-700 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{demo.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Massive Enlarged Showcase Canvas (h-[480px] to h-[620px]) */}
          <div className="relative h-[440px] sm:h-[540px] md:h-[620px] w-full rounded-2xl overflow-hidden select-none border border-slate-200 bg-white shadow-inner">
            {/* 1. Background Layer: Transparent Cutout on Checkerboard */}
            <div className="absolute inset-0 w-full h-full flex items-center justify-center checkerboard-pattern">
              <img
                src={activeDemo.cutoutUrl}
                alt={`${activeDemo.name} cutout preview`}
                className="w-full h-full object-contain filter drop-shadow-[0_12px_28px_rgba(0,0,0,0.22)] p-4 sm:p-8 select-none pointer-events-none"
              />
              <div className="absolute top-4 right-4 rounded-full bg-white/95 backdrop-blur-md px-3.5 py-1 text-xs font-extrabold text-emerald-700 shadow-sm border border-emerald-200 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Transparent Cutout</span>
              </div>
            </div>

            {/* 2. Foreground Layer: Original Image (Kept perfectly stationary with clipPath) */}
            <div
              className="absolute inset-0 w-full h-full flex items-center justify-center bg-slate-100 pointer-events-none"
              style={{
                clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
                WebkitClipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
              }}
            >
              <img
                src={activeDemo.url}
                alt={`${activeDemo.name} original`}
                className="w-full h-full object-contain p-4 sm:p-8 select-none pointer-events-none"
              />
              <div className="absolute top-4 left-4 rounded-full bg-slate-900/90 backdrop-blur-md px-3.5 py-1 text-xs font-extrabold text-white shadow-sm border border-slate-700">
                Original Image
              </div>
            </div>

            {/* 3. Range Input for Fluid Dragging */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPos}
              onChange={(e) => setSliderPos(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
              aria-label="Before and after split slider"
            />

            {/* 4. Split Divider Line & Prominent Drag Handle */}
            <div
              className="absolute top-0 bottom-0 z-20 w-0.5 bg-white shadow-lg pointer-events-none"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-800 shadow-xl border border-slate-300">
                <div className="flex items-center gap-0.5 text-[10px] font-black text-slate-600 select-none">
                  <span>◀</span>
                  <span>▶</span>
                </div>
              </div>
            </div>
          </div>

          {/* Showcase Footer Note */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 pt-1 px-1">
            <span className="font-medium text-slate-700">
              {activeDemo.desc}
            </span>
            <span className="text-[11px] text-slate-400">
              Drag divider left or right to inspect sub-pixel boundary quality
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
