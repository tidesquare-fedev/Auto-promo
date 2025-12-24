"use client"

import { useState, useEffect } from "react"
import { ProductGridSection } from "@/types/page"
import { normalizeBadges, getBadgesForProduct } from "@/lib/badges"
import { getSectionStyleClasses } from "@/lib/section-styles"
import { getProductCardStyles } from "@/lib/product-card-styles"
import { useProducts } from "@/hooks/useProducts"
import { getProductUrl } from "@/lib/tourvis-url"
import { fetchProductReview } from "@/lib/review-api"
import { Review } from "@/types/review"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"

export function ProductGrid({ title, productIds, columns = 4, style, badge, badgeTargets, badges, showReview = true }: ProductGridSection) {
  const { products, loading } = useProducts(productIds)
  const styles = getSectionStyleClasses(style)
  const [reviews, setReviews] = useState<Map<string, Review>>(new Map())
  const [reviewLoading, setReviewLoading] = useState(false)

  // 신규 배지 유틸을 사용해 정규화
  const computedBadges = normalizeBadges(badges, badge, badgeTargets)
  
  // 모든 상품의 리뷰 가져오기
  useEffect(() => {
    if (!showReview || !products || products.length === 0) return

    setReviewLoading(true)
    const reviewPromises = products.map((product) => 
      fetchProductReview(product.id)
        .then((reviewData) => {
          if (reviewData) {
            return { productId: product.id, review: reviewData }
          }
          return null
        })
        .catch((error) => {
          console.error(`리뷰 조회 오류 (${product.id}):`, error)
          return null
        })
    )

    Promise.all(reviewPromises).then((results) => {
      const reviewsMap = new Map<string, Review>()
      results.forEach((result) => {
        if (result && result.review) {
          reviewsMap.set(result.productId, result.review)
        }
      })
      setReviews(reviewsMap)
      setReviewLoading(false)
    })
  }, [products, showReview])

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
  
  // 상품이 1개일 때 가운데 정렬을 위한 스타일
  const isSingleProduct = products.length === 1
  const gridContainerClass = isSingleProduct 
    ? `grid ${cardStyles.gridColsClass} gap-6 justify-items-center mx-auto max-w-md`
    : `grid ${cardStyles.gridColsClass} gap-6 justify-items-center mx-auto`

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
        <div className={gridContainerClass}>
            {products.map((product, idx) => {
              // 이미지 배열 준비 (images 배열이 있으면 사용, 없으면 thumbnail 사용)
              const productImages = product.images && product.images.length > 0 
                ? product.images 
                : (product.thumbnail ? [product.thumbnail] : [])
              
              return (
                <div key={product.id || idx} className="w-full">
                  {/* 상품 카드 */}
                  <ProductCard
                    product={product}
                    images={productImages}
                    cardStyles={cardStyles}
                    showDetailedInfo={showDetailedInfo}
                    computedBadges={computedBadges}
                    getBadgesForProduct={getBadgesForProduct}
                    showReview={false}
                  />
                </div>
              )
            })}
        </div>
        
        {/* 리뷰 영역 (별도 섹션) */}
        {showReview && reviews.size > 0 && (
          <div className="mt-12">
            <ReviewsSection
              reviews={Array.from(reviews.entries()).map(([productId, review]) => ({ productId, review }))}
              showDetailedInfo={showDetailedInfo}
            />
          </div>
        )}
      </div>
    </section>
  )
}

// 상품 카드 컴포넌트 (이미지 스와이프 기능 포함)
interface ProductCardProps {
  product: any
  images: string[]
  cardStyles: any
  showDetailedInfo: boolean
  computedBadges: any[]
  getBadgesForProduct: (productId: string, badges: any[]) => any[]
  showReview?: boolean
}

