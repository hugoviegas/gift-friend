import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Environment variables available to the client
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },

  // Internationalization will be handled by next-intl middleware
  // Locale routing through [locale] dynamic segment

  // Image optimization domains (add as needed)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Performance optimizations
  reactStrictMode: true,

  // Experimental features
  experimental: {
    // Enable Server Actions
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
