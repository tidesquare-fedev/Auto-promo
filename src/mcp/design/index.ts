import { validateDesign } from "./validate"
import { designRules } from "./rules"

export const designMcp = {
  validatePage(page: { content: any[] }) {
    validateDesign(page.content)
  },
  
  getRules() {
    return designRules
  },
  
  // 섹션 템플릿 생성 헬퍼
  createSection(type: keyof typeof designRules) {
    switch (type) {
      case "Hero":
        return { type: "Hero", title: "" }
      case "IntroText":
        return { type: "IntroText", title: "", description: "" }
      case "ProductGrid":
        return { 
          type: "ProductGrid", 
          title: "", 
          productIds: [], 
          columns: 4,
          badges: [{ id: "badge1", text: "" }]
        }
      case "ProductTabs":
        return { 
          type: "ProductTabs", 
          title: "",
          tabs: [{ id: "tab1", label: "탭 1", productIds: [] }],
          columns: 4,
          badges: [{ id: "badge1", text: "" }]
        }
      case "FAQ":
        return { type: "FAQ", title: "자주 묻는 질문", items: [{ q: "", a: "" }] }
      case "ImageCarousel":
        return { 
          type: "ImageCarousel", 
          title: "",
          slides: [{ id: "slide1", image: "", title: "", description: "" }],
          imageHeight: "medium"
        }
      default:
        throw new Error(`알 수 없는 섹션 타입: ${type}`)
    }
  }
}

