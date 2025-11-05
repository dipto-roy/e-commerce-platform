import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fix workspace root detection
  outputFileTracingRoot: '/home/dip-roy/e-commerce_project/e-commerce-frontend',
  
  // Environment variables validation
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Image optimization
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4002',
        pathname: '/api/v1/products/serve-image/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4002',
        pathname: '/api/v1/image-upload/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4002',
        pathname: '/api/v1/images/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4002',
        pathname: '/api/v1/uploads/**',
      },
    ],
  },

  // API routes configuration
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4002'}/:path*`,
      },
    ];
  },

  // CORS headers for development
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },

  // Performance optimizations
  experimental: {
    optimizeCss: true,
  },

  // Webpack configuration to fix module resolution
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Fix for client-side module resolution issues
      config.resolve.fallback = {
        ...config.resolve.fallback,
        buffer: require.resolve('buffer'),
        util: require.resolve('util'),
        url: require.resolve('url'),
        assert: require.resolve('assert'),
      };
    }
    return config;
  },
};

export default nextConfig;
