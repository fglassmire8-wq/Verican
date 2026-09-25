import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getSiteOrigin } from "@/lib/site";

export const dynamic = "force-dynamic";

const PUBLIC_PATHS = [
  "/",
  "/markets",
  "/brands",
  "/affiliate",
  "/join",
  "/login",
  "/age",
  "/privacy",
  "/terms",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = getSiteOrigin();
  const now = new Date();
  const entries: MetadataRoute.Sitemap = PUBLIC_PATHS.map((path) => ({
    url: `${origin}${path}`,
    lastModified: now,
  }));

  try {
    const products = await prisma.product.findMany({
      where: { reviews: { some: { status: "APPROVED" } } },
      select: { slug: true },
      orderBy: { strain: "asc" },
    });
    for (const product of products) {
      entries.push({
        url: `${origin}/product/${product.slug}`,
        lastModified: now,
      });
    }
  } catch {
    // A missing database at build time should not drop the static public URLs.
  }

  return entries;
}
