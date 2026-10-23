"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { MoveHorizontal } from "lucide-react";

interface BeforeAfterSliderProps {
  originalUrl: string;
  resultUrl: string;
  backgroundColor?: string;
  checkerboardClass?: string;
  altText?: string;
}

export function BeforeAfterSlider({
  originalUrl,
  resultUrl,
  backgroundColor = "transparent",
  checkerboardClass = "checkerboard-pattern",
  altText = "Before and after comparison",
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage 0 - 100
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const clampedX = Math.max(0, Math.min(x, rect.width));
    const percent = (clampedX / rect.width) * 100;
    setSliderPosition(percent);
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging) return;
      handleMove(e.touches[0].clientX);
    },
    [isDragging, handleMove]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    },
    [isDragging, handleMove]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-4xl mx-auto h-[380px] sm:h-[480px] md:h-[560px] rounded-2xl overflow-hidden select-none border border-slate-800 shadow-2xl cursor-ew-resize group"
      onMouseDown={() => setIsDragging(true)}
      onTouchStart={() => setIsDragging(true)}
    >
      {/* Background (Processed result) layer with transparency pattern or color */}
      <div 
        className={`absolute inset-0 w-full h-full flex items-center justify-center ${
          backgroundColor === "transparent" ? checkerboardClass : ""
        }`}
        style={{
          backgroundColor: backgroundColor !== "transparent" ? backgroundColor : undefined,
        }}
      >
        <img
          src={resultUrl}
          alt={`Result: ${altText}`}
          className="w-full h-full object-contain pointer-events-none"
        />
        <div className="absolute top-4 right-4 z-10 pointer-events-none rounded-md bg-slate-950/80 backdrop-blur-md px-2.5 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/30">
          Removed (AI)
        </div>
      </div>

      {/* Foreground (Original) layer clipped by slider position */}
      <div
        className="absolute inset-0 w-full h-full overflow-hidden bg-slate-900 pointer-events-none"
        style={{ width: `${sliderPosition}%` }}
      >
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ width: containerWidth ? `${containerWidth}px` : "100%" }}
        >
          <img
            src={originalUrl}
            alt={`Original: ${altText}`}
            className="w-full h-full object-contain pointer-events-none"
          />
        </div>
        <div className="absolute top-4 left-4 z-10 pointer-events-none rounded-md bg-slate-950/80 backdrop-blur-md px-2.5 py-1 text-xs font-semibold text-slate-300 border border-slate-700/60">
          Original
        </div>
      </div>

      {/* Draggable Divider Handle */}
      <div
        className="absolute top-0 bottom-0 z-20 w-0.5 bg-white cursor-ew-resize pointer-events-none"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-900 shadow-xl border-2 border-indigo-600 transition-transform group-hover:scale-110 active:scale-95">
          <MoveHorizontal className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}
