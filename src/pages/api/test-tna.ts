/**
 * TNA API 테스트 엔드포인트
 * 브라우저에서 호출: http://localhost:3000/api/test-tna
 */

const TNA_API_BASE = process.env.TNA_API_BASE || "https://s-apiactivity.tourvis.com/tna-api-v2"
const TNA_API_KEY = process.env.TNA_API_KEY || ""

export default async function handler(req, res) {
  const productIds = req.query.productIds 
    ? req.query.productIds.split(',') 
    : ["test-product"]

  // 여러 가능한 엔드포인트 테스트 (Swagger 문서 기반)
  const endpoints = [
    "/rest/product/_search",  // 실제 엔드포인트
    "/api/front/products/search-extended",
    "/api/front/products/searchExtended",
    "/api/products/search-extended",
    "/front/products/search",
  ]

  const results = []

  for (const endpoint of endpoints) {
    const url = `${TNA_API_BASE}${endpoint}`
    
    try {
      const apiRes = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${TNA_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ productIds })
      })

      const status = apiRes.status
      const contentType = apiRes.headers.get("content-type") || ""
      let responseData = null
      let error = null

      if (apiRes.ok) {
        // JSON 응답인지 확인
        if (contentType.includes("application/json")) {
          try {
            responseData = await apiRes.json()
          } catch (e) {
            error = "JSON 파싱 실패"
            const text = await apiRes.text()
            error += `: ${text.substring(0, 100)}`
          }
        } else {
          const text = await apiRes.text()
          error = `JSON이 아닌 응답 (${contentType}): ${text.substring(0, 200)}`
        }
      } else {
        error = await apiRes.text()
      }

      results.push({
        endpoint,
        url,
        status,
        success: apiRes.ok,
        responseData: apiRes.ok ? responseData : null,
        error: !apiRes.ok ? error?.substring(0, 200) : null
      })

      // 성공한 엔드포인트 발견 시 즉시 반환
      if (apiRes.ok) {
        return res.status(200).json({
          success: true,
          message: "TNA API 연결 성공!",
          workingEndpoint: endpoint,
          fullUrl: url,
          sampleResponse: responseData,
          allResults: results
        })
      }
    } catch (error: any) {
      results.push({
        endpoint,
        url,
        status: 0,
        success: false,
        error: error.message
      })
    }
  }

  // 모든 엔드포인트 실패
  return res.status(500).json({
    success: false,
    message: "모든 TNA API 엔드포인트 테스트 실패",
    apiBase: TNA_API_BASE,
    hasApiKey: !!TNA_API_KEY,
    testedEndpoints: results,
    suggestions: [
      "1. TNA_API_KEY 환경 변수가 올바른지 확인",
      "2. TNA_API_BASE URL이 올바른지 확인",
      "3. Swagger 문서에서 실제 엔드포인트 경로 확인",
      "4. API 키 권한 확인"
    ]
  })
}

