import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0D9488 0%, #0f766e 100%)",
          color: "white",
          fontFamily: "sans-serif",
          padding: "80px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 40,
            fontWeight: 700,
            letterSpacing: "-1px",
            marginBottom: 24,
            opacity: 0.9,
          }}
        >
          {SITE_NAME}
        </div>
        <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.1, maxWidth: 900 }}>
          {SITE_TAGLINE}
        </div>
        <div style={{ fontSize: 28, marginTop: 32, opacity: 0.85, maxWidth: 820 }}>
          Evidence-based mental health articles by licensed professionals
        </div>
      </div>
    ),
    { ...size }
  );
}
