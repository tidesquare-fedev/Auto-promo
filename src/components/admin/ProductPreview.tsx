import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProductBadgeItem, ProductBadge } from "@/types/page"
import { normalizeBadges, getBadgesForProduct } from "@/lib/badges"
import { useProducts } from "@/hooks/useProducts"
import { getProductCardStyles } from "@/lib/product-card-styles"

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

  // 상품 카드 스타일 유틸리티 사용
  const cardStyles = getProductCardStyles(columns)
  const showDetailedInfo = columns <= 2

  return (
    <div className={`grid ${cardStyles.gridColsClass} gap-6 justify-items-center mx-auto`}>
      {products.map((product, idx) => {
        // 이미지 배열 준비
        const productImages = product.images && product.images.length > 0 
          ? product.images 
          : (product.thumbnail ? [product.thumbnail] : [])
        
        if (productImages.length === 0) {
          return null
        }

        const displayImage = productImages[0]

        return (
          <Card key={product.id || idx} className="bg-white border border-gray-200 rounded-2xl hover:shadow-xl transition-all duration-300 w-full flex flex-col relative">
            {/* 상품 정보 */}
            <CardContent className={`${cardStyles.cardPaddingClass} flex-grow`}>
              {/* 제목 */}
              <h3 className={`font-bold ${cardStyles.titleSizeClass} mb-2 line-clamp-2 text-gray-900`}>
                {product.name || productIds[idx]}
              </h3>
              
              {/* 서브 타이틀 */}
              {product.subName && (
                <p className={`text-gray-600 mb-2 ${showDetailedInfo ? 'text-sm' : 'text-xs'}`}>
                  {product.subName}
                </p>
              )}
              
              {/* 상품 설명 */}
              {product.description && (
                <p className={`text-gray-600 mb-2 line-clamp-2 ${showDetailedInfo ? 'text-sm' : 'text-xs'}`}>
                  {product.description}
                </p>
              )}
              
              {/* 리뷰 키워드 */}
              {product.reviewKeywords && product.reviewKeywords.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
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
              
              {/* 평점 표시 (가격 위쪽) */}
              {product.reviewScore !== undefined && 
               product.reviewScore > 0 && (
                <div className="flex items-center mb-1" style={{ fontSize: '14px' }}>
                  <span style={{ color: 'rgb(255, 0, 231)', fontSize: '14px' }} className="font-bold mr-1">★</span>
                  <span className="font-semibold text-gray-900" style={{ fontSize: '14px' }}>{product.reviewScore}</span>
                  {product.reviewCount !== undefined && product.reviewCount > 0 && (
                    <span className="text-gray-500 ml-1" style={{ fontSize: '14px' }}>({product.reviewCount})</span>
                  )}
                </div>
              )}
            </CardContent>
            
            {/* 가격 + 예약하기 버튼 */}
            <div className="px-3 md:px-4 pb-2 md:pb-3">
              <div className="flex items-center justify-between gap-4">
                {/* 가격 - 좌측 */}
                {product.price && (
                  <p className={`text-gray-900 font-bold text-left ${cardStyles.priceSizeClass}`}>
                    {product.price.toLocaleString()}원
                  </p>
                )}
                
                {/* 예약하기 버튼 - 우측 */}
                {!product.soldOut && !product.isClosed && (
                  <button 
                    className={`text-white ${cardStyles.buttonPaddingClass} rounded-full transition-colors shadow-sm ${cardStyles.buttonTextClass} flex items-center justify-center gap-2 ${showDetailedInfo ? '' : 'flex-shrink-0'}`}
                    style={{ backgroundColor: '#000000' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1f2937'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#000000'}
                  >
                    예약하기
                    <div className={`${showDetailedInfo ? 'w-6 h-6' : 'w-5 h-5'} rounded-full bg-white flex items-center justify-center`}>
                      <svg className={`${showDetailedInfo ? 'w-3.5 h-3.5' : 'w-3 h-3'}`} fill="none" stroke="black" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                      </svg>
                    </div>
                  </button>
                )}
                {product.soldOut && (
                  <div className={`bg-gray-100 text-gray-500 font-bold ${cardStyles.buttonPaddingClass} rounded-full text-center ${cardStyles.buttonTextClass} ${showDetailedInfo ? '' : 'flex-shrink-0'}`}>
                    품절
                  </div>
                )}
                {product.isClosed && (
                  <div className={`bg-gray-100 text-gray-500 font-bold ${cardStyles.buttonPaddingClass} rounded-full text-center ${cardStyles.buttonTextClass} ${showDetailedInfo ? '' : 'flex-shrink-0'}`}>
                    종료된 상품
                  </div>
                )}
              </div>
            </div>

            {/* 이미지 영역 (하단) */}
            <div className="relative bg-gray-100 flex-shrink-0 rounded-t-2xl rounded-b-2xl overflow-hidden">
              <img 
                src={displayImage} 
                alt={product.name}
                className={`w-full ${cardStyles.imageHeightClass} object-cover rounded-t-2xl rounded-b-2xl`}
              />

              {/* 우측 하단: 품절 배지 */}
              <div className="absolute bottom-2 right-2 md:bottom-3 md:right-3 flex flex-col items-end gap-1 md:gap-2 z-10">
                {product.soldOut && (
                  <Badge variant="destructive" className="text-xs md:text-sm">
                    품절
                  </Badge>
                )}
              </div>

              {/* 좌측 하단: 카테고리 태그 */}
              <div className="absolute bottom-2 left-2 md:bottom-3 md:left-3 flex flex-col items-start gap-1 md:gap-2 z-10">
                {(product.isClosed || getBadgesForProduct(product.id, computedBadges).length > 0) && (
                  <div className="flex flex-row flex-wrap items-start gap-1 md:gap-2">
                    {product.isClosed && (
                      <Badge variant="secondary" className="text-xs md:text-sm">
                        종료
                      </Badge>
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
            </div>
          </Card>
        )
      })}
    </div>
  )
}

