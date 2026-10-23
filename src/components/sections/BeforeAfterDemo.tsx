"use client";

import React, { useState } from "react";
import { User, ShoppingBag, Dog, ArrowRight } from "lucide-react";

interface BeforeAfterDemoProps {
  onSelectSample: (sampleUrl: string, sampleName: string) => void;
}

const DEMO_CASES = [
  {
    id: "person",
    title: "Portrait Headshot",
    category: "Hair & Silhouette",
    description: "Preserves natural flyaway hairs, shoulder lines, and subtle facial silhouettes without harsh white halos.",
    url: "/samples/sample-person.jpg",
    icon: User,
  },
  {
    id: "product",
    title: "E-Commerce Product",
    category: "Amazon & Shopify",
    description: "Studio-grade product isolation for Amazon listings, Shopify stores, catalogs, and marketplace ads.",
    url: "/samples/sample-product.jpg",
    icon: ShoppingBag,
  },
  {
    id: "animal",
    title: "Pet & Fine Fur",
    category: "Texture Matting",
    description: "Seamlessly separates soft fur, whiskers, and organic edges that traditional lasso tools fail on.",
    url: "/samples/sample-animal.jpg",
    icon: Dog,
  },
];

export function BeforeAfterDemo({ onSelectSample }: BeforeAfterDemoProps) {
  const [activeTab, setActiveTab] = useState<string>("person");
  const [sliderPos, setSliderPos] = useState<number>(50);

  const activeDemo = DEMO_CASES.find((d) => d.id === activeTab) || DEMO_CASES[0];

  return (
    <section id="demo" className="py-14 border-b border-zinc-800/60 bg-zinc-950">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
            Precision Edge Matting
          </h2>
          <p className="text-sm text-zinc-400">
            Inspect the sub-pixel boundary accuracy on complex subjects before uploading.
          </p>

          {/* Subject Tab Selector */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-3">
            {DEMO_CASES.map((demo) => {
              const Icon = demo.icon;
              const isActive = activeTab === demo.id;
              return (
                <button
                  key={demo.id}
                  type="button"
                  onClick={() => setActiveTab(demo.id)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    isActive
                      ? "bg-zinc-800 text-white border border-zinc-700 shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{demo.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Demo Interactive Viewer */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 sm:p-4 shadow-sm">
          <div className="relative h-[320px] sm:h-[440px] rounded-lg overflow-hidden select-none border border-zinc-800 bg-zinc-950">
            {/* Background Layer (Checkerboard with sample image) */}
            <div className="absolute inset-0 w-full h-full flex items-center justify-center checkerboard-dark">
              <img
                src={activeDemo.url}
                alt={activeDemo.title}
                className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] p-2 sm:p-4"
              />
              <div className="absolute top-3 right-3 z-10 rounded bg-zinc-950/80 px-2 py-0.5 text-[11px] font-medium text-emerald-400 border border-zinc-800">
                Cutout Preview
              </div>
            </div>

            {/* Foreground Layer (Original) clipped by slider */}
            <div
              className="absolute inset-0 w-full h-full overflow-hidden bg-zinc-950 pointer-events-none"
              style={{ width: `${sliderPos}%` }}
            >
              <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                <img
                  src={activeDemo.url}
                  alt={activeDemo.title}
                  className="w-full h-full object-contain p-2 sm:p-4"
                />
              </div>
              <div className="absolute top-3 left-3 z-10 rounded bg-zinc-950/80 px-2 py-0.5 text-[11px] font-medium text-zinc-300 border border-zinc-800">
                Original Image
              </div>
            </div>

            {/* Range Input for accessibility and drag */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPos}
              onChange={(e) => setSliderPos(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
              aria-label="Interactive before and after comparison slider"
            />

            {/* Divider visual line */}
            <div
              className="absolute top-0 bottom-0 z-20 w-0.5 bg-white shadow-[0_0_8px_rgba(0,0,0,0.8)] pointer-events-none"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex h-7 w-4.5 items-center justify-center rounded-full bg-white text-zinc-900 shadow-md border border-zinc-300">
                <div className="flex gap-0.5">
                  <div className="h-2.5 w-0.5 bg-zinc-600 rounded-full" />
                  <div className="h-2.5 w-0.5 bg-zinc-600 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-zinc-800/80 text-xs">
            <div>
              <span className="font-semibold text-zinc-200">{activeDemo.title}</span>
              <span className="text-zinc-500 mx-2">•</span>
              <span className="text-zinc-400">{activeDemo.description}</span>
            </div>

            <button
              type="button"
              onClick={() => onSelectSample(activeDemo.url, `${activeDemo.id}-demo.jpg`)}
              className="shrink-0 flex items-center gap-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white px-3 py-1.5 font-medium border border-zinc-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <span>Test with this photo</span>
              <ArrowRight className="h-3.5 w-3.5 text-blue-400" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
