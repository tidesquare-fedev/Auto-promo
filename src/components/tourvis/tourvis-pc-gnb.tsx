import { useEffect, useState } from "react"
import WebComponentWrapper from "@/components/tourvis/web-component-wrapper"

interface TourvisPcGnbProps {
  env?: "production" | "development"
}

export default function TourvisPcGnb({
  env = "production"
}: TourvisPcGnbProps) {
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const checkDevice = () => {
      // 화면 너비 + UA 기반으로 데스크톱 판별
      const isDesktopSize = window.innerWidth >= 768
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
      setIsDesktop(isDesktopSize && !isMobileDevice)
    }

    checkDevice()
    window.addEventListener("resize", checkDevice)
    return () => window.removeEventListener("resize", checkDevice)
  }, [])

  // 데스크톱이 아니면 렌더링하지 않음
  if (!isDesktop) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <WebComponentWrapper
        tagName="gnb-widget"
        attributes={{ env }}
        fallback={
          <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-center">
            <div className="text-sm text-gray-500">Loading...</div>
          </div>
        }
      />
    </div>
  )
}
