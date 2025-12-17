/**
 * Supabase 연결 테스트 API
 * http://localhost:3000/api/test-supabase
 */

import { supabase } from "@/lib/supabase"

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    // 환경 변수 확인
    const envCheck = {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 
        process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30) + "..." : null,
      keyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0
    }

    // Supabase 클라이언트 확인
    const clientCheck = {
      hasClient: !!supabase,
      clientType: typeof supabase
    }

    // 테이블 존재 확인
    let tableCheck = null
    if (supabase) {
      try {
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
      summary: {
        configured: envCheck.hasUrl && envCheck.hasKey,
        connected: !!supabase,
        tableAccessible: tableCheck?.success || false
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

