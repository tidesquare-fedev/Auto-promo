import { TuttiProduct, NormalizedProduct } from "@/types/tutti-api"

export function normalizeProduct(p: TuttiProduct): NormalizedProduct {
  // 상품 ID 추출 (응답에서 productId, id, 또는 다른 필드 확인)
  const productId = p.productId || p.id || (p as any).product_id || ""
  
  // 상품명 추출
  const productName = p.name || p.productName || (p as any).product_name || ""
  
  // 가격 추출 (display_price.price2 우선, 없으면 기존 price)
  const price = p.display_price?.price2 ?? p.price?.amount
  
  // 대표 이미지 추출 (primary_image 우선, display_images[0], 없으면 기존 images)
  const thumbnail = p.primary_image?.origin || p.display_images?.[0]?.origin || p.images?.[0]
  
  // OG 이미지 추출
  const ogImage = p.primary_image?.og || p.display_images?.[0]?.og
  
  // 재고 여부 (sold_out이 false면 재고 있음)
  const soldOut = p.sold_out === true
  
  // 지역 정보 추출
  // areas 배열의 첫 번째 항목(city)에서 city name만 추출
  let region: string | undefined
  
  if (p.areas && Array.isArray(p.areas) && p.areas.length > 0) {
    const firstArea = p.areas[0] // 첫 번째 항목 (보통 city)
    
    if (firstArea.scope === "city") {
      region = firstArea.name // city name만 표시 (예: "하바나")
    } else {
      // city가 아닌 경우 해당 영역의 이름 사용
      region = firstArea.name
    }
  }
  
  // 리뷰 정보 (review 객체 또는 직접 필드에서 추출)
  const reviewScore = p.review?.review_score ?? p.review_score
  const reviewCount = p.review?.review_count ?? p.review_count
  const reviewKeywords = p.review?.review_keywords ?? p.review_keywords
  
  // 서브 타이틀
  const subName = p.sub_name
  
  // 상품 여부 (closed가 false면 상품임)
  const isClosed = p.closed === true
  
  return {
    id: productId,
    name: productName,
    subName: subName,
    price: price ?? undefined,
    currency: p.price?.currency || "원",
    thumbnail: thumbnail,
    ogImage: ogImage,
    soldOut: soldOut,
    description: p.description,
    region: region,
    reviewScore: reviewScore,
    reviewCount: reviewCount,
    reviewKeywords: reviewKeywords,
    isClosed: isClosed
  }
}

