import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Initialize next-intl plugin with custom i18n request path
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  /* config options here */

  // Environment variables available to the client
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },

  // Internationalization is handled by next-intl middleware and plugin
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

export default withNextIntl(nextConfig);
