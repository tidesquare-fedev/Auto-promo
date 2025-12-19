# 환경 설정 가이드

## 개발/운영 환경 구분

투어비스 링크 도메인은 `NEXT_PUBLIC_TOURVIS_ENV` 환경 변수로 제어됩니다.

### 환경 변수 우선순위

1. **NEXT_PUBLIC_TOURVIS_ENV** (명시적 설정) - 최우선
2. **NODE_ENV** (자동 설정) - 대체값

### 설정 방법

#### 1. 로컬 개발 환경

`.env.local` 파일:

```env
# TNA API 설정
TNA_API_BASE=https://dev-apollo-api.tidesquare.com/tna-api-v2
TNA_API_KEY=your-api-key

# 투어비스 환경 (선택 - 설정하지 않으면 development 사용)
NEXT_PUBLIC_TOURVIS_ENV=development
```

**결과**: 상품 클릭 시 `https://d.tourvis.com/activity/product/...` 로 이동

#### 2. Vercel 배포 (운영)

Vercel Dashboard → Settings → Environment Variables:

```
Name: NEXT_PUBLIC_TOURVIS_ENV
Value: production
Environment: Production
```

**결과**: 상품 클릭 시 `https://tourvis.com/activity/product/...` 로 이동

#### 3. Vercel 배포 (스테이징)

```
Name: NEXT_PUBLIC_TOURVIS_ENV
Value: development
Environment: Preview
```

**결과**: 상품 클릭 시 `https://d.tourvis.com/activity/product/...` 로 이동

## 환경별 설정 요약

| 환경 | NEXT_PUBLIC_TOURVIS_ENV | 링크 도메인 |
|------|------------------------|-----------|
| **로컬 개발** | `development` (기본) | `d.tourvis.com` |
| **Vercel Preview** | `development` | `d.tourvis.com` |
| **Vercel Production** | `production` | `tourvis.com` |

## 환경 변수 미설정 시

`NEXT_PUBLIC_TOURVIS_ENV`를 설정하지 않으면 `NODE_ENV`를 사용합니다:

- `npm run dev` → NODE_ENV=development → `d.tourvis.com`
- `npm run build && npm start` → NODE_ENV=production → `tourvis.com`

## 환경 확인 방법

브라우저 콘솔에서:

```javascript
// 개발자 도구(F12) → Console
fetch('/api/test-env').then(r => r.json()).then(console.log)
```

또는 코드에서:

```typescript
import { getEnvironmentInfo } from '@/lib/tourvis-url'

console.log(getEnvironmentInfo())
// {
//   tourvisEnv: 'development',
//   nodeEnv: 'development',
//   domain: 'https://d.tourvis.com'
// }
```

## 문제 해결

### 문제: 운영 배포인데 개발 링크로 이동

**원인**: `NEXT_PUBLIC_TOURVIS_ENV`가 설정되지 않았거나 `development`로 설정됨

**해결**:
1. Vercel Dashboard → Settings → Environment Variables
2. `NEXT_PUBLIC_TOURVIS_ENV=production` 추가
3. Redeploy

### 문제: 로컬에서 운영 링크로 이동

**원인**: `.env.local`에 `NEXT_PUBLIC_TOURVIS_ENV=production`으로 설정됨

**해결**:
```env
# .env.local
NEXT_PUBLIC_TOURVIS_ENV=development
```

## 권장 설정

### .env.local (로컬 개발)

```env
# TNA API - 개발 서버
TNA_API_BASE=https://dev-apollo-api.tidesquare.com/tna-api-v2
TNA_API_KEY=your-dev-api-key

# 투어비스 - 개발 도메인
NEXT_PUBLIC_TOURVIS_ENV=development

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Vercel (운영)

```
# TNA API - 운영 서버
TNA_API_BASE=https://api.tidesquare.com/tna-api-v2
TNA_API_KEY=your-prod-api-key

# 투어비스 - 운영 도메인
NEXT_PUBLIC_TOURVIS_ENV=production

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 테스트 방법

```bash
# 개발 환경 테스트
NEXT_PUBLIC_TOURVIS_ENV=development npm run dev
# → 상품 클릭 시 d.tourvis.com으로 이동 확인

# 운영 환경 테스트
NEXT_PUBLIC_TOURVIS_ENV=production npm run dev
# → 상품 클릭 시 tourvis.com으로 이동 확인
```
