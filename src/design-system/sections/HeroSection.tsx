import { HeroSection as HeroSectionType } from "@/types/page"

export function HeroSection({ title, subtitle, image }: HeroSectionType) {
  return (
    <section className="relative bg-gradient-to-r from-blue-500 to-purple-600 text-white overflow-hidden">
      {image && (
        <div className="absolute inset-0">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover"
          />
          {/* 오버레이: 텍스트 가독성을 위한 어두운 그라데이션 */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/50 to-black/40"></div>
        </div>
      )}
      <div className="relative container mx-auto px-4 py-24 md:py-32 lg:py-40">
        <div className="max-w-4xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 drop-shadow-lg">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xl md:text-2xl lg:text-3xl opacity-95 drop-shadow-md leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
