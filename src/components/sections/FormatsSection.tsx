import React from "react";
import { CheckCircle2, Clock } from "lucide-react";

export function FormatsSection() {
  const formats = [
    {
      format: "JPEG / JPG",
      ext: ".jpg, .jpeg",
      status: "Supported",
      isSupported: true,
      notes: "Standard camera photos & portraits with automatic EXIF orientation handling",
    },
    {
      format: "PNG",
      ext: ".png",
      status: "Supported",
      isSupported: true,
      notes: "Lossless RGB & RGBA graphics, illustrations, and logos",
    },
    {
      format: "WebP",
      ext: ".webp",
      status: "Supported",
      isSupported: true,
      notes: "Modern compressed web graphics with alpha channel preservation",
    },
    {
      format: "BMP",
      ext: ".bmp",
      status: "Supported",
      isSupported: true,
      notes: "Uncompressed Windows Bitmap image files",
    },
    {
      format: "GIF",
      ext: ".gif",
      status: "Supported (First frame)",
      isSupported: true,
      notes: "Static GIF images and first-frame segmentation",
    },
    {
      format: "RAW Camera Files",
      ext: ".cr2, .nef, .arw, .dng",
      status: "Coming in v2",
      isSupported: false,
      notes: "Server-side LibRAW demosaicing pipeline currently in development",
    },
  ];

  return (
    <section id="formats" className="py-14 border-b border-zinc-800/60 bg-zinc-950">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
            Supported Formats & Technical Specs
          </h2>
          <p className="text-sm text-zinc-400">
            Accepts standard digital photography and graphic design formats up to 25MB.
          </p>
        </div>

        {/* Specifications Table */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/80 text-zinc-400 border-b border-zinc-800 uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Format</th>
                  <th className="py-3 px-4 font-semibold">Extensions</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {formats.map((item) => (
                  <tr key={item.format} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3 px-4 font-semibold text-zinc-200">{item.format}</td>
                    <td className="py-3 px-4 font-mono text-zinc-400">{item.ext}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium border ${
                          item.isSupported
                            ? "bg-emerald-950/60 text-emerald-400 border-emerald-800/60"
                            : "bg-amber-950/60 text-amber-400 border-amber-800/60"
                        }`}
                      >
                        {item.isSupported ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <Clock className="h-3 w-3" />
                        )}
                        <span>{item.status}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-400">{item.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Limits Summary Strip */}
          <div className="border-t border-zinc-800 bg-zinc-950/60 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400">
            <div>Max File Size: <span className="font-semibold text-zinc-200">25 MB</span></div>
            <div>Max Resolution: <span className="font-semibold text-zinc-200">8,000 × 8,000 px</span></div>
            <div>Output Color Space: <span className="font-semibold text-zinc-200">sRGB (32-bit RGBA)</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}
