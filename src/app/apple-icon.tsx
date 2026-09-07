import { ImageResponse } from "next/og";

// Generated rather than a static PNG (no image-editing tool available in
// this environment) — same brand colours as the rest of the site
// (globals.css: pine #0e3b2e, brass #d2ab5c). 180x180 is Apple's
// recommended apple-touch-icon size.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0e3b2e",
          color: "#d2ab5c",
          fontSize: 108,
          fontWeight: 700,
        }}
      >
        و
      </div>
    ),
    { ...size },
  );
}
