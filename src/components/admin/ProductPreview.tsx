import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProductBadgeItem, ProductBadge } from "@/types/page"
import { normalizeBadges, getBadgesForProduct } from "@/lib/badges"
import { useProducts } from "@/hooks/useProducts"

interface ProductPreviewProps {
  productIds: string[]
  columns?: 1 | 2 | 3 | 4
  badges?: ProductBadgeItem[]
  // legacy props
  badge?: ProductBadge
  badgeTargets?: string[]
}

export function ProductPreview({ productIds, columns = 4, badges, badge, badgeTargets }: ProductPreviewProps) {
  // 어드민용 preview API 사용
  const { products, loading } = useProducts(productIds, "/api/products/preview")

  // 신규 배지 유틸을 사용해 정규화
  const computedBadges: ProductBadgeItem[] = normalizeBadges(badges, badge, badgeTargets)

  if (productIds.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-4">
        상품 ID를 입력하면 미리보기가 표시됩니다
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground text-center py-4">
        상품 정보를 불러오는 중...
      </div>
    )
  }

  // 컬럼 수에 따른 그리드 클래스
  const gridColsClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
  }[columns]

  // 컬럼 수에 따른 이미지 높이
  const imageHeightClass = {
    1: "h-64",
    2: "h-48",
    3: "h-40",
    4: "h-32"
  }[columns]

  // 1-2개 컬럼일 때는 더 많은 정보 표시
  const showDetailedInfo = columns <= 2

  return (
    <div className={`grid ${gridColsClass} gap-4 justify-items-center`}>
      {products.map((product, idx) => (
        <Card key={product.id || idx} className="overflow-hidden w-full flex flex-col relative">
          {/* 이미지 */}
          {product.thumbnail && (
            <div className="relative flex-shrink-0">
              <img
                src={product.thumbnail}
                alt={product.name}
                className={`w-full ${imageHeightClass} object-cover`}
              />

              <div className="absolute top-2 right-2 flex flex-col items-end gap-2">
                {product.soldOut && (
                  <Badge variant="destructive">
                    품절
                  </Badge>
                )}
              </div>

              {(product.isClosed || getBadgesForProduct(product.id, computedBadges).length > 0) && (
                <div className="absolute top-2 left-2 flex flex-row flex-wrap items-start gap-2">
                  {product.isClosed && (
                    <Badge variant="secondary">
                      종료
                    </Badge>
                  )}
                  {getBadgesForProduct(product.id, computedBadges).map((b) => (
                    <span
                      key={b.id}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm"
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
          
          {/* 상품 정보 */}
          <CardContent className="p-4 space-y-2 flex-grow pb-[120px]">
            {/* 지역 정보 - 제목 위로 */}
            {product.region && (
              <p className="text-xs text-muted-foreground">
                {product.region}
              </p>
            )}
            
            {/* 제목 - 최대 2줄 */}
            <p className={`font-bold line-clamp-2 ${columns === 1 ? 'text-lg' : 'text-base'}`}>
              {product.name || productIds[idx]}
            </p>
            
            {/* 서브 타이틀 - 있을 때만 표시 */}
            {product.subName && (
              <p className={`text-gray-600 ${columns === 1 ? 'text-sm' : 'text-xs'}`}>
                {product.subName}
              </p>
            )}
            
            {/* 리뷰 키워드 - 있을 때만 표시, 최대 3개 */}
            {product.reviewKeywords && product.reviewKeywords.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {product.reviewKeywords.slice(0, 3).map((keyword, kidx) => (
                  <span 
                    key={kidx} 
                    className="inline-flex items-center px-2 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-medium"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            )}
            
            {/* 리뷰 정보 - review_score와 review_count가 모두 0이 아닐 때만 표시 */}
            {product.reviewScore !== undefined && 
             product.reviewCount !== undefined && 
             (product.reviewScore > 0 || product.reviewCount > 0) && (
              <div className="flex items-center gap-2 text-sm mt-1">
                <span style={{ color: '#ff00e7' }} className="font-bold">★</span>
                <span className="font-semibold text-gray-700">{product.reviewScore}</span>
                <span className="text-gray-500">({product.reviewCount})</span>
              </div>
            )}
          </CardContent>
          
          {/* 하단 고정 영역: 가격 + 예약하기 버튼 */}
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4">
            {/* 가격 - 우측 정렬 */}
            {product.price && (
              <p className={`font-bold text-gray-900 mb-2 text-right ${columns === 1 ? 'text-xl' : 'text-base'}`}>
                {product.price.toLocaleString()}원
              </p>
            )}
            
            {/* 예약하기 버튼 + 상태 */}
            <div className="flex gap-2 items-center">
              {!product.soldOut && !product.isClosed && (
                <button 
                  className="flex-1 text-white font-semibold py-3 px-4 rounded-lg transition-colors text-sm"
                  style={{ backgroundColor: '#374151' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1f2937'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#374151'}
                >
                  예약하기
                </button>
              )}
              {product.soldOut && (
                <div className="flex-1 bg-gray-100 text-gray-500 font-semibold py-3 px-4 rounded-lg text-center text-sm">
                  품절
                </div>
              )}
              {product.isClosed && (
                <div className="flex-1 bg-gray-100 text-gray-500 font-semibold py-3 px-4 rounded-lg text-center text-sm">
                  종료
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

