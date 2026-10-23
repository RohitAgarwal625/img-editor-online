import React from "react";
import { Shield, ShoppingBag, Wand2, Zap, DownloadCloud, Cpu } from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      title: "100% In-Browser Privacy",
      description:
        "Your photos never leave your device. The neural network runs entirely inside your browser's local sandbox, with zero cloud storage.",
      icon: Shield,
    },
    {
      title: "Amazon & Shopify Ready",
      description:
        "One-click pure white background (#FFFFFF) compositing to meet strict catalog standards for Amazon, Shopify, eBay, and Google Shopping.",
      icon: ShoppingBag,
    },
    {
      title: "Sub-Pixel Hair & Fur Matting",
      description:
        "Trained on complex real-world boundaries, the ISNet model accurately separates flyaway hair strands, fur, and semi-transparent objects.",
      icon: Wand2,
    },
    {
      title: "Zero Paywalls or Subscriptions",
      description:
        "Remove backgrounds from as many images as you need. No account creation, no credits system, and no watermarks.",
      icon: Zap,
    },
    {
      title: "Lossless PNG & Compact WebP",
      description:
        "Download your cutout in full native pixel resolution. No 0.25-megapixel downsampling restrictions like remove.bg.",
      icon: DownloadCloud,
    },
    {
      title: "Hardware Accelerated WASM",
      description:
        "Leverages multi-core CPU threading and WebGPU acceleration to perform complex neural inference in seconds.",
      icon: Cpu,
    },
  ];

  return (
    <section id="features" className="py-14 border-b border-zinc-800/60 bg-zinc-950">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
            Engineered for Creators & Developers
          </h2>
          <p className="text-sm text-zinc-400">
            A privacy-first, zero-cost architecture designed for modern workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-2 hover:border-zinc-700 transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-blue-400">
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-200">
                  {feature.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
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
