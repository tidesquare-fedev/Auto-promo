import { IntroTextSection } from "@/types/page"

export function IntroText({ title, description, style }: IntroTextSection) {
  // 스타일 클래스 생성
  const titleSizeClass = {
    sm: "text-xl md:text-2xl",
    base: "text-2xl md:text-3xl",
    lg: "text-3xl md:text-4xl",
    xl: "text-4xl md:text-5xl",
    "2xl": "text-4xl md:text-5xl",
    "3xl": "text-5xl md:text-6xl"
  }[style?.titleSize || "lg"]

  const textSizeClass = {
    sm: "text-sm md:text-base",
    base: "text-base md:text-lg",
    lg: "text-lg md:text-xl",
    xl: "text-xl md:text-2xl"
  }[style?.textSize || "base"]

  return (
    <section 
      className="py-16"
      style={{ backgroundColor: style?.backgroundColor }}
    >
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h2 
            className={`${titleSizeClass} font-bold mb-6 text-center`}
            style={{ color: style?.titleColor }}
          >
            {title}
          </h2>
          {/* HTML 콘텐츠 렌더링 - 에디터에서 설정한 정렬 적용 */}
          <div 
            className={`intro-text-content ${textSizeClass} leading-relaxed`}
            style={{ color: style?.textColor }}
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </div>
      </div>
    </section>
  )
}
