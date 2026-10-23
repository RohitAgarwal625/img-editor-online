import React from "react";
import { UploadCloud, Cpu, Palette } from "lucide-react";

export function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Upload or Paste",
      description:
        "Drag and drop any photo, browse files, or press Cmd+V to paste from your clipboard. Supports JPEG, PNG, WebP, and BMP up to 25MB.",
      icon: UploadCloud,
      color: "from-blue-500 to-indigo-500",
    },
    {
      number: "02",
      title: "Neural AI Removes Background",
      description:
        "The ISNet neural network runs locally in your browser via WebAssembly, detecting people, products, or pets with pixel-level precision.",
      icon: Cpu,
      color: "from-indigo-500 to-violet-500",
    },
    {
      number: "03",
      title: "Recolor & Download",
      description:
        "Preview transparent cutout, composite onto e-commerce pure white or custom colors, and export high-res PNG or WebP with zero watermarks.",
      icon: Palette,
      color: "from-violet-500 to-pink-500",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-slate-950 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            How It Works in 3 Simple Steps
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Zero complex software, zero tedious magnetic lasso selections. Simple, fast, and completely free.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="relative rounded-3xl bg-slate-900/60 border border-slate-800/80 p-8 backdrop-blur-md shadow-xl hover:border-indigo-500/40 transition-all duration-300 hover:-translate-y-1 group"
              >
                {/* Step Number Watermark */}
                <span className="absolute top-6 right-6 text-4xl font-black text-slate-800/80 font-mono select-none group-hover:text-indigo-900/40 transition-colors">
                  {step.number}
                </span>

                {/* Icon */}
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr ${step.color} p-0.5 shadow-lg mb-6 group-hover:scale-105 transition-transform`}
                >
                  <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-slate-950/70">
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-200 transition-colors">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
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
