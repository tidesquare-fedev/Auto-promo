# 🔧 TNA API 연동 가이드

## 📝 API 이름 변경: Tutti → TNA

기존 "Tutti API"가 "TNA API"로 변경되었습니다.

---

## 🚨 404 오류 해결

### 1. 환경 변수 확인

```bash
# .env.local 확인
cat .env.local
```

다음 환경 변수가 설정되어 있는지 확인:
```env
TNA_API_BASE=https://dev-apollo-api.tidesquare.com/tna-api-v2
TNA_API_KEY=your_actual_api_key_here
```

### 2. API 엔드포인트 테스트

브라우저에서 접속:
```
http://localhost:3000/api/test-tna
```

또는 curl로 테스트:
```bash
curl http://localhost:3000/api/test-tna
```

**성공 응답 예시**:
```json
{
  "success": true,
  "message": "TNA API 연결 성공!",
  "workingEndpoint": "/api/front/products/search-extended",
  "sampleResponse": { ... }
}
```

**실패 응답**:
```json
{
  "success": false,
  "message": "모든 TNA API 엔드포인트 테스트 실패",
  "testedEndpoints": [ ... ],
  "suggestions": [ ... ]
}
```

---

## 🔍 가능한 엔드포인트들

TNA API는 다음 엔드포인트 중 하나를 사용합니다:

1. `/api/front/products/search-extended` ← **추천**
2. `/api/front/products/searchExtended`
3. `/api/products/search-extended`
4. `/front/products/search`

`adapter.ts`에서 작동하는 엔드포인트로 자동 설정됩니다.

---

## 📊 Swagger 문서 확인

TNA API Swagger:
```
https://dev-apollo-api.tidesquare.com/tna-api-v2/swagger-ui/
```

1. Swagger UI 접속
2. "02-프론트(판매채널)" 섹션 확인
3. 상품 검색 API 엔드포인트 확인
4. 요청/응답 스키마 확인

---

## 🛠️ 수동 API 테스트

### Postman / Insomnia

**요청**:
```
POST https://dev-apollo-api.tidesquare.com/tna-api-v2/api/front/products/search-extended
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "productIds": ["product-id-1", "product-id-2"],
  "includeImages": true,
  "includePrice": true
}
```

**응답 예시**:
```json
{
  "data": [
    {
      "productId": "product-id-1",
      "productName": "상품명",
      "price": {
        "amount": 10000,
        "currency": "KRW"
      },
      "images": ["https://..."],
      "stock": 100
    }
  ],
  "total": 1
}
```

---

## 🔧 문제 해결

### 1. 404 Not Found

**원인**: 잘못된 엔드포인트
```bash
# 테스트 API로 올바른 엔드포인트 확인
curl http://localhost:3000/api/test-tna
```

**해결**: `adapter.ts`의 엔드포인트 경로 수정

### 2. 401 Unauthorized

**원인**: API 키 문제
```bash
# API 키 확인
echo $TNA_API_KEY

# .env.local 확인
cat .env.local | grep TNA_API_KEY
```

**해결**: 
1. TNA 대시보드에서 새 API 키 발급
2. `.env.local` 업데이트
3. 개발 서버 재시작

### 3. 403 Forbidden

**원인**: API 키 권한 부족
- 상품 조회 권한 확인
- 프로덕션/개발 환경 API 키 구분

### 4. 500 Internal Server Error

**원인**: 요청 형식 오류
- Swagger 문서의 요청 스키마 확인
- `productIds` 배열 형식 확인

---

## 📝 코드 변경 사항

### adapter.ts

**변경 전**:
```typescript
const TUTTI_API_BASE = process.env.TUTTI_API_BASE
const endpoint = `${TUTTI_API_BASE}/products/searchExtended`
```

**변경 후**:
```typescript
const TNA_API_BASE = process.env.TNA_API_BASE
const endpoint = `${TNA_API_BASE}/api/front/products/search-extended`
```

### 환경 변수

**변경 전**:
```env
TUTTI_API_BASE=...
TUTTI_API_KEY=...
```

**변경 후**:
```env
TNA_API_BASE=https://dev-apollo-api.tidesquare.com/tna-api-v2
TNA_API_KEY=your_key_here
```

---

## ✅ 체크리스트

배포 전 확인:

- [ ] `.env.local`에 `TNA_API_KEY` 설정
- [ ] `/api/test-tna` 엔드포인트 테스트 성공
- [ ] Admin에서 상품 ID 입력 시 미리보기 표시
- [ ] 프론트엔드 ProductGrid에서 상품 표시
- [ ] Vercel 환경 변수 설정 (TNA_API_KEY)

---

## 🔗 참고 자료

- **TNA API Swagger**: https://dev-apollo-api.tidesquare.com/tna-api-v2/swagger-ui/
- **테스트 엔드포인트**: `/api/test-tna`
- **코드 위치**: `src/mcp/product/adapter.ts`

---

## 💡 팁

### 실시간 디버깅

개발 서버 로그 확인:
```bash
npm run dev

# 다른 터미널에서
curl http://localhost:3000/api/test-tna
```

로그에서 다음 확인:
- `✅ /api/front/products/search-extended - 200`
- 응답 구조 확인

### Vercel 배포 후

```bash
# Vercel 로그 확인
vercel logs --follow

# 프로덕션 테스트
curl https://your-domain.vercel.app/api/test-tna
```

---

TNA API 연동 완료! 🎉

