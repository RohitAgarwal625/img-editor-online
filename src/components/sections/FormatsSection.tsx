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
    <section id="formats" className="py-16 border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Supported Formats & Technical Specs
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Accepts standard digital photography and graphic design formats up to 25MB.
          </p>
        </div>

        {/* Specifications Table */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-mono text-[11px]">
                <tr>
                  <th className="py-3.5 px-5 font-bold">Format</th>
                  <th className="py-3.5 px-5 font-bold">Extensions</th>
                  <th className="py-3.5 px-5 font-bold">Status</th>
                  <th className="py-3.5 px-5 font-bold">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {formats.map((item) => (
                  <tr key={item.format} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-900">{item.format}</td>
                    <td className="py-3.5 px-5 font-mono text-xs text-blue-700">{item.ext}</td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                          item.isSupported
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-amber-50 text-amber-800 border-amber-200"
                        }`}
                      >
                        {item.isSupported ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Clock className="h-3.5 w-3.5 text-amber-600" />
                        )}
                        <span>{item.status}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-600 text-xs">{item.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Limits Summary Strip */}
          <div className="border-t border-slate-200 bg-slate-50 p-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
            <div>Max File Size: <span className="font-bold text-slate-900">25 MB</span></div>
            <div>Max Resolution: <span className="font-bold text-slate-900">8,000 × 8,000 px</span></div>
            <div>Output Color Space: <span className="font-bold text-slate-900">sRGB (32-bit RGBA)</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}
