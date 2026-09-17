import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "springgreen-rook-492819.hostingersite.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "mediumaquamarine-seahorse-783985.hostingersite.com",
        pathname: "/**",
      },
      {
        // Covers any Hostinger-hosted WordPress media
        protocol: "https",
        hostname: "**.hostingersite.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;

