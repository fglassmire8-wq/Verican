import type { Metadata } from "next";
import { Inter, Nunito } from "next/font/google";
import { Providers } from "@/components/Providers";
import { getSiteOrigin, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE } from "@/lib/site";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-nunito",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

// Per request so a Railway domain (or a later custom domain in NEXTAUTH_URL)
// is the share-image origin. A build-time value would stick as localhost.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL(getSiteOrigin()),
    title: {
      default: SITE_TITLE,
      template: `%s · ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    openGraph: {
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      siteName: SITE_NAME,
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} ${inter.variable} antialiased bg-ink text-cream`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
