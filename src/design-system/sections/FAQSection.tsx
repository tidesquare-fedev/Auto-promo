import { FAQSection as FAQSectionType } from "@/types/page"

export function FAQSection({ title, items }: FAQSectionType) {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center">
          {title || "자주 묻는 질문"}
        </h2>
        <div className="max-w-3xl mx-auto space-y-6">
          {items.map((item, i) => (
            <div 
              key={i} 
              className="bg-gray-50 border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-semibold mb-3 text-gray-900">
                Q. {item.q}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                A. {item.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
