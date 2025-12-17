import { SectionStyle } from "@/types/page"

/**
 * 섹션 스타일을 CSS 클래스로 변환
 * @param style 섹션 스타일 설정
 * @param defaultBgClass backgroundColor 미지정 시 사용할 기본 배경 클래스
 */
export function getSectionStyleClasses(style?: SectionStyle, defaultBgClass: string = "bg-gray-50") {
  const titleSizeMap = {
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
    "3xl": "text-3xl"
  }

  return {
    bgColor: style?.backgroundColor || defaultBgClass,
    titleColor: style?.titleColor ? `text-[${style.titleColor}]` : "text-gray-900",
    titleSize: style?.titleSize ? titleSizeMap[style.titleSize] : "text-3xl",
    textColor: style?.textColor ? `text-[${style.textColor}]` : "text-gray-600",
    textSize: style?.textSize 
      ? (style.textSize === "sm" ? "text-sm" : style.textSize === "lg" ? "text-lg" : "text-base")
      : "text-base"
  }
}
