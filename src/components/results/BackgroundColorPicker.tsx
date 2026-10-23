"use client";

import React from "react";
import { Check, Pipette } from "lucide-react";

interface BackgroundColorPickerProps {
  currentColor: string;
  onChangeColor: (color: string) => void;
}

const PRESET_COLORS = [
  { name: "Transparent (PNG Alpha)", value: "transparent", isTransparent: true },
  { name: "Pure White (#FFFFFF - Amazon & Shopify)", value: "#ffffff" },
  { name: "Off-White / Studio (#F4F4F5)", value: "#f4f4f5" },
  { name: "Warm Cream (#FEF3C7)", value: "#fef3c7" },
  { name: "Studio Gray (#94A3B8)", value: "#94a3b8" },
  { name: "Charcoal Dark (#1E293B)", value: "#1e293b" },
  { name: "Pure Black (#000000)", value: "#000000" },
  { name: "Royal Cobalt (#2563EB)", value: "#2563eb" },
  { name: "Emerald (#059669)", value: "#059669" },
  { name: "Coral Rose (#E11D48)", value: "#e11d48" },
];

export function BackgroundColorPicker({
  currentColor,
  onChangeColor,
}: BackgroundColorPickerProps) {
  const isTransparent = currentColor === "transparent";

  return (
    <div className="space-y-3" role="group" aria-label="Background Color Selection">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
          Background
        </label>
        <span className="text-xs font-mono text-zinc-400">
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
              className={`relative h-8 w-8 rounded-md transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                isSelected
                  ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-zinc-900 scale-105"
                  : "hover:scale-105 border border-zinc-700/80"
              }`}
              style={{
                backgroundColor: preset.isTransparent ? undefined : preset.value,
              }}
            >
              {preset.isTransparent && (
                <div className="h-full w-full rounded-md checkerboard-dark" />
              )}
              {isSelected && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <Check
                    className={`h-3.5 w-3.5 ${
                      preset.value === "#ffffff" || preset.value === "#f4f4f5" || preset.value === "#fef3c7"
                        ? "text-zinc-900"
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
            className="flex h-8 w-full cursor-pointer items-center justify-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-800 hover:bg-zinc-700/80 px-2 text-xs text-zinc-300 transition-colors focus-within:ring-2 focus-within:ring-blue-500"
          >
            <Pipette className="h-3.5 w-3.5 text-zinc-400" />
            <span className="text-[11px] font-mono">Custom</span>
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

      {/* Hex value input */}
      {!isTransparent && (
        <div className="pt-1 flex items-center gap-2">
          <span className="text-xs text-zinc-500 font-mono">HEX</span>
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
            className="w-24 rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1 font-mono text-xs text-zinc-200 uppercase focus:outline-none focus:border-blue-500"
            aria-label="Custom Hex Code"
          />
          {currentColor.toLowerCase() === "#ffffff" && (
            <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-1.5 py-0.5 rounded">
              E-Commerce standard
            </span>
          )}
        </div>
      )}
    </div>
  );
}
