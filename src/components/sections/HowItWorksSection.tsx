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
      title: "Local Neural Segmentation",
      description:
        "The ISNet ONNX model runs locally in your browser via multi-threaded WebAssembly. No files are uploaded to any external server.",
      icon: Cpu,
    },
    {
      number: "03",
      title: "Recolor & Export",
      description:
        "Keep the transparent alpha channel, composite onto pure white for e-commerce listings, or apply custom colors. Download in full HD resolution.",
      icon: Palette,
    },
  ];

  return (
    <section id="how-it-works" className="py-14 border-b border-zinc-800/60 bg-zinc-950">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
            How It Works
          </h2>
          <p className="text-sm text-zinc-400">
            Three simple steps to studio-grade cutouts right in your browser.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700 text-blue-400">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="font-mono text-xs font-semibold text-zinc-500">
                    STEP {step.number}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-zinc-200">
                  {step.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
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
