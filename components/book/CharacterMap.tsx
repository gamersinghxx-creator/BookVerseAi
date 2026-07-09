"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Character } from "@/lib/types";

export function CharacterMap({
  characters,
  accentRgb = "255,46,85",
}: {
  characters: Character[];
  accentRgb?: string;
}) {
  const [active, setActive] = useState<string>(characters[0]?.name ?? "");
  const selected = characters.find((c) => c.name === active);

  return (
    <div className="grid gap-5 md:grid-cols-[1fr_1.1fr]">
      <div className="flex flex-wrap content-start gap-2.5">
        {characters.map((c, i) => (
          <motion.button
            key={c.name}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setActive(c.name)}
            className="rounded-2xl px-4 py-2.5 text-left font-grotesk text-sm transition"
            style={
              active === c.name
                ? { background: `rgba(${accentRgb},0.12)`, border: `1px solid rgba(${accentRgb},0.5)`, color: "#211a18" }
                : { background: "rgba(255,253,249,0.6)", border: "1px solid rgba(33,26,24,0.1)", color: "#5b4f49" }
            }
          >
            <span className="block font-semibold text-ink">{c.name}</span>
            <span className="text-xs text-ink-faint">{c.role}</span>
          </motion.button>
        ))}
      </div>

      {selected && (
        <motion.div
          key={selected.name}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <h4 className="display text-2xl font-bold text-ink">{selected.name}</h4>
          <span className="pill mt-2">{selected.role}</span>
          <p className="mt-3 text-sm text-ink-soft">{selected.description}</p>

          {selected.connections.length > 0 && (
            <div className="mt-4">
              <p className="eyebrow mb-2">Connected to</p>
              <div className="flex flex-wrap gap-2">
                {selected.connections.map((name) => (
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
        </motion.div>
      )}
    </div>
  );
}
