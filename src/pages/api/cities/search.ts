import type { NextApiRequest, NextApiResponse } from "next"
import { searchCities } from "@/mcp/product/adapter"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { keyword } = req.query

  if (!keyword || typeof keyword !== "string") {
    return res.status(400).json({ error: "keyword parameter is required" })
  }

  try {
    const cities = await searchCities(keyword)
    return res.status(200).json({ cities })
  } catch (error) {
    console.error("도시 검색 오류:", error)
    return res.status(500).json({ error: "Failed to search cities" })
  }
}
