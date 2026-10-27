"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Eraser, Brush, Undo2, Check, X } from "lucide-react";

interface MaskEditorProps {
  originalUrl: string;
  resultUrl: string;
  backgroundColor: string;
  checkerClass: string;
  onApply: (blob: Blob, url: string) => void;
  onCancel: () => void;
}

type Mode = "erase" | "restore";

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Erase / restore brush editor operating at the cutout's native resolution.
 * Erase clears alpha; restore paints original pixels (full alpha) back.
 */
export function MaskEditor({ originalUrl, resultUrl, backgroundColor, checkerClass, onApply, onCancel }: MaskEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalRef = useRef<HTMLImageElement | null>(null);
  const historyRef = useRef<ImageData[]>([]);
  const drawingRef = useRef(false);
  const lastRef = useRef<{ x: number; y: number } | null>(null);
  const [mode, setMode] = useState<Mode>("erase");
  const [size, setSize] = useState(40);
  const [ready, setReady] = useState(false);
  const [canUndo, setCanUndo] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadImage(resultUrl), loadImage(originalUrl)]).then(([res, orig]) => {
      if (cancelled || !canvasRef.current) return;
      const c = canvasRef.current;
      c.width = res.naturalWidth;
      c.height = res.naturalHeight;
      c.getContext("2d", { willReadFrequently: true })!.drawImage(res, 0, 0);
      originalRef.current = orig;
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [resultUrl, originalUrl]);

  const toCanvas = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    // object-contain letterboxing
    const scale = Math.min(r.width / c.width, r.height / c.height);
    const ox = (r.width - c.width * scale) / 2, oy = (r.height - c.height * scale) / 2;
    return { x: (e.clientX - r.left - ox) / scale, y: (e.clientY - r.top - oy) / scale, scale };
  };

  const stamp = useCallback(
    (from: { x: number; y: number }, to: { x: number; y: number }, radius: number) => {
      const c = canvasRef.current!;
      const ctx = c.getContext("2d", { willReadFrequently: true })!;
      ctx.save();
      ctx.beginPath();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = radius * 2;
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x + 0.01, to.y);
      if (mode === "erase") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.strokeStyle = "#000";
        ctx.stroke();
      } else if (originalRef.current) {
        // Clip to the stroke path and paint original pixels back.
        const path = new Path2D();
        const steps = Math.max(1, Math.ceil(Math.hypot(to.x - from.x, to.y - from.y) / (radius / 2)));
        for (let i = 0; i <= steps; i++) {
          const x = from.x + ((to.x - from.x) * i) / steps, y = from.y + ((to.y - from.y) * i) / steps;
          path.moveTo(x + radius, y);
          path.arc(x, y, radius, 0, Math.PI * 2);
        }
        ctx.clip(path);
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.drawImage(originalRef.current, 0, 0, c.width, c.height);
      }
      ctx.restore();
    },
    [mode]
  );

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!ready) return;
    const c = canvasRef.current!;
    const ctx = c.getContext("2d", { willReadFrequently: true })!;
    historyRef.current.push(ctx.getImageData(0, 0, c.width, c.height));
    if (historyRef.current.length > 15) historyRef.current.shift();
    setCanUndo(true);
    c.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    const p = toCanvas(e);
    lastRef.current = p;
    stamp(p, p, size / p.scale / 2);
  };
  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current || !lastRef.current) return;
    const p = toCanvas(e);
    stamp(lastRef.current, p, size / p.scale / 2);
    lastRef.current = p;
  };
  const onUp = () => {
    drawingRef.current = false;
    lastRef.current = null;
  };

  const undo = () => {
    const prev = historyRef.current.pop();
    if (prev) canvasRef.current!.getContext("2d")!.putImageData(prev, 0, 0);
    setCanUndo(historyRef.current.length > 0);
  };

  const apply = () => {
    canvasRef.current!.toBlob((b) => b && onApply(b, URL.createObjectURL(b)), "image/png");
  };

  const btn = (active: boolean) =>
    `flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold border transition-colors ${
      active ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
    }`;

  return (
    <div className="w-full space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={btn(mode === "erase")} onClick={() => setMode("erase")}>
          <Eraser className="h-3.5 w-3.5" /> Erase
        </button>
        <button type="button" className={btn(mode === "restore")} onClick={() => setMode("restore")}>
          <Brush className="h-3.5 w-3.5" /> Restore
        </button>
        <label className="flex items-center gap-2 text-xs text-slate-600 ml-2">
          Brush
          <input type="range" min={5} max={150} value={size} onChange={(e) => setSize(+e.target.value)} />
          <span className="font-mono w-8">{size}</span>
        </label>
        <div className="ml-auto flex gap-2">
          <button type="button" className={btn(false)} onClick={undo} disabled={!canUndo}>
            <Undo2 className="h-3.5 w-3.5" /> Undo
          </button>
          <button type="button" className={btn(false)} onClick={onCancel}>
            <X className="h-3.5 w-3.5" /> Cancel
          </button>
          <button type="button" className={btn(true)} onClick={apply} disabled={!ready}>
            <Check className="h-3.5 w-3.5" /> Apply
          </button>
        </div>
      </div>
      <div
        className={`w-full h-[420px] sm:h-[500px] md:h-[560px] rounded-2xl overflow-hidden border border-slate-200 ${
          backgroundColor === "transparent" ? checkerClass : ""
        }`}
        style={{ backgroundColor: backgroundColor !== "transparent" ? backgroundColor : undefined }}
      >
        <canvas
          ref={canvasRef}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          className="w-full h-full object-contain touch-none cursor-crosshair"
          aria-label="Cutout editor canvas"
        />
      </div>
    </div>
  );
}
