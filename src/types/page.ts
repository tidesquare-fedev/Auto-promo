export type PageStatus = "DRAFT" | "PUBLISHED"

export type SeoMeta = {
  title: string
  description: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  index: boolean
}

// 섹션 스타일 공통 타입
export type SectionStyle = {
  backgroundColor?: string
  titleColor?: string
  titleSize?: "sm" | "base" | "lg" | "xl" | "2xl" | "3xl"
  textColor?: string
  textSize?: "sm" | "base" | "lg" | "xl"
}

export type ProductBadge = {
  text?: string
  backgroundColor?: string
  textColor?: string
  borderColor?: string
}

export type ProductBadgeItem = ProductBadge & {
  id: string
  targets?: string[]  // 없거나 빈 배열이면 전체 상품에 적용
}

export type HeroSection = {
  type: "Hero"
  title: string
  subtitle?: string
  image?: string
  style?: SectionStyle
}

export type IntroTextSection = {
  type: "IntroText"
  title: string
  description: string
  style?: SectionStyle
}

export type ProductGridSection = {
  type: "ProductGrid"
  title: string
  productIds: string[]
  columns?: 1 | 2 | 3 | 4  // 한 줄에 표시할 상품 개수 (기본값: 4)
  style?: SectionStyle
  // 신규: 다중 뱃지
  badges?: ProductBadgeItem[]
  // 구버전 호환 (단일 뱃지)
  badge?: ProductBadge
  badgeTargets?: string[]
}

export type ProductTabsSection = {
  type: "ProductTabs"
  title?: string  // 섹션 전체 제목 (선택)
  tabs: Array<{
    id: string
    label: string  // 탭 이름 (예: "인기 상품", "신상품", "특가")
    productIds: string[]
  }>
  columns?: 1 | 2 | 3 | 4  // 한 줄에 표시할 상품 개수
  style?: SectionStyle
  // 신규: 다중 뱃지
  badges?: ProductBadgeItem[]
  // 구버전 호환 (단일 뱃지)
  badge?: ProductBadge
  badgeTargets?: string[]
}

export type FAQSection = {
  type: "FAQ"
  title?: string
  items: { q: string; a: string }[]
  style?: SectionStyle
}

export type ImageCarouselSection = {
  type: "ImageCarousel"
  title?: string
  slides: Array<{
    id: string
    image: string
    title?: string
    description?: string
  }>
  imageHeight?: "small" | "medium" | "large" | "xlarge" | "custom"
  customHeight?: number // imageHeight가 "custom"일 때 사용 (px 단위)
  customWidth?: number // imageHeight가 "custom"일 때 사용 (px 단위)
  style?: SectionStyle
}

export type PageSection =
  | HeroSection
  | IntroTextSection
  | ProductGridSection
  | ProductTabsSection
  | FAQSection
  | ImageCarouselSection

export type CityInfo = {
  id: string      // city master ID
  name: string    // 도시명
  nation?: string // 국가명 (표시용)
}

export type CityDirectPage = {
  slug: string
  cityCode: string  // 하위 호환성을 위해 유지
  cities?: CityInfo[]  // 여러 도시 지원 (새로운 방식)
  // 하위 호환성을 위해 유지
  cityMasterId?: string  
  cityName?: string
  status: PageStatus
  seo: SeoMeta
  content: PageSection[]
  createdAt?: string | null
  updatedAt?: string | null
  publishedAt?: string | null
}

