"use client";

import { useEffect, useRef } from "react";

// The signature "liquid light" field: soft blooms of coloured ink that drift,
// breathe, and mix (multiply blend) on the warm-white paper, reacting to the
// pointer. GPU-light Canvas 2D; static single frame under reduced-motion.

type RGB = [number, number, number];

const INKS: RGB[] = [
  [46, 155, 255], // sky
  [255, 46, 85], // crimson
  [46, 203, 124], // leaf
  [255, 177, 61], // amber
  [122, 92, 255], // iris
];

interface Blob {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseR: number;
  phase: number;
  color: RGB;
}

export function LiquidLight({ density = 7 }: { density?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let raf = 0;
    const pointer = { x: -9999, y: -9999, active: false };
    const blobs: Blob[] = [];

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function init() {
      blobs.length = 0;
      for (let i = 0; i < density; i++) {
        const baseR = Math.min(w, h) * (0.24 + Math.random() * 0.22);
        blobs.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.09,
          vy: (Math.random() - 0.5) * 0.09,
          baseR,
          phase: Math.random() * Math.PI * 2,
          color: INKS[i % INKS.length],
        });
      }
    }

    function draw(t: number) {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "multiply";
      for (const b of blobs) {
        const r = b.baseR * (1 + Math.sin(t * 0.0004 + b.phase) * 0.12);
        const [rr, gg, bb] = b.color;
        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, r);
        g.addColorStop(0, `rgba(${rr},${gg},${bb},0.40)`);
        g.addColorStop(0.55, `rgba(${rr},${gg},${bb},0.13)`);
        g.addColorStop(1, `rgba(${rr},${gg},${bb},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
    }

    function step(t: number) {
      for (const b of blobs) {
        b.x += b.vx;
        b.y += b.vy;
        if (b.x < -b.baseR) b.x = w + b.baseR;
        if (b.x > w + b.baseR) b.x = -b.baseR;
        if (b.y < -b.baseR) b.y = h + b.baseR;
        if (b.y > h + b.baseR) b.y = -b.baseR;
        if (pointer.active) {
          const dx = b.x - pointer.x;
          const dy = b.y - pointer.y;
          const d2 = dx * dx + dy * dy;
          const R = 280;
          if (d2 < R * R) {
            const d = Math.sqrt(d2) || 1;
            const f = (1 - d / R) * 0.7;
            b.x += (dx / d) * f;
            b.y += (dy / d) * f;
          }
        }
      }
      draw(t);
      raf = requestAnimationFrame(step);
    }

    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    };
    const onLeave = () => {
      pointer.active = false;
    };
    const onResize = () => {
      resize();
      init();
      if (reduce) draw(0);
    };
    const onVis = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else if (!reduce) raf = requestAnimationFrame(step);
    };

    resize();
    init();
    if (reduce) draw(0);
    else raf = requestAnimationFrame(step);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
      document.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [density]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
      style={{ filter: "blur(30px) saturate(1.15)" }}
    />
  );
}
