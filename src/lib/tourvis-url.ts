/**
 * 투어비스 URL 유틸리티
 */

/**
 * 환경에 따른 투어비스 도메인 반환
 * - development: d.tourvis.com (개발)
 * - production: tourvis.com (운영)
 * 
 * 환경 변수 우선순위:
 * 1. NEXT_PUBLIC_TOURVIS_ENV (명시적 설정)
 * 2. NODE_ENV (기본값)
 */
export function getTourvisDomain(): string {
  // 명시적으로 설정된 환경 변수 우선 사용
  const tourvisEnv = process.env.NEXT_PUBLIC_TOURVIS_ENV
  
  // 명시적 설정이 없으면 NODE_ENV 사용
  const env = tourvisEnv || process.env.NODE_ENV || 'development'
  
  // production이면 운영, 그 외는 개발
  return env === 'production'
    ? 'https://tourvis.com' 
    : 'https://d.tourvis.com'
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
    tourvisEnv: process.env.NEXT_PUBLIC_TOURVIS_ENV || 'not set',
    nodeEnv: process.env.NODE_ENV || 'not set',
    domain: getTourvisDomain()
  }
}
