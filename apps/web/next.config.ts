import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@lade/shared', '@lade/database', '@lade/config', '@lade/services', '@lade/ai-core'],
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'X-DNS-Prefetch-Control', value: 'on' },
      ],
    },
  ],
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
