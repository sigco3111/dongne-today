import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  // External API 도메인 (next/image 사용 시)
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'static.toss.im' },
    ],
  },
  // 헤더 (CORS, 캐싱)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default config;
