import { ImageResponse } from "next/og";
import { accentFor } from "@/lib/accents";
import { loadBook } from "./_data";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "A BookVerse AI study guide";

export default async function BookOG({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const book = await loadBook(slug);
  const accent = accentFor(slug);
  const [r, g, b] = accent.rgb.split(",");

  const title = book?.title ?? "Book not found";
  const author = book?.author ?? "";
  const emoji = book?.cover.emoji ?? "📖";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 90,
          background: `radial-gradient(900px 500px at 15% 10%, rgba(${r},${g},${b},0.30), transparent), radial-gradient(700px 500px at 85% 90%, rgba(255,46,85,0.20), transparent), #FBF6EE`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ fontSize: 64 }}>{emoji}</div>
          <div style={{ fontSize: 26, color: "#6B5C54", fontWeight: 600, textTransform: "uppercase", letterSpacing: 4 }}>
            {book?.category ?? "study guide"}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: title.length > 30 ? 76 : 104, fontWeight: 800, color: "#211A18", lineHeight: 1.05, letterSpacing: -2 }}>
            {title}
          </div>
          {author && (
            <div style={{ fontSize: 34, color: "#544842", marginTop: 18 }}>{author}</div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 22, height: 22, borderRadius: 99, background: "#2E9BFF" }} />
          <div style={{ width: 22, height: 22, borderRadius: 99, background: "#FF2E55" }} />
          <div style={{ width: 22, height: 22, borderRadius: 99, background: "#2ECB7C" }} />
          <div style={{ fontSize: 26, color: "#8A7C74", fontWeight: 600, marginLeft: 8 }}>
            BookVerse AI
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
