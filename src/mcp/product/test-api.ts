/**
 * TNA API 테스트 스크립트
 * 실제 엔드포인트 확인용
 */

const TNA_API_BASE = process.env.TNA_API_BASE || "https://dev-apollo-api.tidesquare.com/tna-api-v2"
const TNA_API_KEY = process.env.TNA_API_KEY || ""

// 가능한 엔드포인트들
const POSSIBLE_ENDPOINTS = [
  "/api/front/products/search-extended",
  "/api/front/products/searchExtended",
  "/api/products/search-extended",
  "/api/products/searchExtended",
  "/products/search-extended",
  "/products/searchExtended",
  "/front/products/search",
  "/api/v1/products/search",
]

export async function testTnaApiEndpoints(productIds: string[] = ["test-product-1"]) {
  console.log("🔍 TNA API 엔드포인트 테스트 시작...")
  console.log(`Base URL: ${TNA_API_BASE}`)
  
  const results: { endpoint: string; status: number; success: boolean; error?: string }[] = []

  for (const endpoint of POSSIBLE_ENDPOINTS) {
    const url = `${TNA_API_BASE}${endpoint}`
    
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${TNA_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ productIds })
      })

      const success = res.ok
      let error = undefined

      if (!success) {
        const text = await res.text()
        error = text.substring(0, 100)
      }

      results.push({
        endpoint,
        status: res.status,
        success,
        error
      })

      console.log(`${success ? '✅' : '❌'} ${endpoint} - ${res.status}`)
      
      if (success) {
        const data = await res.json()
        console.log(`   응답 구조:`, Object.keys(data))
        console.log(`   샘플 데이터:`, JSON.stringify(data).substring(0, 200))
      }
    } catch (error: any) {
      results.push({
        endpoint,
        status: 0,
        success: false,
        error: error.message
      })
      console.log(`❌ ${endpoint} - 연결 실패: ${error.message}`)
    }
  }

  console.log("\n📊 테스트 요약:")
  console.log(`성공: ${results.filter(r => r.success).length}/${results.length}`)
  
  const successEndpoint = results.find(r => r.success)
  if (successEndpoint) {
    console.log(`\n✅ 사용 가능한 엔드포인트: ${successEndpoint.endpoint}`)
  } else {
    console.log(`\n❌ 사용 가능한 엔드포인트를 찾지 못했습니다.`)
    console.log(`   API 키 확인: ${TNA_API_KEY ? '설정됨' : '❌ 미설정'}`)
  }

  return results
}

// Node.js에서 직접 실행 가능
if (require.main === module) {
  testTnaApiEndpoints().then(() => {
    console.log("\n테스트 완료!")
    process.exit(0)
  })
}

