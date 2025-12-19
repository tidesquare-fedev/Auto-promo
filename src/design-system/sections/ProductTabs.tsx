import { useState, useEffect } from "react"
import { ProductTabsSection } from "@/types/page"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { normalizeBadges, getBadgesForProduct } from "@/lib/badges"
import { getSectionStyleClasses } from "@/lib/section-styles"
import { getProductCardStyles } from "@/lib/product-card-styles"
import { useProducts } from "@/hooks/useProducts"
import { getProductUrl } from "@/lib/tourvis-url"

export function ProductTabs({ title, tabs, columns = 4, style, badge, badgeTargets, badges }: ProductTabsSection) {
  const [products, setProducts] = useState<Record<string, any[]>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  // 각 탭별로 상품 조회 훅 사용 (동적 훅 사용은 불가능하므로 기존 방식 유지하되 로직 개선)
  const loadTabProducts = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId)
    if (!tab || products[tabId]) return

    if (tab.productIds.length === 0) {
      setProducts(prev => ({ ...prev, [tabId]: [] }))
      return
    }

    setLoading(prev => ({ ...prev, [tabId]: true }))
    
    fetch("/api/products/by-ids", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productIds: tab.productIds })
    })
      .then(async (res) => {
        if (!res.ok) {
          console.error("상품 조회 실패:", res.status)
          return []
        }
        const data = await res.json()
        return Array.isArray(data) ? data : []
      })
      .then(data => {
        setProducts(prev => ({ ...prev, [tabId]: data }))
        setLoading(prev => ({ ...prev, [tabId]: false }))
      })
      .catch((error) => {
        console.error("상품 조회 오류:", error)
        setProducts(prev => ({ ...prev, [tabId]: [] }))
        setLoading(prev => ({ ...prev, [tabId]: false }))
      })
  }

  // 첫 번째 탭 로드
  useEffect(() => {
    if (tabs.length > 0) {
      loadTabProducts(tabs[0].id)
    }
  }, [tabs])

  // 상품 카드 스타일 유틸리티 사용
  const cardStyles = getProductCardStyles(columns)
  const showDetailedInfo = columns <= 2

  const styles = getSectionStyleClasses(style, "bg-white")

  // 신규 배지 유틸을 사용해 정규화
  const computedBadges = normalizeBadges(badges, badge, badgeTargets)

  // 상품 그리드 렌더링 함수
  const renderProductGrid = (tabId: string) => {
    const tabProducts = products[tabId] || []
    const isLoading = loading[tabId] || false

    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">로딩 중...</p>
          </div>
        </div>
      )
    }

    if (tabProducts.length === 0) {
      return (
        <div className="text-center text-gray-500 py-20">
          <div className="text-4xl mb-4">📦</div>
          <p className="text-lg">상품이 없습니다</p>
        </div>
      )
    }

    return (
      <div className={`grid ${cardStyles.gridColsClass} gap-6 justify-items-center mx-auto`}>
        {tabProducts.map((product, idx) => (
          <a
            key={product.id || idx}
            href={getProductUrl(product.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 w-full flex flex-col relative block"
          >
            {product.thumbnail && (
              <div className="relative bg-gray-100 flex-shrink-0">
                <img
                  src={product.thumbnail}
                  alt={product.name}
                  className={`w-full ${cardStyles.imageHeightClass} object-cover`}
                />
                <div className="absolute top-2 right-2 md:top-3 md:right-3 flex flex-col items-end gap-1 md:gap-2">
                  {product.soldOut && (
                    <div className="bg-red-500 text-white px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-semibold">
                      품절
                    </div>
                  )}
                </div>
                {(product.isClosed || getBadgesForProduct(product.id, computedBadges).length > 0) && (
                  <div className="absolute top-2 left-2 md:top-3 md:left-3 flex flex-row flex-wrap items-start gap-1 md:gap-2">
                    {product.isClosed && (
                      <div className="bg-gray-700 text-white px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-semibold">
                        종료
                      </div>
                    )}
                    {getBadgesForProduct(product.id, computedBadges).map((b) => (
                      <span
                        key={b.id}
                        className="inline-flex items-center px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs font-semibold shadow-sm"
                        style={{
                          backgroundColor: b.backgroundColor || "rgba(17,24,39,0.9)",
                          color: b.textColor || "#ffffff",
                          border: `1px solid ${b.borderColor || "transparent"}`
                        }}
                      >
                        {b.text}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div className={`${cardStyles.cardPaddingClass} pb-[120px] flex-grow`}>
              {/* 지역 정보 - 있을 때만 표시 */}
              {product.region && (
                <p className={`text-gray-500 mb-2 ${showDetailedInfo ? 'text-sm' : 'text-xs'}`}>
                  {product.region}
                </p>
              )}

              {/* 제목 - 최대 2줄 */}
              <h3 className={`font-bold ${cardStyles.titleSizeClass} mb-2 line-clamp-2 text-gray-900`}>
                {product.name}
              </h3>
              
              {/* 서브 타이틀 - 있을 때만 표시 */}
              {product.subName && (
                <p className={`text-gray-600 mb-2 ${showDetailedInfo ? 'text-sm' : 'text-xs'}`}>
                  {product.subName}
                </p>
              )}

              {/* 리뷰 키워드 - 있을 때만 표시, 최대 3개 */}
              {product.reviewKeywords && product.reviewKeywords.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {product.reviewKeywords.slice(0, 3).map((keyword: string, kidx: number) => (
                    <span 
                      key={kidx} 
                      className="inline-flex items-center px-2 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-medium"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              )}

              {/* 리뷰 - review_score와 review_count가 모두 0이 아닐 때만 표시 */}
              {product.reviewScore !== undefined && 
               product.reviewCount !== undefined && 
               (product.reviewScore > 0 || product.reviewCount > 0) && (
                <div className={`flex items-center ${showDetailedInfo ? 'text-base' : 'text-sm'}`}>
                  <span style={{ color: '#ff00e7' }} className="font-bold text-lg mr-1">★</span>
                  <span className="font-semibold text-gray-700">{product.reviewScore}</span>
                  <span className="text-gray-500 ml-1">({product.reviewCount})</span>
                </div>
              )}
            </div>
            
            {/* 하단 고정 영역: 가격 + 예약하기 버튼 */}
            <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-3 md:p-4">
              {/* 가격 - 우측 정렬 */}
              {product.price && (
                <p className={`font-bold text-gray-900 mb-2 text-right ${cardStyles.priceSizeClass}`}>
                  {product.price.toLocaleString()}원
                </p>
              )}
              
              {/* 예약하기 버튼 + 상태 */}
              <div className="flex gap-2 items-center">
                {!product.soldOut && !product.isClosed && (
                  <button 
                    className="flex-1 text-white font-bold py-2 md:py-3 px-3 md:px-4 rounded-lg transition-colors shadow-sm text-sm md:text-base"
                    style={{ backgroundColor: '#374151' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1f2937'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#374151'}
                  >
                    예약하기
                  </button>
                )}
                {product.soldOut && (
                  <div className="flex-1 bg-gray-100 text-gray-500 font-bold py-2 md:py-3 px-3 md:px-4 rounded-lg text-center text-sm md:text-base">
                    품절
                  </div>
                )}
                {product.isClosed && (
                  <div className="flex-1 bg-gray-100 text-gray-500 font-bold py-2 md:py-3 px-3 md:px-4 rounded-lg text-center text-sm md:text-base">
                    종료된 상품
                  </div>
                )}
              </div>
            </div>
          </a>
        ))}
      </div>
    )
  }

  return (
    <section 
      className={`product-tabs-section py-12 ${styles.bgColor}`}
      style={{ backgroundColor: style?.backgroundColor }}
    >
      <div className="container mx-auto px-4 max-w-7xl">
        {title && (
          <h2 
            className={`${styles.titleSize} font-bold mb-8 text-center`}
            style={{ color: style?.titleColor }}
          >
            {title}
          </h2>
        )}

        {/* shadcn/ui Tabs */}
        <Tabs 
          defaultValue={tabs[0]?.id} 
          className="w-full"
          onValueChange={(value) => {
            // 탭 전환 시 해당 탭의 상품 로드
            if (!products[value]) {
              loadTabProducts(value)
            }
          }}
        >
          <TabsList className="grid w-full max-w-2xl mx-auto mb-8" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
            {tabs.map((tab) => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id}
                className="text-base font-semibold"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="mt-6">
              {renderProductGrid(tab.id)}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  )
}
