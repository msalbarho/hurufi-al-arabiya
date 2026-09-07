import { useEffect, useRef, useState } from "react";
import { Eraser } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  glyph: string;
  onComplete?: (coverage: number) => void;
  /** 0..1 – how much of the letter must be covered */
  threshold?: number;
  className?: string;
}

const SIZE = 320;

/**
 * Freehand tracing over a ghost letter. Coverage is computed by comparing
 * the child's strokes with the rasterised glyph mask (offscreen canvas).
 */
export function TracingCanvas({ glyph, onComplete, threshold = 0.55, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskRef = useRef<Uint8ClampedArray | null>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const done = useRef(false);
  const [coverage, setCoverage] = useState(0);

  // Build glyph mask
  useEffect(() => {
    const off = document.createElement("canvas");
    off.width = SIZE;
    off.height = SIZE;
    const c = off.getContext("2d")!;
    c.clearRect(0, 0, SIZE, SIZE);
    c.fillStyle = "#000";
    c.font = `700 ${SIZE * 0.72}px "Noto Naskh Arabic", "Baloo Bhaijaan 2", serif`;
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.direction = "rtl";
    c.fillText(glyph, SIZE / 2, SIZE / 2 + SIZE * 0.04);
    maskRef.current = c.getImageData(0, 0, SIZE, SIZE).data;
    clear();
    done.current = false;
    setCoverage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [glyph]);

  const clear = () => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d")!;
    ctx.clearRect(0, 0, SIZE, SIZE);
    done.current = false;
    setCoverage(0);
  };

  const pos = (e: React.PointerEvent) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * SIZE, y: ((e.clientY - r.top) / r.height) * SIZE };
  };

  const stroke = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const ctx = canvasRef.current!.getContext("2d")!;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 26;
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--coral") || "#ff5a3c";
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  };

  const evaluate = () => {
    const mask = maskRef.current;
    const cv = canvasRef.current;
    if (!mask || !cv || done.current) return;
    const data = cv.getContext("2d")!.getImageData(0, 0, SIZE, SIZE).data;
    let glyphPx = 0;
    let hit = 0;
    let outside = 0;
    for (let i = 3; i < mask.length; i += 16) {
      const inGlyph = (mask[i] ?? 0) > 100;
      const drawn = (data[i] ?? 0) > 60;
      if (inGlyph) {
        glyphPx++;
        if (drawn) hit++;
      } else if (drawn) outside++;
    }
    const cov = glyphPx ? hit / glyphPx : 0;
    const precision = hit + outside ? hit / (hit + outside) : 0;
    setCoverage(cov);
    if (cov >= threshold && precision > 0.35) {
      done.current = true;
      onComplete?.(cov);
    }
  };

  return (
    <div className={cn("relative mx-auto w-full max-w-[320px]", className)}>
      <div className="relative aspect-square overflow-hidden rounded-3xl border-4 border-dashed border-ink/15 bg-card shadow-chunky-sm">
        {/* ghost letter */}
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <span className="arabic-letter select-none text-ink/15" style={{ fontSize: SIZE * 0.72 * 0.98 }}>
            {glyph}
          </span>
        </div>
        <canvas
          ref={canvasRef}
          width={SIZE}
          height={SIZE}
          className="relative size-full touch-none"
          onPointerDown={(e) => {
            drawing.current = true;
            last.current = pos(e);
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (!drawing.current || !last.current) return;
            const p = pos(e);
            stroke(last.current, p);
            last.current = p;
          }}
          onPointerUp={() => {
            drawing.current = false;
            last.current = null;
            evaluate();
          }}
          onPointerCancel={() => {
            drawing.current = false;
            last.current = null;
          }}
        />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-ink/10">
          <div className="h-full rounded-full bg-sea transition-all" style={{ width: `${Math.min(100, Math.round((coverage / threshold) * 100))}%` }} />
        </div>
        <button
          type="button"
          onClick={clear}
          aria-label="امسح"
          className="press mr-3 grid size-12 place-items-center rounded-2xl border-2 border-ink/10 bg-card shadow-chunky-xs"
        >
          <Eraser className="size-6" />
        </button>
      </div>
    </div>
  );
}
