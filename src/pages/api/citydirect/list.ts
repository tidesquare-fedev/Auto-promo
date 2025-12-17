import { getPages, debugMemoryStore } from "@/lib/db"

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      // 디버깅: 메모리 상태 확인
      const debug = debugMemoryStore()
      console.log("📊 목록 조회 시 메모리 상태:", debug)
      
      const pages = await getPages()
      console.log("📋 목록 API 응답:", {
        count: pages.length,
        slugs: pages.map(p => p.slug),
        memorySize: debug.size,
        memorySlugs: debug.slugs
      })
      
      // 메모리에는 있지만 조회가 안 되는 경우 경고
      if (debug.size > 0 && pages.length === 0) {
        console.warn("⚠️ 메모리에는 데이터가 있지만 조회가 안 됨:", debug)
      }
      
      return res.json(pages)
    } catch (error: any) {
      console.error("목록 조회 오류:", error)
      return res.status(500).json({ 
        error: "Failed to fetch pages",
        message: error?.message 
      })
    }
  }

  res.status(405).json({ error: "Method not allowed" })
}
