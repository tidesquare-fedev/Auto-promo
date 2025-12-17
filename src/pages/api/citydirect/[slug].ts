import { getPage, debugMemoryStore } from "@/lib/db"

export default async function handler(req, res) {
  const { slug } = req.query

  if (req.method === "GET") {
    try {
      if (!slug || typeof slug !== "string") {
        return res.status(400).json({ error: "Invalid slug" })
      }

      console.log("🔍 페이지 조회 요청:", slug)
      
      // 디버깅: 메모리 상태 확인
      const debug = debugMemoryStore()
      console.log("📊 현재 메모리 상태:", debug)

      const page = await getPage(slug)
      
      if (!page) {
        console.log("❌ 페이지를 찾을 수 없음:", slug)
        console.log("📊 메모리 상태:", debug)
        return res.status(404).json({ 
          error: "Page not found",
          debug: debug // 디버깅 정보 포함
        })
      }
      
      console.log("✅ 페이지 조회 성공:", slug)
      return res.json(page)
    } catch (error: any) {
      console.error("페이지 조회 오류:", error)
      return res.status(500).json({ 
        error: "Failed to fetch page",
        message: error?.message 
      })
    }
  }

  res.status(405).json({ error: "Method not allowed" })
}
