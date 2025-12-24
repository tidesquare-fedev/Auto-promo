# CityDirect Auto-Promo

MCP(Model Context Protocol) 기반 CityDirect 프로모션 페이지 제작 어드민 시스템입니다.

Apollo API와 디자인 시스템을 MCP로 래핑하여 프로모션 페이지를 빠르고 쉽게 제작할 수 있습니다.

## 주요 기능

### 페이지 빌더
- **실시간 상품 미리보기**: 상품 ID 입력 시 Apollo API를 통해 실시간으로 상품 정보 표시
- **Drag & Drop 섹션 관리**: 섹션을 드래그하여 자유롭게 배치 및 순서 변경
- **디자인 시스템 검증**: Design MCP가 페이지 구조를 자동 검증하여 오류 방지
- **Draft·Publish 권한 분리**: 발행된 페이지는 초안으로 변경 후 수정 가능
- **리뷰 통합**: 상품별 리뷰 자동 표시 및 키워드 태그 지원

### 배지 시스템
- **다중 배지 지원**: 한 상품에 여러 개의 배지 표시 가능
- **상품별 타게팅**: 특정 상품에만 배지 적용 가능 (ID 지정)
- **커스터마이징**: 텍스트, 배경색, 테두리색 자유롭게 설정
- **표 형식 UI**: 배지 관리를 간편한 테이블 형태로 제공

### 이미지 캐러셀
- **터치/마우스 스와이프**: 모바일과 데스크톱 모두 스와이프 지원
- **자동 슬라이드**: 5초마다 자동 전환
- **커스텀 사이즈**: 이미지 높이/너비 자유롭게 조절
- **오버레이 텍스트**: 이미지 위에 제목/설명 표시

### GNB/Footer 통합
- **Tourvis 위젯 자동 로드**: 환경별(dev/prod) 자동 설정
- **반응형 디자인**: 데스크톱은 PC GNB, 모바일은 Bottom Tab Bar
- **SSR 대응**: WebComponentWrapper로 서버사이드 렌더링 지원

## 기술 스택

- **Framework**: Next.js 16.1 (Pages Router)
- **Language**: TypeScript
- **UI Library**: shadcn/ui (Radix UI + Tailwind CSS)
- **Drag & Drop**: @dnd-kit
- **Database**: Supabase
- **External API**: Apollo API (TNA), Tourvis Review API
- **Architecture**: MCP (Model Context Protocol)

## 프로젝트 구조

