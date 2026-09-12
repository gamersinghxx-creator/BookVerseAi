import type { ReactNode, HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

// Small presentational primitives shared across the app. Keep them minimal —
// they encode the design system's surfaces, labels and spacing, nothing more.

export function Card({
  as: Tag = "div",
  className,
  children,
  ...rest
}: {
  as?: "div" | "article" | "section" | "figure";
  className?: string;
  children: ReactNode;
} & HTMLAttributes<HTMLElement>) {
  return (
    <Tag className={cn("card", className)} {...rest}>
      {children}
    </Tag>
  );
}

export function Pill({
  className,
  children,
  ...rest
}: { className?: string; children: ReactNode } & HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn("pill", className)} {...rest}>
      {children}
    </span>
  );
}

export function Eyebrow({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <p className={cn("eyebrow", className)}>{children}</p>;
}

// Gradient-tinted square that holds a section / feature icon.
export function IconTile({
  accentRgb = "122,92,255",
  size = "md",
  className,
  children,
}: {
  accentRgb?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  children: ReactNode;
}) {
  const dims = { sm: "h-9 w-9 rounded-xl", md: "h-12 w-12 rounded-2xl", lg: "h-14 w-14 rounded-2xl" }[size];
  return (
    <span
      className={cn("grid shrink-0 place-items-center text-ink", dims, className)}
      style={{
        background: `radial-gradient(circle at 50% 40%, rgba(${accentRgb},0.3), rgba(255,255,255,0.5))`,
        boxShadow: `0 12px 28px -16px rgba(${accentRgb},0.9)`,
      }}
    >
      {children}
    </span>
  );
}

// Eyebrow + heading + optional lead, used at the top of every section.
export function SectionHeading({
  eyebrow,
  title,
  lead,
  accentText,
  className,
  as: Tag = "h2",
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  accentText?: string;
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <div className={cn("max-w-prose", className)}>
      {eyebrow ? <p className={cn("eyebrow mb-4", accentText)}>{eyebrow}</p> : null}
      <Tag className="display text-h2 font-black text-ink">{title}</Tag>
      {lead ? <p className="mt-5 text-lead text-ink-soft">{lead}</p> : null}
    </div>
  );
}
