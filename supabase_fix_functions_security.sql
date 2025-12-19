-- ============================================
-- Function Search Path 보안 문제 수정
-- ============================================
-- 이 스크립트를 Supabase SQL Editor에서 실행하세요
-- Dashboard → SQL Editor → New query → 붙여넣기 → Run

-- 1. update_updated_at_column 함수 재생성 (보안 강화)
-- ============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 함수 소유자를 postgres로 설정 (보안 강화)
ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

-- 함수에 대한 설명 추가
COMMENT ON FUNCTION public.update_updated_at_column() 
IS 'Automatically updates the updated_at column to the current timestamp';

-- 2. set_published_at 함수 재생성 (보안 강화)
-- ============================================

CREATE OR REPLACE FUNCTION public.set_published_at()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'PUBLISHED' AND OLD.status != 'PUBLISHED' THEN
    NEW.published_at = NOW();
  ELSIF NEW.status = 'DRAFT' THEN
    NEW.published_at = NULL;
  END IF;
  RETURN NEW;
END;
$$;

-- 함수 소유자를 postgres로 설정
ALTER FUNCTION public.set_published_at() OWNER TO postgres;

-- 함수에 대한 설명 추가
COMMENT ON FUNCTION public.set_published_at() 
IS 'Automatically sets published_at when status changes to PUBLISHED';

-- 3. get_page_stats 함수 재생성 (보안 강화)
-- ============================================

CREATE OR REPLACE FUNCTION public.get_page_stats()
RETURNS TABLE (
  total_pages BIGINT,
  published_pages BIGINT,
  draft_pages BIGINT
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) AS total_pages,
    COUNT(*) FILTER (WHERE status = 'PUBLISHED') AS published_pages,
    COUNT(*) FILTER (WHERE status = 'DRAFT') AS draft_pages
  FROM public.citydirect_pages;
END;
$$;

-- 함수 소유자를 postgres로 설정
ALTER FUNCTION public.get_page_stats() OWNER TO postgres;

-- 함수에 대한 설명 추가
COMMENT ON FUNCTION public.get_page_stats() 
IS 'Returns statistics about citydirect_pages (total, published, draft counts)';

-- 4. 함수 권한 설정
-- ============================================

-- service_role에 실행 권한 부여
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO service_role;
GRANT EXECUTE ON FUNCTION public.set_published_at() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_page_stats() TO service_role;

-- authenticated에 통계 함수 실행 권한 부여
GRANT EXECUTE ON FUNCTION public.get_page_stats() TO authenticated;

-- anon에 통계 함수 읽기 권한 부여
GRANT EXECUTE ON FUNCTION public.get_page_stats() TO anon;

-- 5. 설정 확인
-- ============================================

-- 모든 함수 목록 및 search_path 확인
SELECT 
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as arguments,
  p.prosecdef as security_definer,
  p.proconfig as configuration
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname IN (
    'update_updated_at_column',
    'set_published_at',
    'get_page_stats'
  )
ORDER BY p.proname;

-- 6. 완료 메시지
-- ============================================

SELECT '✅ 함수 보안 설정이 완료되었습니다!' as status,
       'search_path가 모든 함수에 적용되었습니다.' as message;
