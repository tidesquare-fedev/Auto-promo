import { SectionStyle } from "@/types/page"

/**
 * 섹션 스타일을 CSS 클래스로 변환
 * 디자인 관련 로직을 MCP 영역으로 모아 관리
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
      ? style.textSize === "sm"
        ? "text-sm"
        : style.textSize === "lg"
          ? "text-lg"
          : "text-base"
      : "text-base"
  }
}

/**
 * 컬럼 수에 따른 상품 카드 스타일 매핑
 * 디자인 관련 로직을 MCP 영역으로 모아 관리
 */
export type ProductCardStyles = {
  gridColsClass: string
  imageHeightClass: string
  cardPaddingClass: string
  titleSizeClass: string
  priceSizeClass: string
  buttonPaddingClass: string
  buttonTextClass: string
}

export function getProductCardStyles(columns: 1 | 2 | 3 | 4): ProductCardStyles {
  const gridColsClassMap = {
    1: "grid-cols-1 max-w-2xl",
    2: "grid-cols-1 md:grid-cols-2 max-w-4xl",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-6xl",
    4: "grid-cols-4 max-w-7xl"
  }

  const imageHeightClassMap = {
    1: "h-96 md:h-[28rem]",
    2: "h-80 md:h-96",
    3: "h-72 md:h-80",
    4: "h-64 md:h-72"
  }

  const cardPaddingClassMap = {
    1: "p-6",
    2: "p-4",
    3: "p-4",
    4: "p-4"
  }

  const titleSizeClassMap = {
    1: "text-2xl",
    2: "text-xl",
    3: "text-lg",
    4: "text-lg"
  }

  const priceSizeClassMap = {
    1: "text-2xl",
    2: "text-xl",
    3: "text-lg",
    4: "text-lg"
  }

  const buttonPaddingClassMap = {
    1: "py-2 md:py-3 px-5 md:px-6",
    2: "py-2 md:py-2.5 px-4 md:px-5",
    3: "py-1.5 md:py-2 px-3 md:px-4",
    4: "py-1.5 md:py-2 px-3 md:px-4"
  }

  const buttonTextClassMap = {
    1: "text-sm md:text-base",
    2: "text-sm md:text-base",
    3: "text-xs md:text-sm",
    4: "text-xs md:text-sm"
  }

  return {
    gridColsClass: gridColsClassMap[columns],
    imageHeightClass: imageHeightClassMap[columns],
    cardPaddingClass: cardPaddingClassMap[columns],
    titleSizeClass: titleSizeClassMap[columns],
    priceSizeClass: priceSizeClassMap[columns],
    buttonPaddingClass: buttonPaddingClassMap[columns],
    buttonTextClass: buttonTextClassMap[columns]
  }
}

