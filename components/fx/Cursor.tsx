"use client";

import { useEffect, useRef } from "react";

// A soft multiply-blend glow that trails the pointer and swells over
// interactive elements. Disabled on touch and under reduced-motion (via CSS).
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Skip on touch devices and when the user prefers reduced motion — in both
    // cases the native cursor must stay visible (the glow would be hidden).
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current!;
    if (!el) return;
    document.body.classList.add("has-custom-cursor");

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let cx = x;
    let cy = y;
    let raf = 0;

    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
    };
    const over = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null;
      const interactive = t?.closest("a,button,input,textarea,[role=button]");
      const s = interactive ? "48px" : "26px";
      el.style.width = s;
      el.style.height = s;
    };
    const loop = () => {
      cx += (x - cx) * 0.2;
      cy += (y - cy) * 0.2;
      el.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      document.body.classList.remove("has-custom-cursor");
    };
  }, []);

  return <div ref={ref} className="cursor-glow" aria-hidden />;
}
