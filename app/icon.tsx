import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Generated favicon: three living-ink dots on warm paper.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FBF6EE",
          borderRadius: 8,
        }}
      >
        <div style={{ display: "flex", gap: -4 }}>
          <div style={{ width: 12, height: 12, borderRadius: 99, background: "#2E9BFF", marginRight: -4 }} />
          <div style={{ width: 12, height: 12, borderRadius: 99, background: "#FF2E55", marginRight: -4 }} />
          <div style={{ width: 12, height: 12, borderRadius: 99, background: "#2ECB7C" }} />
        </div>
      </div>
    ),
    { ...size }
  );
}
