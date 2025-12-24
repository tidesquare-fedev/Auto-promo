import { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { productCode } = req.body

  if (!productCode) {
    return res.status(400).json({ error: "productCode is required" })
  }

  try {
    const response = await fetch("https://dapi.tourvis.com/api/review/reviewList", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        brand: "TOURVIS",
        prodCat: "TNT",
        prodCd: productCode,
        bestYn: "Y",
        limit: 10,
        offset: 0
      })
    })

    if (!response.ok) {
      console.error("리뷰 API 호출 실패:", response.status)
      return res.status(response.status).json({ error: "리뷰 API 호출 실패" })
    }

    const data = await response.json()
    
    console.log("리뷰 API 응답 구조:", {
      hasReviews: !!data.reviews,
      hasData: !!data.data,
      isArray: Array.isArray(data),
      keys: Object.keys(data),
      sample: JSON.stringify(data).substring(0, 500)
    })
    
    // 응답 구조에 따라 reviews 또는 data에서 가져오기
    // 응답이 배열일 수도 있고, 객체 안에 배열이 있을 수도 있음
    let reviews: any[] = []
    
    if (Array.isArray(data)) {
      reviews = data
    } else if (Array.isArray(data.reviews)) {
      reviews = data.reviews
    } else if (Array.isArray(data.data)) {
      reviews = data.data
    } else if (data.list && Array.isArray(data.list)) {
      reviews = data.list
    } else if (data.items && Array.isArray(data.items)) {
      reviews = data.items
    }
    
    console.log("추출된 리뷰 개수:", reviews.length)
    
    if (!Array.isArray(reviews) || reviews.length === 0) {
      console.log("리뷰가 없습니다")
      return res.status(200).json({ review: null })
    }
    
    // 평점 5.0 이상인 리뷰만 필터링
    // bestYn이 "Y"로 요청했으므로 모든 리뷰가 베스트 리뷰일 가능성이 높음
    let filteredReview = reviews.find((review: any) => {
      // reviewScore 필드가 있으면 5.0 이상인 것만
      if (review.reviewScore !== undefined && review.reviewScore !== null) {
        const score = Number(review.reviewScore)
        if (!isNaN(score)) {
          return score >= 5.0
        }
      }
      // reviewScore가 없으면 bestYn이 "Y"인 것 (이미 bestYn="Y"로 요청했으므로)
      return review.bestYn === "Y" || review.bestYn === true || review.bestYn === "true"
    })

    // 필터링된 리뷰가 없으면 첫 번째 리뷰 사용 (bestYn="Y"로 요청했으므로 모두 베스트 리뷰)
    if (!filteredReview && reviews.length > 0) {
      filteredReview = reviews[0]
      console.log("필터링된 리뷰가 없어 첫 번째 리뷰 사용")
    }

    console.log("최종 리뷰:", filteredReview ? {
      prodNm: filteredReview.prodNm,
      hasImage: !!(filteredReview.imageList && filteredReview.imageList.length > 0),
      reviewScore: filteredReview.reviewScore,
      bestYn: filteredReview.bestYn
    } : "없음")
    
    return res.status(200).json({ review: filteredReview || null })
  } catch (error: any) {
    console.error("리뷰 조회 오류:", error)
    return res.status(500).json({ error: error.message || "리뷰 조회 중 오류가 발생했습니다" })
  }
}
