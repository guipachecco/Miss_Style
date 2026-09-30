import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Fotos das peças enviadas pelo painel (Sanity).
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
};

export default nextConfig;
