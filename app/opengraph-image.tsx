import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "BookVerse AI - Step inside any book";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 90,
          background:
            "radial-gradient(600px 400px at 20% 20%, rgba(46,155,255,0.35), transparent), radial-gradient(600px 400px at 80% 30%, rgba(255,46,85,0.35), transparent), radial-gradient(700px 500px at 50% 90%, rgba(46,203,124,0.3), transparent), #FBF6EE",
        }}
      >
        <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          <div style={{ width: 26, height: 26, borderRadius: 99, background: "#2E9BFF" }} />
          <div style={{ width: 26, height: 26, borderRadius: 99, background: "#FF2E55" }} />
          <div style={{ width: 26, height: 26, borderRadius: 99, background: "#2ECB7C" }} />
        </div>
        <div style={{ fontSize: 96, fontWeight: 800, color: "#211A18", lineHeight: 1.05, letterSpacing: -2 }}>
          Step inside any book.
        </div>
        <div style={{ fontSize: 34, color: "#5B4F49", marginTop: 24, maxWidth: 900 }}>
          Living summaries, timelines, mind maps and an AI tutor - painted in light.
        </div>
        <div style={{ fontSize: 28, color: "#8A7C74", marginTop: 40, fontWeight: 600 }}>
          BookVerse AI
        </div>
      </div>
    ),
    { ...size }
  );
}
