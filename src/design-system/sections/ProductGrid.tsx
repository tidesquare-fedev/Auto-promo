import { ProductGridSection } from "@/types/page"
import { normalizeBadges, getBadgesForProduct } from "@/lib/badges"
import { getSectionStyleClasses } from "@/lib/section-styles"
import { getProductCardStyles } from "@/lib/product-card-styles"
import { useProducts } from "@/hooks/useProducts"

export function ProductGrid({ title, productIds, columns = 4, style, badge, badgeTargets, badges }: ProductGridSection) {
  const { products, loading } = useProducts(productIds)
  const styles = getSectionStyleClasses(style)

  // 신규 배지 유틸을 사용해 정규화
  const computedBadges = normalizeBadges(badges, badge, badgeTargets)

  if (loading) {
    return (
      <section className="product-grid-section py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">{title}</h2>
          <div className="text-center text-gray-500">로딩 중...</div>
        </div>
      </section>
    )
  }

  if (!Array.isArray(products) || products.length === 0) {
    return (
      <section className="product-grid-section py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">{title}</h2>
          <div className="text-center text-gray-500">
            상품이 없습니다
          </div>
        </div>
      </section>
    )
  }

  // 상품 카드 스타일 유틸리티 사용
  const cardStyles = getProductCardStyles(columns)
  const showDetailedInfo = columns <= 2

  return (
    <section 
      className={`product-grid-section py-12 ${styles.bgColor}`}
      style={{ backgroundColor: style?.backgroundColor }}
    >
      <div className="container mx-auto px-4">
        <h2 
          className={`${styles.titleSize} font-bold mb-8 text-center`}
          style={{ color: style?.titleColor }}
        >
          {title}
        </h2>
        <div className={`grid ${cardStyles.gridColsClass} gap-6 justify-items-center mx-auto`}>
            {products.map((product, idx) => (
            <div 
              key={product.id || idx} 
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 w-full flex flex-col relative"
            >
              {product.thumbnail && (
                <div className="relative bg-gray-100 flex-shrink-0">
                  <img 
                    src={product.thumbnail} 
                    alt={product.name}
                    className={`w-full ${cardStyles.imageHeightClass} object-cover`}
                  />

                  <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
                    {product.soldOut && (
                      <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        품절
                      </div>
                    )}
                  </div>

                  {(product.isClosed || getBadgesForProduct(product.id, computedBadges).length > 0) && (
                    <div className="absolute top-3 left-3 flex flex-row flex-wrap items-start gap-2">
                      {product.isClosed && (
                        <div className="bg-gray-700 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          종료
                        </div>
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
            <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4">
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
                    className="flex-1 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-sm"
                    style={{ backgroundColor: '#374151' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1f2937'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#374151'}
                  >
                    예약하기
                  </button>
                )}
                {product.soldOut && (
                  <div className="flex-1 bg-gray-100 text-gray-500 font-bold py-3 px-4 rounded-lg text-center">
                    품절
                  </div>
                )}
                {product.isClosed && (
                  <div className="flex-1 bg-gray-100 text-gray-500 font-bold py-3 px-4 rounded-lg text-center">
                    종료된 상품
                  </div>
                )}
              </div>
            </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
