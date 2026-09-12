// Tiny classname joiner — dependency-free. Later tokens/variants win by order.
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
