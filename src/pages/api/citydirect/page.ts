import { designMcp } from "@/mcp/design"
import { savePage, getPage } from "@/lib/db"

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const page = req.body

  console.log("📝 페이지 저장 요청:", {
    slug: page?.slug,
    cityCode: page?.cityCode,
    status: page?.status,
    contentLength: page?.content?.length,
    hasSeo: !!page?.seo
  })

  try {
    // 필수 필드 검증
    if (!page) {
      return res.status(400).json({ error: "페이지 데이터가 없습니다" })
    }
    if (!page.slug) {
      return res.status(400).json({ error: "페이지 slug는 필수입니다" })
    }
    if (!page.seo) {
      return res.status(400).json({ error: "페이지 seo는 필수입니다" })
    }

    // Draft·Publish 권한 분리: PUBLISHED 상태의 페이지는 수정 불가
    if (page.slug) {
      try {
        const existingPage = await getPage(page.slug)
        if (existingPage && existingPage.status === "PUBLISHED") {
          return res.status(403).json({
            error: "발행된 페이지는 수정할 수 없습니다. 먼저 초안으로 변경하세요."
          })
        }
      } catch (dbError: any) {
        console.error("페이지 조회 오류:", dbError)
        // 조회 실패해도 새 페이지 생성은 계속 진행
      }
    }

    // Design MCP 검증 (우회 없음)
    try {
      designMcp.validatePage(page)
      console.log("✅ Design MCP 검증 통과")
    } catch (error: any) {
      console.error("❌ Design MCP 검증 실패:", error.message)
      return res.status(400).json({ error: error.message })
    }

    // 페이지 저장
    console.log("💾 저장 시작...")
    console.log("📝 저장할 페이지 데이터:", {
      slug: page.slug,
      cityCode: page.cityCode,
      status: page.status,
      contentLength: page.content?.length,
      hasSeo: !!page.seo,
      timestamp: new Date().toISOString()
    })
    
    // 저장 전 메모리 상태 확인
    const { debugMemoryStore } = require("@/lib/db")
    const beforeDebug = debugMemoryStore()
    console.log("📊 저장 전 메모리 상태:", beforeDebug)
    
    try {
      await savePage(page)
      console.log("✅ savePage 호출 완료")
    } catch (saveError: any) {
      console.error("❌ savePage 호출 실패:", saveError)
      throw saveError
    }
    
    // 저장 후 Supabase에 실제로 저장되었는지 확인 (프로덕션 환경에서만)
    const isProduction = process.env.NODE_ENV === "production"
    if (isProduction) {
      try {
        const { getPage } = require("@/lib/db")
        const savedPage = await getPage(page.slug)
        if (savedPage) {
          console.log("✅ 저장 검증 성공 - Supabase에서 페이지 확인됨:", {
            slug: savedPage.slug,
            status: savedPage.status,
            storage: "Supabase"
          })
        } else {
          console.error("❌ 저장 검증 실패 - Supabase에서 페이지를 찾을 수 없음!")
          console.error("💡 가능한 원인:")
          console.error("  1. Supabase 저장이 실패했지만 에러가 발생하지 않음")
          console.error("  2. RLS (Row Level Security) 정책 문제")
          console.error("  3. 테이블 스키마 불일치")
          throw new Error("저장 검증 실패: Supabase에서 페이지를 찾을 수 없습니다")
        }
      } catch (verifyError: any) {
        console.error("❌ 저장 검증 중 오류:", verifyError.message)
        throw verifyError
      }
    }
    
    // 저장 후 메모리 상태 확인 (Supabase 사용 시에는 의미 없지만 로그용)
    const afterDebug = debugMemoryStore()
    console.log("✅ 저장 완료:", page.slug)
    console.log("📊 저장 후 메모리 상태:", afterDebug)

    res.json({ ok: true, slug: page.slug })
  } catch (error: any) {
    console.error("페이지 저장 오류:", error)
    res.status(500).json({ 
      error: "페이지 저장 실패",
      message: error?.message || "Unknown error"
    })
  }
}

