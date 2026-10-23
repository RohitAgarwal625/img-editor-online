import React from "react";
import { Shield, ShoppingBag, Wand2, Zap, DownloadCloud, Cpu } from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      title: "100% In-Browser Privacy",
      description:
        "Your photos never leave your device. The neural network runs entirely inside your browser's local sandbox, with zero cloud uploads.",
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
        "Trained on complex real-world boundaries, the ISNet model accurately separates flyaway hair strands, pet fur, and transparent objects.",
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
    <section id="features" className="py-16 border-b border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Engineered for Creators & Sellers
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            A privacy-first, zero-cost architecture designed for modern e-commerce and creative workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2.5 shadow-2xs hover:border-slate-300 transition-colors"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
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
