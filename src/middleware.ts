import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Admin 페이지 보호 (프로덕션에서는 인증 추가)
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // TODO: 인증 로직 추가
    // const token = request.cookies.get("auth-token")
    // if (!token) {
    //   return NextResponse.redirect(new URL("/login", request.url))
    // }
  }

  // API 요청에 캐시 헤더 추가
  if (request.nextUrl.pathname.startsWith("/api")) {
    const response = NextResponse.next()
    
    // 상품 API는 캐시 활용
    if (request.nextUrl.pathname.includes("/products")) {
      response.headers.set(
        "Cache-Control",
        "s-maxage=60, stale-while-revalidate=30"
      )
    }
    
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/:path*",
  ],
}

