import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import { CityDirectPage } from "@/types/page"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

export default function AdminIndex() {
  const [pages, setPages] = useState<CityDirectPage[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const loadPages = () => {
    setLoading(true)
    fetch("/api/citydirect/list")
      .then(async (res) => {
        if (!res.ok) {
          console.error("목록 조회 실패:", res.status)
          return []
        }
        return res.json()
      })
      .then(data => {
        const pagesData = data || []
        console.log("📋 클라이언트에서 받은 페이지 목록:", {
          count: pagesData.length,
          slugs: pagesData.map((p: CityDirectPage) => p.slug),
          timestamp: new Date().toISOString()
        })
        
        // 빈 목록인 경우 경고
        if (pagesData.length === 0) {
          console.warn("⚠️ 페이지 목록이 비어있습니다. 서버 로그를 확인하세요.")
          console.warn("💡 디버깅: http://localhost:3000/api/debug-memory")
        }
        
        setPages(pagesData)
        setLoading(false)
      })
      .catch((err) => {
        console.error("목록 조회 오류:", err)
        setLoading(false)
      })
  }

  useEffect(() => {
    loadPages()
    
    // URL에 refresh 파라미터가 있으면 자동 새로고침 (저장 후 이동한 경우)
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get("refresh") === "1") {
      // URL에서 refresh 파라미터 제거
      window.history.replaceState({}, "", "/admin/citydirect")
      // 저장 완료 대기 후 새로고침 (메모리 동기화 대기)
      setTimeout(() => {
        console.log("🔄 refresh 파라미터로 목록 새로고침")
        loadPages()
      }, 1000) // 1초 대기 (저장 완료 대기)
    }
    
    // 페이지 포커스 시 목록 새로고침 (다른 탭에서 저장 후 돌아온 경우)
    const handleFocus = () => {
      loadPages()
    }
    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [])

  // 검색 필터링
  const filteredPages = pages.filter(page => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      page.slug.toLowerCase().includes(query) ||
      page.seo?.title?.toLowerCase().includes(query) ||
      page.cityCode.toLowerCase().includes(query)
    )
  })

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CityDirect 페이지 관리</h1>
          <p className="text-muted-foreground mt-1">
            페이지를 생성하고 편집하세요
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={loadPages}
            disabled={loading}
          >
            {loading ? "새로고침 중..." : "새로고침"}
          </Button>
          <Link href="/admin/citydirect/new">
            <Button>새 페이지 만들기</Button>
          </Link>
        </div>
      </div>

      {/* 페이지 목록 */}
      {filteredPages.length === 0 && searchQuery ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-lg font-semibold mb-2">검색 결과 없음</p>
            <p className="text-gray-600 mb-4">"{searchQuery}"에 대한 결과가 없습니다</p>
            <Button variant="outline" onClick={() => setSearchQuery("")}>
              검색 초기화
            </Button>
          </CardContent>
        </Card>
      ) : pages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <p className="text-muted-foreground">페이지가 없습니다</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={loadPages}
                disabled={loading}
              >
                새로고침
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  const debug = await fetch("/api/debug-memory").then(r => r.json())
                  console.log("🔍 메모리 상태:", debug)
                  alert(`메모리 상태:\n- 크기: ${debug.memory?.size || 0}\n- 슬러그: ${debug.memory?.slugs?.join(", ") || "없음"}`)
                }}
              >
                메모리 확인
              </Button>
              <Link href="/admin/citydirect/new">
                <Button>새 페이지 만들기</Button>
              </Link>
            </div>
            <p className="text-xs text-muted-foreground text-center max-w-md">
              💡 저장 후 목록에 표시되지 않으면 "새로고침" 버튼을 클릭하세요.
              <br />
              개발 환경에서는 서버 재시작 시 메모리 저장소가 초기화될 수 있습니다.
              <br />
              "메모리 확인" 버튼으로 현재 메모리 상태를 확인할 수 있습니다.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              {filteredPages.length}개의 페이지 {searchQuery && `(검색: "${searchQuery}")`}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPages.map(page => (
              <Card key={page.slug} className="hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg line-clamp-2">
                      {page.seo?.title || page.slug}
                    </CardTitle>
                    <Badge
                      variant={page.status === "PUBLISHED" ? "default" : "secondary"}
                      className="shrink-0"
                    >
                      {page.status === "PUBLISHED" ? "✓ 발행" : "📝 초안"}
                    </Badge>
                  </div>
                  {page.seo?.description && (
                    <CardDescription className="line-clamp-2 mt-2">
                      {page.seo.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 메타 정보 */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-gray-600 text-xs mb-1">슬러그</p>
                      <p className="font-mono text-xs truncate">{page.slug}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-gray-600 text-xs mb-1">도시 코드</p>
                      <p className="font-semibold text-xs">{page.cityCode}</p>
                    </div>
                  </div>
                  
                  {/* 섹션 정보 */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>📦</span>
                    <span>{page.content.length}개 섹션</span>
                    {page.updatedAt && (
                      <>
                        <span>•</span>
                        <span className="text-xs">
                          {new Date(page.updatedAt).toLocaleDateString('ko-KR')}
                        </span>
                      </>
                    )}
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex gap-2 pt-2">
                    <Link href={`/admin/citydirect/${page.slug}`} className="flex-1">
                      <Button className="w-full" size="sm">
                        ✏️ 편집
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        window.open(`/marketing/citydirect/${page.slug}`, "_blank")
                      }}
                      title="미리보기"
                    >
                      🔍
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
