import { Review, ReviewListResponse } from "@/types/review"

/**
 * 상품 리뷰 조회 API
 * @param productCode 상품 코드 (prodCd)
 * @returns 리뷰 목록 (평점 5.0 이상, 최대 1개)
 */
export async function fetchProductReview(productCode: string): Promise<Review | null> {
  try {
    const response = await fetch("/api/reviews/list", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ productCode })
    })

    if (!response.ok) {
      console.error("리뷰 API 호출 실패:", response.status)
      return null
    }

    const data = await response.json()
    return data.review || null
  } catch (error) {
    console.error("리뷰 조회 오류:", error)
    return null
  }
}
