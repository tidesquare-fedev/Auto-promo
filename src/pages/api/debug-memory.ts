/**
 * 메모리 저장소 디버깅 엔드포인트
 * http://localhost:3000/api/debug-memory
 */

import { debugMemoryStore } from "@/lib/db"

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const debug = debugMemoryStore()
    res.json({
      success: true,
      memory: debug,
      message: "메모리 저장소 상태"
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

