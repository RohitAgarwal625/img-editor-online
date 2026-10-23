import React from "react";
import { CheckCircle2, Clock, FileCheck, Layers } from "lucide-react";

export function FormatsSection() {
  const formats = [
    {
      format: "JPEG / JPG",
      ext: ".jpg, .jpeg",
      status: "Supported",
      badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      notes: "Standard photos & portraits with automatic orientation correction",
    },
    {
      format: "PNG",
      ext: ".png",
      status: "Supported",
      badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      notes: "Lossless RGB & RGBA images, logos, graphics and illustrations",
    },
    {
      format: "WebP",
      ext: ".webp",
      status: "Supported",
      badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      notes: "Modern web format with high compression and transparency support",
    },
    {
      format: "BMP",
      ext: ".bmp",
      status: "Supported",
      badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      notes: "Uncompressed bitmap image files",
    },
    {
      format: "GIF",
      ext: ".gif",
      status: "Supported (First frame)",
      badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      notes: "Static GIF images and first frame extraction",
    },
    {
      format: "RAW Camera Files",
      ext: ".cr2, .nef, .arw, .dng",
      status: "Coming in v2",
      badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      notes: "Server-side LibRAW demosaicing pipeline currently in development",
    },
  ];

  return (
    <section id="formats" className="py-20 bg-slate-950 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Supported Formats & Specifications
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            We accept virtually any standard web and digital camera image format.
          </p>
        </div>

        {/* Formats Grid */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          {formats.map((item) => (
            <div
              key={item.format}
              className="flex flex-col justify-between rounded-2xl bg-slate-900/60 border border-slate-800/80 p-5 backdrop-blur-sm hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <h3 className="text-base font-bold text-white">{item.format}</h3>
                  <p className="text-xs font-mono text-indigo-400">{item.ext}</p>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border ${item.badgeClass}`}
                >
                  {item.status.includes("Supported") ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <Clock className="h-3 w-3" />
                  )}
                  <span>{item.status}</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 pt-2 border-t border-slate-800/50">
                {item.notes}
              </p>
            </div>
          ))}
        </div>

        {/* Limits notice */}
        <div className="mt-8 max-w-4xl mx-auto rounded-2xl bg-indigo-950/20 border border-indigo-500/20 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-indigo-400 shrink-0" />
            <span>Maximum File Size: <strong className="text-white">25 MB</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-indigo-400 shrink-0" />
            <span>Maximum Dimension: <strong className="text-white">8,000 × 8,000 px</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Export Resolutions: <strong className="text-white">100% Original Lossless</strong></span>
          </div>
        </div>
      </div>
    </section>
  );
}
