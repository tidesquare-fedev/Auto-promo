import { HeroSection as HeroSectionType } from "@/types/page"

export function HeroSection({ title, subtitle, image }: HeroSectionType) {
  return (
    <section className="relative bg-gradient-to-r from-blue-500 to-purple-600 text-white overflow-hidden h-[600px] mt-16">
      {image && (
        <div className="absolute inset-0">
          <img 
            src={image} 
            alt={title || "Hero image"}
            className="w-full h-full object-cover object-center"
            loading="eager"
          />
          {/* 오버레이: 텍스트 가독성을 위한 어두운 그라데이션 */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/50 to-black/40"></div>
        </div>
      )}
      {(title || subtitle) && (
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-4xl">
            {title && (
              <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 md:mb-6 drop-shadow-lg leading-tight">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-lg md:text-xl lg:text-2xl xl:text-3xl opacity-95 drop-shadow-md leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
