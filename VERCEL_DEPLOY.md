# 🚀 Vercel 배포 가이드

## 📋 사전 준비

### 1. Vercel 계정 및 프로젝트 생성
```bash
# Vercel CLI 설치
npm i -g vercel

# 로그인
vercel login

# 프로젝트 연결
vercel link
```

### 2. Supabase 데이터베이스 연동

**중요**: 먼저 `SUPABASE_SETUP.md`를 참고하여 Supabase 프로젝트를 생성하세요.

Supabase Dashboard → Settings → Integrations → Vercel:
1. **Vercel Integration** 설치
2. 프로젝트 선택
3. 자동으로 환경 변수 추가됨:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

---

## 🔧 환경 변수 설정

Vercel Dashboard → Settings → Environment Variables

### Production 환경

| 변수명 | 값 | 설명 |
|--------|-----|------|
| `TNA_API_BASE` | `https://dev-apollo-api.tidesquare.com/tna-api-v2` | TNA API 엔드포인트 |
| `TNA_API_KEY` | `your_api_key_here` | TNA API 인증 키 |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Supabase URL (자동) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` | Supabase Anon Key (자동) |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` | Supabase Service Key (자동) |
| `NODE_ENV` | `production` | 환경 구분 |

### Preview 환경 (선택)

개발/스테이징 환경에서 다른 API 사용 시:
```
TUTTI_API_BASE=https://dev-apollo-api.tidesquare.com/tna-api-v2
TUTTI_API_KEY=your_dev_api_key
```

---

## 📦 배포 명령어

### 1. Preview 배포 (테스트용)
```bash
# 현재 브랜치를 Preview 환경으로 배포
vercel

# 또는 Git push 시 자동 배포
git push origin feature/my-branch
```

### 2. Production 배포
```bash
# Production 환경으로 배포
vercel --prod

# 또는 main/master 브랜치 push 시 자동 배포
git push origin main
```

---

## 🏗️ 배포 체크리스트

### 필수 확인 사항

- [ ] **Supabase 데이터베이스 연결 확인**
  ```bash
  # Supabase 스키마 적용 (SUPABASE_SETUP.md 참고)
  
  # 환경 변수 확인
  vercel env pull .env.local
  
  # 로컬 테스트
  npm run dev
  # Admin에서 페이지 생성/조회 테스트
  ```

- [ ] **투티 API 키 설정**
  - Vercel Dashboard에서 `TUTTI_API_KEY` 확인
  - 프로덕션 키 사용 확인

- [ ] **도메인 설정**
  - Vercel Dashboard → Domains
  - 커스텀 도메인 연결 (선택)

- [ ] **빌드 성공 확인**
  ```bash
  npm run build
  # 에러 없이 완료되는지 확인
  ```

### 성능 최적화

- [ ] **이미지 최적화**
  - `next.config.js`에 투티 이미지 도메인 추가
  - Next.js `<Image>` 컴포넌트 사용

- [ ] **ISR 설정 확인**
  ```typescript
  // pages/marketing/citydirect/[slug].tsx
  revalidate: 60 // 60초마다 재생성
  ```

- [ ] **API 캐싱 설정**
  - `vercel.json`에서 캐시 헤더 확인
  - 상품 API는 60초 캐시

### 보안 설정

- [ ] **환경 변수 암호화**
  - Vercel이 자동으로 암호화
  - `.env` 파일은 Git에 커밋 금지

- [ ] **Admin 페이지 인증 추가**
  ```typescript
  // src/middleware.ts에서 인증 로직 활성화
  // NextAuth.js 또는 Auth0 연동 권장
  ```

- [ ] **CORS 설정**
  ```typescript
  // API Routes에 CORS 헤더 추가 (필요시)
  ```

---

## 📊 모니터링 설정

### 1. Vercel Analytics
```bash
# 자동 활성화됨
# Dashboard에서 트래픽 확인 가능
```

### 2. 로그 모니터링
```bash
# 실시간 로그 확인
vercel logs --follow

# 특정 배포의 로그
vercel logs [deployment-url]
```

### 3. 에러 추적 (권장)
```bash
# Sentry 연동
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

---

## 🔄 CI/CD 파이프라인

### GitHub Actions (선택)

`.github/workflows/deploy.yml` 생성:
```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## 🚨 트러블슈팅

### 빌드 실패

**문제**: `Module not found: Can't resolve '@/...'`
```bash
# tsconfig.json 확인
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**문제**: TNA API 연결 실패
```bash
# 환경 변수 확인
vercel env pull
cat .env.local

# API 테스트 엔드포인트 호출
curl http://localhost:3000/api/test-tna

# 또는 브라우저에서
# http://localhost:3000/api/test-tna
```

### 서버리스 함수 타임아웃

**문제**: `FUNCTION_INVOCATION_TIMEOUT`
```json
// vercel.json
{
  "functions": {
    "pages/api/products/preview.ts": {
      "maxDuration": 30  // 최대 30초로 증가
    }
  }
}
```

### Supabase 연결 오류

**문제**: `Failed to connect to Supabase`
```bash
# 환경 변수 확인
vercel env pull
cat .env.local

# Supabase Dashboard에서 API 키 확인
# Settings → API → Project API keys

# 로컬 개발 시 메모리 저장소 사용 (자동 fallback)
# Supabase 설정 없으면 자동으로 메모리 저장소 사용
```

---

## 📈 성능 최적화 팁

### 1. Edge Runtime 사용 (선택)
```typescript
// pages/api/products/preview.ts
export const config = {
  runtime: 'edge',  // 더 빠른 응답
}
```

### 2. 이미지 CDN 활용
```typescript
// next.config.js
images: {
  loader: 'custom',
  loaderFile: './src/lib/image-loader.ts',
}
```

### 3. 데이터베이스 쿼리 최적화
```typescript
// Vercel KV 파이프라인 사용
const pipeline = kv.pipeline()
pipeline.get('key1')
pipeline.get('key2')
const results = await pipeline.exec()
```

---

## 🎉 배포 완료 후

1. **프로덕션 URL 확인**
   ```
   https://auto-promo.vercel.app
   ```

2. **Admin 페이지 접속**
   ```
   https://auto-promo.vercel.app/admin/citydirect
   ```

3. **첫 프로모션 페이지 생성**
   - 상품 ID 입력
   - 섹션 구성
   - PUBLISHED로 변경

4. **프론트엔드 확인**
   ```
   https://auto-promo.vercel.app/marketing/citydirect/[your-slug]
   ```

---

## 📞 지원

- Vercel 문서: https://vercel.com/docs
- Next.js 문서: https://nextjs.org/docs
- 투티 API 문서: https://dev-apollo-api.tidesquare.com/tna-api-v2/swagger-ui/

배포에 문제가 있다면 Vercel Dashboard의 Logs 탭을 확인하세요!

