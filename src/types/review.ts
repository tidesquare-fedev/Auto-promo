// 리뷰 API 타입 정의
export interface ReviewImage {
  fileId: number
  imgSeq: number
  orgImgPath: string
}

export interface ReviewKeyword {
  keywordSeq: number
  keywordUpperCd: string
  keywordCd: string
  keywordNm: string
}

export interface Review {
  prodNm: string
  prodOptionNm: string
  reviewCont: string
  imageList: ReviewImage[]
  bestYn: string
  reviewScore?: number // 평점 (5.0 이상 필터링용)
  keywords?: ReviewKeyword[] | string[] // 리뷰 키워드 (API 응답에서 - 객체 배열 또는 문자열 배열)
  reviewKeywords?: ReviewKeyword[] | string[] // 리뷰 키워드 (API 응답에서, 대체 필드명)
  keywordList?: ReviewKeyword[] | string[] // 리뷰 키워드 (API 응답에서, 대체 필드명)
}

export interface ReviewListResponse {
  reviews?: Review[]
  data?: Review[]
  // API 응답 구조에 따라 추가 가능
}
