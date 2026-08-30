import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "VERICAN — Independent cannabis reviews",
    template: "%s · VERICAN",
  },
  description:
    "Independent 21+ cannabis review site. Check a photo and an honest review before you buy at a New Jersey dispensary. Not a store.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${cormorant.variable} ${outfit.variable} antialiased bg-ink text-cream`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
