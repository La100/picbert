/** @type {import('next').NextConfig} */
import type { NextConfig } from 'next'

const nextConfig:NextConfig = {
  output: 'standalone',
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
    turbo: {
      resolveAlias: {
        // Add any custom module resolutions if needed
      },
    },
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "v3.fal.media",
      },
      {
        protocol: "https",
        hostname: "fal.media",
      },
      {
        protocol: "https",
        hostname: "vjvlsiuqjfotifoyqivh.supabase.co", // Update this to your supabase url
      },
      {
        protocol: "https",
        hostname: "api.facesfactory.com",
      },
    ],
  },
};

export default nextConfig;
