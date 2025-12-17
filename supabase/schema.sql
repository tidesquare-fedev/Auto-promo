-- Supabase 스키마 정의
-- Auto-Promo: CityDirect 페이지 관리

-- 1. citydirect_pages 테이블 생성
CREATE TABLE IF NOT EXISTS public.citydirect_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  city_code TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('DRAFT', 'PUBLISHED')),
  seo JSONB NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  
  -- 인덱스
  CONSTRAINT slug_format CHECK (slug ~ '^[a-z0-9-]+$')
);

-- 2. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_citydirect_pages_slug 
  ON public.citydirect_pages(slug);

CREATE INDEX IF NOT EXISTS idx_citydirect_pages_status 
  ON public.citydirect_pages(status);

CREATE INDEX IF NOT EXISTS idx_citydirect_pages_city_code 
  ON public.citydirect_pages(city_code);

CREATE INDEX IF NOT EXISTS idx_citydirect_pages_updated_at 
  ON public.citydirect_pages(updated_at DESC);

-- 3. RLS (Row Level Security) 설정
ALTER TABLE public.citydirect_pages ENABLE ROW LEVEL SECURITY;

-- 읽기: 모든 사용자 허용
CREATE POLICY "Public read access"
  ON public.citydirect_pages
  FOR SELECT
  USING (true);

-- 쓰기: 서비스 역할만 허용 (Admin API에서만 사용)
CREATE POLICY "Service role write access"
  ON public.citydirect_pages
  FOR ALL
  USING (auth.role() = 'service_role');

-- 4. updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_citydirect_pages_updated_at
  BEFORE UPDATE ON public.citydirect_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 5. 발행 시 published_at 자동 설정 트리거
CREATE OR REPLACE FUNCTION public.set_published_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'PUBLISHED' AND OLD.status != 'PUBLISHED' THEN
    NEW.published_at = NOW();
  ELSIF NEW.status = 'DRAFT' THEN
    NEW.published_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_citydirect_pages_published_at
  BEFORE UPDATE ON public.citydirect_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.set_published_at();

-- 6. 샘플 데이터 (선택)
-- INSERT INTO public.citydirect_pages (slug, city_code, status, seo, content)
-- VALUES (
--   'seoul-summer-promotion',
--   'SEOUL',
--   'DRAFT',
--   '{"title": "서울 여름 프로모션", "description": "여름 시즌 특별 할인", "index": true}'::jsonb,
--   '[{"type": "Hero", "title": "서울 여름 프로모션"}]'::jsonb
-- );

-- 7. 유용한 뷰 생성
CREATE OR REPLACE VIEW public.citydirect_pages_published AS
SELECT * FROM public.citydirect_pages
WHERE status = 'PUBLISHED'
ORDER BY published_at DESC;

-- 8. 통계 함수
CREATE OR REPLACE FUNCTION public.get_page_stats()
RETURNS TABLE (
  total_pages BIGINT,
  published_pages BIGINT,
  draft_pages BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) AS total_pages,
    COUNT(*) FILTER (WHERE status = 'PUBLISHED') AS published_pages,
    COUNT(*) FILTER (WHERE status = 'DRAFT') AS draft_pages
  FROM public.citydirect_pages;
END;
$$ LANGUAGE plpgsql;

-- 완료 메시지
COMMENT ON TABLE public.citydirect_pages IS 'CityDirect 프로모션 페이지 저장소';

