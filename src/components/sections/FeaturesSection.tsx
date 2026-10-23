import React from "react";
import { Shield, ShoppingBag, Wand2, Zap, DownloadCloud, Cpu, Sparkles } from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      title: "100% In-Browser Privacy",
      description:
        "Your photos are computed locally on your device using WebAssembly. No images are sent to any remote servers or saved in any cloud databases.",
      icon: Shield,
      badge: "Zero Leaks",
    },
    {
      title: "E-Commerce White BG Ready",
      description:
        "Instantly swap transparent cutouts to pure white (#FFFFFF) backgrounds required by Amazon, Shopify, eBay, and Google Merchant Center.",
      icon: ShoppingBag,
      badge: "Marketplace Compliant",
    },
    {
      title: "Hair & Fur Edge Precision",
      description:
        "Trained on millions of real-world images, the ISNet neural network separates fine hair strands, pet fur, and transparent objects with natural edges.",
      icon: Wand2,
      badge: "Pixel Accurate",
    },
    {
      title: "Zero Limits & No Signup",
      description:
        "Remove backgrounds from as many images as you need without signing up, entering credit cards, or getting blocked by credit paywalls.",
      icon: Zap,
      badge: "Unlimited",
    },
    {
      title: "Lossless PNG & Compact WebP",
      description:
        "Export in lossless PNG format with transparent alpha channels or compact modern WebP format for high-speed websites.",
      icon: DownloadCloud,
      badge: "Full Resolution",
    },
    {
      title: "Hardware Accelerated",
      description:
        "Leverages WebGPU and multi-threaded WASM to run AI inference directly on your machine's graphics card and multicore CPU.",
      icon: Cpu,
      badge: "WebAssembly",
    },
  ];

  return (
    <section id="features" className="py-20 bg-slate-900/40 border-t border-slate-800/80 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1 text-xs font-semibold text-indigo-300">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>Built For Modern Creators</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Everything You Need in a Background Remover
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Engineered as a modern, private, zero-cost alternative to remove.bg.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-3xl bg-slate-950/70 border border-slate-800 p-7 hover:border-indigo-500/40 hover:bg-slate-900/60 transition-all duration-300 group shadow-lg"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/15 border border-indigo-500/30 text-indigo-400 group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-slate-800/80 border border-slate-700/60 px-2.5 py-0.5 text-[11px] font-semibold text-slate-300">
                    {feature.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-200 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
