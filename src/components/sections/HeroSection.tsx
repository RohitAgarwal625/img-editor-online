"use client";

import React, { useState } from "react";
import { User, ShoppingBag, Dog, Sparkles, CheckCircle2 } from "lucide-react";
import { UploadZone } from "@/components/upload/UploadZone";

interface HeroSectionProps {
  onFileSelected: (file: File) => void;
}

const HERO_DEMOS = [
  {
    id: "person",
    name: "People",
    url: "/samples/sample-person.jpg",
    cutoutUrl: "/samples/sample-person-cutout.png",
    icon: User,
    desc: "Hair & silhouette isolation",
  },
  {
    id: "product",
    name: "Products",
    url: "/samples/sample-product.jpg",
    cutoutUrl: "/samples/sample-product-cutout.png",
    icon: ShoppingBag,
    desc: "Clean marketplace cutouts",
  },
  {
    id: "animal",
    name: "Animals",
    url: "/samples/sample-animal.jpg",
    cutoutUrl: "/samples/sample-animal-cutout.png",
    icon: Dog,
    desc: "Complex fur and soft edges",
  },
];

export function HeroSection({ onFileSelected }: HeroSectionProps) {
  const [activeTab, setActiveTab] = useState<string>("person");
  const [sliderPos, setSliderPos] = useState<number>(50);

  const activeDemo = HERO_DEMOS.find((d) => d.id === activeTab) || HERO_DEMOS[0];

  return (
    <section className="pt-8 pb-16 md:pt-12 md:pb-20 border-b border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Heading, Value Props & Live Split Demo */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold text-blue-700">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                <span>Next-Gen In-Browser AI Engine</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
                Remove Image Background
              </h1>

              <p className="text-lg sm:text-xl font-semibold text-slate-600">
                100% Automatically and <span className="text-blue-600">Free</span>
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-600 font-medium">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>No account needed</span>
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Full HD resolution</span>
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Zero server uploads</span>
                </span>
              </div>
            </div>

            {/* Live Interactive Before/After Demo Box */}
            <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-md space-y-2.5">
              {/* Category tabs */}
              <div className="flex items-center gap-1 border-b border-slate-100 pb-2">
                {HERO_DEMOS.map((demo) => {
                  const Icon = demo.icon;
                  const isActive = activeTab === demo.id;
                  return (
                    <button
                      key={demo.id}
                      type="button"
                      onClick={() => setActiveTab(demo.id)}
                      className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                        isActive
                          ? "bg-slate-900 text-white"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{demo.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Slider Visual */}
              <div className="relative h-64 sm:h-72 md:h-80 w-full rounded-xl overflow-hidden select-none border border-slate-200 bg-white shadow-inner">
                {/* 1. Background Cutout on Checkerboard */}
                <div className="absolute inset-0 w-full h-full flex items-center justify-center checkerboard-pattern">
                  <img
                    src={activeDemo.cutoutUrl}
                    alt={`${activeDemo.name} cutout preview`}
                    className="w-full h-full object-contain filter drop-shadow-[0_8px_20px_rgba(0,0,0,0.18)] p-3 select-none pointer-events-none"
                  />
                  <div className="absolute top-2.5 right-2.5 rounded-full bg-white/95 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-700 shadow-2xs border border-emerald-200">
                    Transparent Cutout
                  </div>
                </div>

                {/* 2. Foreground Original (Clipped with inset to keep image stationary) */}
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
                    className="w-full h-full object-contain p-3 select-none pointer-events-none"
                  />
                  <div className="absolute top-2.5 left-2.5 rounded-full bg-slate-900/85 px-2.5 py-0.5 text-[10px] font-extrabold text-white shadow-2xs">
                    Original
                  </div>
                </div>

                {/* 3. Range Input for slider dragging */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPos}
                  onChange={(e) => setSliderPos(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                  aria-label="Before and after split slider"
                />

                {/* 4. Hairline Divider & Directional Handle */}
                <div
                  className="absolute top-0 bottom-0 z-20 w-0.5 bg-white shadow-md pointer-events-none"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-700 shadow-lg border border-slate-300">
                    <div className="flex items-center gap-0.5 text-[9px] font-extrabold text-slate-500 select-none">
                      <span>◀</span>
                      <span>▶</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                <span>Drag divider left or right to inspect edges</span>
                <span className="font-medium text-slate-700">{activeDemo.desc}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Dedicated Upload Card */}
          <div className="lg:col-span-6">
            <UploadZone onFileSelected={onFileSelected} />
          </div>
        </div>
      </div>
    </section>
  );
}
