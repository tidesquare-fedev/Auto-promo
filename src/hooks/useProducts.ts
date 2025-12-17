import { useState, useEffect } from "react"

export interface UseProductsResult {
  products: any[]
  loading: boolean
  error: string | null
}

/**
 * 상품 ID 배열을 받아서 상품 정보를 조회하는 커스텀 훅
 * @param productIds 상품 ID 배열
 * @param apiEndpoint API 엔드포인트 (기본값: "/api/products/by-ids")
 * @returns { products, loading, error }
 */
export function useProducts(
  productIds: string[],
  apiEndpoint: string = "/api/products/by-ids"
): UseProductsResult {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (productIds.length === 0) {
      setProducts([])
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    fetch(apiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productIds })
    })
      .then(async (res) => {
        // Content-Type 확인 (어드민용 preview API의 경우)
        const contentType = res.headers.get("content-type") || ""
        
        if (!res.ok) {
          const errorText = await res.text()
          console.error("상품 조회 실패:", res.status, errorText.substring(0, 100))
          throw new Error(`상품 조회 실패: ${res.status}`)
        }

        // JSON 응답인지 확인
        if (!contentType.includes("application/json")) {
          const text = await res.text()
          console.error("JSON이 아닌 응답:", text.substring(0, 100))
          throw new Error("JSON이 아닌 응답을 받았습니다")
        }

        return await res.json()
      })
      .then(data => {
        // 배열인지 확인
        if (Array.isArray(data)) {
          setProducts(data)
        } else {
          console.error("예상치 못한 응답 형식:", data)
          setProducts([])
          throw new Error("응답이 배열 형식이 아닙니다")
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error("상품 조회 오류:", err)
        setError(err.message || "상품 조회 중 오류가 발생했습니다")
        setProducts([])
        setLoading(false)
      })
  }, [productIds.join(","), apiEndpoint])

  return { products, loading, error }
}
