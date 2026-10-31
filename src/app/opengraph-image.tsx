import { ImageResponse } from "next/og";

export const alt = "Green Vault — Independent cannabis reviews. 21+ and not a store.";
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
          background: "#fff8ef",
          color: "#2a1d1a",
          padding: "80px",
        }}
      >
        <div
          style={{
            display: "flex",
            color: "#b4432a",
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
            color: "#5b2a5e",
          }}
        >
          GREEN VAULT
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
            color: "#6a5650",
          }}
        >
          User opinions only. Green Vault does not sell cannabis.
        </div>
      </div>
    ),
    { ...size },
  );
}
