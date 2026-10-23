import React from "react";
import { UploadCloud, Cpu, Palette } from "lucide-react";

export function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Upload or Paste",
      description:
        "Drop any image, browse local files, or press Cmd+V to paste a screenshot directly from your clipboard. Supports JPEG, PNG, WebP, BMP up to 25MB.",
      icon: UploadCloud,
    },
    {
      number: "02",
      title: "In-Browser AI Removal",
      description:
        "The ISNet neural network runs locally in your browser via multi-threaded WebAssembly. No files are uploaded to any external server.",
      icon: Cpu,
    },
    {
      number: "03",
      title: "Recolor & Export",
      description:
        "Keep the transparent alpha channel, composite onto pure white for Amazon/Shopify e-commerce listings, or apply custom colors. Download in full HD.",
      icon: Palette,
    },
  ];

  return (
    <section id="how-it-works" className="py-16 border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            How It Works
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Three simple steps to studio-grade cutouts right in your browser.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6 space-y-3 shadow-2xs hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 border border-blue-200 text-blue-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-400">
                    STEP {step.number}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