function ProductCard({ 
  product, 
  images, 
  cardStyles, 
  showDetailedInfo,
  computedBadges,
  getBadgesForProduct,
  showReview = false
}: ProductCardProps) {

  // 이미지가 없으면 렌더링하지 않음
  if (images.length === 0) {
    return null
  }

  // 첫 번째 이미지만 사용
  const displayImage = images[0]

  return (
    <a
      href={getProductUrl(product.id)}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-white border border-gray-200 rounded-2xl hover:shadow-xl transition-all duration-300 w-full flex flex-col relative block"
    >
      {/* 상품 정보 */}
      <div className={`${cardStyles.cardPaddingClass} flex-grow`}>
        {/* 제목 */}
        <h3 className={`font-bold ${cardStyles.titleSizeClass} ${showDetailedInfo ? 'mb-1.5' : 'mb-2'} line-clamp-2 text-gray-900`}>
          {product.name}
        </h3>
        
        {/* 서브 타이틀 */}
        {product.subName && (
          <p className={`text-gray-600 ${showDetailedInfo ? 'mb-1.5' : 'mb-2'} ${showDetailedInfo ? 'text-sm' : 'text-xs'}`}>
            {product.subName}
          </p>
        )}
        
        {/* 상품 설명 */}
        {product.description && (
          <p className={`text-gray-600 ${showDetailedInfo ? 'mb-1.5' : 'mb-2'} line-clamp-2 ${showDetailedInfo ? 'text-sm' : 'text-xs'}`}>
            {product.description}
          </p>
        )}
        
        {/* 리뷰 키워드 */}
        {product.reviewKeywords && product.reviewKeywords.length > 0 && (
          <div className={`flex flex-wrap gap-1 ${showDetailedInfo ? 'mb-2' : 'mb-3'}`}>
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
      </div>
      
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
              onClick={(e) => {
                e.preventDefault()
                window.open(getProductUrl(product.id), '_blank')
              }}
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
            <div className="bg-red-500 text-white px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-semibold">
              품절
            </div>
          )}
        </div>

        {/* 좌측 하단: 카테고리 태그 */}
        <div className="absolute bottom-2 left-2 md:bottom-3 md:left-3 flex flex-col items-start gap-1 md:gap-2 z-10">
          {(product.isClosed || getBadgesForProduct(product.id, computedBadges).length > 0) && (
            <div className="flex flex-row flex-wrap items-start gap-1 md:gap-2">
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
      </div>
    </a>
  )
}

// 리뷰 섹션 컴포넌트 (모든 리뷰를 가로로 나열, 3개 초과 시 스와이프)
interface ReviewsSectionProps {
  reviews: Array<{ productId: string; review: Review }>
  showDetailedInfo: boolean
}

function ReviewsSection({ reviews, showDetailedInfo }: ReviewsSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const minSwipeDistance = 50
  const maxVisible = 3
  const shouldSwipe = reviews.length > maxVisible
  const cardWidth = 320 // 고정 카드 너비 (px)
  const gap = 16 // gap-4 = 1rem = 16px

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd || !shouldSwipe) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && currentIndex < reviews.length - maxVisible) {
      setCurrentIndex(currentIndex + 1)
    }
    if (isRightSwipe && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  if (reviews.length === 0) return null

  // 리뷰 개수에 따른 정렬 결정
  const reviewCount = reviews.length
  const isSingleReview = reviewCount === 1

  return (
    <div className="w-full">
      {/* 리얼 리뷰 안내 */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-gray-900">리얼 리뷰</span>
        </div>
      </div>
      
      {/* 리뷰 카드 컨테이너 */}
      <div
        className={`relative overflow-hidden ${isSingleReview ? 'flex justify-center' : ''}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className={`flex gap-4 transition-transform duration-300 ease-in-out ${
            shouldSwipe ? '' : isSingleReview ? 'justify-center' : 'justify-center flex-wrap'
          }`}
          style={{
            transform: shouldSwipe ? `translateX(-${currentIndex * (cardWidth + gap)}px)` : 'none'
          }}
        >
          {reviews.map(({ productId, review }, idx) => (
            <div
              key={productId}
              className="flex-shrink-0"
              style={{ 
                width: shouldSwipe ? `${cardWidth}px` : isSingleReview ? '100%' : 'auto',
                minWidth: shouldSwipe ? `${cardWidth}px` : isSingleReview ? '320px' : '320px',
                maxWidth: shouldSwipe ? `${cardWidth}px` : isSingleReview ? '400px' : '400px'
              }}
            >
              <ReviewCard
                review={review}
                showDetailedInfo={showDetailedInfo}
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* 인디케이터 (3개 초과일 때만) */}
      {shouldSwipe && reviews.length > maxVisible && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: reviews.length - maxVisible + 1 }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`transition-all rounded-full ${
                idx === currentIndex
                  ? "w-2 h-2 bg-purple-600"
                  : "w-2 h-2 bg-gray-300"
              }`}
              aria-label={`리뷰 ${idx + 1}로 이동`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// 개별 리뷰 카드 컴포넌트
interface ReviewCardProps {
  review: Review
  showDetailedInfo: boolean
}

function ReviewCard({ review, showDetailedInfo }: ReviewCardProps) {
  const [reviewImageIndex, setReviewImageIndex] = useState(0)

  // 키워드 추출
  const reviewKeywords = review.keywords || review.reviewKeywords || review.keywordList || []
  const keywordTexts = reviewKeywords.slice(0, 3).map((keyword: any) => {
    if (typeof keyword === 'string') {
      return keyword
    } else if (keyword && typeof keyword === 'object' && keyword.keywordNm) {
      return keyword.keywordNm
    }
    return null
  }).filter((text: string | null): text is string => text !== null)

  return (
    <div className="w-full">
      {/* 후기 카드 */}
      <div className="relative bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
        {/* 상단 인용 아이콘 (카드 내부, 스택 배치) */}
        <div className="mb-2">
          {/* 아이콘을 제목 위에 배치 */}
          <div className="h-8 w-8 mb-1 select-none pointer-events-none">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 10H16M8 14H12M11 3H13C17.9706 3 22 7.02944 22 12C22 16.9706 17.9706 21 13 21H6C3.79086 21 2 19.2091 2 17V12C2 7.02944 6.02944 3 11 3Z"
                stroke="#28303F"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          {/* 상품명 헤더 */}
          <div className="flex-1">
            <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-1">
              {review.prodNm}
            </h3>
            {review.prodOptionNm && (
              <p className="text-xs text-gray-500 line-clamp-1">
                {review.prodOptionNm}
              </p>
            )}
          </div>
        </div>

        {/* 리뷰 키워드 태그 */}
        {keywordTexts.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {keywordTexts.map((keywordText: string, kidx: number) => (
              <span 
                key={kidx} 
                className="inline-flex items-center px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 text-xs font-medium border border-purple-200"
              >
                {keywordText}
              </span>
            ))}
          </div>
        )}
        
        {/* 리뷰 본문과 이미지 */}
        <div className="space-y-4">
          {/* 리뷰 본문 */}
          <div className="text-sm text-gray-700 leading-relaxed">
            <ReviewContent content={review.reviewCont} />
          </div>
          
          {/* 리뷰 이미지 (하단에 배치, 여러 개일 경우 스와이프) */}
          {review.imageList && review.imageList.length > 0 && (
            <ReviewImageCarousel
              images={review.imageList}
              currentIndex={reviewImageIndex}
              onIndexChange={setReviewImageIndex}
              showDetailedInfo={showDetailedInfo}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// 리뷰 이미지 캐러셀 컴포넌트
interface ReviewImageCarouselProps {
  images: { fileId: number; imgSeq: number; orgImgPath: string }[]
  currentIndex: number
  onIndexChange: (index: number) => void
  showDetailedInfo?: boolean
}

function ReviewImageCarousel({
  images,
  currentIndex,
  onIndexChange,
  showDetailedInfo = false
}: ReviewImageCarouselProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const minSwipeDistance = 50
  const maxVisible = 3 // 한 번에 보여줄 이미지 개수
  const shouldSwipe = images.length > maxVisible

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (shouldSwipe) {
      if (isLeftSwipe && currentIndex < images.length - maxVisible) {
        onIndexChange(currentIndex + 1)
      }
      if (isRightSwipe && currentIndex > 0) {
        onIndexChange(currentIndex - 1)
      }
    } else {
      // 스와이프가 필요 없을 때는 기존 동작
      if (isLeftSwipe && currentIndex < images.length - 1) {
        onIndexChange(currentIndex + 1)
      }
      if (isRightSwipe && currentIndex > 0) {
        onIndexChange(currentIndex - 1)
      }
    }
  }

  if (images.length === 0) return null

  // 컬럼 수에 따라 이미지 크기 조정
  const imageSizeClass = showDetailedInfo 
    ? "w-24 h-24 md:w-28 md:h-28" // 2컬럼 이하: 더 크게
    : "w-20 h-20 md:w-24 md:h-24" // 3-4컬럼: 작게
  
  // 이미지 크기 (px) - 기본값
  const imageWidth = showDetailedInfo ? 112 : 96 // w-24 = 96px, w-28 = 112px
  const imageGap = 8 // gap-2 = 0.5rem = 8px

  // 이미지가 1개일 때
  if (images.length === 1) {
    return (
      <div className={`relative flex-shrink-0 ${imageSizeClass} rounded-xl overflow-hidden shadow-md border-2 border-gray-100`}>
        <img
          src={images[0].orgImgPath}
          alt="리뷰 이미지"
          className="w-full h-full object-cover"
        />
      </div>
    )
  }

  // 이미지가 여러 개일 때 - 한 줄에 여러 개 표시

  return (
    <div className="relative w-full">
      <div
        className="relative overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex gap-2 transition-transform duration-300 ease-in-out"
          style={{
            transform: shouldSwipe ? `translateX(-${currentIndex * (imageWidth + imageGap)}px)` : 'none'
          }}
        >
          {images.map((image, index) => (
            <div
              key={index}
              className="flex-shrink-0"
              style={{ 
                width: `${imageWidth}px`
              }}
            >
              <div className={`relative ${imageSizeClass} rounded-xl overflow-hidden shadow-md border-2 border-gray-100`}>
                <img
                  src={image.orgImgPath}
                  alt={`리뷰 이미지 ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* 인디케이터 (3개 초과일 때만) */}
      {shouldSwipe && images.length > maxVisible && (
        <div className="flex justify-center gap-1.5 mt-2">
          {Array.from({ length: images.length - maxVisible + 1 }).map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onIndexChange(idx)
              }}
              className={`transition-all rounded-full ${
                idx === currentIndex
                  ? "w-2 h-2 bg-purple-600"
                  : "w-2 h-2 bg-gray-300"
              }`}
              aria-label={`이미지 ${idx + 1}로 이동`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// 리뷰 본문 컴포넌트 (더보기 팝업 포함)
interface ReviewContentProps {
  content: string
}

function ReviewContent({ content }: ReviewContentProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  // 3줄 이상인지 확인 (대략적인 계산)
  const shouldShowMore = content.length > 150 // 대략 3줄 정도

  return (
    <div>
      <p className="text-sm leading-relaxed text-gray-800 line-clamp-3">{content}</p>
      {shouldShowMore && (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <button
              className="text-xs font-medium text-purple-600 hover:text-purple-800 mt-2 transition-colors"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setIsOpen(true)
              }}
            >
              더보기 →
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 max-h-96 overflow-y-auto p-4">
            <div className="space-y-3">
              <h4 className="font-bold text-base text-gray-900 border-b border-gray-200 pb-2">리뷰 전체 내용</h4>
              <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">{content}</p>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}
