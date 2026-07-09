"use client";

import { Bookmark } from "lucide-react";
import { useShelf, type ShelfItem } from "@/lib/shelf";

export function ShelfButton({
  item,
  variant = "icon",
}: {
  item: ShelfItem;
  variant?: "icon" | "full";
}) {
  const { has, toggle } = useShelf();
  const saved = has(item.slug);

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggle(item);
  }

  if (variant === "full") {
    return (
      <button
        onClick={onClick}
        aria-pressed={saved}
        className={saved ? "btn-primary" : "btn-ghost"}
      >
        <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
        {saved ? "On your shelf" : "Save to shelf"}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      aria-pressed={saved}
      aria-label={saved ? "Remove from shelf" : "Save to shelf"}
      className={`grid h-9 w-9 place-items-center rounded-full border transition ${
        saved
          ? "border-crimson/40 bg-crimson/10 text-crimson-ink"
          : "border-ink/10 bg-paper/70 text-ink-soft hover:text-ink"
      }`}
    >
      <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
    </button>
  );
}
