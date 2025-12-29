export const isDev = process.env.NEXT_PUBLIC_APP_ENV === "development";
export const isProd = process.env.NEXT_PUBLIC_APP_ENV === "production";

export const brand = process.env.NEXT_PUBLIC_APP_BRAND || "tourvis";

// Apollo API 토큰 (개발/운영 환경별)
const APOLLO_API_AUTH_DEV = "Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJUQSIsImlzcyI6InRuYS1hcGktdjIiLCJpYXQiOjE2NTUzNTI0MTksImV4cCI6MjI4NjA3MjQxOSwiaWQiOjMsIm5hbWUiOiLtiKzslrTruYTsiqQiLCJyb2xlIjoiRlJPTlRfQ0hBTk5FTCIsInN0YWdlIjoicHJvZCJ9.CLG1Xq90Qd52IMG01Gz7LTjpBYpYs7OzNsmr1-JqErCYPMfAMZ0_VNnPpZgDa6JaCP6pXSSArZ-2YamouHrDZw";
const APOLLO_API_AUTH_PROD = "Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJQQSIsImlzcyI6InRuYS1hcGktdjIiLCJpYXQiOjE2NTUzNTI1OTUsImV4cCI6MjI4NjA3MjU5NSwiaWQiOjQsIm5hbWUiOiJQUklWSUEiLCJyb2xlIjoiRlJPTlRfQ0hBTk5FTCIsInN0YWdlIjoicHJvZCJ9.QdRe6Iz2cY5VgjclRYuqKXckzGQIAXL6eqhWwQuOb9XKJw4BJqi06O48ITsUev-6AnjYumIgxyY20i2n1b-HRg";

// ============================================
// Supabase 기본값 설정 (Vercel Environment Variables 없이도 동작)
// ============================================
// Next.js는 자동으로 .env.local 파일을 로드합니다.
// 우선순위: 환경 변수 > .env.local > 아래 기본값
//
// 사용 방법:
// 1. .env.local 파일에 설정 (권장): 프로젝트 루트에 .env.local 파일 생성
//    NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
//    SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
//
// 2. Vercel Environment Variables 사용: Vercel Dashboard에서 환경 변수 등록
//
// 3. 코드에 직접 설정: 아래에 실제 값을 입력 (보안 주의!)

// Supabase URL (필수)
// .env.local 파일의 NEXT_PUBLIC_SUPABASE_URL이 있으면 자동으로 사용됨
// .env.local 파일의 3번째 줄에서 가져온 값
const SUPABASE_URL_DEFAULT = "https://xavvecihhsymdvjsnwla.supabase.co";

// Supabase Anon Key (선택사항, 클라이언트 사이드에서 사용)
// .env.local 파일의 NEXT_PUBLIC_SUPABASE_ANON_KEY가 있으면 자동으로 사용됨
// .env.local 파일의 2번째 줄에서 가져온 값
const SUPABASE_ANON_KEY_DEFAULT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhdnZlY2loaHN5bWR2anNud2xhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3NDY4NDksImV4cCI6MjA4MTMyMjg0OX0.AkRY7r67xvIaHh5NmaYAkzsMFn6DZrehffGPBZpmTRw";

// Supabase Service Role Key (필수, 서버 사이드에서만 사용)
// .env.local 파일의 SUPABASE_SERVICE_ROLE_KEY가 있으면 자동으로 사용됨
// .env.local 파일의 5번째 줄에서 가져온 값
const SUPABASE_SERVICE_ROLE_KEY_DEFAULT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhdnZlY2loaHN5bWR2anNud2xhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc0Njg0OSwiZXhwIjoyMDgxMzIyODQ5fQ.1F6PjN7S_QOlOY4jAIZ1EL_WTm-vP44ffHId5fqTTvY";

