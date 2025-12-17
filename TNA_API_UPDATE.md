# 🔄 TNA API 업데이트 가이드

## 📝 변경 사항

### API 엔드포인트 변경

**이전**:
```
POST /api/front/products/search-extended
```

**현재** (Swagger 문서 기반):
```
POST /rest/product/_search
```

### API Base URL 변경

**이전**:
```
https://dev-apollo-api.tidesquare.com/tna-api-v2
```

**현재**:
```
https://s-apiactivity.tourvis.com/tna-api-v2
```

---

## 🔗 Swagger 문서

**공식 문서**: https://s-apiactivity.tourvis.com/tna-api-v2/swagger-ui/

**상품 검색 API**: 
- 섹션: `02-프론트(판매채널)`
- API: `상품 API` → `searchGet`
- 엔드포인트: `/rest/product/_search`

---

## 📊 요청/응답 형식

### 요청 (POST)

```json
{
  "productIds": ["product-id-1", "product-id-2"]
}
```

### 응답

Swagger 문서에 따라 응답 구조 확인 필요:
- `{ data: [...], total: N }`
- `{ products: [...], total: N }`
- 또는 배열 `[...]`

---

## 🔧 환경 변수 업데이트

`.env.local` 파일 수정:

```env
# 변경 전
TNA_API_BASE=https://dev-apollo-api.tidesquare.com/tna-api-v2

# 변경 후
TNA_API_BASE=https://s-apiactivity.tourvis.com/tna-api-v2
```

---

## ✅ 수정된 파일

1. **src/mcp/product/adapter.ts**
   - 엔드포인트: `/rest/product/_search`
   - Base URL 업데이트

2. **src/pages/api/test-tna.ts**
   - 테스트 엔드포인트 목록 업데이트
   - Base URL 업데이트

---

## 🧪 테스트

```bash
# 개발 서버 실행
npm run dev

# 브라우저에서 테스트
http://localhost:3000/api/test-tna
```

성공 시:
```json
{
  "success": true,
  "workingEndpoint": "/rest/product/_search",
  "sampleResponse": { ... }
}
```

---

## 📚 참고

- Swagger 문서에서 실제 요청/응답 스키마 확인
- API 키 권한 확인
- CORS 설정 확인 (필요시)

