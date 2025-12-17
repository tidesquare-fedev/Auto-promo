import { useEffect } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  const router = useRouter()

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Auto-Promo
          </h1>
          <p className="text-xl text-muted-foreground">
            MCP 기반 프로모션 페이지 제작 어드민
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>관리자</CardTitle>
              <CardDescription>
                프로모션 페이지 생성 및 관리
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/citydirect">
                <Button className="w-full">관리자 페이지로 이동</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>문서</CardTitle>
              <CardDescription>
                설정 및 사용 가이드
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="https://github.com" target="_blank">
                <Button variant="outline" className="w-full">
                  GitHub
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>빠른 시작</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>
                <Link href="/admin/citydirect" className="text-primary hover:underline">
                  관리자 페이지
                </Link>
                에서 새 페이지 생성
              </li>
              <li>상품 ID 입력하여 실시간 미리보기 확인</li>
              <li>섹션을 드래그하여 순서 변경</li>
              <li>PUBLISHED로 변경하여 배포</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

