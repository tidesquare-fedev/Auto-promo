import { NextApiRequest, NextApiResponse } from "next"
import { fetchProductsByIds } from "@/lib/api/products"

/**
 * 프론트엔드용 상품 조회 API
 * 여러 상품 ID를 받아서 정규화된 상품 정보를 반환
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const { productIds } = req.body

    if (!productIds || !Array.isArray(productIds)) {
      return res.status(400).json({ error: "productIds는 배열이어야 합니다" })
    }

    console.log("🔍 프론트엔드 상품 조회:", {
      count: productIds.length,
      ids: productIds
    })

    // 공통 유틸리티를 통해 상품 조회
    const products = await fetchProductsByIds(productIds)

    console.log("✅ 상품 조회 완료:", {
      requested: productIds.length,
      found: products.length
    })

    // Content-Type 명시
    res.setHeader("Content-Type", "application/json")
    return res.status(200).json(products)
  } catch (error: any) {
    console.error("상품 조회 오류:", error)
    return res.status(500).json({
      error: "상품 조회 실패",
      message: error?.message || "Unknown error"
    })
  }
}