```
src/
├─ pages/
│  ├─ admin/citydirect/              # 관리자 페이지
│  │  ├─ index.tsx                   # 페이지 목록
│  │  ├─ [slug].tsx                  # 페이지 편집기
│  │  └─ SectionEditor.tsx           # 섹션 편집 컴포넌트
│  ├─ marketing/citydirect/          # 프론트엔드 (발행된 페이지)
│  │  └─ [slug].tsx                  # 동적 마케팅 페이지
│  └─ api/
│     ├─ products/
│     │  ├─ by-ids.ts                # 상품 조회 (프론트)
│     │  └─ preview.ts               # 상품 미리보기 (어드민)
│     ├─ citydirect/
│     │  ├─ page.ts                  # 페이지 저장
│     │  ├─ [slug].ts                # 페이지 조회
│     │  └─ list.ts                  # 페이지 목록
│     └─ revalidate.ts               # ISR Revalidate
│
├─ mcp/
│  ├─ product/                       # Product MCP
│  │  ├─ index.ts                    # 메인 인터페이스
│  │  ├─ adapter.ts                  # Apollo API 어댑터
│  │  ├─ normalize.ts                # 데이터 정규화
│  │  ├─ cache.ts                    # 캐싱 레이어
│  │  └─ test-api.ts                 # API 테스트
│  ├─ design/                        # Design MCP
│  │  ├─ index.ts                    # 메인 인터페이스
│  │  ├─ rules.ts                    # 디자인 규칙
│  │  ├─ validate.ts                 # 검증 로직
│  │  └─ styles.ts                   # 스타일 유틸리티
│  └─ common/                        # Common MCP
│     ├─ index.ts                    # 메인 인터페이스
│     └─ review.ts                   # 리뷰 API
│
├─ components/
│  ├─ admin/                         # 어드민 전용 컴포넌트
│  │  ├─ SortableSectionList.tsx    # Drag & Drop 리스트
│  │  ├─ SectionTree.tsx             # 섹션 트리 뷰
│  │  ├─ ProductPreview.tsx          # 상품 미리보기
│  │  ├─ StyleSettings.tsx           # 스타일 설정
│  │  ├─ InlineStyleControl.tsx      # 인라인 스타일 컨트롤
│  │  └─ BackgroundColorControl.tsx  # 배경색 컨트롤
│  ├─ tourvis/                       # Tourvis 위젯 래퍼
│  │  ├─ tourvis-pc-gnb.tsx          # PC GNB 래퍼
│  │  ├─ tourvis-bottom-tab-bar.tsx  # 모바일 탭바 래퍼
│  │  └─ web-component-wrapper.tsx   # 웹 컴포넌트 래퍼
│  └─ ui/                            # shadcn/ui 컴포넌트
│     ├─ button.tsx, input.tsx, ...
│
├─ design-system/sections/           # 프론트 섹션 컴포넌트
│  ├─ HeroSection.tsx                # 히어로 섹션
│  ├─ IntroText.tsx                  # 소개 텍스트
│  ├─ ProductGrid.tsx                # 상품 그리드
│  ├─ ProductTabs.tsx                # 탭 구조 상품 진열
│  ├─ ImageCarousel.tsx              # 이미지 캐러셀
│  ├─ FAQSection.tsx                 # FAQ 섹션
│  └─ index.ts                       # 섹션 export
│
├─ lib/
│  ├─ badges.ts                      # 배지 유틸리티
│  ├─ section-styles.ts              # 섹션 스타일 유틸리티
│  ├─ product-card-styles.ts         # 상품 카드 스타일 유틸리티
│  ├─ api/
│  │  └─ products.ts                 # 상품 API 유틸리티
│  ├─ utils.ts                       # 공통 유틸리티 (cn)
│  ├─ db.ts                          # 데이터베이스 추상화
│  ├─ supabase.ts                    # Supabase 클라이언트
│  └─ tourvis-url.ts                 # Tourvis URL 유틸리티
│
├─ hooks/
│  └─ useProducts.ts                 # 상품 조회 커스텀 훅
│
├─ types/
│  ├─ page.ts                        # Page DSL 타입 정의
│  ├─ tutti-api.ts                   # Apollo API 타입
│  └─ review.ts                     # 리뷰 타입
│
├─ styles/
│  └─ globals.css                    # 글로벌 스타일
│
└─ env/
   └─ universal.ts                   # 환경별 설정 중앙 관리
```

## 설치 및 실행

### 1. 패키지 설치

```bash
npm install
# 또는
yarn install
```

### 2. 환경 변수 설정

환경 변수는 `package.json`의 `dev` 스크립트에서 `cross-env`로 설정되거나, Vercel 대시보드에서 설정합니다.

**로컬 개발:**
- `package.json`의 `dev` 스크립트에 환경 변수가 포함되어 있습니다
- 필요시 Vercel에서 환경 변수를 가져와 사용할 수 있습니다

