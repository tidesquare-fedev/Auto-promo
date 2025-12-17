import type React from "react"
import { JSX, useEffect, useState } from "react"

interface WebComponentWrapperProps {
  tagName: string
  attributes?: Record<string, string | number | boolean>
  children?: React.ReactNode
  fallback?: React.ReactNode
}

export default function WebComponentWrapper({
  tagName,
  attributes = {},
  children,
  fallback = null
}: WebComponentWrapperProps) {
  // 클라이언트 여부를 초기값에서 판단해 SSR 시 안전하게 처리
  const [isClient] = useState(() => typeof window !== "undefined")
  const [isComponentDefined, setIsComponentDefined] = useState(false)
  const [hasTimedOut, setHasTimedOut] = useState(false)

  useEffect(() => {
    // 10초 타임아웃 - 그래도 로드 안되면 강제로 렌더링
    const timeout = setTimeout(() => {
      if (!customElements.get(tagName)) {
        console.warn(`Web component ${tagName} timeout - rendering anyway`)
        setHasTimedOut(true)
      }
      setIsComponentDefined(true)
    }, 10000)

    const checkComponent = () => {
      // 이미 정의되어 있으면 바로 렌더링
      if (customElements.get(tagName)) {
        console.log(`✓ Web component ${tagName} is ready`)
        clearTimeout(timeout)
        setIsComponentDefined(true)
        return
      }

      // 정의될 때까지 대기
      console.log(`⏳ Waiting for web component ${tagName}...`)
      customElements
        .whenDefined(tagName)
        .then(() => {
          console.log(`✓ Web component ${tagName} loaded`)
          clearTimeout(timeout)
          setIsComponentDefined(true)
        })
        .catch((error) => {
          console.error(`✗ Web component ${tagName} failed to load:`, error)
          clearTimeout(timeout)
        })
    }

    checkComponent()

    return () => clearTimeout(timeout)
  }, [tagName])

  // 서버 사이드에서는 fallback 렌더링
  if (!isClient) {
    return <>{fallback}</>
  }

  // 클라이언트에서 컴포넌트 로드 전이면 fallback
  if (!isComponentDefined && fallback) {
    return <>{fallback}</>
  }

  const Component = tagName as keyof JSX.IntrinsicElements
  return <Component {...attributes}>{children}</Component>
}
