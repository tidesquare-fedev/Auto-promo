/**
 * Supabase 연결 테스트 API
 * http://localhost:3000/api/test-supabase
 */

import { supabase, initializationError } from "@/lib/supabase"

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { slug } = req.query

  try {
    // 환경 변수 확인
    const envCheck = {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 
        process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30) + "..." : null,
      keyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
      urlIsValid: process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith("https://") || false,
      keyIsValid: (process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0) > 50,
      nodeEnv: process.env.NODE_ENV
    }

    // Supabase 클라이언트 확인
    const clientCheck = {
      hasClient: !!supabase,
      clientType: typeof supabase,
      initializationError: initializationError ? {
        message: initializationError.message,
        name: initializationError.name
      } : null
    }

    // 테이블 존재 확인
    let tableCheck = null
    let pageCheck = null
    
    if (supabase) {
      try {
        // 테이블 접근 테스트
        const { data, error } = await supabase
          .from("citydirect_pages")
          .select("slug")
          .limit(1)

        tableCheck = {
          success: !error,
          error: error ? {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          } : null,
          dataCount: data?.length || 0
        }

        // 특정 slug 조회 (쿼리 파라미터가 있는 경우)
        if (slug && typeof slug === "string") {
          try {
            const { data: pageData, error: pageError } = await supabase
              .from("citydirect_pages")
              .select("*")
              .eq("slug", slug)
              .single()

            pageCheck = {
              found: !pageError && !!pageData,
              error: pageError ? {
                code: pageError.code,
                message: pageError.message
              } : null,
              page: pageData ? {
                slug: pageData.slug,
                status: pageData.status,
                city_code: pageData.city_code,
                has_content: !!pageData.content,
                content_length: Array.isArray(pageData.content) ? pageData.content.length : 0
              } : null
            }
          } catch (pageCheckError: any) {
            pageCheck = {
              found: false,
              error: {
                message: pageCheckError.message
              }
            }
          }
        }
      } catch (tableError: any) {
        tableCheck = {
          success: false,
          error: {
            message: tableError.message,
            stack: tableError.stack
          }
        }
      }
    }

    res.json({
      success: true,
      environment: envCheck,
      client: clientCheck,
      table: tableCheck,
      page: pageCheck,
      summary: {
        configured: envCheck.hasUrl && envCheck.hasKey,
        connected: !!supabase,
        tableAccessible: tableCheck?.success || false,
        pageFound: pageCheck?.found || false
      }
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    })
  }
}

