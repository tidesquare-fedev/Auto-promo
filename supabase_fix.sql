-- 기존 트리거 삭제 후 재생성
DROP TRIGGER IF EXISTS update_citydirect_pages_updated_at ON citydirect_pages;
DROP TRIGGER IF EXISTS set_citydirect_pages_published_at ON citydirect_pages;

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_at 트리거 재생성
CREATE TRIGGER update_citydirect_pages_updated_at
  BEFORE UPDATE ON citydirect_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS 비활성화 (개발 환경)
ALTER TABLE citydirect_pages DISABLE ROW LEVEL SECURITY;

-- 완료!
SELECT 
  '✅ 설정 완료!' as message,
  COUNT(*) as total_pages,
  COUNT(*) FILTER (WHERE status = 'DRAFT') as draft_pages,
  COUNT(*) FILTER (WHERE status = 'PUBLISHED') as published_pages
FROM citydirect_pages;

