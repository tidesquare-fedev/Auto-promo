import { CityDirectPage } from "@/types/page"

/**
 * 데이터베이스 추상화 레이어
 * 환경에 따라 Supabase 또는 메모리 저장소 사용
 */

// Supabase 사용 여부 확인
const useSupabase = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// 동적 import로 Supabase 로드
let supabaseStore: any = null
let supabaseAvailable = false

if (useSupabase) {
  try {
    supabaseStore = require("./supabase")
    console.log("📦 Supabase 모듈 로드 성공:", {
      hasStore: !!supabaseStore,
      hasSupabase: !!supabaseStore?.supabase,
      storeKeys: supabaseStore ? Object.keys(supabaseStore) : [],
      hasSavePage: typeof supabaseStore?.savePage === 'function',
      hasGetPage: typeof supabaseStore?.getPage === 'function'
    })
    
    // Supabase 클라이언트가 제대로 초기화되었는지 확인
    // supabaseStore는 { supabase, savePage, getPage, ... } 형태
    if (supabaseStore && supabaseStore.supabase) {
      supabaseAvailable = true
      console.log("✅ Supabase 연결됨")
      console.log("📊 Supabase 클라이언트 상태:", {
        hasClient: !!supabaseStore.supabase,
        clientType: typeof supabaseStore.supabase,
        hasFrom: typeof supabaseStore.supabase.from === 'function',
        hasSavePage: typeof supabaseStore.savePage === 'function',
        hasGetPage: typeof supabaseStore.getPage === 'function'
      })
    } else {
      console.error("❌ Supabase 클라이언트가 초기화되지 않음!")
      console.error("  - supabaseStore:", !!supabaseStore)
      console.error("  - supabaseStore.supabase:", !!supabaseStore?.supabase)
      console.error("  - supabaseStore 타입:", typeof supabaseStore)
      console.error("  - supabaseStore 키:", supabaseStore ? Object.keys(supabaseStore) : [])
      console.error("  - 환경 변수 확인:")
      console.error("    - NEXT_PUBLIC_SUPABASE_URL:", !!process.env.NEXT_PUBLIC_SUPABASE_URL)
      console.error("    - SUPABASE_SERVICE_ROLE_KEY:", !!process.env.SUPABASE_SERVICE_ROLE_KEY)
      console.error("  - 환경 변수 값 (일부):")
      console.error("    - URL prefix:", process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30))
      console.error("    - Key length:", process.env.SUPABASE_SERVICE_ROLE_KEY?.length)
      supabaseAvailable = false
    }
  } catch (e: any) {
    console.error("❌ Supabase 로드 실패, 메모리 저장소 사용:", e.message)
    console.error("에러 상세:", e.stack)
    supabaseAvailable = false
  }
} else {
  console.log("ℹ️ Supabase 설정 없음, 메모리 저장소 사용")
  console.log("  - NEXT_PUBLIC_SUPABASE_URL:", !!process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log("  - SUPABASE_SERVICE_ROLE_KEY:", !!process.env.SUPABASE_SERVICE_ROLE_KEY)
  console.log("  - useSupabase:", useSupabase)
}

// 메모리 저장소 (개발 환경 또는 Supabase 미사용 시)
// Next.js Hot Reload 시에도 유지되도록 global 객체 사용
declare global {
  var __cityDirectPages: Map<string, CityDirectPage> | undefined
}

const pages = global.__cityDirectPages || new Map<string, CityDirectPage>()
global.__cityDirectPages = pages

console.log("📦 메모리 저장소 초기화:", {
  isNewMap: !global.__cityDirectPages,
  currentSize: pages.size,
  slugs: Array.from(pages.keys())
})

// 디버깅: 현재 메모리 상태 확인
export function debugMemoryStore() {
  return {
    size: pages.size,
    slugs: Array.from(pages.keys()),
    pages: Array.from(pages.entries()).map(([slug, page]) => ({
      slug,
      cityCode: page.cityCode,
      status: page.status,
      contentLength: page.content?.length || 0
    }))
  }
}

// 안전한 Supabase 호출 래퍼
// 프로덕션 환경에서는 Supabase 저장 실패 시 에러를 던짐 (fallback 방지)
async function safeSupabaseCall<T>(
  fn: () => Promise<T>,
  fallback: () => T | Promise<T>,
  throwOnError: boolean = false // 프로덕션에서는 true로 설정
): Promise<T> {
  // Supabase 사용 가능 여부 재확인
  const canUseSupabase = supabaseAvailable && supabaseStore && supabaseStore.supabase
  
  if (!canUseSupabase) {
    const fallbackInfo = {
      supabaseAvailable,
      hasStore: !!supabaseStore,
      hasClient: !!supabaseStore?.supabase,
      storeKeys: supabaseStore ? Object.keys(supabaseStore) : [],
      hasEnvUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasEnvKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      nodeEnv: process.env.NODE_ENV
    }
    console.log("📦 Supabase 미사용, 메모리 저장소로 fallback:", fallbackInfo)
    
    // 프로덕션 환경에서는 상세 정보와 함께 에러
    const isProduction = process.env.NODE_ENV === "production"
    if (isProduction && throwOnError) {
      throw new Error(`Supabase를 사용할 수 없습니다. 상세 정보: ${JSON.stringify(fallbackInfo)}`)
    }
    
    const result = fallback()
    return result instanceof Promise ? await result : result
  }

  try {
    console.log("🔄 Supabase 호출 시도...")
    return await fn()
  } catch (error: any) {
    console.error("❌ Supabase 호출 실패:", error.message)
    console.error("에러 상세:", error.stack)
    
    // 프로덕션 환경이거나 throwOnError가 true면 에러를 다시 던짐
    const isProduction = process.env.NODE_ENV === "production"
    if (throwOnError || isProduction) {
      console.error("🚨 프로덕션 환경: Supabase 저장 실패 시 에러를 던집니다")
      throw error
    }
    
    // 개발 환경에서만 fallback
    console.warn("⚠️ 개발 환경: 메모리 저장소로 fallback")
    supabaseAvailable = false // 다음 호출부터 메모리 저장소 사용
    const result = fallback()
    return result instanceof Promise ? await result : result
  }
}

export async function savePage(page: CityDirectPage): Promise<void> {
  // 필수 필드 검증
  if (!page.slug) {
    throw new Error("페이지 slug는 필수입니다")
  }
  if (!page.seo) {
    throw new Error("페이지 seo는 필수입니다")
  }
  if (!page.content) {
    page.content = []
  }

  const pageWithTimestamp = {
    ...page,
    updatedAt: new Date().toISOString(),
    createdAt: page.createdAt || new Date().toISOString(),
    publishedAt: page.status === "PUBLISHED" ? new Date().toISOString() : page.publishedAt
  }

  console.log("💾 savePage 호출:", {
    slug: pageWithTimestamp.slug,
    useSupabase: supabaseAvailable,
    hasSupabaseStore: !!supabaseStore
  })

  // 프로덕션에서는 Supabase 저장 실패 시 에러를 던짐 (throwOnError: true)
  const isProduction = process.env.NODE_ENV === "production"
  
  // Supabase 사용 가능 여부 재확인 및 상세 로그
  const canUseSupabase = supabaseAvailable && supabaseStore && supabaseStore.supabase
  console.log("🔍 savePage - Supabase 사용 가능 여부:", {
    canUseSupabase,
    supabaseAvailable,
    hasSupabaseStore: !!supabaseStore,
    hasSupabaseClient: !!supabaseStore?.supabase,
    isProduction,
    environment: process.env.NODE_ENV
  })
  
  if (!canUseSupabase && isProduction) {
    // 프로덕션에서 Supabase를 사용할 수 없으면 즉시 에러
    const errorDetails: any = {
      message: "프로덕션 환경에서는 Supabase 저장이 필수입니다",
      supabaseAvailable,
      hasSupabaseStore: !!supabaseStore,
      hasSupabaseClient: !!supabaseStore?.supabase,
      hasEnvUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasEnvKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    }
    console.error("❌ Supabase 사용 불가:", errorDetails)
    throw new Error(`프로덕션 환경에서는 Supabase 저장이 필수입니다. Supabase 연결을 확인하세요. (상세: ${JSON.stringify(errorDetails)})`)
  }
  
  return safeSupabaseCall(
    // Supabase 저장 함수
    async () => {
      console.log("📤 Supabase 저장 시도...")
      try {
        await supabaseStore.savePage(pageWithTimestamp)
        console.log("✅ Supabase 저장 성공")
        
        // 저장 직후 즉시 검증
        const verifyPage = await supabaseStore.getPage(pageWithTimestamp.slug)
        if (!verifyPage) {
          console.error("❌ 저장 후 즉시 검증 실패 - Supabase에서 페이지를 찾을 수 없음!")
          throw new Error("Supabase 저장 후 검증 실패: 페이지를 찾을 수 없습니다")
        }
        console.log("✅ 저장 후 즉시 검증 성공:", {
          slug: verifyPage.slug,
          status: verifyPage.status
        })
      } catch (saveError: any) {
        console.error("❌ Supabase 저장 중 오류:", saveError.message)
        // Supabase 저장 실패 시 에러를 다시 던져서 fallback 방지
        // (프로덕션에서는 Supabase를 사용해야 하므로)
        throw saveError
      }
    },
    // Fallback 함수 (프로덕션에서는 사용 안 함)
    () => {
      // 프로덕션에서는 메모리 저장소 사용 안 함
      if (isProduction) {
        const errorDetails = {
          supabaseAvailable,
          hasSupabaseStore: !!supabaseStore,
          hasSupabaseClient: !!supabaseStore?.supabase
        }
        console.error("❌ 프로덕션에서 fallback 시도:", errorDetails)
        throw new Error(`프로덕션 환경에서는 Supabase 저장이 필수입니다. Supabase 연결을 확인하세요. (상세: ${JSON.stringify(errorDetails)})`)
      }
      console.log("📦 메모리 저장소 저장 시작...")
      const beforeSize = pages.size
      const beforeSlugs = Array.from(pages.keys())
      console.log("📝 저장 전 메모리 상태:", {
        size: beforeSize,
        slugs: beforeSlugs
      })
      
      // 저장 실행
      pages.set(page.slug, pageWithTimestamp)
      
      // 저장 직후 검증
      const savedPage = pages.get(page.slug)
      const afterSize = pages.size
      const afterSlugs = Array.from(pages.keys())
      
      console.log("📊 저장 후 메모리 상태:", {
        size: afterSize,
        slugs: afterSlugs,
        savedSlug: page.slug,
        verification: pages.has(page.slug) ? "✅ 확인됨" : "❌ 확인 실패",
        beforeAfter: { before: beforeSize, after: afterSize }
      })
      
      if (!savedPage) {
        console.error("❌ 저장 실패: 메모리에 페이지가 없음!")
        console.error("메모리 Map 상태:", {
          size: pages.size,
          keys: Array.from(pages.keys()),
          hasSlug: pages.has(page.slug)
        })
        throw new Error("메모리 저장소 저장 실패")
      }
      
      if (afterSize <= beforeSize) {
        console.warn("⚠️ 경고: 저장 후 메모리 크기가 증가하지 않음!")
        console.warn("저장 전:", beforeSize, "저장 후:", afterSize)
      }
      
      console.log("✅ 저장 검증 완료:", savedPage.slug)
      return undefined // void 반환
    },
    // throwOnError: 프로덕션에서는 true
    isProduction
  )
}

export async function getPage(slug: string): Promise<CityDirectPage | null> {
  console.log("🔍 db.getPage 호출:", {
    slug,
    useSupabase: supabaseAvailable,
    hasSupabaseStore: !!supabaseStore
  })

  return safeSupabaseCall(
    async () => {
      console.log("📤 Supabase getPage 호출 중...")
      const result = await supabaseStore.getPage(slug)
      console.log("📥 Supabase getPage 결과:", {
        slug,
        found: !!result,
        status: result?.status
      })
      return result
    },
    () => {
      const page = pages.get(slug) || null
      console.log("📄 메모리 저장소에서 페이지 조회:", {
        slug,
        found: !!page,
        mapSize: pages.size,
        allSlugs: Array.from(pages.keys())
      })
      if (!page) {
        console.warn("⚠️ 메모리 저장소에 페이지가 없습니다. Supabase를 사용하는 것을 권장합니다.")
      }
      return page
    }
  )
}

export async function getPages(): Promise<CityDirectPage[]> {
  return safeSupabaseCall(
    () => supabaseStore.getPages(),
    () => {
      const result = Array.from(pages.values())
      const debug = debugMemoryStore()
      console.log("📋 메모리 저장소에서 페이지 목록 조회:", {
        count: result.length,
        slugs: result.map(p => p.slug),
        mapSize: pages.size,
        debugSize: debug.size,
        debugSlugs: debug.slugs,
        // 메모리와 결과가 다른 경우 경고
        mismatch: pages.size !== result.length
      })
      
      // 메모리와 결과가 다른 경우 경고
      if (pages.size !== result.length) {
        console.warn("⚠️ 메모리 Map 크기와 결과 배열 크기가 다름:", {
          mapSize: pages.size,
          resultLength: result.length,
          mapKeys: Array.from(pages.keys()),
          resultSlugs: result.map(p => p.slug)
        })
      }
      
      return result
    }
  )
}

export async function deletePage(slug: string): Promise<void> {
  return safeSupabaseCall(
    () => supabaseStore.deletePage(slug),
    () => {
      pages.delete(slug)
    }
  )
}
