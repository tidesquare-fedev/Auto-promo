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

  // Supabase 연결 상태 확인 (디버깅용) - try 블록 밖에서 선언
  const supabaseStatus = {
    hasEnvUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasEnvKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    nodeEnv: process.env.NODE_ENV,
    urlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30),
    keyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length
  }

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
    
    // Supabase 초기화 상태 확인
    const { debugMemoryStore } = require("@/lib/db")
    const beforeDebug = debugMemoryStore()
    console.log("📊 저장 전 메모리 상태:", beforeDebug)
    
    // Supabase 연결 상태 로그
    console.log("🔍 Supabase 연결 상태 확인:", supabaseStatus)
    
    // Supabase 클라이언트 직접 확인
    try {
      const { supabase: directSupabase } = require("@/lib/supabase")
      console.log("🔍 Supabase 클라이언트 직접 확인:", {
        hasClient: !!directSupabase,
        clientType: typeof directSupabase,
        hasFrom: typeof directSupabase?.from === 'function'
      })
    } catch (supabaseCheckError: any) {
      console.warn("⚠️ Supabase 클라이언트 직접 확인 실패:", supabaseCheckError.message)
    }
    
    let saveSuccess = false
    let saveError: any = null
    let verificationResult: any = null

    try {
      await savePage(page)
      saveSuccess = true
      console.log("✅ savePage 호출 완료")
    } catch (error: any) {
      saveError = error
      console.error("❌ savePage 호출 실패:", error)
      throw error
    }
    
    // 저장 후 Supabase에 실제로 저장되었는지 확인 (프로덕션 환경에서만)
    const isProduction = process.env.NODE_ENV === "production"
    if (isProduction) {
      try {
        const { getPage } = require("@/lib/db")
        const savedPage = await getPage(page.slug)
        if (savedPage) {
          verificationResult = {
            success: true,
            slug: savedPage.slug,
            status: savedPage.status,
            storage: "Supabase"
          }
          console.log("✅ 저장 검증 성공 - Supabase에서 페이지 확인됨:", verificationResult)
        } else {
          verificationResult = {
            success: false,
            error: "Supabase에서 페이지를 찾을 수 없음",
            possibleCauses: [
              "Supabase 저장이 실패했지만 에러가 발생하지 않음",
              "RLS (Row Level Security) 정책 문제",
              "테이블 스키마 불일치"
            ]
          }
          console.error("❌ 저장 검증 실패:", verificationResult)
          throw new Error("저장 검증 실패: Supabase에서 페이지를 찾을 수 없습니다")
        }
      } catch (verifyError: any) {
        verificationResult = {
          success: false,
          error: verifyError.message
        }
        console.error("❌ 저장 검증 중 오류:", verifyError.message)
        throw verifyError
      }
    }
    
    // 저장 후 메모리 상태 확인 (Supabase 사용 시에는 의미 없지만 로그용)
    const afterDebug = debugMemoryStore()
    console.log("✅ 저장 완료:", page.slug)
    console.log("📊 저장 후 메모리 상태:", afterDebug)

    res.json({ 
      ok: true, 
      slug: page.slug,
      debug: {
        saveSuccess,
        verification: verificationResult,
        environment: isProduction ? "production" : "development",
        timestamp: new Date().toISOString()
      }
    })
  } catch (error: any) {
    console.error("페이지 저장 오류:", error)
    console.error("에러 스택:", error?.stack)
    
    // 상세한 에러 정보를 응답에 포함
    const errorResponse: any = {
      error: "페이지 저장 실패",
      message: error?.message || "Unknown error",
      debug: {
        slug: page?.slug,
        hasSeo: !!page?.seo,
        hasContent: !!page?.content,
        contentLength: page?.content?.length || 0,
        status: page?.status,
        timestamp: new Date().toISOString(),
        errorType: error?.constructor?.name,
        errorCode: error?.code,
        errorDetails: error?.details,
        errorHint: error?.hint
      }
    }

    // Supabase 관련 에러인 경우 추가 정보
    const isSupabaseError = error?.message?.includes("Supabase") || 
                           error?.message?.includes("RLS") ||
                           error?.message?.includes("프로덕션 환경에서는 Supabase") ||
                           error?.code?.startsWith("PGRST") ||
                           error?.code?.startsWith("42")
    
    if (isSupabaseError) {
      errorResponse.debug.supabaseError = true
      errorResponse.debug.supabaseErrorCode = error?.code
      errorResponse.debug.supabaseErrorMessage = error?.message
      errorResponse.debug.supabaseErrorDetails = error?.details
      errorResponse.debug.supabaseErrorHint = error?.hint
      errorResponse.debug.supabaseStatus = supabaseStatus
      errorResponse.debug.suggestions = [
        "Vercel Dashboard → Settings → Environment Variables에서 환경 변수 확인",
        "NEXT_PUBLIC_SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY가 올바르게 설정되었는지 확인",
        "환경 변수 이름이 정확한지 확인 (대소문자 구분)",
        "/api/test-supabase로 연결 테스트",
        "Supabase Dashboard → Authentication → Policies에서 Service role full access 정책 확인",
        "Supabase Dashboard → Table Editor에서 citydirect_pages 테이블이 존재하는지 확인"
      ]
      
      // 특정 에러 코드에 대한 구체적인 해결책
      if (error?.code === "42501" || error?.message?.includes("permission denied")) {
        errorResponse.debug.specificIssue = "RLS 정책 문제"
        errorResponse.debug.specificSolution = "Supabase Dashboard → Authentication → Policies에서 Service role full access 정책 확인"
      } else if (error?.code === "42P01" || error?.message?.includes("does not exist")) {
        errorResponse.debug.specificIssue = "테이블이 존재하지 않음"
        errorResponse.debug.specificSolution = "supabase/schema.sql 파일의 SQL을 Supabase SQL Editor에서 실행"
      }
    }

    res.status(500).json(errorResponse)
  }
}

