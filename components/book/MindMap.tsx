"use client";

import { motion } from "framer-motion";
import type { MindMapNode } from "@/lib/types";

// Radial mind map on paper: the root at centre, first-level branches fanning
// out, leaves beyond. Coloured by the page accent.
export function MindMap({
  nodes,
  accentRgb = "122,92,255",
}: {
  nodes: MindMapNode[];
  accentRgb?: string;
}) {
  const root = nodes.find((n) => n.parent === null);
  if (!root) return null;

  const branches = nodes.filter((n) => n.parent === root.id);
  const leavesOf = (id: string) => nodes.filter((n) => n.parent === id);

  const W = 720;
  const H = 460;
  const cx = W / 2;
  const cy = H / 2;
  const R = 150;

  const points = branches.map((b, i) => {
    const angle = (i / Math.max(branches.length, 1)) * Math.PI * 2 - Math.PI / 2;
    return { node: b, x: cx + Math.cos(angle) * R, y: cy + Math.sin(angle) * R, angle };
  });

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mx-auto h-auto w-full min-w-[560px]"
        role="img"
        aria-label="Mind map of the book's key concepts"
      >
        {points.map((p, i) => (
          <motion.line
            key={`l-${i}`}
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            stroke={`rgba(${accentRgb},0.4)`}
            strokeWidth={2}
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
          />
        ))}

        {points.map((p, i) => {
          const leaves = leavesOf(p.node.id);
          return leaves.map((leaf, j) => {
            const lr = 92;
            const spread = 0.5;
            const a =
              p.angle + (leaves.length > 1 ? (j / (leaves.length - 1) - 0.5) * spread : 0);
            const lx = p.x + Math.cos(a) * lr;
            const ly = p.y + Math.sin(a) * lr;
            return (
              <g key={`leaf-${i}-${j}`}>
                <line x1={p.x} y1={p.y} x2={lx} y2={ly} stroke="rgba(33,26,24,0.16)" strokeWidth={1.5} />
                <foreignObject x={lx - 60} y={ly - 14} width={120} height={28}>
                  <div className="flex h-full items-center justify-center rounded-full border border-ink/10 bg-paper/90 px-2 text-center text-[10px] font-medium leading-tight text-ink-faint">
                    {leaf.label}
                  </div>
                </foreignObject>
              </g>
            );
          });
        })}

        {points.map((p, i) => (
          <foreignObject key={`b-${i}`} x={p.x - 66} y={p.y - 18} width={132} height={36}>
            <div
              className="flex h-full items-center justify-center rounded-xl px-2 text-center font-grotesk text-xs font-semibold text-ink"
              style={{
                background: `rgba(${accentRgb},0.16)`,
                border: `1px solid rgba(${accentRgb},0.35)`,
              }}
            >
              {p.node.label}
            </div>
          </foreignObject>
        ))}

        <foreignObject x={cx - 82} y={cy - 27} width={164} height={54}>
          <div
            className="display flex h-full items-center justify-center rounded-2xl px-2 text-center text-body-sm font-bold text-white"
            style={{
              background: `linear-gradient(120deg, rgb(${accentRgb}), rgba(${accentRgb},0.75))`,
              boxShadow: `0 16px 34px -18px rgba(${accentRgb},0.9)`,
            }}
          >
            {root.label}
          </div>
        </foreignObject>
      </svg>
    </div>
  );
}
