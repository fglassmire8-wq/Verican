import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Seed photos are /uploads/max-ac/*; new reviews are /media/* from UPLOAD_DIR.
    // Skip the optimizer so runtime files outside /public still render.
    unoptimized: true,
  },
};

export default nextConfig;
