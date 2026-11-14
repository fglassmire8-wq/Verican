import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Seed photos in /public/uploads are resized from each Image `sizes`.
    // Runtime files at /media are outside /public; CatalogImage leaves those unoptimized.
    minimumCacheTTL: 60 * 60 * 24,
  },
  async redirects() {
    return [
      {
        source: "/categories",
        has: [{ type: "query", key: "c" }],
        destination: "/reviews?category=:c",
        permanent: true,
      },
      { source: "/categories", destination: "/reviews", permanent: true },
      { source: "/submit", destination: "/portal/submit", permanent: true },
      { source: "/markets", destination: "/reviews", permanent: true },
      { source: "/brands", destination: "/reviews", permanent: true },
    ];
  },
};

export default nextConfig;
