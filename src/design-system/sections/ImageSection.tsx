import { ImageSection as ImageSectionType } from "@/types/page"

export function ImageSection({ 
  image, 
  alt, 
  caption, 
  fullWidth = false, 
  link, 
  imageHeight = "auto",
  customHeight,
  customWidth,
  style 
}: ImageSectionType) {
  // 이미지 높이 클래스 매핑 (모바일 반응형)
  const getImageHeightClass = () => {
    if (imageHeight === "auto") return "h-auto"
    if (imageHeight === "custom") return "image-custom-height"
    
    const heightMap = {
      small: "h-48 md:h-64",
      medium: "h-64 md:h-80",
      large: "h-80 md:h-96",
      xlarge: "h-96 md:h-[500px]"
    }
    return heightMap[imageHeight] || "h-auto"
  }

  const imageContent = (
    <>
      {/* 이미지 */}
      <div 
        className={`relative overflow-hidden ${fullWidth ? "" : "rounded-lg"} ${link ? "cursor-pointer transition-opacity hover:opacity-90" : ""}`}
        style={
          imageHeight === "custom" && customWidth
            ? { "--image-custom-width": `${customWidth}px` } as React.CSSProperties
            : {}
        }
      >
        <img
          src={image}
          alt={alt || "섹션 이미지"}
          className={`w-full ${getImageHeightClass()} object-contain`}
          style={
            imageHeight === "custom" && customHeight
              ? { "--image-custom-height": `${customHeight}px` } as React.CSSProperties
              : {}
          }
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400"%3E%3Crect fill="%23e5e7eb" width="800" height="400"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="24"%3E이미지를 불러올 수 없습니다%3C/text%3E%3C/svg%3E'
          }}
        />
      </div>

      {/* 캡션 */}
      {caption && (
        <p 
          className={`text-center mt-4 text-sm md:text-base text-gray-600 ${fullWidth ? "px-4" : ""}`}
          style={{ color: style?.textColor }}
        >
          {caption}
        </p>
      )}
    </>
  )

  return (
    <section 
      className={`image-section ${fullWidth ? "" : "py-8 md:py-12"}`}
      style={{ backgroundColor: style?.backgroundColor }}
    >
      <div className={fullWidth ? "" : "container mx-auto px-4"}>
        <div className={fullWidth ? "" : "max-w-4xl mx-auto"}>
          {link ? (
            <a 
              href={link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block"
            >
              {imageContent}
            </a>
          ) : (
            imageContent
          )}
        </div>
      </div>
    </section>
  )
}
