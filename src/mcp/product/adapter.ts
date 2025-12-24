import { TuttiProduct } from "@/types/tutti-api"
import { universalEnv } from "../../../env/universal"

// universalEnv에서 API 설정 가져오기
const TNA_API_BASE = universalEnv.apiBaseUrl.tna
const TNA_API_AUTH = universalEnv.apiAuth.tna || ""

// 디버깅: 환경 변수 확인
console.log("🔧 adapter.ts 초기화:", {
  tnaApiBase: TNA_API_BASE,
  hasTnaAuth: !!TNA_API_AUTH,
  tnaAuthPrefix: TNA_API_AUTH ? TNA_API_AUTH.substring(0, 20) + "..." : "없음",
  envTourvisApiKey: process.env.TOURVIS_API_KEY ? "설정됨" : "미설정",
  envTourvisApiKeyLength: process.env.TOURVIS_API_KEY?.length || 0,
  envTnaApiAuth: process.env.TNA_API_AUTH ? "설정됨" : "미설정",
  nodeEnv: process.env.NODE_ENV,
  appEnv: process.env.NEXT_PUBLIC_APP_ENV,
  brand: process.env.NEXT_PUBLIC_APP_BRAND
})

export type CitySearchResult = {
  id: string
  city: string
  nation: string
  aliases: string
}

export async function searchCities(keyword: string): Promise<CitySearchResult[]> {
  if (!keyword || keyword.trim().length === 0) {
    return []
  }

  try {
    const url = `${TNA_API_BASE}/rest/area/city?keyword=${encodeURIComponent(keyword)}&count=10`
    
    console.log("🔍 도시 검색 API 호출:", {
      url,
      keyword,
      base: TNA_API_BASE,
      hasAuth: !!TNA_API_AUTH,
      authHeader: TNA_API_AUTH ? TNA_API_AUTH.substring(0, 30) + "..." : "없음"
    })
    
    const res = await fetch(url, {
      method: "GET",
      headers: {
        ...(TNA_API_AUTH ? { Authorization: TNA_API_AUTH } : {}),
        "Content-Type": "application/json"
      }
    })

    if (!res.ok) {
      const errorText = await res.text().catch(() => "응답 본문 읽기 실패")
      console.error(`도시 검색 API 오류: ${res.status} ${res.statusText}`, {
        url,
        status: res.status,
        statusText: res.statusText,
        errorResponse: errorText.substring(0, 200),
        hasAuth: !!TNA_API_AUTH,
        authPrefix: TNA_API_AUTH ? TNA_API_AUTH.substring(0, 20) : "없음"
      })
      return []
    }

    const contentType = res.headers.get("content-type") || ""
    if (!contentType.includes("application/json")) {
      console.error(`도시 검색 API가 JSON이 아닌 응답 반환: ${contentType}`)
      return []
    }

    const data = await res.json()
    
    console.log("📦 도시 검색 API 원본 응답:", JSON.stringify(data, null, 2))
    
    // 응답 형식: { total, offset, count, list: [...] }
    if (data.list && Array.isArray(data.list)) {
      console.log(`✅ 도시 검색 완료: ${data.total}개 결과`)
      console.log("도시 목록:", data.list.map((c: any) => c.city).join(", "))
      return data.list
    }
    
    console.warn("⚠️ 예상하지 못한 응답 형식:", Object.keys(data))
    return []
  } catch (error) {
    console.error("도시 검색 API 호출 실패:", error)
    return []
  }
}

export async function fetchProducts(productIds: string[]): Promise<TuttiProduct[]> {
  if (!productIds || productIds.length === 0) {
    return []
  }

  try {
    // TNA API 엔드포인트: GET /rest/product/_search?product_ids=...
    // https://s-apiactivity.tourvis.com/tna-api-v2/swagger-ui/
    // 여러 상품 ID는 쉼표로 구분하여 전달
    const productIdsParam = productIds.join(",")
    const url = `${TNA_API_BASE}/rest/product/_search?product_ids=${encodeURIComponent(productIdsParam)}`
    
    console.log("🔍 TNA API 호출:", url)
    
    const res = await fetch(url, {
      method: "GET",
      headers: {
        ...(TNA_API_AUTH ? { Authorization: TNA_API_AUTH } : {}),
        "Content-Type": "application/json"
      }
    })

    // Content-Type 확인
    const contentType = res.headers.get("content-type") || ""
    
    if (!res.ok) {
      console.error(`TNA API 오류: ${res.status} ${res.statusText}`)
      const errorText = await res.text()
      console.error(`응답 내용:`, errorText.substring(0, 200))
      return []
    }

    // HTML 응답인 경우 (404 페이지 등)
    if (!contentType.includes("application/json")) {
      console.error(`TNA API가 JSON이 아닌 응답 반환: ${contentType}`)
      const text = await res.text()
      console.error(`응답 내용 (처음 200자):`, text.substring(0, 200))
      return []
    }

    let data
    try {
      data = await res.json()
    } catch (jsonError) {
      console.error("JSON 파싱 실패:", jsonError)
      const text = await res.text()
      console.error("응답 내용:", text.substring(0, 200))
      return []
    }
    
    // 응답 형식에 따라 조정
    // TNA API 응답 구조 확인
    let products: TuttiProduct[] = []
    
    if (Array.isArray(data)) {
      products = data
    } else if (data.list && Array.isArray(data.list)) {
      // TNA API 실제 응답 형식: { total, offset, count, list: [...] }
      products = data.list
    } else if (data.data && Array.isArray(data.data)) {
      products = data.data
    } else if (data.products && Array.isArray(data.products)) {
      products = data.products
    } else if (data.content && Array.isArray(data.content)) {
      products = data.content
    } else if (data.hits && data.hits.hits && Array.isArray(data.hits.hits)) {
      // Elasticsearch 형식: hits.hits 배열에서 _source 추출
      products = data.hits.hits.map((hit: any) => hit._source || hit)
    } else {
      console.warn("⚠️ 알 수 없는 응답 형식:", Object.keys(data))
      return []
    }
    
    // 응답 구조 로깅 (첫 번째 상품만)
    if (products.length > 0) {
      const firstProduct = products[0]
      console.log("📦 TNA API 응답 구조 (첫 번째 상품):", {
        keys: Object.keys(firstProduct),
        hasName: "name" in firstProduct,
        hasSoldOut: "sold_out" in firstProduct,
        hasDisplayPrice: "display_price" in firstProduct,
        hasDisplayImages: "display_images" in firstProduct,
        hasAreas: "areas" in firstProduct,
        hasReviewScore: "review_score" in firstProduct,
        hasClosed: "closed" in firstProduct
      })
    }
    
    return products
  } catch (error) {
    console.error("TNA API 호출 실패:", error)
    return []
  }
}

