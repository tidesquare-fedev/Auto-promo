# Supabase 프로젝트 설정 가이드

## 1️⃣ Supabase 프로젝트 생성

1. https://supabase.com 접속
2. "Start your project" 클릭
3. 프로젝트 생성:
   - Organization: 선택 또는 새로 생성
   - Project Name: `Auto-promo` (또는 원하는 이름)
   - Database Password: 강력한 비밀번호 생성 (저장 필수!)
   - Region: `Northeast Asia (Seoul)` 선택 (한국 서버)
   - Pricing Plan: Free tier 선택

## 2️⃣ 환경 변수 확인

프로젝트 생성 후 **Settings > API** 에서 확인:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xavvecihhsymdvjsnwla.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

✅ 이미 `.env.local`에 설정되어 있음

## 3️⃣ 데이터베이스 테이블 생성

### 방법 1: SQL Editor 사용 (추천)

1. Supabase Dashboard → **SQL Editor** 클릭
2. "New query" 클릭
3. 아래 SQL 복사 & 붙여넣기
4. "Run" 버튼 클릭

```sql
-- CityDirect 페이지 테이블 생성
CREATE TABLE IF NOT EXISTS citydirect_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  city_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  seo JSONB NOT NULL,
  content JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_citydirect_pages_slug ON citydirect_pages(slug);
CREATE INDEX IF NOT EXISTS idx_citydirect_pages_status ON citydirect_pages(status);
CREATE INDEX IF NOT EXISTS idx_citydirect_pages_city_code ON citydirect_pages(city_code);

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_citydirect_pages_updated_at
  BEFORE UPDATE ON citydirect_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 설명(코멘트) 추가
COMMENT ON TABLE citydirect_pages IS 'CityDirect 프로모션 페이지 저장소';
COMMENT ON COLUMN citydirect_pages.slug IS '페이지 URL 식별자 (예: seoul, busan)';
COMMENT ON COLUMN citydirect_pages.city_code IS '도시 코드 (임의 텍스트)';
COMMENT ON COLUMN citydirect_pages.status IS '페이지 상태: DRAFT 또는 PUBLISHED';
COMMENT ON COLUMN citydirect_pages.seo IS 'SEO 메타데이터 (title, description 등)';
COMMENT ON COLUMN citydirect_pages.content IS '페이지 컨텐츠 섹션 배열';
```

### 방법 2: Supabase CLI 사용

```bash
# 프로젝트 루트에서 실행
npx supabase db push
```

## 4️⃣ Row Level Security (RLS) 설정

### ⚠️ 중요: 개발 환경에서는 RLS 비활성화 권장

개발 중에는 RLS를 **비활성화**하고, 배포 시 활성화하는 것을 권장합니다.

#### RLS 비활성화 (개발 환경)

SQL Editor에서 실행:

```sql
-- RLS 비활성화 (개발 환경)
ALTER TABLE citydirect_pages DISABLE ROW LEVEL SECURITY;
```

#### RLS 활성화 (프로덕션 환경)

나중에 배포 시 RLS를 활성화하고 정책을 추가:

```sql
-- RLS 활성화
ALTER TABLE citydirect_pages ENABLE ROW LEVEL SECURITY;

-- Service Role은 모든 작업 가능 (API에서 사용)
CREATE POLICY "Service role can do everything"
  ON citydirect_pages
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 익명 사용자는 PUBLISHED 페이지만 읽기 가능 (프론트엔드)
CREATE POLICY "Public can read published pages"
  ON citydirect_pages
  FOR SELECT
  TO anon
  USING (status = 'PUBLISHED');

-- 인증된 사용자는 모든 작업 가능 (향후 어드민 인증)
CREATE POLICY "Authenticated users can do everything"
  ON citydirect_pages
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
```

## 5️⃣ 연결 테스트

### 테스트 1: SQL Editor에서 직접 확인

```sql
-- 테이블 구조 확인
SELECT * FROM citydirect_pages LIMIT 1;

-- 테스트 데이터 삽입
INSERT INTO citydirect_pages (slug, city_code, status, seo, content)
VALUES (
  'test',
  'TEST',
  'DRAFT',
  '{"title": "테스트 페이지", "description": "테스트용"}'::jsonb,
  '[]'::jsonb
);

-- 데이터 확인
SELECT slug, city_code, status FROM citydirect_pages;

-- 테스트 데이터 삭제
DELETE FROM citydirect_pages WHERE slug = 'test';
```

### 테스트 2: Next.js API에서 확인

터미널에서 실행:

```bash
curl http://localhost:3000/api/test-supabase | jq .
```

예상 결과:
```json
{
  "success": true,
  "envCheck": {
    "hasUrl": true,
    "hasKey": true
  },
  "clientCheck": {
    "initialized": true
  },
  "tableCheck": {
    "accessible": true,
    "count": 0
  }
}
```

## 6️⃣ 문제 해결

### 문제 1: "relation does not exist" 오류

**원인**: 테이블이 생성되지 않음

**해결**:
1. Supabase Dashboard → **Table Editor** 확인
2. `citydirect_pages` 테이블이 있는지 확인
3. 없으면 위의 SQL 실행

### 문제 2: "permission denied" 오류

**원인**: RLS가 활성화되어 있고 정책이 없음

**해결**:
```sql
-- RLS 비활성화
ALTER TABLE citydirect_pages DISABLE ROW LEVEL SECURITY;
```

### 문제 3: "authentication failed" 오류

**원인**: SERVICE_ROLE_KEY가 잘못됨

**해결**:
1. Supabase Dashboard → **Settings** → **API**
2. `service_role` key (secret) 복사
3. `.env.local`의 `SUPABASE_SERVICE_ROLE_KEY` 업데이트
4. Next.js 서버 재시작

### 문제 4: 클라이언트가 `null`로 초기화됨

**원인**: 환경 변수가 로드되지 않음

**해결**:
```bash
# 서버 재시작
# Ctrl+C로 종료 후
npm run dev
```

## 7️⃣ 개발 vs 프로덕션 설정

### 개발 환경 (현재)
- ✅ 메모리 저장소 사용 (Hot Reload 대응)
- ✅ Supabase는 옵션 (설정 시 자동 사용)
- ✅ RLS 비활성화

### 프로덕션 환경 (Vercel 배포 시)
- ✅ Supabase만 사용
- ✅ RLS 활성화 + 정책 적용
- ✅ 환경 변수 Vercel에 설정

## 8️⃣ 다음 단계

1. **지금 바로**: SQL 실행하여 테이블 생성
2. **확인**: 테스트 API로 연결 확인
3. **배포 준비**: RLS 정책 설정 (나중에)

---

## 🚀 빠른 시작

```bash
# 1. Supabase Dashboard에서 SQL 실행
# (위의 테이블 생성 SQL 복사 & 붙여넣기)

# 2. 서버 재시작
# Ctrl+C로 종료 후
npm run dev

# 3. 저장 테스트
# 어드민에서 페이지 생성 → 저장 → 목록 확인
```

## 📞 도움이 필요하면

- Supabase 대시보드 URL을 확인하세요: `https://xavvecihhsymdvjsnwla.supabase.co`
- SQL 실행 시 오류가 있으면 전체 오류 메시지를 공유해 주세요
- 연결 테스트 결과를 공유해 주세요
