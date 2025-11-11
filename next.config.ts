import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.myshopify.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
    ],
  },
  // Enable strict mode for better error detection
  reactStrictMode: true,
  // Pin Turbopack root so Next doesn't mis-detect workspace root
  turbopack: {
    root: __dirname,
  },
}

export default nextConfig
