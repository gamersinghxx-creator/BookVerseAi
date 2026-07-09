// Living-ink accent palette, shared by orbs, book pages, and modules.
export interface Accent {
  key: string;
  rgb: string; // "r,g,b"
  text: string; // tailwind text color class (dark enough for paper)
}

export const ACCENTS: Accent[] = [
  { key: "sky", rgb: "46,155,255", text: "text-sky-ink" },
  { key: "crimson", rgb: "255,46,85", text: "text-crimson-ink" },
  { key: "leaf", rgb: "46,203,124", text: "text-leaf-ink" },
  { key: "amber", rgb: "255,177,61", text: "text-amber-ink" },
  { key: "iris", rgb: "122,92,255", text: "text-iris-ink" },
];

export function accentIndex(key: string): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return h % ACCENTS.length;
}

export function accentFor(key: string): Accent {
  return ACCENTS[accentIndex(key)];
}
