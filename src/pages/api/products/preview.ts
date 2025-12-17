import { NextApiRequest, NextApiResponse } from "next"
import { fetchProductsByIds } from "@/lib/api/products"

/**
 * 어드민용 상품 미리보기 API
 * 여러 상품 ID를 받아서 정규화된 상품 정보를 반환
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { productIds } = req.body

  if (!productIds || !Array.isArray(productIds)) {
    return res.status(400).json({ error: "Invalid productIds" })
  }

  try {
    // 공통 유틸리티를 통해 상품 조회
    const products = await fetchProductsByIds(productIds)
    
    // 배열인지 확인
    if (!Array.isArray(products)) {
      console.error("예상치 못한 응답 형식:", typeof products)
      return res.status(500).json({ error: "Invalid response format" })
    }
    
    res.setHeader("Content-Type", "application/json")
    res.json(products)
  } catch (error: any) {
    console.error("상품 조회 오류:", error)
    res.status(500).json({ 
      error: "Failed to fetch products",
      message: error?.message || "Unknown error"
    })
  }
}

