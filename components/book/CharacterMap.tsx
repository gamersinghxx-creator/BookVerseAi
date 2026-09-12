"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { transition } from "@/lib/motion";
import { Card, Pill } from "@/components/ui";
import type { Character } from "@/lib/types";

export function CharacterMap({
  characters,
  accentRgb = "255,46,85",
}: {
  characters: Character[];
  accentRgb?: string;
}) {
  const names = new Set(characters.map((c) => c.name));
  const [active, setActive] = useState<string>(characters[0]?.name ?? "");
  const selected = characters.find((c) => c.name === active) ?? characters[0];

  return (
    <div className="grid gap-5 md:grid-cols-[1fr_1.1fr]">
      <div className="flex flex-wrap content-start gap-2.5">
        {characters.map((c, i) => {
          const isActive = active === c.name;
          return (
            <motion.button
              key={c.name}
              initial={{ y: 8 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={transition(0.35, i * 0.05)}
              onClick={() => setActive(c.name)}
              aria-pressed={isActive}
              className="rounded-2xl px-4 py-2.5 text-left font-grotesk text-body-sm transition"
              style={
                isActive
                  ? { background: `rgba(${accentRgb},0.12)`, border: `1px solid rgba(${accentRgb},0.5)` }
                  : { background: "rgba(255,253,249,0.6)", border: "1px solid rgba(33,26,24,0.1)" }
              }
            >
              <span className="block font-semibold text-ink">{c.name}</span>
              <span className="text-xs text-ink-faint">{c.role}</span>
            </motion.button>
          );
        })}
      </div>

      {selected && (
        <Card key={selected.name} className="p-6">
          <h3 className="display text-h3 font-bold text-ink">{selected.name}</h3>
          <Pill className="mt-2">{selected.role}</Pill>
          <p className="mt-3 text-body-sm text-ink-soft">{selected.description}</p>

          {selected.connections.filter((n) => names.has(n)).length > 0 && (
            <div className="mt-4">
              <p className="eyebrow mb-2">Connected to</p>
              <div className="flex flex-wrap gap-2">
                {selected.connections
                  .filter((n) => names.has(n))
                  .map((name) => (
                    <button
                      key={name}
                      onClick={() => setActive(name)}
                      className="pill hover:border-ink/25 hover:text-ink"
                    >
                      {name}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
