import { Eraser, Pen, Redo2, RotateCcw, Save, Undo2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Point {
  x: number;
  y: number;
}
interface Stroke {
  points: Point[];
  color: string;
  width: number;
  erase: boolean;
}

const CANVAS_W = 1000;
const CANVAS_H = 1400;

const PEN_SIZES = [2, 4, 8];
const INK_COLORS = ["#1f2d24", "#1d4ed8", "#b3541e"];

/**
 * Paper-like drawing surface. Strokes are kept in memory as vectors so undo /
 * redo are exact, then flattened to a PNG for cloud storage on save.
 * Supports finger, stylus (pressure-aware width) and mouse input.
 */
export function FreehandCanvas({
  initialImageUrl,
  onSave,
  saving,
}: {
  initialImageUrl: string | null;
  onSave: (blob: Blob) => void;
  saving: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const baseImageRef = useRef<HTMLImageElement | null>(null);
  const drawingRef = useRef(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [undone, setUndone] = useState<Stroke[]>([]);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [size, setSize] = useState(4);
  const [color, setColor] = useState(INK_COLORS[0]);
  const [ready, setReady] = useState(false);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.fillStyle = "#fdfbf4";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // faint ruled lines, like a case-paper sheet
    ctx.strokeStyle = "rgba(31,45,36,0.07)";
    ctx.lineWidth = 1;
    for (let y = 60; y < CANVAS_H; y += 40) {
      ctx.beginPath();
      ctx.moveTo(24, y);
      ctx.lineTo(CANVAS_W - 24, y);
      ctx.stroke();
    }

    if (baseImageRef.current) {
      ctx.drawImage(baseImageRef.current, 0, 0, CANVAS_W, CANVAS_H);
    }

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (const stroke of strokes) {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = stroke.erase ? "#fdfbf4" : stroke.color;
      ctx.lineWidth = stroke.erase ? stroke.width * 5 : stroke.width;
      ctx.beginPath();
      stroke.points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      if (stroke.points.length === 1) {
        ctx.arc(stroke.points[0].x, stroke.points[0].y, ctx.lineWidth / 2, 0, Math.PI * 2);
        ctx.fillStyle = ctx.strokeStyle as string;
        ctx.fill();
      }
      ctx.stroke();
    }
  }, [strokes]);

  // Load any previously saved page so the doctor continues where they left off.
  useEffect(() => {
    if (!initialImageUrl) {
      setReady(true);
      redraw();
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      baseImageRef.current = img;
      setReady(true);
      redraw();
    };
    img.onerror = () => {
      setReady(true);
      redraw();
    };
    img.src = initialImageUrl;
  }, [initialImageUrl, redraw]);

  useEffect(() => {
    if (ready) redraw();
  }, [ready, redraw]);

  const toCanvasPoint = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * CANVAS_W,
      y: ((e.clientY - rect.top) / rect.height) * CANVAS_H,
    };
  };

  const handleDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    const pressure = e.pressure > 0 && e.pointerType === "pen" ? e.pressure : 0.5;
    setUndone([]);
    setStrokes((prev) => [
      ...prev,
      {
        points: [toCanvasPoint(e)],
        color,
        width: Math.max(1, size * pressure * 2),
        erase: tool === "eraser",
      },
    ]);
  };

  const handleMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    e.preventDefault();
    const point = toCanvasPoint(e);
    setStrokes((prev) => {
      if (prev.length === 0) return prev;
      const next = prev.slice();
      const last = next[next.length - 1];
      next[next.length - 1] = { ...last, points: [...last.points, point] };
      return next;
    });
  };

  const handleUp = () => {
    drawingRef.current = false;
  };

  const undo = () => {
    setStrokes((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setUndone((u) => [...u, last]);
      return prev.slice(0, -1);
    });
  };

  const redo = () => {
    setUndone((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setStrokes((s) => [...s, last]);
      return prev.slice(0, -1);
    });
  };

  const clear = () => {
    baseImageRef.current = null;
    setStrokes([]);
    setUndone([]);
    redraw();
  };

  const save = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (blob) onSave(blob);
    }, "image/png");
  };

  return (
    <div className="space-y-3">
      <div className="card-record sticky top-[104px] z-10 flex flex-wrap items-center gap-2 p-2">
        <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
          <ToolButton active={tool === "pen"} onClick={() => setTool("pen")} label="लेखणी">
            <Pen className="size-4" />
          </ToolButton>
          <ToolButton active={tool === "eraser"} onClick={() => setTool("eraser")} label="खोडरबर">
            <Eraser className="size-4" />
          </ToolButton>
        </div>

        <div className="flex items-center gap-1">
          {PEN_SIZES.map((s) => (
            <button
              key={s}
              type="button"
              aria-label={`जाडी ${s}`}
              aria-pressed={size === s}
              onClick={() => setSize(s)}
              className={cn(
                "grid size-8 place-items-center rounded-md border border-border bg-card",
                size === s && "border-primary bg-secondary",
              )}
            >
              <span
                className="rounded-full bg-foreground"
                style={{ width: s + 2, height: s + 2 }}
              />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          {INK_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`रंग ${c}`}
              aria-pressed={color === c}
              onClick={() => {
                setColor(c);
                setTool("pen");
              }}
              className={cn(
                "size-8 rounded-md border-2",
                color === c ? "border-primary" : "border-border",
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <div className="ml-auto flex items-center gap-1">
          <ToolButton onClick={undo} disabled={strokes.length === 0} label="Undo">
            <Undo2 className="size-4" />
          </ToolButton>
          <ToolButton onClick={redo} disabled={undone.length === 0} label="Redo">
            <Redo2 className="size-4" />
          </ToolButton>
          <ToolButton onClick={clear} label="पूर्ण पुसा">
            <RotateCcw className="size-4" />
          </ToolButton>
          <Button type="button" size="sm" onClick={save} disabled={saving}>
            <Save className="mr-1 size-4" />
            {saving ? "जतन…" : "जतन"}
          </Button>
        </div>
      </div>

      <div className="card-record overflow-hidden p-1">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          onPointerDown={handleDown}
          onPointerMove={handleMove}
          onPointerUp={handleUp}
          onPointerLeave={handleUp}
          onPointerCancel={handleUp}
          className="block h-auto w-full rounded-md"
          style={{ touchAction: "none" }}
        />
      </div>
    </div>
  );
}

function ToolButton({
  children,
  onClick,
  active,
  disabled,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "grid size-9 place-items-center rounded-md border border-border bg-card text-foreground transition-colors disabled:opacity-40",
        active && "border-primary bg-secondary text-secondary-foreground",
      )}
    >
      {children}
    </button>
  );
}
