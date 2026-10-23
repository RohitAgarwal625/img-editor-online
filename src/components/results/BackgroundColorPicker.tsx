"use client";

import React from "react";
import { Check, Pipette } from "lucide-react";

interface BackgroundColorPickerProps {
  currentColor: string;
  onChangeColor: (color: string) => void;
}

const PRESET_COLORS = [
  { name: "Transparent (PNG)", value: "transparent", isTransparent: true },
  { name: "Pure White (#FFFFFF - Amazon & Shopify)", value: "#ffffff" },
  { name: "Studio Off-White (#F8FAFC)", value: "#f8fafc" },
  { name: "Warm Cream (#FEF3C7)", value: "#fef3c7" },
  { name: "Soft Gray (#E2E8F0)", value: "#e2e8f0" },
  { name: "Neutral Slate (#64748B)", value: "#64748b" },
  { name: "Deep Charcoal (#1E293B)", value: "#1e293b" },
  { name: "Pitch Black (#000000)", value: "#000000" },
  { name: "Vibrant Cobalt (#2563EB)", value: "#2563eb" },
  { name: "Emerald (#10B981)", value: "#10b981" },
];

export function BackgroundColorPicker({
  currentColor,
  onChangeColor,
}: BackgroundColorPickerProps) {
  const isTransparent = currentColor === "transparent";

  return (
    <div className="space-y-3.5" role="group" aria-label="Background Color Selection">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Background Color
        </label>
        <span className="text-xs font-mono font-medium text-slate-500">
          {isTransparent ? "Transparent" : currentColor.toUpperCase()}
        </span>
      </div>

      {/* Swatches Grid */}
      <div className="grid grid-cols-6 gap-2">
        {PRESET_COLORS.map((preset) => {
          const isSelected = currentColor.toLowerCase() === preset.value.toLowerCase();
          return (
            <button
              key={preset.value}
              type="button"
              title={preset.name}
              aria-label={preset.name}
              aria-pressed={isSelected}
              onClick={() => onChangeColor(preset.value)}
              className={`relative h-9 w-9 rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                isSelected
                  ? "ring-2 ring-blue-600 ring-offset-2 ring-offset-white scale-105 shadow-xs"
                  : "hover:scale-105 border border-slate-300"
              }`}
              style={{
                backgroundColor: preset.isTransparent ? undefined : preset.value,
              }}
            >
              {preset.isTransparent && (
                <div className="h-full w-full rounded-lg checkerboard-pattern" />
              )}
              {isSelected && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <Check
                    className={`h-4 w-4 drop-shadow-xs ${
                      preset.value === "#ffffff" || preset.value === "#f8fafc" || preset.value === "#fef3c7" || preset.value === "#e2e8f0"
                        ? "text-slate-900"
                        : "text-white"
                    }`}
                  />
                </div>
              )}
            </button>
          );
        })}

        {/* Custom Color Eyedropper Button */}
        <div className="relative col-span-2">
          <label
            title="Custom hex color"
            className="flex h-9 w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 px-2 text-xs font-semibold text-slate-700 transition-colors focus-within:ring-2 focus-within:ring-blue-600"
          >
            <Pipette className="h-4 w-4 text-slate-500" />
            <span className="text-xs">Custom</span>
            <input
              type="color"
              aria-label="Pick custom background color"
              value={isTransparent ? "#ffffff" : currentColor}
              onChange={(e) => onChangeColor(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </label>
        </div>
      </div>

      {/* Hex value input and Amazon compliance callout */}
      {!isTransparent && (
        <div className="pt-1 flex items-center justify-between gap-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono text-slate-400">HEX</span>
            <input
              type="text"
              value={currentColor}
              onChange={(e) => {
                const val = e.target.value;
                if (val.startsWith("#") || val === "") {
                  onChangeColor(val || "#000000");
                } else {
                  onChangeColor(`#${val}`);
                }
              }}
              maxLength={7}
              className="w-24 rounded-md border border-slate-300 bg-white px-2 py-1 font-mono text-xs text-slate-800 uppercase focus:outline-none focus:border-blue-600"
              aria-label="Custom Hex Code"
            />
          </div>
          {currentColor.toLowerCase() === "#ffffff" && (
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
              E-Commerce standard
            </span>
          )}
        </div>
      )}
    </div>
  );
}
