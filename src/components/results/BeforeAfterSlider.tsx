"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";

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
  checkerboardClass = "checkerboard-dark",
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
    const percent = Math.round((clampedX / rect.width) * 100);
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

  // Keyboard accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setSliderPosition((prev) => Math.max(0, prev - 5));
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setSliderPosition((prev) => Math.min(100, prev + 5));
    } else if (e.key === "Home") {
      e.preventDefault();
      setSliderPosition(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setSliderPosition(100);
    }
  };

  return (
    <div
      ref={containerRef}
      role="slider"
      tabIndex={0}
      aria-label="Before and after split slider"
      aria-valuenow={sliderPosition}
      aria-valuemin={0}
      aria-valuemax={100}
      onKeyDown={handleKeyDown}
      onMouseDown={() => setIsDragging(true)}
      onTouchStart={() => setIsDragging(true)}
      className="relative w-full max-w-4xl mx-auto h-[360px] sm:h-[460px] md:h-[520px] rounded-xl overflow-hidden select-none border border-zinc-800 bg-zinc-950 shadow-lg cursor-ew-resize focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
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
          className="w-full h-full object-contain pointer-events-none p-2 sm:p-4"
        />
        <div className="absolute top-3 right-3 z-10 pointer-events-none rounded bg-zinc-950/80 px-2 py-0.5 text-[11px] font-medium text-emerald-400 border border-zinc-800">
          Removed Background
        </div>
      </div>

      {/* Foreground (Original) layer clipped by slider position */}
      <div
        className="absolute inset-0 w-full h-full overflow-hidden bg-zinc-950 pointer-events-none"
        style={{ width: `${sliderPosition}%` }}
      >
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ width: containerWidth ? `${containerWidth}px` : "100%" }}
        >
          <img
            src={originalUrl}
            alt={`Original: ${altText}`}
            className="w-full h-full object-contain pointer-events-none p-2 sm:p-4"
          />
        </div>
        <div className="absolute top-3 left-3 z-10 pointer-events-none rounded bg-zinc-950/80 px-2 py-0.5 text-[11px] font-medium text-zinc-300 border border-zinc-800">
          Original
        </div>
      </div>

      {/* Hairline Divider & Precision Handle */}
      <div
        className="absolute top-0 bottom-0 z-20 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.7)] pointer-events-none"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex h-8 w-5 items-center justify-center rounded-full bg-white text-zinc-900 shadow-md border border-zinc-300">
          <div className="flex gap-0.5">
            <div className="h-3 w-0.5 bg-zinc-600 rounded-full" />
            <div className="h-3 w-0.5 bg-zinc-600 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
