"use client";

import React from "react";
import { Check, Pipette } from "lucide-react";

interface BackgroundColorPickerProps {
  currentColor: string;
  onChangeColor: (color: string) => void;
}

const PRESET_COLORS = [
  { name: "Transparent", value: "transparent", isTransparent: true },
  { name: "Pure White (E-commerce)", value: "#ffffff" },
  { name: "Slate White", value: "#f8fafc" },
  { name: "Warm Cream", value: "#fef3c7" },
  { name: "Studio Gray", value: "#64748b" },
  { name: "Dark Neutral", value: "#1e293b" },
  { name: "Pitch Black", value: "#000000" },
  { name: "Indigo Blue", value: "#4f46e5" },
  { name: "Sky Azure", value: "#0ea5e9" },
  { name: "Emerald Green", value: "#10b981" },
  { name: "Pastel Rose", value: "#f43f5e" },
  { name: "Sunset Orange", value: "#f97316" },
];

export function BackgroundColorPicker({
  currentColor,
  onChangeColor,
}: BackgroundColorPickerProps) {
  const isCustom = !PRESET_COLORS.some((p) => p.value === currentColor);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
          Background Color
        </label>
        <span className="text-xs font-mono text-slate-400">
          {currentColor === "transparent" ? "None (Transparent)" : currentColor.toUpperCase()}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {PRESET_COLORS.map((preset) => {
          const isSelected = currentColor.toLowerCase() === preset.value.toLowerCase();
          return (
            <button
              key={preset.value}
              type="button"
              title={preset.name}
              onClick={() => onChangeColor(preset.value)}
              className={`relative h-9 w-9 rounded-xl transition-all duration-200 focus:outline-none ${
                isSelected
                  ? "ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-950 scale-105 shadow-md"
                  : "hover:scale-105 border border-slate-700/80"
              }`}
              style={{
                backgroundColor: preset.isTransparent ? undefined : preset.value,
              }}
            >
              {preset.isTransparent && (
                <div className="h-full w-full rounded-xl checkerboard-pattern" />
              )}
              {isSelected && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Check
                    className={`h-4 w-4 drop-shadow ${
                      preset.value === "#ffffff" || preset.value === "#f8fafc" || preset.value === "#fef3c7"
                        ? "text-slate-900"
                        : "text-white"
                    }`}
                  />
                </div>
              )}
            </button>
          );
        })}

        {/* Custom Color Input */}
        <div className="relative group">
          <label
            title="Choose custom background color"
            className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border transition-all duration-200 ${
              isCustom
                ? "ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-950 scale-105 border-indigo-400"
                : "border-dashed border-slate-600 hover:border-indigo-400 hover:bg-slate-800"
            }`}
            style={{
              backgroundColor: isCustom ? currentColor : undefined,
            }}
          >
            <input
              type="color"
              value={currentColor === "transparent" ? "#ffffff" : currentColor}
              onChange={(e) => onChangeColor(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <Pipette
              className={`h-4 w-4 transition-transform group-hover:rotate-45 ${
                isCustom && (currentColor === "#ffffff" || currentColor.toLowerCase().includes("fff"))
                  ? "text-slate-900"
                  : "text-slate-300"
              }`}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
