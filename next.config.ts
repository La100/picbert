/** @type {import('next').NextConfig} */
import type { NextConfig } from 'next'

const nextConfig:NextConfig = {
  async redirects() {
    const pausedDestination = '/?service=paused'

    return [
      '/api/:path*',
      '/auth/:path*',
      '/login',
      '/reset-password',
      '/dashboard/:path*',
      '/image-generation/:path*',
      '/video-generation/:path*',
      '/video-library/:path*',
      '/gallery/:path*',
      '/billing/:path*',
      '/account-settings/:path*',
      '/requests-history/:path*',
    ].map((source) => ({
      source,
      destination: pausedDestination,
      permanent: false,
    }))
  },
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
        hostname: "bucket.facesfactory.com", // Update this to your supabase url
      },
    ],
  },
};

export default nextConfig;
