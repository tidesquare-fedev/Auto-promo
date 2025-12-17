import { designRules } from "./rules"
import { PageSection } from "@/types/page"

export function validateDesign(sections: PageSection[]) {
  const count: Record<string, number> = {}

  for (const s of sections) {
    count[s.type] = (count[s.type] || 0) + 1

    const rule = designRules[s.type]
    if (!rule) {
      throw new Error(`알 수 없는 섹션 타입: ${s.type}`)
    }

    // ProductGrid 검증
    if (s.type === "ProductGrid") {
      if (s.productIds.length > designRules.ProductGrid.maxItems) {
        throw new Error(
          `ProductGrid는 최대 ${designRules.ProductGrid.maxItems}개 상품까지 가능합니다`
        )
      }
      if (s.productIds.length < designRules.ProductGrid.minItems) {
        throw new Error(
          `ProductGrid는 최소 ${designRules.ProductGrid.minItems}개 상품이 필요합니다`
        )
      }
    }

    // ProductTabs 검증
    if (s.type === "ProductTabs") {
      if (!s.tabs || s.tabs.length < designRules.ProductTabs.minTabs) {
        throw new Error(
          `ProductTabs는 최소 ${designRules.ProductTabs.minTabs}개 탭이 필요합니다`
        )
      }
      if (s.tabs.length > designRules.ProductTabs.maxTabs) {
        throw new Error(
          `ProductTabs는 최대 ${designRules.ProductTabs.maxTabs}개 탭까지 가능합니다`
        )
      }
      // 각 탭의 상품 개수 검증
      for (const tab of s.tabs) {
        if (!tab.label) {
          throw new Error("탭 이름은 필수입니다")
        }
        if (tab.productIds.length < designRules.ProductTabs.minItemsPerTab) {
          throw new Error(
            `각 탭은 최소 ${designRules.ProductTabs.minItemsPerTab}개 상품이 필요합니다`
          )
        }
        if (tab.productIds.length > designRules.ProductTabs.maxItemsPerTab) {
          throw new Error(
            `각 탭은 최대 ${designRules.ProductTabs.maxItemsPerTab}개 상품까지 가능합니다`
          )
        }
      }
    }

    // FAQ 검증
    if (s.type === "FAQ") {
      if (s.items.length < designRules.FAQ.minItems) {
        throw new Error(
          `FAQ는 최소 ${designRules.FAQ.minItems}개 항목이 필요합니다`
        )
      }
      // 빈 Q&A 검증
      for (const item of s.items) {
        if (!item.q || !item.a) {
          throw new Error("FAQ 항목의 질문과 답변은 필수입니다")
        }
      }
    }

    // ImageCarousel 검증
    if (s.type === "ImageCarousel") {
      if (!s.slides || s.slides.length < designRules.ImageCarousel.minSlides) {
        throw new Error(
          `ImageCarousel는 최소 ${designRules.ImageCarousel.minSlides}개 슬라이드가 필요합니다`
        )
      }
      if (s.slides.length > designRules.ImageCarousel.maxSlides) {
        throw new Error(
          `ImageCarousel는 최대 ${designRules.ImageCarousel.maxSlides}개 슬라이드까지 가능합니다`
        )
      }
      // 각 슬라이드의 이미지 URL 검증
      for (const slide of s.slides) {
        if (!slide.image) {
          throw new Error("각 슬라이드의 이미지 URL은 필수입니다")
        }
      }
    }

    // 필수 필드 검증
    if (s.type === "Hero" && !s.title) {
      throw new Error("Hero 섹션의 제목은 필수입니다")
    }
    if (s.type === "IntroText" && (!s.title || !s.description)) {
      throw new Error("IntroText 섹션의 제목과 설명은 필수입니다")
    }
  }

  // 섹션 개수 제한 검증
  for (const type in designRules) {
    if (count[type] > designRules[type].max) {
      throw new Error(`${type} 섹션은 최대 ${designRules[type].max}개까지 가능합니다`)
    }
  }
}

