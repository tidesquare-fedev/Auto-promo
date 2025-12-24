export const isDev = process.env.NEXT_PUBLIC_APP_ENV === "development";
export const isProd = process.env.NEXT_PUBLIC_APP_ENV === "production";

export const brand = process.env.NEXT_PUBLIC_APP_BRAND || "tourvis";

// Apollo API 토큰 (개발/운영 환경별)
const APOLLO_API_AUTH_DEV = "Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJUQSIsImlzcyI6InRuYS1hcGktdjIiLCJpYXQiOjE2NTUzNTI0MTksImV4cCI6MjI4NjA3MjQxOSwiaWQiOjMsIm5hbWUiOiLtiKzslrTruYTsiqQiLCJyb2xlIjoiRlJPTlRfQ0hBTk5FTCIsInN0YWdlIjoicHJvZCJ9.CLG1Xq90Qd52IMG01Gz7LTjpBYpYs7OzNsmr1-JqErCYPMfAMZ0_VNnPpZgDa6JaCP6pXSSArZ-2YamouHrDZw";
const APOLLO_API_AUTH_PROD = "Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJQQSIsImlzcyI6InRuYS1hcGktdjIiLCJpYXQiOjE2NTUzNTI1OTUsImV4cCI6MjI4NjA3MjU5NSwiaWQiOjQsIm5hbWUiOiJQUklWSUEiLCJyb2xlIjoiRlJPTlRfQ0hBTk5FTCIsInN0YWdlIjoicHJvZCJ9.QdRe6Iz2cY5VgjclRYuqKXckzGQIAXL6eqhWwQuOb9XKJw4BJqi06O48ITsUev-6AnjYumIgxyY20i2n1b-HRg";

// 환경 변수에서 API 키 및 토큰 읽기
// package.json의 cross-env 또는 시스템 환경 변수에서 읽음 (.env.local 사용 안 함)
export const envConfig = {
  // TNA API (Apollo API) - 환경 변수 우선, 없으면 환경별 기본값 사용
  tnaApiBase: process.env.TNA_API_BASE,
  tnaApiAuth: process.env.TNA_API_AUTH, // 환경 변수로 오버라이드 가능
  
  // Tourvis API (Apollo API 인증에도 사용됨)
  // package.json의 dev 스크립트에서 cross-env로 설정됨
  tourvisApiKey: process.env.TOURVIS_API_KEY,
  
  // Supabase
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
} as const;

// 디버깅: 환경 변수 로드 상태 확인
if (typeof window === "undefined") {
  // 서버 사이드에서만 로그 출력
  console.log("🔧 env/universal.ts 환경 변수 로드 상태:", {
    hasTourvisApiKey: !!envConfig.tourvisApiKey,
    tourvisApiKeyLength: envConfig.tourvisApiKey?.length || 0,
    hasTnaApiAuth: !!envConfig.tnaApiAuth,
    tnaApiBase: envConfig.tnaApiBase || "기본값 사용",
    appEnv: process.env.NEXT_PUBLIC_APP_ENV,
    brand: brand,
    isDev,
    isProd
  });
}

// 브랜드별 universalEnv 정의 (투어비스 기준, dev/prod 도메인 분기)
export const universalEnv =
  brand === "tourvis"
    ? isProd
      ? {
          wwwDomain: "https://tourvis.com",
          mwDomain: "https://tourvis.com",
          apiBaseUrl: {
            tna: envConfig.tnaApiBase || "https://apollo-api.tidesquare.com/tna-api-v2",
            review: "https://api.tourvis.com", // swagger: https://api.tourvis.com/swagger-ui.html
          },
          // API 인증 정보
          apiAuth: {
            tna: envConfig.tnaApiAuth || APOLLO_API_AUTH_PROD,
            tourvis: envConfig.tourvisApiKey,
          },
        }
      : {
          wwwDomain: "https://d.tourvis.com",
          mwDomain: "https://d.tourvis.com",
          apiBaseUrl: {
            tna: envConfig.tnaApiBase || "https://dev-apollo-api.tidesquare.com/tna-api-v2",
            review: "https://dapi.tourvis.com", // swagger: https://dapi.tourvis.com/swagger-ui.html
          },
          // API 인증 정보 (개발 환경)
          apiAuth: {
            tna: envConfig.tnaApiAuth || APOLLO_API_AUTH_DEV,
            tourvis: envConfig.tourvisApiKey,
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
          tna: envConfig.tnaApiAuth || (isProd ? APOLLO_API_AUTH_PROD : APOLLO_API_AUTH_DEV),
        },
      }
    : {
        mwDomain: "https://tmw.priviatravel.com",
        wwwDomain: "https://twww.priviatravel.com",
        apiBaseUrl: {
          common_fe: "https://dedge.tidesquare.com/ptcomm/api",
        },
        apiAuth: {
          tna: envConfig.tnaApiAuth || (isProd ? APOLLO_API_AUTH_PROD : APOLLO_API_AUTH_DEV),
        },
      };