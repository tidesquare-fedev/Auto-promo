-- ============================================
-- RLS (Row Level Security) 활성화 및 정책 설정
-- ============================================
-- 이 스크립트를 Supabase SQL Editor에서 실행하세요
-- Dashboard → SQL Editor → New query → 붙여넣기 → Run

-- 1. RLS 활성화
-- ============================================

ALTER TABLE public.citydirect_pages ENABLE ROW LEVEL SECURITY;

-- 2. 기존 정책 삭제 (있다면)
-- ============================================

DROP POLICY IF EXISTS "Public read access" ON public.citydirect_pages;
DROP POLICY IF EXISTS "Service role write access" ON public.citydirect_pages;
DROP POLICY IF EXISTS "Service role can do everything" ON public.citydirect_pages;
DROP POLICY IF EXISTS "Public can read published pages" ON public.citydirect_pages;
DROP POLICY IF EXISTS "Authenticated users can do everything" ON public.citydirect_pages;

-- 3. 새로운 정책 생성
-- ============================================

-- 정책 1: Service Role은 모든 작업 가능 (Admin API에서 사용)
CREATE POLICY "Service role full access"
  ON public.citydirect_pages
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 정책 2: 익명 사용자는 PUBLISHED 페이지만 조회 가능 (프론트엔드 마케팅 페이지)
CREATE POLICY "Anonymous read published"
  ON public.citydirect_pages
  FOR SELECT
  TO anon
  USING (status = 'PUBLISHED');

-- 정책 3: 인증된 사용자는 모든 페이지 조회 가능
CREATE POLICY "Authenticated read all"
  ON public.citydirect_pages
  FOR SELECT
  TO authenticated
  USING (true);

-- 정책 4: 인증된 사용자는 모든 작업 가능 (향후 어드민 인증 시 사용)
CREATE POLICY "Authenticated full access"
  ON public.citydirect_pages
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. 설정 확인
-- ============================================

-- RLS 상태 확인
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'citydirect_pages';

-- 정책 목록 확인
SELECT 
  policyname as policy_name,
  roles as for_role,
  cmd as command,
  qual as using_expression
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'citydirect_pages'
ORDER BY policyname;

-- 5. 완료 메시지
-- ============================================

SELECT '✅ RLS가 성공적으로 활성화되었습니다!' as status,
       '보안 정책이 적용되었습니다.' as message;
