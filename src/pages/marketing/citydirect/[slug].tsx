import Head from "next/head"
import { GetStaticProps, GetStaticPaths } from "next"
import { getPage, getPages } from "@/lib/db"
import { CityDirectPage } from "@/types/page"
import { productMcp } from "@/mcp/product"

// Design System 섹션 컴포넌트
import { HeroSection } from "@/design-system/sections/HeroSection"
import { ProductGrid } from "@/design-system/sections/ProductGrid"
import { ProductTabs } from "@/design-system/sections/ProductTabs"
import { IntroText } from "@/design-system/sections/IntroText"
import { FAQSection } from "@/design-system/sections/FAQSection"
import { ImageCarousel } from "@/design-system/sections/ImageCarousel"
import { ImageSection } from "@/design-system/sections/ImageSection"

interface PageProps {
  page: CityDirectPage
}

export default function CityDirectMarketingPage({ page }: PageProps) {
  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">페이지를 찾을 수 없습니다</h1>
          <p className="text-gray-600">요청하신 페이지가 존재하지 않습니다.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{page.seo.title || "CityDirect"}</title>
        <meta name="description" content={page.seo.description || ""} />
        {page.seo.index === false && <meta name="robots" content="noindex,nofollow" />}
        <meta property="og:title" content={page.seo.ogTitle || page.seo.title} />
        <meta property="og:description" content={page.seo.ogDescription || page.seo.description} />
        {page.seo.ogImage && <meta property="og:image" content={page.seo.ogImage} />}
      </Head>

      <main className="min-h-screen bg-white pb-24 pt-24 md:pt-28">
        {/* 섹션 렌더링 */}
        {page.content.map((section, idx) => {
          const key = `${section.type}-${idx}`

          switch (section.type) {
            case "Hero":
              return (
                <HeroSection
                  key={key}
                  {...section}
                />
              )

            case "ProductGrid":
              return (
                <ProductGrid
                  key={key}
                  {...section}
                />
              )

            case "ProductTabs":
              return (
                <ProductTabs
                  key={key}
                  {...section}
                />
              )

            case "IntroText":
              return (
                <IntroText
                  key={key}
                  {...section}
                />
              )

            case "FAQ":
              return (
                <FAQSection
                  key={key}
                  {...section}
                />
              )

            case "ImageCarousel":
              return (
                <ImageCarousel
                  key={key}
                  {...section}
                />
              )

            case "Image":
              return (
                <ImageSection
                  key={key}
                  {...section}
                />
              )

            default:
              console.warn(`Unknown section type: ${(section as any).type}`)
              return null
          }
        })}

        {/* 페이지가 비어있는 경우 */}
        {page.content.length === 0 && (
          <div className="container mx-auto px-4 py-20 text-center">
            <h2 className="text-2xl font-semibold text-gray-600 mb-4">
              페이지가 비어있습니다
            </h2>
            <p className="text-gray-500">
              어드민에서 섹션을 추가해주세요.
            </p>
          </div>
        )}

        {/* Footer - PUBLISHED 상태에서만 표시 */}
        {page.status === "PUBLISHED" && (
          <footer className="bg-gray-100 border-t border-gray-200 py-8 mt-20">
            <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
              <p>© 2024 CityDirect. All rights reserved.</p>
            </div>
          </footer>
        )}
      </main>
    </>
  )
}

// ISR: 페이지 목록을 빌드 시점에 생성
export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const pages = await getPages()
    
    const paths = pages
      .filter(page => page.status === "PUBLISHED") // PUBLISHED 페이지만
      .map(page => ({
        params: { slug: page.slug }
      }))

    return {
      paths,
      fallback: "blocking" // 새 페이지는 요청 시 생성
    }
  } catch (error) {
    console.error("getStaticPaths 오류:", error)
    return {
      paths: [],
      fallback: "blocking"
    }
  }
}

// ISR: 페이지 데이터를 가져오고 60초마다 재검증
export const getStaticProps: GetStaticProps<PageProps> = async ({ params }) => {
  const slug = params?.slug as string

  if (!slug) {
    return { notFound: true }
  }

  try {
    console.log("🔍 getStaticProps - 페이지 조회 시작:", slug)
    console.log("📊 저장소 확인:", {
      useSupabase: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    })
    
    const page = await getPage(slug)

    if (!page) {
      console.error("❌ getStaticProps - 페이지를 찾을 수 없음:", slug)
      console.error("💡 디버깅 정보:")
      console.error("  - Supabase URL 설정:", !!process.env.NEXT_PUBLIC_SUPABASE_URL)
      console.error("  - Supabase Key 설정:", !!process.env.SUPABASE_SERVICE_ROLE_KEY)
      console.error("💡 해결책:")
      console.error("  1. Supabase 환경 변수가 올바르게 설정되었는지 확인")
      console.error("  2. Supabase 테이블이 생성되었는지 확인 (citydirect_pages)")
      console.error("  3. /api/test-supabase 엔드포인트로 연결 테스트")
      return { notFound: true }
    }

    console.log("✅ getStaticProps - 페이지 조회 성공:", {
      slug: page.slug,
      status: page.status,
      contentLength: page.content?.length,
      storage: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Supabase" : "Memory"
    })

    // DRAFT 페이지도 표시 (미리보기 기능)
    // 프로덕션에서도 DRAFT 페이지를 표시하여 미리보기 가능
    // 필요시 쿼리 파라미터로 제어할 수 있도록 유연하게 처리

    // Next.js JSON 직렬화를 위해 undefined를 null로 변환
    const serializedPage: CityDirectPage = {
      ...page,
      createdAt: page.createdAt || null,
      updatedAt: page.updatedAt || null,
      publishedAt: page.publishedAt || null,
    }

    return {
      props: { page: serializedPage },
      revalidate: 60 // 60초마다 재검증 (ISR)
    }
  } catch (error) {
    console.error("getStaticProps 오류:", error)
    return { notFound: true }
  }
}