// 환경 변수에서 API 키 및 토큰 읽기
// Next.js는 자동으로 .env.local 파일을 로드하므로 process.env로 접근 가능
// 우선순위: 환경 변수 > .env.local > 기본값
// 함수로 만들어서 런타임에 평가 (Vercel 배포 시 환경 변수 로드 보장)
export function getEnvConfig() {
  return {
    // TNA API (Apollo API) - 환경 변수 우선, 없으면 환경별 기본값 사용
    tnaApiBase: process.env.TNA_API_BASE,
    tnaApiAuth: process.env.TNA_API_AUTH, // 환경 변수로 오버라이드 가능
    
    // Tourvis API (Apollo API 인증에도 사용됨)
    // package.json의 dev 스크립트에서 cross-env로 설정됨
    tourvisApiKey: process.env.TOURVIS_API_KEY,
    
    // Supabase - Next.js가 .env.local을 자동으로 로드하므로 process.env로 접근
    // 우선순위: 환경 변수 > .env.local > 기본값
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL_DEFAULT,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY_DEFAULT,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_SERVICE_ROLE_KEY_DEFAULT,
  } as const;
}

// 하위 호환성을 위한 export (기존 코드와의 호환)
export const envConfig = getEnvConfig();

// 디버깅: 환경 변수 로드 상태 확인 (런타임에 평가)
if (typeof window === "undefined") {
  // 서버 사이드에서만 로그 출력
  const config = getEnvConfig();
  console.log("🔧 env/universal.ts 환경 변수 로드 상태:", {
    hasTourvisApiKey: !!config.tourvisApiKey,
    tourvisApiKeyLength: config.tourvisApiKey?.length || 0,
    hasTnaApiAuth: !!config.tnaApiAuth,
    tnaApiBase: config.tnaApiBase || "기본값 사용",
    hasSupabaseUrl: !!config.supabaseUrl,
    hasSupabaseServiceRoleKey: !!config.supabaseServiceRoleKey,
    supabaseUrlLength: config.supabaseUrl?.length || 0,
    supabaseKeyLength: config.supabaseServiceRoleKey?.length || 0,
    appEnv: process.env.NEXT_PUBLIC_APP_ENV,
    brand: brand,
    isDev,
    isProd,
    // 직접 환경 변수 확인 (디버깅용)
    directEnvUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    directEnvKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
  });
}

// 브랜드별 universalEnv 정의 (투어비스 기준, dev/prod 도메인 분기)
// 함수로 만들어서 런타임에 평가 (환경 변수 로드 보장)
export function getUniversalEnv() {
  const config = getEnvConfig()
  return brand === "tourvis"
    ? isProd
      ? {
          wwwDomain: "https://tourvis.com",
          mwDomain: "https://tourvis.com",
          apiBaseUrl: {
            tna: config.tnaApiBase || "https://apollo-api.tidesquare.com/tna-api-v2",
            review: "https://api.tourvis.com", // swagger: https://api.tourvis.com/swagger-ui.html
          },
          // API 인증 정보
          apiAuth: {
            tna: config.tnaApiAuth || APOLLO_API_AUTH_PROD,
            tourvis: config.tourvisApiKey,
          },
        }
      : {
          wwwDomain: "https://d.tourvis.com",
          mwDomain: "https://d.tourvis.com",
          apiBaseUrl: {
            tna: config.tnaApiBase || "https://dev-apollo-api.tidesquare.com/tna-api-v2",
            review: "https://dapi.tourvis.com", // swagger: https://dapi.tourvis.com/swagger-ui.html
          },
          // API 인증 정보 (개발 환경)
          apiAuth: {
            tna: config.tnaApiAuth || APOLLO_API_AUTH_DEV,
            tourvis: config.tourvisApiKey,
          },
        }
    : isProd
    ? {
        mwDomain: "https://mw.priviatravel.com",
        wwwDomain: "https://www.priviatravel.com",
        apiBaseUrl: {
          common_fe: "https://edge.tidesquare.com/ptcomm/api",
        },
        apiAuth: {
          tna: config.tnaApiAuth || (isProd ? APOLLO_API_AUTH_PROD : APOLLO_API_AUTH_DEV),
        },
      }
    : {
        mwDomain: "https://tmw.priviatravel.com",
        wwwDomain: "https://twww.priviatravel.com",
        apiBaseUrl: {
          common_fe: "https://dedge.tidesquare.com/ptcomm/api",
        },
        apiAuth: {
          tna: config.tnaApiAuth || (isProd ? APOLLO_API_AUTH_PROD : APOLLO_API_AUTH_DEV),
        },
      };
}

// 하위 호환성을 위한 export (기존 코드와의 호환)
export const universalEnv = getUniversalEnv();