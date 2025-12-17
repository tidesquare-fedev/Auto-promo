import { productMcp } from "@/mcp/product"

/**
 * 상품 ID 배열을 받아서 상품 정보를 조회하는 공통 함수
 * @param productIds 상품 ID 배열
 * @returns 정규화된 상품 배열
 */
export async function fetchProductsByIds(productIds: string[]): Promise<any[]> {
  if (!productIds || !Array.isArray(productIds)) {
    throw new Error("productIds는 배열이어야 합니다")
  }

  if (productIds.length === 0) {
    return []
  }

  try {
    // Product MCP를 통해 상품 조회
    const products = await productMcp.getProductsByIds(productIds)
    
    // 배열인지 확인
    if (!Array.isArray(products)) {
      console.error("예상치 못한 응답 형식:", typeof products)
      return []
    }
    
    return products
  } catch (error: any) {
    console.error("상품 조회 오류:", error)
    throw error
  }
}
