import "@/styles/globals.css"
import type { AppProps } from "next/app"
import { useRouter } from "next/router"
import { useEffect } from "react"
import TourvisPcGnb from "@/components/tourvis/tourvis-pc-gnb"
import TourvisBottomTabBar from "@/components/tourvis/tourvis-bottom-tab-bar"
import Script from "next/script"

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  
  // 마케팅 페이지(citydirect)에서만 GNB/Bottom Tab Bar를 렌더링
  const isMarketingPage = router.pathname.startsWith('/marketing/citydirect')
  const isAdminPage = router.pathname.startsWith('/admin')
  
  // body에 클래스 추가/제거
  useEffect(() => {
    if (isAdminPage) {
      document.body.classList.add('admin-page')
      document.body.classList.remove('marketing-page')
    } else if (isMarketingPage) {
      document.body.classList.add('marketing-page')
      document.body.classList.remove('admin-page')
    } else {
      document.body.classList.remove('admin-page', 'marketing-page')
    }
  }, [isAdminPage, isMarketingPage])
  
  return (
    <>
      {isMarketingPage && (
        <Script
          src="https://d2um1hurm6o2hd.cloudfront.net/tourvis-static/common/common-widget.js"
          strategy="afterInteractive"
        />
      )}
      {isMarketingPage && <TourvisPcGnb env="production" />}
      <Component {...pageProps} />
      {isMarketingPage && <TourvisBottomTabBar env="production" />}
    </>
  )
}

