/**
 * ISR (Incremental Static Regeneration) 재검증 API
 * 페이지 저장 후 프론트엔드 캐시 갱신용
 */

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { slug } = req.body

  if (!slug) {
    return res.status(400).json({ error: "slug is required" })
  }

  try {
    console.log("🔄 페이지 재검증 요청:", slug)
    
    // ISR 재검증 실행
    const path = `/marketing/citydirect/${slug}`
    console.log("📝 재검증 경로:", path)
    
    await res.revalidate(path)
    
    console.log("✅ 재검증 성공:", slug)
    
    res.json({ 
      revalidated: true, 
      slug,
      path,
      message: "페이지가 즉시 재검증되었습니다"
    })
  } catch (error: any) {
    console.error("❌ 재검증 오류:", error)
    console.error("에러 상세:", {
      message: error?.message,
      stack: error?.stack,
      slug
    })
    
    // Vercel에서 revalidate가 실패할 수 있으므로 경고만 하고 성공으로 처리
    // (fallback: "blocking"이 있으면 다음 요청 시 자동으로 생성됨)
    res.status(200).json({ 
      revalidated: false,
      slug,
      warning: "재검증 실패했지만 다음 요청 시 자동으로 생성됩니다",
      error: error?.message 
    })
  }
}

