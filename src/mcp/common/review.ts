import { Review } from "@/types/review"

const REVIEW_API_BASE = process.env.REVIEW_API_BASE || "https://dapi.tourvis.com"
const REVIEW_LIST_PATH = "/api/review/reviewList"

export type ReviewListParams = {
  productCode: string
  limit?: number
  offset?: number
  brand?: string
  prodCat?: string
  bestYn?: "Y" | "N"
}

// Swagger 기반 리뷰 조회 (reviewListUsingPOST)
export async function fetchReviewList({
  productCode,
  limit = 4,
  offset = 0,
  brand = "TOURVIS",
  prodCat = "TNT",
  bestYn = "Y"
}: ReviewListParams): Promise<Review[]> {
  if (!productCode) {
    throw new Error("productCode는 필수입니다.")
  }

  const url = `${REVIEW_API_BASE}${REVIEW_LIST_PATH}`

  const body = {
    brand,
    prodCat,
    prodCd: productCode,
    bestYn,
    limit,
    offset
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`리뷰 API 호출 실패 (${res.status}): ${text.substring(0, 200)}`)
  }

  const data = await res.json()

  // 응답에서 리뷰 배열 추출 (여러 형태 대응)
  let reviews: any[] = []
  if (Array.isArray(data)) {
    reviews = data
  } else if (Array.isArray(data.reviews)) {
    reviews = data.reviews
  } else if (Array.isArray(data.data)) {
    reviews = data.data
  } else if (Array.isArray(data.list)) {
    reviews = data.list
  } else if (Array.isArray(data.items)) {
    reviews = data.items
  }

  if (!reviews || reviews.length === 0) {
    return []
  }

  return reviews.slice(0, limit) as Review[]
}

