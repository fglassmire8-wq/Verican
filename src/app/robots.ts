import type { MetadataRoute } from "next";
import { getSiteOrigin } from "@/lib/site";

export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/portal", "/moderation", "/dashboard", "/submit"],
    },
    sitemap: `${getSiteOrigin()}/sitemap.xml`,
  };
}
