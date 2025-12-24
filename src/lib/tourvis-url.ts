/**
 * 투어비스 URL 유틸리티
 */

/**
 * 환경에 따른 투어비스 도메인 반환
 * - development: d.tourvis.com (개발)
 * - production: tourvis.com (운영)
 * 
 * 환경 변수 우선순위:
 * 1. NEXT_PUBLIC_APP_ENV (명시적 설정: development/production)
 * 2. NODE_ENV (기본값)
 */
export function getTourvisDomain(): string {
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV
  const env = appEnv || process.env.NODE_ENV || "development"
  return env === "production"
    ? "https://tourvis.com"
    : "https://d.tourvis.com"
}

/**
 * 상품 상세 페이지 URL 생성
 * @param productId 상품 ID (예: GPRD2001366002)
 */
export function getProductUrl(productId: string): string {
  const domain = getTourvisDomain()
  return `${domain}/activity/product/${productId}`
}

/**
 * 현재 환경 확인 (디버깅용)
 */
export function getEnvironmentInfo() {
  return {
    appEnv: process.env.NEXT_PUBLIC_APP_ENV || "not set",
    nodeEnv: process.env.NODE_ENV || "not set",
    domain: getTourvisDomain(),
  }
}
