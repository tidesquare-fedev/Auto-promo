import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { CityDirectPage, PageSection, PageStatus, ProductBadge } from "@/types/page"
import { designMcp } from "@/mcp/design"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { SortableSectionList } from "@/components/admin/SortableSectionList"
import { ProductPreview } from "@/components/admin/ProductPreview"
import { SectionTree } from "@/components/admin/SectionTree"
import { InlineStyleControl } from "@/components/admin/InlineStyleControl"
import { BackgroundColorControl } from "@/components/admin/BackgroundColorControl"
import { RichTextEditor } from "@/components/admin/RichTextEditor"
import { normalizeBadges } from "@/lib/badges"

export default function AdminEditor() {
  const router = useRouter()
  const { slug } = router.query
  const isNew = slug === "new"

  const [page, setPage] = useState<CityDirectPage | null>(null)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number | undefined>(undefined)
  const [collapsedSections, setCollapsedSections] = useState<Set<number>>(new Set())
  
  // 도시 검색 상태
  const [citySearchKeyword, setCitySearchKeyword] = useState("")
  const [citySearchResults, setCitySearchResults] = useState<any[]>([])
  const [citySearchLoading, setCitySearchLoading] = useState(false)
  const [showCityDropdown, setShowCityDropdown] = useState(false)

  useEffect(() => {
    if (isNew) {
      setPage({
        slug: "",
        cityCode: "",
        status: "DRAFT",
        seo: {
          title: "",
          description: "",
          index: true
        },
        content: []
      })
      setLoading(false)
      return
    }

    if (!slug) return

    // 저장 직후에는 API 조회하지 않고 기존 데이터 유지
    // (저장 후 router.push로 이동한 경우)
    if (page && page.slug === slug) {
      console.log("💡 저장된 페이지 데이터 사용, API 조회 스킵")
      setLoading(false)
      return
    }

    fetch(`/api/citydirect/${slug}`)
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 404) {
            const errorData = await res.json().catch(() => ({}))
            console.warn("⚠️ 페이지를 찾을 수 없음, 새 페이지로 초기화:", {
              slug,
              debug: errorData.debug
            })
            // 페이지가 없으면 새로 만들기
            setPage({
              slug: slug as string,
              cityCode: "",
              status: "DRAFT",
              seo: {
                title: "",
                description: "",
                index: true
              },
              content: []
            })
            setLoading(false)
            return
          }
          const errorText = await res.text()
          console.error("페이지 조회 실패:", res.status, errorText)
          throw new Error(`페이지 조회 실패: ${res.status}`)
        }
        return res.json()
      })
      .then(data => {
        if (!data) return
        
        // seo가 없는 경우 기본값 설정
        if (!data.seo) {
          data.seo = {
            title: "",
            description: "",
            index: true
          }
        }
        // content가 없는 경우 기본값 설정
        if (!data.content) {
          data.content = []
        }
        setPage(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error("페이지 로드 오류:", err)
        setError("페이지를 불러올 수 없습니다")
        setLoading(false)
      })
  }, [slug, isNew])

  // 페이지 로드 시 도시 정보 초기화 (하위 호환성)
  useEffect(() => {
    if (page && !page.cities && page.cityMasterId && page.cityName) {
      // 기존 단일 도시 데이터를 배열로 마이그레이션
      setPage({
        ...page,
        cities: [{
          id: page.cityMasterId,
          name: page.cityName,
          nation: undefined
        }]
      })
    }
  }, [page])

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('[data-city-search-container]')) {
        setShowCityDropdown(false)
      }
    }

    if (showCityDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showCityDropdown])

  const handleSave = async () => {
    if (!page) {
      setError("페이지 데이터가 없습니다")
      return
    }

    // 필수 필드 검증
    if (!page.slug) {
      setError("페이지 slug를 입력해주세요")
      return
    }
    if (!page.seo) {
      setError("SEO 정보가 없습니다")
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(false)

    console.log("💾 저장 시작:", {
      slug: page.slug,
      cityCode: page.cityCode,
      status: page.status,
      contentLength: page.content?.length
    })

    try {
      // Design MCP로 검증
      try {
        designMcp.validatePage(page)
        console.log("✅ 클라이언트 검증 통과")
      } catch (validationError: any) {
        console.error("❌ 클라이언트 검증 실패:", validationError.message)
        throw validationError
      }

      const res = await fetch("/api/citydirect/page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(page)
      })

      const responseData = await res.json()

      if (!res.ok) {
        console.error("❌ 저장 실패:", responseData)
        throw new Error(responseData.error || responseData.message || "저장 실패")
      }

      console.log("✅ 저장 성공:", responseData)

      // 저장 후 revalidate (에러가 나도 무시)
      if (page.slug) {
        try {
          await fetch("/api/revalidate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slug: page.slug })
          })
        } catch (revalidateError) {
          console.warn("Revalidate 실패 (무시):", revalidateError)
        }
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)

      // 저장 후 처리
      if (isNew && page.slug) {
        // 새 페이지인 경우 목록 페이지로 이동하여 저장 확인
        // refresh=1 파라미터로 목록 페이지에서 자동 새로고침
        // 저장 완료 후 메모리 동기화를 위해 충분한 시간 대기
        setTimeout(() => {
          console.log("🔄 목록 페이지로 이동 (저장된 페이지 확인)")
          router.push("/admin/citydirect?refresh=1")
        }, 2000) // 2초 대기 (저장 완료 및 메모리 동기화 대기)
      }
      // 기존 페이지 수정인 경우 현재 페이지 유지
    } catch (err: any) {
      console.error("❌ 저장 오류:", err)
      setError(err.message || "저장 중 오류가 발생했습니다")
    } finally {
      setSaving(false)
    }
  }

  const addSection = (type: PageSection["type"]) => {
    if (!page) return

    let newSection: PageSection

    switch (type) {
      case "Hero":
        newSection = { type: "Hero", title: "" }
        break
      case "IntroText":
        newSection = { type: "IntroText", title: "", description: "" }
        break
      case "ProductGrid":
        newSection = { type: "ProductGrid", title: "", productIds: [], columns: 4 }
        break
      case "ProductTabs":
        newSection = { 
          type: "ProductTabs", 
          title: "",
          tabs: [
            { id: "tab1", label: "인기 상품", productIds: [] }
          ],
          columns: 4 
        }
        break
      case "FAQ":
        newSection = { type: "FAQ", title: "자주 묻는 질문", items: [{ q: "", a: "" }] }
        break
      case "ImageCarousel":
        newSection = { 
          type: "ImageCarousel", 
          title: "",
          slides: [{ id: `slide-${Date.now()}`, image: "", title: "", description: "" }]
        }
        break
    }

    setPage({
      ...page,
      content: [...page.content, newSection]
    })
  }

  // 도시명 일치 확인 (city 필드만 검사)
  const calculateMatchScore = (city: any, keyword: string): number => {
    // city 필드가 없거나 빈 문자열인 경우
    if (!city || !city.city || typeof city.city !== 'string' || city.city.trim() === '') {
      return 0
    }
    
    const searchTerm = keyword.toLowerCase().trim()
    const cityName = city.city.toLowerCase().trim()
    
    // city 필드가 정확히 일치
    if (cityName === searchTerm) return 100
    
    // city 필드가 검색어로 시작
    if (cityName.startsWith(searchTerm)) return 90
    
    // city 필드에 검색어 포함
    if (cityName.includes(searchTerm)) return 80
    
    // 일치하지 않음
    return 0
  }

  // 도시 검색
  const searchCity = async (keyword: string) => {
    if (!keyword || keyword.trim().length === 0) {
      setCitySearchResults([])
      setShowCityDropdown(false)
      return
    }

    setCitySearchLoading(true)
    try {
      const res = await fetch(`/api/cities/search?keyword=${encodeURIComponent(keyword)}`)
      if (res.ok) {
        const data = await res.json()
        const cities = data.cities || []
        
        console.log("🔍 도시 검색 원본 결과:", {
          keyword,
          total: cities.length,
          cities: cities.slice(0, 5).map((c: any) => ({ id: c.id, city: c.city, nation: c.nation }))
        })
        
        // city 필드 기준으로 필터링 및 정렬
        const sortedCities = cities
          .map((city: any) => {
            const score = calculateMatchScore(city, keyword)
            console.log(`  검색어 "${keyword}" vs 도시명 "${city.city}": 점수 ${score}`)
            return {
              ...city,
              matchScore: score
            }
          })
          .filter((city: any) => {
            const passed = city.matchScore > 0
            if (!passed) {
              console.log(`    ❌ 필터링 제외: ${city.city} (점수: ${city.matchScore})`)
            }
            return passed
          })  // city 필드에 매칭되는 것만
          .sort((a: any, b: any) => b.matchScore - a.matchScore)
          .slice(0, 10)  // 상위 10개만
        
        console.log("✅ 필터링 후 결과:", {
          count: sortedCities.length,
          cities: sortedCities.map((c: any) => ({ city: c.city, score: c.matchScore }))
        })
        
        setCitySearchResults(sortedCities)
        setShowCityDropdown(sortedCities.length > 0)
      } else {
        console.error("❌ API 응답 오류:", res.status)
        setCitySearchResults([])
        setShowCityDropdown(false)
      }
    } catch (error) {
      console.error("❌ 도시 검색 오류:", error)
      setCitySearchResults([])
      setShowCityDropdown(false)
    } finally {
      setCitySearchLoading(false)
    }
  }

  // 도시 선택 (여러 개 추가)
  const selectCity = (city: any) => {
    if (!page) return
    
    const newCity = {
      id: city.id,
      name: city.city,
      nation: city.nation
    }
    
    // 이미 추가된 도시인지 확인
    const existingCities = page.cities || []
    const isDuplicate = existingCities.some(c => c.id === newCity.id)
    
    if (isDuplicate) {
      alert('이미 추가된 도시입니다.')
      return
    }
    
    setPage({
      ...page,
      cities: [...existingCities, newCity],
      cityCode: newCity.id,  // 하위 호환성: 첫 번째 도시 ID
      cityMasterId: newCity.id,
      cityName: newCity.name
    })
    
    setCitySearchKeyword('')
    setShowCityDropdown(false)
  }

  // 도시 제거
  const removeCity = (cityId: string) => {
    if (!page) return
    
    const updatedCities = (page.cities || []).filter(c => c.id !== cityId)
    
    setPage({
      ...page,
      cities: updatedCities,
      cityCode: updatedCities.length > 0 ? updatedCities[0].id : '',
      cityMasterId: updatedCities.length > 0 ? updatedCities[0].id : undefined,
      cityName: updatedCities.length > 0 ? updatedCities[0].name : undefined
    })
  }

  const removeSection = (index: number) => {
    if (!page) return
    setPage({
      ...page,
      content: page.content.filter((_, i) => i !== index)
    })
  }

  const updateSection = (index: number, section: PageSection) => {
    if (!page) return
    setPage({
      ...page,
      content: page.content.map((s, i) => (i === index ? section : s))
    })
  }

  const moveSection = (index: number, direction: "up" | "down") => {
    if (!page) return
    const newIndex = direction === "up" ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= page.content.length) return

    const newContent = [...page.content]
    ;[newContent[index], newContent[newIndex]] = [
      newContent[newIndex],
      newContent[index]
    ]

    setPage({ ...page, content: newContent })
  }

  const reorderSections = (newSections: PageSection[]) => {
    if (!page) return
    setPage({ ...page, content: newSections })
  }

  // Draft·Publish 권한 분리
  const isPublished = page?.status === "PUBLISHED"
  const canEdit = !isPublished

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!page) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>페이지를 찾을 수 없습니다</AlertDescription>
        </Alert>
      </div>
    )
  }

  // seo가 없는 경우 기본값 설정 (안전장치)
  if (!page.seo) {
    page.seo = {
      title: "",
      description: "",
      index: true
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isNew ? "새 페이지 만들기" : `페이지 편집: ${slug}`}
          </h1>
          <p className="text-muted-foreground mt-1">
            페이지 정보를 입력하고 섹션을 추가하세요
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/admin/citydirect")}
          >
            목록으로
          </Button>
          <Button onClick={handleSave} disabled={saving || !canEdit}>
            {saving ? "저장 중..." : "저장"}
          </Button>
          
          {/* 미리보기 버튼 */}
          {page.slug && (
            <Button
              variant="outline"
              onClick={() => {
                const previewUrl = `/marketing/citydirect/${page.slug}`
                window.open(previewUrl, "_blank")
              }}
            >
              🔍 미리보기
            </Button>
          )}
        </div>
      </div>

      {isPublished && (
        <Alert>
          <AlertDescription>
            ⚠️ 발행된 페이지입니다. 수정하려면 먼저 초안 상태로 변경하세요.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

       {success && (
         <Alert>
           <AlertDescription>
             ✅ 저장되었습니다
             {page.slug && (
               <span className="block mt-2 text-sm">
                 프론트엔드 URL: <code className="bg-muted px-1 rounded">/marketing/{page.slug}</code>
               </span>
             )}
           </AlertDescription>
         </Alert>
       )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="slug">
                  슬러그 (URL 경로)
                </Label>
                <Input
                  id="slug"
                  value={page.slug || ""}
                  onChange={e => setPage({ ...page, slug: e.target.value })}
                  disabled={!isNew || !canEdit}
                  placeholder="예: seoul-city"
                />
                {page.slug && (
                  <p className="text-xs text-muted-foreground">
                    프론트엔드 URL: <code className="bg-muted px-1 rounded">/marketing/{page.slug}</code>
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  페이지의 고유 식별자입니다. 영문 소문자, 숫자, 하이픈(-)만 사용하세요.
                </p>
              </div>
             <div className="space-y-2">
               <Label htmlFor="citySearch">도시 검색</Label>
               <div className="relative" data-city-search-container>
                 <Input
                   id="citySearch"
                   value={citySearchKeyword}
                   onChange={e => {
                     setCitySearchKeyword(e.target.value)
                     searchCity(e.target.value)
                   }}
                   onFocus={() => {
                     if (citySearchResults.length > 0) {
                       setShowCityDropdown(true)
                     }
                   }}
                   disabled={!canEdit}
                   placeholder="도시명을 입력하세요 (예: 하바나, 파리, 도쿄)"
                   autoComplete="off"
                 />
                 {citySearchLoading && (
                   <div className="absolute right-3 top-1/2 -translate-y-1/2">
                     <span className="text-sm text-muted-foreground">검색중...</span>
                   </div>
                 )}
                 
                 {/* 검색 결과 없음 */}
                 {!citySearchLoading && citySearchKeyword && citySearchResults.length === 0 && showCityDropdown && (
                   <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-4 text-center text-sm text-gray-500">
                     검색 결과가 없습니다. 다른 키워드로 검색해보세요.
                   </div>
                 )}
                 
                 {/* 자동완성 드롭다운 */}
                 {showCityDropdown && citySearchResults.length > 0 && (
                   <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                     {citySearchResults.map((city) => {
                       return (
                         <button
                           key={city.id}
                           type="button"
                           onClick={() => selectCity(city)}
                           className="w-full px-4 py-2 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                         >
                           <div className="flex items-center justify-between">
                             <div className="font-semibold text-gray-900">{city.city}</div>
                             {city.matchScore === 100 && (
                               <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                                 정확히 일치
                               </span>
                             )}
                           </div>
                           <div className="text-xs text-gray-600 mt-1">
                             {city.state && <span>{city.state}, </span>}
                             <span>{city.nation}</span>
                             <span className="ml-2 text-gray-400">ID: {city.id}</span>
                           </div>
                           {city.aliases && (
                             <div className="text-xs text-gray-400 mt-1">
                               별칭: {city.aliases}
                             </div>
                           )}
                         </button>
                       )
                     })}
                   </div>
                 )}
               </div>
               
               {/* 선택된 도시들 표시 */}
               {page.cities && page.cities.length > 0 && (
                 <div className="space-y-2">
                   <div className="text-xs font-medium text-gray-700">
                     선택된 도시 ({page.cities.length}개)
                   </div>
                   <div className="flex flex-wrap gap-2">
                     {page.cities.map((city) => (
                       <div
                         key={city.id}
                         className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm"
                       >
                         <div className="flex flex-col">
                           <span className="font-semibold text-blue-900">{city.name}</span>
                           <span className="text-xs text-blue-600">
                             {city.nation && `${city.nation} · `}ID: {city.id}
                           </span>
                         </div>
                         {canEdit && (
                           <button
                             type="button"
                             onClick={() => removeCity(city.id)}
                             className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded p-1 transition-colors"
                             title="도시 제거"
                           >
                             ✕
                           </button>
                         )}
                       </div>
                     ))}
                   </div>
                 </div>
               )}
               
               <p className="text-xs text-muted-foreground">
                 도시명으로 검색하여 여러 개의 도시를 추가할 수 있습니다.
               </p>
             </div>
           <div className="space-y-2">
             <Label htmlFor="status">상태</Label>
             <select
               id="status"
               value={page.status}
               onChange={e =>
                 setPage({
                   ...page,
                   status: e.target.value as PageStatus
                 })
               }
               className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
             >
               <option value="DRAFT">초안</option>
               <option value="PUBLISHED">발행</option>
             </select>
             <p className="text-xs text-muted-foreground">
               발행 후에는 초안으로 변경해야 편집할 수 있습니다
             </p>
           </div>
          </CardContent>
        </Card>

          <Card className="shadow-sm">
            <CardHeader className="bg-gray-50">
              <CardTitle className="flex items-center gap-2">
                <span>🔍</span>
                <span>SEO 설정</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label htmlFor="seo-title">제목</Label>
               <Input
                 id="seo-title"
                 value={page.seo?.title ?? ""}
                 onChange={e =>
                   setPage({
                     ...page,
                     seo: { 
                       ...(page.seo || { title: "", description: "", index: true }),
                       title: e.target.value 
                     }
                   })
                 }
                 disabled={!canEdit}
                 placeholder="SEO 제목"
               />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seo-description">설명</Label>
               <Textarea
                 id="seo-description"
                 value={page.seo?.description ?? ""}
                 onChange={e =>
                   setPage({
                     ...page,
                     seo: { 
                       ...(page.seo || { title: "", description: "", index: true }),
                       description: e.target.value 
                     }
                   })
                 }
                 disabled={!canEdit}
                 placeholder="SEO 설명"
                 rows={3}
               />
            </div>
            <div className="space-y-2">
              <Label htmlFor="og-image">OG 이미지 URL</Label>
               <Input
                 id="og-image"
                 type="url"
                 value={page.seo?.ogImage ?? ""}
                 onChange={e =>
                   setPage({
                     ...page,
                     seo: { 
                       ...(page.seo || { title: "", description: "", index: true }),
                       ogImage: e.target.value || undefined 
                     }
                   })
                 }
                 disabled={!canEdit}
                 placeholder="https://example.com/image.jpg"
               />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="seo-index"
                checked={page.seo?.index ?? true}
                onChange={e =>
                  setPage({
                    ...page,
                    seo: { 
                      ...(page.seo || { title: "", description: "", index: true }),
                      index: e.target.checked 
                    }
                  })
                }
                disabled={!canEdit}
              />
              <Label htmlFor="seo-index" className="cursor-pointer">
                검색 엔진 인덱싱 허용
              </Label>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2컬럼 레이아웃: 좌측 편집, 우측 트리 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 좌측: 콘텐츠 편집 영역 */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>콘텐츠 섹션</CardTitle>
                <Badge variant="secondary">{page.content.length}개</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => addSection("Hero")}
              disabled={!canEdit}
            >
              + Hero
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addSection("IntroText")}
              disabled={!canEdit}
            >
              + IntroText
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addSection("ProductGrid")}
              disabled={!canEdit}
            >
              + ProductGrid
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addSection("ProductTabs")}
              disabled={!canEdit}
            >
              + ProductTabs (탭 구조)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addSection("FAQ")}
              disabled={!canEdit}
            >
              + FAQ
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addSection("ImageCarousel")}
              disabled={!canEdit}
            >
              + 이미지 캐러셀
            </Button>
          </div>

          <div className="space-y-4">
            {page.content.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                섹션이 없습니다. 위 버튼을 클릭하여 섹션을 추가하세요.
              </div>
            ) : canEdit ? (
              <SortableSectionList
                sections={page.content}
                onReorder={reorderSections}
                renderSection={(section, index, onUpdate, onRemove) => (
                  <SectionEditorContent
                    section={section}
                    index={index}
                    onUpdate={onUpdate}
                    onRemove={onRemove}
                    collapsed={collapsedSections.has(index)}
                    onToggleCollapse={() => {
                      setCollapsedSections(prev => {
                        const next = new Set(prev)
                        if (next.has(index)) {
                          next.delete(index)
                        } else {
                          next.add(index)
                        }
                        return next
                      })
                    }}
                  />
                )}
                onUpdate={updateSection}
                onRemove={removeSection}
              />
            ) : (
              page.content.map((section, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{section.type}</Badge>
                      <span className="text-sm text-muted-foreground">
                        섹션 {index + 1}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <SectionEditorContent
                      section={section}
                      index={index}
                      onUpdate={() => {}}
                      onRemove={() => {}}
                      readOnly
                      collapsed={collapsedSections.has(index)}
                      onToggleCollapse={() => {
                        setCollapsedSections(prev => {
                          const next = new Set(prev)
                          if (next.has(index)) {
                            next.delete(index)
                          } else {
                            next.add(index)
                          }
                          return next
                        })
                      }}
                    />
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>

    {/* 우측: 페이지 구조 트리 */}
    <div className="lg:col-span-1">
      <SectionTree
        sections={page.content}
        onReorder={reorderSections}
        onSectionClick={(index) => {
          setCurrentSectionIndex(index)
          // 해당 섹션으로 스크롤
          const element = document.querySelector(`[data-section-index="${index}"]`)
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }}
        currentIndex={currentSectionIndex}
      />
    </div>
  </div>
    </div>
  )
}

function SectionEditorContent({
  section,
  index,
  onUpdate,
  onRemove,
  readOnly = false,
  collapsed = false,
  onToggleCollapse
}: {
  section: PageSection
  index: number
  onUpdate: (index: number, section: PageSection) => void
  onRemove: (index: number) => void
  readOnly?: boolean
  collapsed?: boolean
  onToggleCollapse?: () => void
}) {
  const update = (updates: Partial<PageSection>) => {
    if (!readOnly) {
      onUpdate(index, { ...section, ...updates } as PageSection)
    }
  }

  // 공통 배지 유틸을 사용해 섹션 배지 정규화
  const badgesForSection =
    section.type === "ProductGrid" || section.type === "ProductTabs"
      ? normalizeBadges(
          (section as any).badges,
          (section as any).badge,
          (section as any).badgeTargets
        )
      : []

  const setBadges = (badges: any[]) => {
    if (readOnly) return
    if (section.type !== "ProductGrid" && section.type !== "ProductTabs") return
    onUpdate(index, { ...(section as any), badges, badge: undefined, badgeTargets: undefined } as PageSection)
  }

  const updateBadge = (changes: Partial<ProductBadge>) => {
    if (readOnly) return
    if (section.type !== "ProductGrid" && section.type !== "ProductTabs") return
    const nextBadge = { ...(section.badge || {}), ...changes }
    onUpdate(index, { ...section, badge: nextBadge } as PageSection)
  }

  // 섹션 타이틀 추출
  const getSectionTitle = () => {
    if (section.type === "Hero" || section.type === "IntroText" || section.type === "ProductGrid" || section.type === "ProductTabs") {
      return (section as any).title || "제목 없음"
    }
    if (section.type === "ImageCarousel") {
      return `이미지 캐러셀 (${(section as any).slides?.length || 0}개)`
    }
    if (section.type === "FAQ") {
      return `FAQ (${(section as any).items?.length || 0}개)`
    }
    return section.type
  }

  return (
    <div className="space-y-4">
      {/* 섹션 헤더 */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b">
        <button
          onClick={onToggleCollapse}
          className="flex items-center gap-2 flex-1 text-left hover:bg-gray-50 p-2 rounded transition-colors"
        >
          <span className="text-lg transition-transform" style={{ transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}>
            ▼
          </span>
          <Badge variant="outline" className="shrink-0">{section.type}</Badge>
          <span className="text-sm font-medium truncate">{getSectionTitle()}</span>
        </button>
        {!readOnly && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(index)}
            className="shrink-0"
          >
            삭제
          </Button>
        )}
      </div>

      {/* 섹션 내용 - collapsed일 때 숨김 */}
      {!collapsed && (
        <div className="space-y-4">
      {section.type === "Hero" && (
        <>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>제목</Label>
              {!readOnly && (
                <InlineStyleControl
                  label="제목 스타일"
                  color={section.style?.titleColor}
                  size={section.style?.titleSize || "2xl"}
                  onColorChange={(color) => update({ 
                    style: { ...section.style, titleColor: color || undefined } 
                  })}
                  onSizeChange={(size) => update({ 
                    style: { ...section.style, titleSize: size as any } 
                  })}
                  type="title"
                />
              )}
            </div>
            <Input
              value={section.title}
              onChange={e => update({ title: e.target.value })}
              disabled={readOnly}
              placeholder="Hero 제목"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>부제목 (선택)</Label>
              {!readOnly && section.subtitle && (
                <InlineStyleControl
                  label="부제목 스타일"
                  color={section.style?.textColor}
                  size={section.style?.textSize || "base"}
                  onColorChange={(color) => update({ 
                    style: { ...section.style, textColor: color || undefined } 
                  })}
                  onSizeChange={(size) => update({ 
                    style: { ...section.style, textSize: size as any } 
                  })}
                  type="body"
                />
              )}
            </div>
             <Input
               value={section.subtitle ?? ""}
               onChange={e =>
                 update({ subtitle: e.target.value || undefined })
               }
               disabled={readOnly}
               placeholder="Hero 부제목"
             />
          </div>
          <div className="space-y-2">
            <Label>이미지 URL (선택)</Label>
             <Input
               type="url"
               value={section.image ?? ""}
               onChange={e => update({ image: e.target.value || undefined })}
               disabled={readOnly}
               placeholder="https://example.com/image.jpg"
             />
          </div>
        </>
      )}

      {section.type === "IntroText" && (
        <>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>제목</Label>
              {!readOnly && (
                <InlineStyleControl
                  label="제목 스타일"
                  color={section.style?.titleColor}
                  size={section.style?.titleSize || "2xl"}
                  onColorChange={(color) => update({ 
                    style: { ...section.style, titleColor: color || undefined } 
                  })}
                  onSizeChange={(size) => update({ 
                    style: { ...section.style, titleSize: size as any } 
                  })}
                  type="title"
                />
              )}
            </div>
            <Input
              value={section.title}
              onChange={e => update({ title: e.target.value })}
              disabled={readOnly}
              placeholder="섹션 제목"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>설명</Label>
              {!readOnly && (
                <InlineStyleControl
                  label="설명 스타일"
                  color={section.style?.textColor}
                  size={section.style?.textSize || "base"}
                  onColorChange={(color) => update({ 
                    style: { ...section.style, textColor: color || undefined } 
                  })}
                  onSizeChange={(size) => update({ 
                    style: { ...section.style, textSize: size as any } 
                  })}
                  type="body"
                />
              )}
            </div>
            <RichTextEditor
              value={section.description}
              onChange={(value) => update({ description: value })}
              disabled={readOnly}
              placeholder="섹션 설명을 입력하세요. 서식을 지정할 수 있습니다."
            />
          </div>
        </>
      )}

      {section.type === "ProductGrid" && (
        <>
          {(() => {
            const badges = badgesForSection
            const addBadge = () => {
              setBadges([
                ...badges,
                {
                  id: `badge-${Date.now()}`,
                  text: "",
                  backgroundColor: "#111827",
                  textColor: "#ffffff",
                  borderColor: "transparent",
                  targets: []
                }
              ])
            }

            const updateBadgeItem = (i: number, changes: any) => {
              const next = [...badges]
              next[i] = { ...next[i], ...changes }
              setBadges(next)
            }

            const removeBadge = (i: number) => {
              const next = badges.filter((_, idx) => idx !== i)
              setBadges(next)
            }

            return (
              <div className="space-y-3 rounded-lg border border-gray-200 p-3 bg-white">
                <div className="flex items-center justify-between">
                  <Label className="m-0">대표 이미지 뱃지</Label>
                  {!readOnly && (
                    <Button size="sm" variant="outline" onClick={addBadge}>
                      + 뱃지 추가
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  텍스트를 비우면 노출되지 않습니다. 적용 상품 ID를 비우면 전체 상품에 적용됩니다.
                </p>

                {badges.length === 0 ? (
                  <div className="text-xs text-muted-foreground text-center py-4">
                    뱃지를 추가해 상품별로 표시를 설정하세요.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left p-2 font-semibold text-xs">미리보기</th>
                          <th className="text-left p-2 font-semibold text-xs">텍스트</th>
                          <th className="text-left p-2 font-semibold text-xs">텍스트 색상</th>
                          <th className="text-left p-2 font-semibold text-xs">배경색</th>
                          <th className="text-left p-2 font-semibold text-xs">테두리 색상</th>
                          <th className="text-left p-2 font-semibold text-xs">적용 상품</th>
                          {!readOnly && <th className="text-left p-2 font-semibold text-xs">삭제</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {badges.map((badgeItem, i) => (
                          <tr key={badgeItem.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="p-2">
                              {badgeItem.text ? (
                                <span
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold"
                                  style={{
                                    backgroundColor: badgeItem.backgroundColor || "rgba(17,24,39,0.9)",
                                    color: badgeItem.textColor || "#ffffff",
                                    border: `1px solid ${badgeItem.borderColor || "transparent"}`
                                  }}
                                >
                                  {badgeItem.text}
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground">-</span>
                              )}
                            </td>
                            <td className="p-2">
                              <Input
                                value={badgeItem.text || ""}
                                onChange={e => updateBadgeItem(i, { text: e.target.value })}
                                disabled={readOnly}
                                placeholder="예: 베스트"
                                className="h-8 text-xs w-24"
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                type="color"
                                value={badgeItem.textColor || "#ffffff"}
                                onChange={e => updateBadgeItem(i, { textColor: e.target.value })}
                                disabled={readOnly}
                                className="h-8 w-16 p-1"
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                type="color"
                                value={badgeItem.backgroundColor || "#111827"}
                                onChange={e => updateBadgeItem(i, { backgroundColor: e.target.value })}
                                disabled={readOnly}
                                className="h-8 w-16 p-1"
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                type="color"
                                value={badgeItem.borderColor || "#111827"}
                                onChange={e => updateBadgeItem(i, { borderColor: e.target.value })}
                                disabled={readOnly}
                                className="h-8 w-16 p-1"
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                value={badgeItem.targets?.join(", ") || ""}
                                onChange={e => {
                                  const targets = e.target.value
                                    .split(/[,\n]/)
                                    .map(id => id.trim())
                                    .filter(Boolean)
                                  updateBadgeItem(i, { targets: targets.length > 0 ? targets : undefined })
                                }}
                                disabled={readOnly}
                                placeholder="전체 적용"
                                className="h-8 text-xs w-32"
                              />
                              {badgeItem.targets && badgeItem.targets.length > 0 && (
                                <div className="mt-1 text-xs text-muted-foreground">
                                  {badgeItem.targets.length}개
                                </div>
                              )}
                            </td>
                            {!readOnly && (
                              <td className="p-2">
                                <Button size="sm" variant="ghost" onClick={() => removeBadge(i)} className="h-8 text-xs">
                                  삭제
                                </Button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )
          })()}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>제목</Label>
              {!readOnly && (
                <InlineStyleControl
                  label="제목 스타일"
                  color={section.style?.titleColor}
                  size={section.style?.titleSize || "2xl"}
                  onColorChange={(color) => update({ 
                    style: { ...section.style, titleColor: color || undefined } 
                  })}
                  onSizeChange={(size) => update({ 
                    style: { ...section.style, titleSize: size as any } 
                  })}
                  type="title"
                />
              )}
            </div>
            <Input
              value={section.title}
              onChange={e => update({ title: e.target.value })}
              disabled={readOnly}
              placeholder="상품 그리드 제목"
            />
          </div>
          
          <div className="space-y-2">
            <Label>카드 타입 (한 줄에 표시할 개수)</Label>
            <select
              value={section.columns || 4}
              onChange={e => update({ columns: Number(e.target.value) as 1 | 2 | 3 | 4 })}
              disabled={readOnly}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value={1}>1개 - 큰 카드 (상세 정보)</option>
              <option value={2}>2개 - 중간 카드</option>
              <option value={3}>3개 - 표준 카드</option>
              <option value={4}>4개 - 작은 카드 (기본)</option>
            </select>
            <p className="text-xs text-muted-foreground">
              💡 카드 개수에 따라 표시되는 정보량이 달라집니다
            </p>
          </div>

          <div className="space-y-2">
            <Label>상품 ID (쉼표로 구분)</Label>
            <Textarea
              key={`productgrid-${index}-productIds`}
              defaultValue={section.productIds.join(", ")}
              onBlur={e => {
                const ids = e.target.value
                  .split(/[,\n]/)  // 쉼표 또는 줄바꿈으로 구분
                  .map(id => id.trim())
                  .filter(id => id.length > 0)  // 빈 문자열 제거
                
                console.log("📝 상품 ID 입력 완료:", {
                  raw: e.target.value,
                  parsed: ids,
                  count: ids.length
                })
                
                update({ productIds: ids })
              }}
              disabled={readOnly}
              placeholder="GPRD2001366002, GPRD2001366003, GPRD2001366004"
              rows={3}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                💡 각 상품 ID를 쉼표로 구분하거나 줄바꿈으로 입력하세요
              </p>
              <Badge variant={section.productIds.length > 0 ? "default" : "secondary"}>
                {section.productIds.length}개 상품
              </Badge>
            </div>
            {section.productIds.length > 0 && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs font-semibold text-gray-700 mb-2">입력된 상품 ID:</p>
                <div className="flex flex-wrap gap-2">
                  {section.productIds.map((id, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded px-2 py-1"
                    >
                      <span className="text-xs font-mono">{id}</span>
                      {!readOnly && (
                        <button
                          onClick={() => {
                            const newIds = section.productIds.filter((_, i) => i !== idx)
                            update({ productIds: newIds })
                          }}
                          className="text-red-500 hover:text-red-700 text-xs ml-1"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {section.productIds.length > 0 && (
            <div className="space-y-2">
              <Label>상품 미리보기 ({section.columns || 4}개 컬럼)</Label>
              <ProductPreview 
                productIds={section.productIds} 
                columns={section.columns}
                badges={badgesForSection}
                badge={section.badge}
                badgeTargets={section.badgeTargets}
              />
            </div>
          )}
        </>
      )}

      {section.type === "ProductTabs" && (
        <>
          {(() => {
            const badges = badgesForSection
            const addBadge = () => {
              setBadges([
                ...badges,
                {
                  id: `badge-${Date.now()}`,
                  text: "",
                  backgroundColor: "#111827",
                  textColor: "#ffffff",
                  borderColor: "transparent",
                  targets: []
                }
              ])
            }

            const updateBadgeItem = (i: number, changes: any) => {
              const next = [...badges]
              next[i] = { ...next[i], ...changes }
              setBadges(next)
            }

            const removeBadge = (i: number) => {
              const next = badges.filter((_, idx) => idx !== i)
              setBadges(next)
            }

            return (
              <div className="space-y-3 rounded-lg border border-gray-200 p-3 bg-white">
                <div className="flex items-center justify-between">
                  <Label className="m-0">대표 이미지 뱃지</Label>
                  {!readOnly && (
                    <Button size="sm" variant="outline" onClick={addBadge}>
                      + 뱃지 추가
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  모든 탭의 상품 썸네일에 공통으로 적용됩니다. 적용 상품 ID를 비우면 전체 상품에 적용됩니다.
                </p>

                {badges.length === 0 ? (
                  <div className="text-xs text-muted-foreground text-center py-4">
                    뱃지를 추가해 상품별로 표시를 설정하세요.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left p-2 font-semibold text-xs">미리보기</th>
                          <th className="text-left p-2 font-semibold text-xs">텍스트</th>
                          <th className="text-left p-2 font-semibold text-xs">텍스트 색상</th>
                          <th className="text-left p-2 font-semibold text-xs">배경색</th>
                          <th className="text-left p-2 font-semibold text-xs">테두리 색상</th>
                          <th className="text-left p-2 font-semibold text-xs">적용 상품</th>
                          {!readOnly && <th className="text-left p-2 font-semibold text-xs">삭제</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {badges.map((badgeItem, i) => (
                          <tr key={badgeItem.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="p-2">
                              {badgeItem.text ? (
                                <span
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold"
                                  style={{
                                    backgroundColor: badgeItem.backgroundColor || "rgba(17,24,39,0.9)",
                                    color: badgeItem.textColor || "#ffffff",
                                    border: `1px solid ${badgeItem.borderColor || "transparent"}`
                                  }}
                                >
                                  {badgeItem.text}
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground">-</span>
                              )}
                            </td>
                            <td className="p-2">
                              <Input
                                value={badgeItem.text || ""}
                                onChange={e => updateBadgeItem(i, { text: e.target.value })}
                                disabled={readOnly}
                                placeholder="예: 베스트"
                                className="h-8 text-xs w-24"
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                type="color"
                                value={badgeItem.textColor || "#ffffff"}
                                onChange={e => updateBadgeItem(i, { textColor: e.target.value })}
                                disabled={readOnly}
                                className="h-8 w-16 p-1"
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                type="color"
                                value={badgeItem.backgroundColor || "#111827"}
                                onChange={e => updateBadgeItem(i, { backgroundColor: e.target.value })}
                                disabled={readOnly}
                                className="h-8 w-16 p-1"
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                type="color"
                                value={badgeItem.borderColor || "#111827"}
                                onChange={e => updateBadgeItem(i, { borderColor: e.target.value })}
                                disabled={readOnly}
                                className="h-8 w-16 p-1"
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                value={badgeItem.targets?.join(", ") || ""}
                                onChange={e => {
                                  const targets = e.target.value
                                    .split(/[,\n]/)
                                    .map(id => id.trim())
                                    .filter(Boolean)
                                  updateBadgeItem(i, { targets: targets.length > 0 ? targets : undefined })
                                }}
                                disabled={readOnly}
                                placeholder="전체 적용"
                                className="h-8 text-xs w-32"
                              />
                              {badgeItem.targets && badgeItem.targets.length > 0 && (
                                <div className="mt-1 text-xs text-muted-foreground">
                                  {badgeItem.targets.length}개
                                </div>
                              )}
                            </td>
                            {!readOnly && (
                              <td className="p-2">
                                <Button size="sm" variant="ghost" onClick={() => removeBadge(i)} className="h-8 text-xs">
                                  삭제
                                </Button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )
          })()}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>섹션 제목 (선택)</Label>
              {!readOnly && section.title && (
                <InlineStyleControl
                  label="제목 스타일"
                  color={section.style?.titleColor}
                  size={section.style?.titleSize || "2xl"}
                  onColorChange={(color) => update({ 
                    style: { ...section.style, titleColor: color || undefined } 
                  })}
                  onSizeChange={(size) => update({ 
                    style: { ...section.style, titleSize: size as any } 
                  })}
                  type="title"
                />
              )}
            </div>
            <Input
              value={section.title || ""}
              onChange={e => update({ title: e.target.value })}
              disabled={readOnly}
              placeholder="예: 추천 상품"
            />
          </div>

          <div className="space-y-2">
            <Label>카드 타입 (한 줄에 표시할 개수)</Label>
            <select
              value={section.columns || 4}
              onChange={e => update({ columns: Number(e.target.value) as 1 | 2 | 3 | 4 })}
              disabled={readOnly}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value={1}>1개 - 큰 카드</option>
              <option value={2}>2개 - 중간 카드</option>
              <option value={3}>3개 - 표준 카드</option>
              <option value={4}>4개 - 작은 카드 (기본)</option>
            </select>
          </div>

          <div className="space-y-3 rounded-lg border border-gray-200 p-3 bg-white">
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>탭 목록</Label>
              {!readOnly && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newTabs = [
                      ...section.tabs,
                      { 
                        id: `tab${section.tabs.length + 1}`, 
                        label: `탭 ${section.tabs.length + 1}`, 
                        productIds: [] 
                      }
                    ]
                    update({ tabs: newTabs })
                  }}
                >
                  + 탭 추가
                </Button>
              )}
            </div>

            {section.tabs.map((tab, tabIdx) => (
              <Card key={tab.id} className="bg-muted/50">
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg">탭 {tabIdx + 1}</Label>
                    {!readOnly && section.tabs.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newTabs = section.tabs.filter((_, idx) => idx !== tabIdx)
                          update({ tabs: newTabs })
                        }}
                      >
                        삭제
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>탭 이름</Label>
                    <Input
                      value={tab.label}
                      onChange={e => {
                        const newTabs = [...section.tabs]
                        newTabs[tabIdx] = { ...tab, label: e.target.value }
                        update({ tabs: newTabs })
                      }}
                      disabled={readOnly}
                      placeholder="예: 인기 상품, 신상품, 특가"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>상품 ID (쉼표로 구분)</Label>
                    <Textarea
                      value={tab.productIds.join(", ")}
                      onChange={e => {
                        const ids = e.target.value
                          .split(/[,\n]/)
                          .map(id => id.trim())
                          .filter(id => id.length > 0)
                        
                        const newTabs = [...section.tabs]
                        newTabs[tabIdx] = { ...tab, productIds: ids }
                        update({ tabs: newTabs })
                      }}
                      disabled={readOnly}
                      placeholder="GPRD2001366002, GPRD2001366003"
                      rows={2}
                    />
                    <Badge variant={tab.productIds.length > 0 ? "default" : "secondary"}>
                      {tab.productIds.length}개 상품
                    </Badge>
                  </div>

                  {tab.productIds.length > 0 && !readOnly && (
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs font-semibold text-gray-700 mb-2">입력된 상품 ID:</p>
                      <div className="flex flex-wrap gap-2">
                        {tab.productIds.map((id, idIdx) => (
                          <div
                            key={idIdx}
                            className="inline-flex items-center gap-1 bg-gray-50 border border-gray-200 rounded px-2 py-1"
                          >
                            <span className="text-xs font-mono">{id}</span>
                            <button
                              onClick={() => {
                                const newIds = tab.productIds.filter((_, i) => i !== idIdx)
                                const newTabs = [...section.tabs]
                                newTabs[tabIdx] = { ...tab, productIds: newIds }
                                update({ tabs: newTabs })
                              }}
                              className="text-red-500 hover:text-red-700 text-xs ml-1"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {section.type === "FAQ" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>섹션 제목 (선택)</Label>
              {!readOnly && section.title && (
                <InlineStyleControl
                  label="제목 스타일"
                  color={section.style?.titleColor}
                  size={section.style?.titleSize || "2xl"}
                  onColorChange={(color) => update({ 
                    style: { ...section.style, titleColor: color || undefined } 
                  })}
                  onSizeChange={(size) => update({ 
                    style: { ...section.style, titleSize: size as any } 
                  })}
                  type="title"
                />
              )}
            </div>
            <Input
              value={section.title || ""}
              onChange={e => update({ title: e.target.value })}
              disabled={readOnly}
              placeholder="예: 자주 묻는 질문"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>FAQ 항목 목록</Label>
            {!readOnly && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newItems = [...section.items, { q: "", a: "" }]
                  update({ items: newItems })
                }}
              >
                + FAQ 추가
              </Button>
            )}
          </div>

          {section.items.map((item, i) => (
            <Card key={i} className="bg-muted/50">
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <Label>FAQ 항목 {i + 1}</Label>
                  {!readOnly && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newItems = section.items.filter(
                          (_, idx) => idx !== i
                        )
                        update({ items: newItems })
                      }}
                    >
                      삭제
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>질문</Label>
                  <Input
                    value={item.q}
                    onChange={e => {
                      const newItems = [...section.items]
                      newItems[i] = { ...item, q: e.target.value }
                      update({ items: newItems })
                    }}
                    disabled={readOnly}
                    placeholder="질문을 입력하세요"
                  />
                </div>
                <div className="space-y-2">
                  <Label>답변</Label>
                  <Textarea
                    value={item.a}
                    onChange={e => {
                      const newItems = [...section.items]
                      newItems[i] = { ...item, a: e.target.value }
                      update({ items: newItems })
                    }}
                    disabled={readOnly}
                    placeholder="답변을 입력하세요"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
          {!readOnly && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                update({ items: [...section.items, { q: "", a: "" }] })
              }}
            >
              + FAQ 항목 추가
            </Button>
          )}
        </div>
      )}

      {section.type === "ImageCarousel" && (
        <>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>섹션 제목 (선택)</Label>
              {!readOnly && section.title && (
                <InlineStyleControl
                  label="제목 스타일"
                  color={section.style?.titleColor}
                  size={section.style?.titleSize || "2xl"}
                  onColorChange={(color) => update({ 
                    style: { ...section.style, titleColor: color || undefined } 
                  })}
                  onSizeChange={(size) => update({ 
                    style: { ...section.style, titleSize: size as any } 
                  })}
                  type="title"
                />
              )}
            </div>
            <Input
              value={section.title || ""}
              onChange={e => update({ title: e.target.value })}
              disabled={readOnly}
              placeholder="예: 이용 꿀팁"
            />
          </div>

          <div className="space-y-2">
            <Label>이미지 높이</Label>
            <select
              value={section.imageHeight || "medium"}
              onChange={e => {
                const height = e.target.value as "small" | "medium" | "large" | "xlarge" | "custom"
                update({ 
                  imageHeight: height,
                  customHeight: height === "custom" ? section.customHeight || 400 : undefined,
                  customWidth: height === "custom" ? section.customWidth || 800 : undefined
                })
              }}
              disabled={readOnly}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="small">작음 (192px)</option>
              <option value="medium">보통 (256px) - 기본</option>
              <option value="large">큼 (384px)</option>
              <option value="xlarge">매우 큼 (500px)</option>
              <option value="custom">커스텀</option>
            </select>
            {section.imageHeight === "custom" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">커스텀 높이 (px)</Label>
                  <Input
                    type="number"
                    value={section.customHeight || 400}
                    onChange={e => {
                      const height = parseInt(e.target.value) || 400
                      update({ customHeight: height })
                    }}
                    disabled={readOnly}
                    placeholder="400"
                    min={100}
                    max={1000}
                    className="h-10"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">커스텀 너비 (px)</Label>
                  <Input
                    type="number"
                    value={section.customWidth || 800}
                    onChange={e => {
                      const width = parseInt(e.target.value) || 800
                      update({ customWidth: width })
                    }}
                    disabled={readOnly}
                    placeholder="800"
                    min={200}
                    max={2000}
                    className="h-10"
                  />
                </div>
              </div>
            )}
            {section.imageHeight === "custom" && (
              <p className="text-xs text-muted-foreground">
                💡 높이: 100px ~ 1000px, 너비: 200px ~ 2000px 사이의 값을 입력하세요. 이미지는 지정된 크기에 맞게 리사이징됩니다.
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Label>슬라이드 목록</Label>
            {!readOnly && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newSlides = [
                    ...section.slides,
                    { id: `slide-${Date.now()}`, image: "", title: "", description: "" }
                  ]
                  update({ slides: newSlides })
                }}
              >
                + 슬라이드 추가
              </Button>
            )}
          </div>

          {section.slides.map((slide, i) => (
            <Card key={slide.id} className="bg-muted/50">
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <Label>슬라이드 {i + 1} / {section.slides.length}</Label>
                  <div className="flex gap-2">
                    {!readOnly && i > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newSlides = [...section.slides]
                          ;[newSlides[i], newSlides[i - 1]] = [newSlides[i - 1], newSlides[i]]
                          update({ slides: newSlides })
                        }}
                      >
                        ↑ 위로
                      </Button>
                    )}
                    {!readOnly && i < section.slides.length - 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newSlides = [...section.slides]
                          ;[newSlides[i], newSlides[i + 1]] = [newSlides[i + 1], newSlides[i]]
                          update({ slides: newSlides })
                        }}
                      >
                        ↓ 아래로
                      </Button>
                    )}
                    {!readOnly && section.slides.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newSlides = section.slides.filter((_, idx) => idx !== i)
                          update({ slides: newSlides })
                        }}
                      >
                        삭제
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>이미지 URL *</Label>
                  <Input
                    type="url"
                    value={slide.image}
                    onChange={e => {
                      const newSlides = [...section.slides]
                      newSlides[i] = { ...slide, image: e.target.value }
                      update({ slides: newSlides })
                    }}
                    disabled={readOnly}
                    placeholder="https://example.com/image.jpg"
                  />
                  {slide.image && (
                    <div className="mt-2">
                      <img 
                        src={slide.image} 
                        alt={`Slide ${i + 1}`}
                        className="max-w-full h-48 object-contain border border-gray-200 rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>제목 (선택)</Label>
                  <Input
                    value={slide.title || ""}
                    onChange={e => {
                      const newSlides = [...section.slides]
                      newSlides[i] = { ...slide, title: e.target.value }
                      update({ slides: newSlides })
                    }}
                    disabled={readOnly}
                    placeholder="슬라이드 제목"
                  />
                </div>

                <div className="space-y-2">
                  <Label>설명 (선택)</Label>
                  <Textarea
                    value={slide.description || ""}
                    onChange={e => {
                      const newSlides = [...section.slides]
                      newSlides[i] = { ...slide, description: e.target.value }
                      update({ slides: newSlides })
                    }}
                    disabled={readOnly}
                    placeholder="슬라이드 설명"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </>
      )}
        </div>
      )}
    </div>
  )
}
