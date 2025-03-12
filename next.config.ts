/** @type {import('next').NextConfig} */
import type { NextConfig } from 'next'

const nextConfig:NextConfig = {
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
        hostname: "api.facesfactory.com", // Update this to your supabase url
      },
      {
        protocol: "https",
        hostname: "vjvlsiuqjfotifoyqivh.supabase.co", // Update this to your supabase url
      },
      {
        protocol: "https",
        hostname: "facesfactory.bb4be4706863711bab16632895c4fab3.r2.cloudflarestorage.com", // Update this to your supabase url
      },
    ],
  },
};

export default nextConfig;