**Vercel 배포:**
- `NEXT_PUBLIC_APP_ENV`: `production` 또는 `development`
- `NEXT_PUBLIC_APP_BRAND`: `tourvis` (기본값)
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase Anon Key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase Service Role Key
- `TOURVIS_API_KEY`: Tourvis API 키 (선택)
- `TNA_API_BASE`: Apollo API Base URL (선택, 기본값 사용 가능)

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000/admin/citydirect](http://localhost:3000/admin/citydirect) 접속

## 사용 방법

### 1. 새 페이지 만들기

1. `/admin/citydirect`에서 **"새 페이지 만들기"** 클릭
2. **기본 정보 입력**
   - **슬러그**: URL 경로 (예: `seoul-city`)
   - **도시 코드**: 도시 구분자 (예: `SEOUL`)
   - **상태**: `DRAFT` (초안) 또는 `PUBLISHED` (발행)

3. **SEO 설정**
   - 제목, 설명, OG 이미지
   - 검색 엔진 인덱싱 여부

### 2. 섹션 추가 및 편집

좌측 콘텐츠 영역에서 원하는 섹션 타입 버튼을 클릭하여 추가:

#### Hero 섹션
- 페이지 상단 히어로 이미지와 제목
- 부제목 및 이미지 URL 설정 가능

#### IntroText 섹션
- 소개 텍스트 섹션
- 제목과 설명 입력

#### ProductGrid 섹션
- 상품을 그리드 형태로 진열
- **컬럼 수**: 1~4개 선택 (카드 크기 자동 조절)
- **상품 ID**: 쉼표 또는 줄바꿈으로 구분하여 입력
- **리뷰 표시**: 상품별 리뷰 자동 표시 (선택 가능)
- **배지 설정**: 
  - "뱃지 추가" 버튼으로 여러 배지 생성
  - 텍스트, 색상, 테두리 커스터마이징
  - 적용 상품 ID 지정 (비워두면 전체 적용)

#### ProductTabs 섹션
- 탭 구조로 상품 분류 진열
- 각 탭마다 별도의 상품 목록
- ProductGrid와 동일한 배지 시스템 지원

#### ImageCarousel 섹션
- 스와이프 가능한 이미지 캐러셀
- **이미지 높이**: 작음/보통/큼/매우 큼/커스텀
- **커스텀 모드**: 높이와 너비를 픽셀 단위로 정밀 조절
- 각 슬라이드에 제목/설명 추가 가능
- 자동 슬라이드 및 네비게이션 버튼 제공

#### FAQ 섹션
- 자주 묻는 질문 섹션
- 질문/답변 쌍으로 구성

### 3. 섹션 관리

- **순서 변경**: 좌측 편집 영역에서 드래그하여 순서 변경
- **트리 뷰**: 우측 사이드바에서 페이지 구조 한눈에 확인
- **삭제**: 각 섹션 우측 상단 "삭제" 버튼

### 4. 저장 및 발행

1. **저장**: "저장" 버튼 클릭하여 변경사항 저장
2. **미리보기**: "미리보기" 버튼으로 실제 렌더링 확인
3. **발행**: 상태를 `PUBLISHED`로 변경하여 프론트엔드에 배포

## 지원하는 섹션 타입

### 1. Hero
- **용도**: 페이지 상단 히어로 영역
- **필수 필드**: 제목
- **선택 필드**: 부제목, 이미지 URL
- **제한**: 페이지당 최대 1개

### 2. IntroText
- **용도**: 소개 텍스트 섹션
- **필수 필드**: 제목, 설명
- **제한**: 페이지당 최대 1개

### 3. ProductGrid
- **용도**: 상품 그리드 진열
- **필수 필드**: 제목, 상품 ID 배열
- **선택 필드**: 컬럼 수(1-4), 배지, 스타일
- **제한**: 
  - 페이지당 최대 2개
  - 상품 1~6개
- **특징**: 다중 배지 지원, 상품별 타게팅

### 4. ProductTabs
- **용도**: 탭 구조 상품 분류
- **필수 필드**: 탭 배열 (id, label, productIds)
- **선택 필드**: 섹션 제목, 컬럼 수, 배지
- **제한**: 
  - 페이지당 최대 2개
  - 탭 1~6개
  - 각 탭당 상품 1~6개
- **특징**: 모든 탭 공통 배지 시스템

### 5. ImageCarousel
- **용도**: 이미지 슬라이드 캐러셀
- **필수 필드**: 슬라이드 배열 (id, image)
- **선택 필드**: 제목, 이미지 높이, 커스텀 사이즈
- **제한**: 
  - 페이지당 최대 3개
  - 슬라이드 1~20개
- **특징**: 
  - 터치/마우스 스와이프
  - 자동 슬라이드 (5초)
  - 커스텀 사이즈 (100-1000px 높이, 200-2000px 너비)

### 6. FAQ
- **용도**: 자주 묻는 질문
- **필수 필드**: 질문/답변 배열
- **선택 필드**: 섹션 제목
- **제한**: 
  - 페이지당 최대 1개
  - 최소 1개 항목

## MCP 아키텍처

```
┌─────────────────────────────────────┐
│         Admin UI (shadcn/ui)        │
│   - 페이지 편집기                      │
│   - 섹션 관리                         │
│   - 실시간 미리보기                    │
└───────────────┬─────────────────────┘
                │
     ┌──────────▼──────────┐
     │    API Routes       │
     │  - /api/citydirect  │
     │  - /api/products    │
     └──────────┬──────────┘
                │
     ┌──────────▼────────────────────┐
     │        MCP Layer              │
     ├────────────┬──────────────────┤
     │ Product    │  Design          │
     │ MCP        │  MCP             │
     │            │                  │
     │ - 상품 조회  │  - 페이지 검증    │
     │ - 정규화    │  - 규칙 관리      │
     │ - 캐싱     │  - 섹션 템플릿    │
     └─────┬──────┴────────┬─────────┘
           │               │
  ┌────────▼──────┐  ┌────▼─────────┐
  │  Tutti API    │  │ Design Rules │
  │  (External)   │  │ (Internal)   │
  └───────────────┘  └──────────────┘
```

### Product MCP
- **역할**: Apollo API (TNA)와의 인터페이스
- **기능**: 상품 조회, 데이터 정규화, 캐싱
- **파일**: `src/mcp/product/`

### Design MCP
- **역할**: 페이지 디자인 검증 및 규칙 관리
- **기능**: 섹션 개수 제한, 필수 필드 검증, 스타일 유틸리티
- **파일**: `src/mcp/design/`

### Common MCP
- **역할**: 공통 API 모듈
- **기능**: 리뷰 조회, 공통 유틸리티
- **파일**: `src/mcp/common/`

## API 엔드포인트

### 상품 조회

#### `POST /api/products/by-ids`
프론트엔드용 상품 조회

**요청:**
```json
{
  "productIds": ["GPRD2001366002", "GPRD2001366003"]
}
```

**응답:**
```json
[
  {
    "id": "GPRD2001366002",
    "name": "상품명",
    "thumbnail": "이미지 URL",
    "price": 50000,
    "region": "서울",
    "isClosed": false,
    "soldOut": false,
    ...
  }
]
```

#### `POST /api/products/preview`
어드민용 상품 미리보기 (동일한 스펙)

### 페이지 관리

#### `GET /api/citydirect/[slug]`
페이지 조회

**응답:**
```json
{
  "slug": "seoul-city",
  "cityCode": "SEOUL",
  "status": "PUBLISHED",
  "seo": { ... },
  "content": [ ... ],
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

#### `POST /api/citydirect/page`
페이지 저장

**요청:** CityDirectPage 객체 전체

#### `GET /api/citydirect/list`
페이지 목록 조회

#### `POST /api/revalidate`
ISR 캐시 재검증

**요청:**
```json
{
  "slug": "seoul-city"
}
```

## 배지 시스템 사용법

### 배지 추가

1. ProductGrid 또는 ProductTabs 섹션에서 **"+ 뱃지 추가"** 클릭
2. 표 형식 UI에서 배지 정보 입력:
   - **텍스트**: 배지에 표시될 텍스트 (예: "베스트", "할인")
   - **텍스트 색상**: 텍스트 색상 선택
   - **배경색**: 배지 배경색 선택
   - **테두리 색상**: 테두리 색상 선택
   - **적용 상품**: 특정 상품 ID 입력 (비우면 전체 적용)

### 배지 타게팅

- **전체 적용**: "적용 상품" 필드를 비워두면 해당 섹션의 모든 상품에 표시
- **특정 상품만**: 쉼표로 구분된 상품 ID 입력 (예: `GPRD001, GPRD002`)

### 다중 배지

- 한 섹션에 여러 배지 추가 가능
- 한 상품에 여러 배지가 적용될 경우 가로로 나란히 표시

## 이미지 캐러셀 사용법

### 슬라이드 추가

1. ImageCarousel 섹션에서 **"+ 슬라이드 추가"** 클릭
2. 각 슬라이드 정보 입력:
   - **이미지 URL**: 필수
   - **제목**: 선택 (오버레이 표시)
   - **설명**: 선택 (오버레이 표시)

### 이미지 크기 설정

- **작음**: 192px
- **보통**: 256px (기본값)
- **큼**: 384px
- **매우 큼**: 500px
- **커스텀**: 높이(100-1000px)와 너비(200-2000px) 직접 입력

### 슬라이드 순서 변경

각 슬라이드 우측 상단의 **"↑ 위로"** / **"↓ 아래로"** 버튼 사용

## 권한 관리

### DRAFT (초안)
- 자유롭게 편집 가능
- 섹션 추가/삭제/순서 변경
- 저장 즉시 반영

### PUBLISHED (발행)
- **읽기 전용**: 수정 불가
- 수정하려면 먼저 `DRAFT`로 변경 필요
- API와 UI 양쪽에서 수정 차단

발행된 페이지를 수정하려면:
1. 상태를 `DRAFT`로 변경
2. 수정 작업 진행
3. 다시 `PUBLISHED`로 변경

## 배포

### 프론트엔드 페이지 경로

발행된 페이지는 다음 경로에서 확인할 수 있습니다:

```
/marketing/citydirect/[slug]
```

예: `/marketing/citydirect/seoul-city`

### ISR (Incremental Static Regeneration)

- 프론트엔드 페이지는 ISR을 사용하여 빠른 로딩 속도 제공
- 페이지 저장 시 자동으로 revalidate 호출
- 필요시 수동으로 `/api/revalidate` 호출 가능

### Vercel 배포

프로젝트는 Vercel에 최적화되어 있습니다:

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel
```

환경 변수는 Vercel 대시보드에서 설정하세요. `env/universal.ts`에서 환경별 설정을 중앙 관리합니다.

## 개발 가이드

### 새 섹션 타입 추가

1. **타입 정의** (`src/types/page.ts`)
```typescript
export type NewSection = {
  type: "NewSection"
  // 필드 정의
}

export type PageSection = 
  | HeroSection 
  | NewSection // 추가
  | ...
```

2. **Design MCP 규칙** (`src/mcp/design/rules.ts`)
```typescript
export const designRules = {
  NewSection: {
    max: 1,
    required: ["field1"],
    optional: ["field2"]
  },
  ...
}
```

3. **검증 로직** (`src/mcp/design/validate.ts`)
```typescript
if (s.type === "NewSection") {
  // 검증 로직
}
```

4. **섹션 컴포넌트** (`src/design-system/sections/NewSection.tsx`)
```typescript
export function NewSection({ ...props }: NewSection) {
  // 렌더링 로직
}
```

5. **어드민 편집기** (`src/pages/admin/citydirect/[slug].tsx`)
```typescript
// addSection 함수에 케이스 추가
case "NewSection":
  newSection = { type: "NewSection", ... }
  break

// SectionEditorContent에 편집 UI 추가
{section.type === "NewSection" && (
  // 편집 UI
)}
```

6. **프론트 렌더링** (`src/pages/marketing/citydirect/[slug].tsx`)
```typescript
{section.type === "NewSection" && (
  <NewSection {...section} />
)}
```

### 코드 구조 원칙

#### 유틸리티 함수
- `src/lib/` 디렉토리에 기능별로 분리
- 타입 안전성 보장
- 재사용 가능하도록 설계

#### 컴포넌트 분리
- 어드민 전용: `src/components/admin/`
- 프론트 전용: `src/design-system/sections/`
- 공통 UI: `src/components/ui/`

#### 타입 정의
- 모든 타입은 `src/types/`에 중앙 관리
- Page DSL은 `page.ts`에 집중
- API 응답 타입은 별도 파일로 분리

#### MCP 패턴
- 외부 의존성을 MCP로 래핑
- 검증 로직을 비즈니스 규칙으로 분리
- 확장 가능한 구조 유지

## 라이선스

Rebecca Project
