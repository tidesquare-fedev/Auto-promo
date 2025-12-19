import { createClient } from "@supabase/supabase-js"
import { CityDirectPage } from "@/types/page"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

console.log("🔍 Supabase 환경 변수 확인:", {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseKey,
  urlLength: supabaseUrl.length,
  keyLength: supabaseKey.length,
  urlPrefix: supabaseUrl.substring(0, 20) + "...",
  keyPrefix: supabaseKey.substring(0, 20) + "..."
})

// Supabase 클라이언트 초기화
let supabase: any = null

if (supabaseUrl && supabaseKey) {
  try {
    console.log("🔧 Supabase 클라이언트 생성 시도...")
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
    
    console.log("✅ Supabase 클라이언트 생성 완료:", {
      hasClient: !!supabase,
      clientType: typeof supabase,
      hasFrom: typeof supabase?.from === 'function'
    })
  } catch (error: any) {
    console.error("❌ Supabase 클라이언트 생성 실패:", error)
    console.error("에러 상세:", error.message, error.stack)
    supabase = null
  }
} else {
  console.warn("⚠️ Supabase 환경 변수가 설정되지 않았습니다")
  if (!supabaseUrl) {
    console.warn("  - NEXT_PUBLIC_SUPABASE_URL 없음")
  }
  if (!supabaseKey) {
    console.warn("  - SUPABASE_SERVICE_ROLE_KEY 없음")
  }
}

export { supabase }

/**
 * Supabase PostgreSQL을 사용한 영구 저장소
 * 
 * 테이블 스키마:
 * - citydirect_pages 테이블에 페이지 저장
 * - JSON 타입으로 content, seo 저장
 */

export async function savePage(page: CityDirectPage): Promise<void> {
  if (!supabase) {
    console.error("❌ Supabase 클라이언트가 초기화되지 않았습니다")
    throw new Error("Supabase 클라이언트가 초기화되지 않았습니다")
  }

  const now = new Date().toISOString()
  
  const pageData = {
    slug: page.slug,
    city_code: page.cityCode,
    status: page.status,
    seo: page.seo,
    content: page.content,
    created_at: page.createdAt || now,
    updated_at: now,
    published_at: page.status === "PUBLISHED" ? (page.publishedAt || now) : null,
  }

  console.log("📤 Supabase 저장 시도:", {
    slug: pageData.slug,
    table: "citydirect_pages"
  })

  const { data, error } = await supabase
    .from("citydirect_pages")
    .upsert(pageData, {
      onConflict: "slug",
    })
    .select()

  if (error) {
    console.error("❌ Supabase save error:", error)
    console.error("에러 코드:", error.code)
    console.error("에러 메시지:", error.message)
    console.error("에러 상세:", error.details, error.hint)
    console.error("저장 시도한 데이터:", {
      slug: pageData.slug,
      status: pageData.status,
      hasSeo: !!pageData.seo,
      hasContent: !!pageData.content,
      contentLength: Array.isArray(pageData.content) ? pageData.content.length : 0
    })
    throw new Error(`페이지 저장 실패: ${error.message} (코드: ${error.code})`)
  }

  if (!data || data.length === 0) {
    console.error("❌ Supabase 저장 후 데이터가 반환되지 않음!")
    console.error("저장 시도한 데이터:", {
      slug: pageData.slug,
      status: pageData.status
    })
    throw new Error("페이지 저장 후 데이터가 반환되지 않았습니다")
  }

  console.log("✅ Supabase 저장 성공:", {
    slug: pageData.slug,
    returnedSlug: data?.[0]?.slug,
    returnedStatus: data?.[0]?.status,
    returnedDataKeys: data?.[0] ? Object.keys(data[0]) : []
  })
  
  // 저장 직후 검증: 실제로 조회 가능한지 확인
  try {
    const { data: verifyData, error: verifyError } = await supabase
      .from("citydirect_pages")
      .select("slug, status")
      .eq("slug", pageData.slug)
      .single()
    
    if (verifyError) {
      console.warn("⚠️ 저장 후 검증 실패:", verifyError.message)
    } else if (verifyData) {
      console.log("✅ 저장 후 검증 성공 - 즉시 조회 가능:", {
        slug: verifyData.slug,
        status: verifyData.status
      })
    }
  } catch (verifyErr: any) {
    console.warn("⚠️ 저장 후 검증 중 오류 (무시):", verifyErr.message)
  }
}

