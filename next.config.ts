import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    // Allow images served from the WordPress/WooCommerce host
    remotePatterns: [
      {
        protocol: "https",
        hostname: "springgreen-rook-492819.hostingersite.com",
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
