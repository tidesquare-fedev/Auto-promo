// TNA API 타입 정의 (실제 응답 구조 기반)
export interface TNAProductArea {
  scope: "city" | "state" | "country"
  id: string
  name: string
  nation_code: string
  count: number
  parent?: TNAProductArea
}

export interface TNAProductDisplayPrice {
  price1: number | null
  price2: number | null
  price3: number | null
  dc_rate: number | null
  dc_coupon: boolean
}

export interface TNAProductDisplayImage {
  origin: string
  og?: string
  thumbnail?: string
}

// TNA API 실제 응답 구조
export interface TuttiProduct {
  // 기본 정보
  product_id?: string // TNA API 실제 필드명
  productId?: string
  id?: string
  name: string
  sub_name?: string // 서브 타이틀
  
  // 재고 정보
  sold_out: boolean
  
  // 지역 정보
  areas?: TNAProductArea[]
  
  // 가격 정보
  display_price?: TNAProductDisplayPrice
  
  // 이미지 정보
  display_images?: TNAProductDisplayImage[]
  primary_image?: TNAProductDisplayImage // TNA API 대표 이미지
  
  // 리뷰 정보
  review_score?: number
  review_count?: number
  review_keywords?: string[] // 리뷰 키워드
  review?: {
    review_score?: number
    review_count?: number
    review_keywords?: string[]
  }
  
  // 상품 상태
  closed: boolean
  
  // 기타 (하위 호환성)
  productName?: string
  price?: {
    amount: number
    currency: string
  }
  images?: string[]
  stock?: number
  description?: string
  category?: string
  brand?: string
}

export interface TuttiProductResponse {
  products: TuttiProduct[]
  total: number
}

// 정규화된 상품 정보 (프론트엔드 표시용)
export interface NormalizedProduct {
  id: string
  name: string
  subName?: string // 서브 타이틀
  price?: number
  currency?: string
  thumbnail?: string
  ogImage?: string
  soldOut: boolean
  description?: string
  // 추가 필드
  region?: string // 지역 정보 (예: "경상북도 구미시")
  reviewScore?: number
  reviewCount?: number
  reviewKeywords?: string[] // 리뷰 키워드
  isClosed: boolean
}

