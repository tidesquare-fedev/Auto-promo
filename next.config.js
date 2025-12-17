/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // 이미지 최적화 (TNA API 이미지)
  images: {
    domains: [
      'dev-apollo-api.tidesquare.com',
      'api.tidesquare.com',
      // 추가 CDN 도메인
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // ISR 설정
  async rewrites() {
    return [
      {
        source: '/marketing/citydirect/:slug',
        destination: '/marketing/citydirect/:slug',
      },
    ]
  },

  // 환경 변수 공개 범위
  env: {
    API_BASE: process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}/api`
      : 'http://localhost:3000/api',
  },

  // 빌드 최적화
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

module.exports = nextConfig

