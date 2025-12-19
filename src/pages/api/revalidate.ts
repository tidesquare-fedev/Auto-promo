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
    
    // Next.js 13+ revalidate API 사용
    await res.revalidate(path)
    
    console.log("✅ 재검증 성공:", slug)
    
    // 추가: 캐시 헤더 설정으로 브라우저 캐시도 무효화
    res.setHeader('Cache-Control', 'no-store, must-revalidate')
    
    res.json({ 
      revalidated: true, 
      slug,
      path,
      message: "페이지가 즉시 재검증되었습니다",
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error("❌ 재검증 오류:", error)
    console.error("에러 상세:", {
      message: error?.message,
      stack: error?.stack,
      slug,
      errorCode: error?.code
    })
    
    // Vercel에서 revalidate가 실패할 수 있으므로 경고만 하고 성공으로 처리
    // (fallback: "blocking"이 있으면 다음 요청 시 자동으로 생성됨)
    res.status(200).json({ 
      revalidated: false,
      slug,
      warning: "재검증 실패했지만 다음 요청 시 자동으로 생성됩니다",
      error: error?.message,
      suggestion: "페이지가 Supabase에 저장되었는지 확인하세요. /api/test-supabase로 연결을 테스트할 수 있습니다."
    })
  }
}