export async function getPage(slug: string): Promise<CityDirectPage | null> {
  if (!supabase) {
    console.error("❌ Supabase 클라이언트가 초기화되지 않았습니다")
    throw new Error("Supabase 클라이언트가 초기화되지 않았습니다")
  }

  console.log("🔍 Supabase getPage 호출:", {
    slug,
    hasClient: !!supabase,
    tableName: "citydirect_pages"
  })

  const { data, error } = await supabase
    .from("citydirect_pages")
    .select("*")
    .eq("slug", slug)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      // 데이터 없음
      console.log("📭 Supabase에서 페이지를 찾을 수 없음:", slug)
      console.log("💡 확인 사항:")
      console.log("  1. Supabase 테이블에 데이터가 있는지 확인")
      console.log("  2. slug가 정확히 일치하는지 확인")
      console.log("  3. SQL: SELECT * FROM citydirect_pages WHERE slug = '" + slug + "'")
      return null
    }
    console.error("❌ Supabase get error:", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      slug
    })
    throw new Error(`페이지 조회 실패: ${error.message}`)
  }

  if (!data) {
    console.log("📭 Supabase에서 데이터 없음 (null):", slug)
    return null
  }

  console.log("✅ Supabase getPage 성공:", {
    slug: data.slug,
    status: data.status,
    hasContent: !!data.content,
    contentLength: Array.isArray(data.content) ? data.content.length : 0
  })

  return {
    slug: data.slug,
    cityCode: data.city_code,
    status: data.status,
    seo: data.seo,
    content: data.content,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    publishedAt: data.published_at,
  }
}

export async function getPages(): Promise<CityDirectPage[]> {
  if (!supabase) {
    console.error("❌ Supabase 클라이언트가 초기화되지 않았습니다")
    throw new Error("Supabase 클라이언트가 초기화되지 않았습니다")
  }

  console.log("📋 Supabase 목록 조회 시도...")
  
  const { data, error } = await supabase
    .from("citydirect_pages")
    .select("*")
    .order("updated_at", { ascending: false })

  if (error) {
    console.error("❌ Supabase list error:", error)
    console.error("에러 코드:", error.code)
    console.error("에러 메시지:", error.message)
    console.error("에러 상세:", error.details, error.hint)
    throw new Error(`페이지 목록 조회 실패: ${error.message} (코드: ${error.code})`)
  }

  console.log("✅ Supabase 목록 조회 성공:", {
    count: data?.length || 0,
    slugs: data?.map((row: any) => row.slug) || []
  })

  if (!data) return []

  return data.map((row) => ({
    slug: row.slug,
    cityCode: row.city_code,
    status: row.status,
    seo: row.seo,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at,
  }))
}

export async function deletePage(slug: string): Promise<void> {
  if (!supabase) {
    throw new Error("Supabase 클라이언트가 초기화되지 않았습니다")
  }

  const { error } = await supabase
    .from("citydirect_pages")
    .delete()
    .eq("slug", slug)

  if (error) {
    console.error("Supabase delete error:", error)
    throw new Error(`페이지 삭제 실패: ${error.message}`)
  }
}

// 통계 조회 (추가 기능)
export async function getPageStats(slug: string) {
  const { data, error } = await supabase
    .from("citydirect_pages")
    .select("created_at, updated_at, published_at, status")
    .eq("slug", slug)
    .single()

  if (error) return null
  return data
}

// 발행된 페이지만 조회
export async function getPublishedPages(): Promise<CityDirectPage[]> {
  const { data, error } = await supabase
    .from("citydirect_pages")
    .select("*")
    .eq("status", "PUBLISHED")
    .order("published_at", { ascending: false })

  if (error) {
    console.error("Supabase published list error:", error)
    return []
  }

  if (!data) return []

  return data.map((row) => ({
    slug: row.slug,
    cityCode: row.city_code,
    status: row.status,
    seo: row.seo,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at,
  }))
}

