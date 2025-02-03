/** @type {import('next').NextConfig} */
import type { NextConfig } from 'next'

const nextConfig:NextConfig = {
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
  images: {
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
    ],
  },
};

export default nextConfig;
