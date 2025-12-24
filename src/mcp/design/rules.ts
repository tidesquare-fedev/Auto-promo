// 디자인 시스템 규칙 (비즈니스 요구사항에 따라 조정 가능)
export const designRules = {
  Hero: {
    max: 1,
    required: [],
    optional: ["title", "subtitle", "image"]
  },
  ProductGrid: {
    max: 2,
    maxItems: 6,
    minItems: 1,
    required: ["title", "productIds"]
  },
  ProductTabs: {
    max: 2,
    minTabs: 1,
    maxTabs: 6,
    maxItemsPerTab: 6,
    minItemsPerTab: 1,
    required: ["tabs"]
  },
  IntroText: {
    max: 1,
    required: ["title", "description"]
  },
  FAQ: {
    max: 1,
    minItems: 1,
    required: ["items"]
  },
  ImageCarousel: {
    max: 3,
    minSlides: 1,
    maxSlides: 20,
    required: ["slides"]
  },
  Image: {
    max: 10,
    required: ["image"]
  }
}

export type SectionType = keyof typeof designRules

