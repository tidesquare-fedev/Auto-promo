const ENV = process.env.NEXT_PUBLIC_APP_ENV || "development"
const isProd = ENV === "production"

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  typescript: {
    ignoreBuildErrors: true,
  },

  // basePath는 정적 경로만 가능 (동적 파라미터 [slug] 불가)
  // 파일 구조가 pages/marketing/citydirect/[slug].tsx 이므로 basePath 불필요
  // basePath: isProd ? "/marketing/citydirect" : "",

  images: {
    // 기존 도메인/포맷 설정 + 요청한 비최적화 옵션
    unoptimized: true,
    domains: [
      "dev-apollo-api.tidesquare.com",
      "api.tidesquare.com",
      // 추가 CDN 도메인
    ],
    formats: ["image/avif", "image/webp"],
  },

  // rewrites 불필요 (파일 구조가 이미 /marketing/citydirect/[slug].tsx로 되어 있음)

  // 필요한 값만 클라이언트에 노출 (env 파일로 관리)
  env: {
    NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  experimental: {
    serverActions: {
      allowedOrigins: [
        "d.tourvis.com",
        "tourvis.com", // 실제 도메인으로 변경
      ],
    },
  },
}

export default nextConfig

