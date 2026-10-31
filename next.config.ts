import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Seed photos in /public/uploads are resized from each Image `sizes`.
    // Runtime files at /media are outside /public; CatalogImage leaves those unoptimized.
    minimumCacheTTL: 60 * 60 * 24,
  },
  async redirects() {
    return [
      { source: "/markets", destination: "/categories", permanent: true },
      { source: "/brands", destination: "/categories", permanent: true },
    ];
  },
};

export default nextConfig;
