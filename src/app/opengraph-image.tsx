import { ImageResponse } from "next/og";

export const alt = "VERICAN — Independent cannabis reviews. 21+ and not a store.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#0b0a08",
          color: "#f3ead8",
          padding: "80px",
        }}
      >
        <div
          style={{
            display: "flex",
            color: "#c4a36a",
            letterSpacing: "0.28em",
            fontSize: 22,
            textTransform: "uppercase",
          }}
        >
          21+ · Independent · Not a store
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 96,
            letterSpacing: "0.16em",
            color: "#e8d5a3",
          }}
        >
          VERICAN
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 36,
            lineHeight: 1.35,
            maxWidth: 920,
          }}
        >
          Independent cannabis reviews. New Jersey first.
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 18,
            fontSize: 24,
            color: "#9a8f7a",
          }}
        >
          User opinions only. VERICAN does not sell cannabis.
        </div>
      </div>
    ),
    { ...size },
  );
}
