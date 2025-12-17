-- ============================================
-- Auto-Promo Supabase 완전 초기화 및 재설정
-- ============================================

-- 1. 기존 항목 모두 삭제 (초기화)
-- ============================================

-- 트리거 삭제
DROP TRIGGER IF EXISTS update_citydirect_pages_updated_at ON citydirect_pages;
DROP TRIGGER IF EXISTS set_citydirect_pages_published_at ON citydirect_pages;

-- 뷰 삭제
DROP VIEW IF EXISTS citydirect_pages_published;

-- 함수 삭제
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS set_published_at();
DROP FUNCTION IF EXISTS get_page_stats();

-- 테이블 삭제 (모든 데이터도 함께 삭제됨)
DROP TABLE IF EXISTS citydirect_pages CASCADE;

-- 2. 테이블 생성
-- ============================================

CREATE TABLE citydirect_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  city_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED')),
  seo JSONB NOT NULL,
  content JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- 3. 인덱스 생성
-- ============================================

CREATE INDEX idx_citydirect_pages_slug ON citydirect_pages(slug);
CREATE INDEX idx_citydirect_pages_status ON citydirect_pages(status);
CREATE INDEX idx_citydirect_pages_city_code ON citydirect_pages(city_code);
CREATE INDEX idx_citydirect_pages_updated_at ON citydirect_pages(updated_at DESC);

-- 4. updated_at 자동 업데이트 함수 및 트리거
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_citydirect_pages_updated_at
  BEFORE UPDATE ON citydirect_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. RLS (Row Level Security) 비활성화
-- ============================================
-- 개발 환경에서는 RLS를 비활성화합니다.
-- 프로덕션 배포 시 활성화하고 정책을 추가하세요.

ALTER TABLE citydirect_pages DISABLE ROW LEVEL SECURITY;

-- 6. 테이블 설명 추가
-- ============================================

COMMENT ON TABLE citydirect_pages IS 'CityDirect 프로모션 페이지 저장소';
COMMENT ON COLUMN citydirect_pages.id IS '고유 ID (UUID)';
COMMENT ON COLUMN citydirect_pages.slug IS '페이지 URL 식별자 (예: seoul, busan)';
COMMENT ON COLUMN citydirect_pages.city_code IS '도시 코드 (임의 텍스트)';
COMMENT ON COLUMN citydirect_pages.status IS '페이지 상태: DRAFT 또는 PUBLISHED';
COMMENT ON COLUMN citydirect_pages.seo IS 'SEO 메타데이터 (title, description 등)';
COMMENT ON COLUMN citydirect_pages.content IS '페이지 컨텐츠 섹션 배열';

-- 7. 완료 확인
-- ============================================

SELECT 
  '✅ Supabase 설정 완료!' as message,
  'citydirect_pages 테이블이 생성되었습니다.' as details;

-- 테이블 구조 확인
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'citydirect_pages'
ORDER BY ordinal_position;

