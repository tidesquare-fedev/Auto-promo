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
    await res.revalidate(`/marketing/citydirect/${slug}`)
    
    res.json({ 
      revalidated: true, 
      slug,
      message: "페이지가 즉시 재검증되었습니다"
    })
  } catch (error: any) {
    console.error("재검증 오류:", error)
    res.status(500).json({ 
      error: "재검증 실패",
      message: error?.message 
    })
  }
}

