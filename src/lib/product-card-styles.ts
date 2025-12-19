/**
 * 컬럼 수에 따른 상품 카드 스타일 매핑
 */
export type ProductCardStyles = {
  gridColsClass: string
  imageHeightClass: string
  cardPaddingClass: string
  titleSizeClass: string
  priceSizeClass: string
}

export function getProductCardStyles(columns: 1 | 2 | 3 | 4): ProductCardStyles {
  const gridColsClassMap = {
    1: "grid-cols-1 max-w-2xl",
    2: "grid-cols-1 md:grid-cols-2 max-w-4xl",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-6xl",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-7xl"
  }

  const imageHeightClassMap = {
    1: "h-64 md:h-80",
    2: "h-56 md:h-64",
    3: "h-48 md:h-56",
    4: "h-40 md:h-48"
  }

  const cardPaddingClassMap = {
    1: "p-6",
    2: "p-5",
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

  return {
    gridColsClass: gridColsClassMap[columns],
    imageHeightClass: imageHeightClassMap[columns],
    cardPaddingClass: cardPaddingClassMap[columns],
    titleSizeClass: titleSizeClassMap[columns],
    priceSizeClass: priceSizeClassMap[columns]
  }
}
