"use client"

import { useState, useEffect } from "react"
import { ImageCarouselSection } from "@/types/page"
import { getSectionStyleClasses } from "@/lib/section-styles"

export function ImageCarousel({ title, slides, style, imageHeight = "medium", customHeight, customWidth }: ImageCarouselSection) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const styles = getSectionStyleClasses(style, "bg-white")

  // 이미지 높이 클래스 매핑
  const getImageHeightClass = () => {
    if (imageHeight === "custom") {
      return ""
    }
    const heightMap = {
      small: "h-48",
      medium: "h-64",
      large: "h-96",
      xlarge: "h-[500px]"
    }
    return heightMap[imageHeight] || "h-64"
  }

  // 이미지 스타일 (커스텀일 때 높이와 너비 모두 적용)
  const getImageStyle = () => {
    if (imageHeight === "custom") {
      const style: React.CSSProperties = {}
      if (customHeight) {
        style.height = `${customHeight}px`
      }
      if (customWidth) {
        style.width = `${customWidth}px`
        style.maxWidth = `${customWidth}px`
      }
      return style
    }
    return {}
  }

  // 최소 스와이프 거리
  const minSwipeDistance = 50

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

    if (isLeftSwipe && currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
    if (isRightSwipe && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
  }

  // 자동 슬라이드 (선택적)
  useEffect(() => {
    if (slides.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
    }, 5000) // 5초마다 자동 전환

    return () => clearInterval(interval)
  }, [slides.length])

  if (!slides || slides.length === 0) {
    return null
  }

  return (
    <section 
      className={`image-carousel-section py-12 ${styles.bgColor}`}
      style={{ backgroundColor: style?.backgroundColor }}
    >
      <div className="container mx-auto px-4">
        {title && (
          <h2 
            className={`${styles.titleSize} font-bold mb-8 text-center`}
            style={{ color: style?.titleColor }}
          >
            {title}
          </h2>
        )}

        <div 
          className="relative mx-auto flex flex-col items-center"
          style={imageHeight === "custom" && customWidth ? { maxWidth: `${customWidth}px`, width: "100%" } : { maxWidth: "56rem" }}
        >
          {/* 캐러셀 컨테이너 */}
          <div
            className="relative overflow-hidden rounded-lg w-full"
            style={imageHeight === "custom" && customWidth ? { width: `${customWidth}px`, maxWidth: "100%" } : {}}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="flex transition-transform duration-300 ease-in-out"
              style={{
                transform: `translateX(-${currentIndex * 100}%)`
              }}
            >
              {slides.map((slide, index) => (
                <div
                  key={slide.id}
                  className="min-w-full flex-shrink-0 flex items-center justify-center"
                  style={imageHeight === "custom" && customWidth ? { width: `${customWidth}px`, maxWidth: "100%" } : {}}
                >
                  <div 
                    className="relative flex items-center justify-center bg-gray-100 w-full"
                    style={getImageStyle()}
                  >
                    <img
                      src={slide.image}
                      alt={slide.title || `Slide ${index + 1}`}
                      className={`${imageHeight === "custom" ? "" : "w-full"} ${getImageHeightClass()} object-contain`}
                      style={getImageStyle()}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400"%3E%3Crect fill="%23e5e7eb" width="800" height="400"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="24"%3E이미지를 불러올 수 없습니다%3C/text%3E%3C/svg%3E'
                      }}
                    />
                    {(slide.title || slide.description) && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
                        {slide.title && (
                          <h3 className="text-xl font-bold mb-2">{slide.title}</h3>
                        )}
                        {slide.description && (
                          <p className="text-sm opacity-90">{slide.description}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 이전/다음 버튼 - 이미지 세로 중간에 배치, 양쪽 끝에 걸쳐지게 */}
          {slides.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 md:p-3 shadow-lg transition-all z-10"
                aria-label="이전 슬라이드"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={goToNext}
                className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 md:p-3 shadow-lg transition-all z-10"
                aria-label="다음 슬라이드"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* 인디케이터 (점) */}
          {slides.length > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`transition-all rounded-full ${
                    index === currentIndex
                      ? "w-8 h-2 bg-gray-800"
                      : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`슬라이드 ${index + 1}로 이동`}
                />
              ))}
            </div>
          )}

          {/* 슬라이드 카운터 */}
          {slides.length > 1 && (
            <div className="text-center mt-2 text-sm text-gray-500">
              {currentIndex + 1} / {slides.length}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
