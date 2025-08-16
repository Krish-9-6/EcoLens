import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization configuration
  images: {
    // Enable image optimization
    formats: ['image/webp', 'image/avif'],
    // Configure image domains if needed for external images
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Optimize image sizes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Bundle optimization
  experimental: {
    // Enable optimized package imports
    optimizePackageImports: ['lucide-react', 'react-leaflet', 'framer-motion'],
  },
  
  // Turbopack configuration (stable)
  turbopack: {
    // Configure module resolution for Turbopack
    resolveAlias: {
      // Add any module aliases if needed
    },
  },
};

export default nextConfig;
