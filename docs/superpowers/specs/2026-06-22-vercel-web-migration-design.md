# 우리 동네 오늘 — Vercel Web Migration Design Spec

> **Date**: 2026-06-22
> **Author**: sigco3111 + AI assistant
> **Status**: Approved (2026-06-22, awaiting written spec review)

---

## 1. 개요 (Overview)

토스 앱인토스 Granite + React Native 기반 미니앱 "우리 동네 오늘"을 **Next.js 15 + Vercel** 웹앱으로 완전 전환한다.

**핵심 동인**:
- Granite DevTools standalone 포트 충돌(EADDRINUSE 8081/8097/8098) 등 RN 스택 운영 마찰
- 토스 샌드박스 앱 QR 스캔 강제 → 데스크탑/모바일 브라우저 자유
- 토스 디자인 시스템 검수 제약에서 벗어나 디자인 자유도 확보
- 챌린지 300만원 포기 (2026-06-30 마감) — 더 넓은 잠재 사용자 도달

**범위**: 기존 Toss 버전과 **1:1 기능 동등성** 확보 (날씨/미세먼지/강수/공휴일/비교 + MBTI 캐릭터 엔진 + 위치/친구 동네 + 공유 + 햅틱)

---

## 2. 컨텍스트 (Context)

### 2.1 현재 스택 (제거 대상)
| 영역 | 기술 | 비고 |
|---|---|---|
| 프레임워크 | Granite 1.x (`@granite-js/react-native` 0.1.28) | React Native 0.72.6 기반 |
| UI 라이브러리 | `@toss/tds-react-native` 1.3.8 | TDS React Native 1.3.8 |
| 차트 | `react-native-gifted-charts` 1.4.43 | LineChart / PieChart / BarChart |
| SDK | `@apps-in-toss/framework` 1.5.2 | storage, share, getCurrentLocation 등 |
| 빌드 | `yarn granite build` → `dist/` → `apps-in-toss.toss.im` 콘솔 업로드 | |

### 2.2 신규 스택 (도입 대상)
| 영역 | 기술 | 비고 |
|---|---|---|
| 프레임워크 | **Next.js 15** (App Router) | TypeScript strict, React 19 |
| 스타일링 | **Tailwind CSS v4** (CSS-first) + TDS 디자인 토큰 | `globals.css`의 `@theme { --color-tds-blue: #3182F6; }`, **`tailwind.config.ts` 없음**, 차트/UI는 `var(--color-tds-blue)` 참조 |
| 차트 | **recharts** | LineChart / RadialBarChart / AreaChart / BarChart |
| 클라이언트 데이터 | **SWR** | 위치 기반 4종 + 30분 캐시 |
| 서버 데이터 | **RSC + fetch cache** | 공휴일 (위치 무관) |
| 영구 저장 | **localStorage** (typed wrapper) | SSR-safe 가드 |
| 위치 | `navigator.geolocation.getCurrentPosition` | Nominatim Reverse |
| 공유 | Web Share API + clipboard fallback | 토스 share 대체 |
| 폰트 | `next/font/google` (Pretendard) | 한글 가독성 |
| 테스트 | Vitest + React Testing Library | verify-engine.ts 재사용 |
| 배포 | Vercel (Git 자동) | 환경변수 0개 |

### 2.3 외부 API (변경 없음 — 모두 무키)
- Open-Meteo Forecast, Air Quality, Precipitation, Geocoding
- Nager Date (공휴일)
- Nominatim Reverse (좌표→주소)

상세: `docs/DATA_SOURCES.md`

---

## 3. 목표 / 비목표 (Goals & Non-Goals)

### 3.1 Goals
1. **1:1 기능 동등성** — 기존 Toss 버전의 모든 기능 재현
2. **Vercel 자동 배포** — `main` 브랜치 push 시 자동 빌드/배포
3. **환경변수 0개** — 무키 API 그대로 사용
4. **모바일 퍼스트** — 토스 미니앱 UX 보존 (375px~)
5. **다크모드 자동** — TDS 토큰 CSS vars 활용
6. **오프라인 fallback** — localStorage 캐시 (네트워크 끊김 시)

### 3.2 Non-Goals
- ❌ 챌린지 출품 (300만원 포기)
- ❌ 백엔드 서버 구축 (API Routes 사용 안 함, 직접 fetch)
- ❌ 인증/로그인 (현재 0 사용자 인증, 그대로 유지)
- ❌ DB 도입 (localStorage만)
- ❌ PWA (선택 사항, 우선순위 낮음)
- ❌ 다국어 (한국어 단일)

---

## 4. 핵심 아키텍처 결정 (Locked)

| # | 결정 | 선택 | 근거 |
|---|---|---|---|
| 1 | 챌린지 출품 | **포기** | Vercel 전환 필수 |
| 2 | 프레임워크 | **Next.js 15 App Router** | Vercel 최적화, RSC |
| 3 | 범위 | **1:1 기능 동등성** | 가시 출고물 동일 |
| 4 | 디자인 | **TDS Web (CSS tokens)** | 색상 일관성 |
| 5 | 데이터 fetching | **하이브리드** (RSC + Client/SWR) | Next.js 장점 활용 |
| 6 | 마이그레이션 | **Greenfield 재작성** | 깔끔, RN 의존성 제거 |

---

## 5. 신규 프로젝트 구조

```
dongne-today/
├── app/                            # Next.js App Router
│   ├── layout.tsx                  # 루트 (TDS 토큰 + Pretendard)
│   ├── page.tsx                    # 메인 대시보드 (Home)
│   ├── onboarding/page.tsx         # 위치 권한 + 자동 인식
│   ├── settings/page.tsx           # 우리/친구 동네 관리
│   ├── globals.css                 # TDS 토큰 (CSS variables)
│   └── manifest.ts                 # PWA 메타 — Out of Scope로 이동, 구조에서 제외
├── components/
│   ├── cards/                      # 5종 카드 (recharts)
│   │   ├── WeatherCard.tsx         # 24h 기온 LineChart
│   │   ├── AirQualityCard.tsx      # PM2.5 RadialBarChart
│   │   ├── PrecipitationCard.tsx   # 강수확률 AreaChart
│   │   ├── HolidayCard.tsx         # 단순 Badge
│   │   └── CompareCard.tsx         # 가로 막대 BarChart
│   ├── dashboard/                  # 대시보드 셸
│   │   ├── DashboardGrid.tsx       # 2x3 그리드 레이아웃
│   │   ├── CharacterReport.tsx     # MBTI 캐릭터 헤더
│   │   └── ErrorBoundary.tsx       # 에러 격리
│   ├── neighborhood/
│   │   └── NeighborhoodPicker.tsx  # 주소 검색 모달
│   └── ui/                         # 프리미티브
│       ├── Card.tsx
│       ├── Badge.tsx
│       ├── Button.tsx
│       └── Skeleton.tsx
├── lib/
│   ├── api/                        # 6종 API (fetch + 타입)
│   │   ├── weather.ts
│   │   ├── airQuality.ts
│   │   ├── precipitation.ts
│   │   ├── holidays.ts             # RSC 지원 (revalidate: 86400)
│   │   ├── geocoding.ts
│   │   └── index.ts                # fetchAllData + getDashboard
│   ├── hooks/
│   │   ├── useDashboardData.ts     # SWR hook
│   │   ├── useNeighborhood.ts      # SWR + localStorage
│   │   └── useFriends.ts           # 친구 동네 (localStorage)
│   ├── location.ts                 # navigator.geolocation wrapper
│   ├── storage.ts                  # localStorage typed wrapper (SSR-safe)
│   ├── share.ts                    # Web Share API + clipboard fallback
│   └── haptics.ts                  # navigator.vibrate (선택)
├── utils/
│   ├── characterEngine.ts          # 6종 MBTI 결정 (재사용)
│   ├── format.ts                   # 온도/시간/거리/날짜 포맷 (재사용)
│   └── shareLink.ts                # 공유 메시지 생성 (Web Share API용, **RN의 shareLink와 별개**)
├── types/
│   └── index.ts                    # 도메인 타입 (재사용)
├── archive/                        # 기존 RN/Granite 코드 백업
│   ├── toss-app/                   # src/, granite.config.ts, package.json(이전)
│   └── README.md                   # archive 사유/복원 방법
├── scripts/
│   └── verify-engine.ts            # Node assert 단위 테스트 (재사용)
├── public/                         # 정적 자산
├── next.config.ts
├── postcss.config.mjs              # Tailwind v4 PostCSS 플러그인
├── tsconfig.json                   # "jsx": "preserve" (Next.js 기본)
├── package.json
├── vitest.config.ts                # environment: 'jsdom'
├── .gitignore
├── README.md
└── LICENSE
```

---

## 6. 마이그레이션 매핑 (RN → Web)

| 기존 (Toss/RN) | 신규 (Next.js/Web) | 변경 강도 |
|---|---|---|
| `@apps-in-toss/framework` | 제거 (Web APIs) | 🟢 삭제 |
| `@granite-js/react-native` | Next.js 15 | 🟢 삭제 |
| `@granite-js/plugin-router` | App Router | 🟢 삭제 |
| `@granite-js/native` | 제거 | 🟢 삭제 |
| `@toss/tds-react-native` | TDS 디자인 토큰 (CSS variables) | 🟡 변환 |
| `react-native-gifted-charts` | recharts | 🟡 변환 |
| `getCurrentLocation` | `navigator.geolocation.getCurrentPosition` | 🟡 변환 |
| `@apps-in-toss/storage` | localStorage typed wrapper | 🟡 변환 |
| `share` SDK | `navigator.share` + clipboard fallback | 🟡 변환 |
| `generateHapticFeedback` | `navigator.vibrate(50)` (선택) | 🟢 단순 |
| `react-native-svg` | recharts 기본 SVG | 🟢 삭제 |
| `react-native-view-shot` | `html-to-image` (공유용 스냅샷) | 🟡 변환 |
| `AppRegistry.registerComponent` | Next.js 페이지 라우트 | 🟢 교체 |
| `src/_app.tsx` (Granite 진입점) | `app/layout.tsx` + `app/page.tsx` | 🟢 교체 |
| `Text` (TDS) | `<p>`, `<h1>` + Tailwind | 🟡 변환 |
| `Top` 컴포넌트 (TDS) | 커스텀 `<header>` + Tailwind | 🟡 변환 |
| `Button` (TDS) | 커스텀 `<button>` + Tailwind | 🟡 변환 |
| `Badge` (TDS) | 커스텀 `<span>` + Tailwind | 🟡 변환 |
| `SearchField` (TDS) | `<input>` + Tailwind | 🟡 변환 |
| `colors.adaptiveGrey900` | `var(--tds-grey-900)` | 🟡 변환 |
| `generateHapticFeedback(['tap'])` | `navigator.vibrate(10)` | 🟢 단순 |

---

## 7. 재사용 파일 (로직 재사용 + import 경로 수정 필요)

✅ **로직은 100% 재사용, import 경로는 sed로 일괄 수정**:
- `src/types/index.ts` → `types/index.ts` — 도메인 타입
- `src/utils/characterEngine.ts` → `utils/characterEngine.ts` — 6종 MBTI 결정 (순수 함수)
- `src/utils/format.ts` → `utils/format.ts` — temp, percent, hourLabel, daysUntil, distance, relativeDate
- `scripts/verify-engine.ts` → `scripts/verify-engine.ts` (경로만 archive/로 보정) — Node assert 단위 테스트

**import 경로 수정 작업 (Phase 4)**:
```bash
# src 내부 상대 import를 @/ alias로 일괄 변경
find . -name "*.ts" -not -path "*/node_modules/*" -not -path "*/archive/*" \
  -exec sed -i '' "s|from '\\.\\./\\.\\./types|from '@/types|g" {} \;
find . -name "*.ts" -not -path "*/node_modules/*" -not -path "*/archive/*" \
  -exec sed -i '' "s|from '\\.\\./types|from '@/types|g" {} \;
# verify-engine.ts는 archive 안에 남기므로 별도 처리 불필요
```

**tsconfig.json path alias 설정**:
```json
{
  "compilerOptions": {
    "paths": { "@/*": ["./*"] }
  }
}
```

✅ **로직 그대로 + fetch 부분만 수정**:
- `lib/api/weather.ts`
- `lib/api/airQuality.ts`
- `lib/api/precipitation.ts`
- `lib/api/geocoding.ts`
- `lib/api/holidays.ts` (RSC 지원 추가)

---

## 8. 데이터 Fetching 전략 (하이브리드)

### 8.1 RSC (서버 컴포넌트) — 공휴일
```typescript
// app/api/holidays/cache.ts (서버 전용)
export async function getHolidays(year: number): Promise<PublicHoliday[]> {
  const res = await fetch(
    `https://date.nager.at/api/v3/PublicHolidays/${year}/KR`,
    { next: { revalidate: 86400 } } // 24시간 캐시
  );
  if (!res.ok) throw new Error(`Holidays fetch failed: ${res.status}`);
  return res.json();
}
```
- 위치 무관 데이터
- 24시간 revalidate (Next.js fetch cache)
- 연 1회 갱신으로 충분

### 8.2 Client (SWR) — 위치 의존 데이터
```typescript
// lib/hooks/useDashboardData.ts
export function useDashboardData(neighborhood: Neighborhood) {
  const { data, error, isLoading, mutate } = useSWR(
    neighborhood ? ['dashboard', neighborhood.lat, neighborhood.lon] : null,
    () => fetchDashboard(neighborhood),
    {
      refreshInterval: 30 * 60 * 1000,    // 30분 자동 갱신
      dedupingInterval: 30 * 60 * 1000,  // 30분 중복 제거
      revalidateOnFocus: true,
      keepPreviousData: true,
    }
  );
  return { data, error, isLoading, refresh: mutate };
}
```
- 위치 기반 4종: weather, airQuality, precipitation, geocoding
- SWR in-memory 캐시 (30분)
- 네트워크 끊김 시 localStorage fallback

### 8.3 캐싱 전략 (3단)
| 층위 | 대상 | TTL | 저장소 |
|---|---|---|---|
| L1 — Next.js fetch cache | 공휴일 | 24시간 | 서버 메모리 |
| L2 — SWR in-memory | 위치 의존 데이터 | 30분 | 브라우저 메모리 |
| L3 — localStorage | 전체 대시보드 | 영구 | 브라우저 디스크 |

---

## 9. UI/UX 보존

### 9.1 카드 2×3 그리드
```
┌─────────────────────────────────────┐
│  📍 강남구                            │
│  ☀️ E형 활동가 산책러버                 │  ← CharacterReport
│  "오늘은 산책하기 완벽!"               │
├─────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐         │
│  │  🌤️ 날씨  │  │ 🌫️ 미세먼지│         │
│  │  [차트]  │  │  [게이지] │         │
│  │  27° 맑음 │  │   좋음 😊  │         │
│  └──────────┘  └──────────┘         │
│  ┌──────────┐  ┌──────────┐         │
│  │ 🌧️ 강수  │  │ 🎭 공휴일  │         │
│  │  [라인]  │  │   [배지]  │         │
│  │  24h     │  │   평일     │         │
│  └──────────┘  └──────────┘         │
│  ┌──────────────────────────────┐   │
│  │ 👥 친구 동네 비교                │   │  ← 풀폭
│  │  [막대 차트]                    │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

### 9.2 MBTI 캐릭터 헤더
- 6종 캐릭터 (E형 활동가, 조용한 I형, 문화인, 출근러 동네, 마스크 동네, 산책러버)
- 결정 우선순위: 마스크 > 출근러 > 산책러버 > 문화인 > E형 > I형
- 시간 의존 (출근러는 평일 7-9시만)
- 결정 로직: `utils/characterEngine.ts` 재사용

### 9.3 다크모드
- `prefers-color-scheme: dark` 미디어 쿼리
- TDS CSS vars가 자동 적응
- 차트 색상은 useColorScheme 훅으로 분기

### 9.4 모바일 퍼스트
- 브레이크포인트: sm(640px) / md(768px) / lg(1024px)
- 기본은 모바일 (375px~)
- 태블릿/데스크탑은 그리드 확장 (2x3 → 3x2)

---

## 10. 신규 코드 (생성 대상)

### 10.1 핵심 신규 파일
| 파일 | 역할 | 의존성 |
|---|---|---|
| `app/layout.tsx` | 루트 (Pretendard, TDS vars) | next/font |
| `app/page.tsx` | 메인 대시보드 | SWR, useDashboardData |
| `app/onboarding/page.tsx` | 위치 권한 + 자동 인식 | `lib/hooks/useGeolocation` (아래 정의됨) |
| `app/settings/page.tsx` | 동네 관리 | useFriends |
| `app/globals.css` | TDS 토큰 (CSS vars) | Tailwind v4 |
| `tailwind.config.ts` | TDS 컬러 매핑 | Tailwind v4 |
| `lib/storage.ts` | localStorage typed wrapper | (Web API) |
| `lib/location.ts` | navigator.geolocation wrapper | (Web API) |
| `lib/share.ts` | Web Share API wrapper | (Web API) |
| `lib/haptics.ts` | navigator.vibrate wrapper | (Web API) |
| `lib/hooks/useDashboardData.ts` | SWR hook | SWR, fetchAllData |
| `lib/hooks/useNeighborhood.ts` | SWR + localStorage | SWR |
| `lib/hooks/useFriends.ts` | 친구 동네 (localStorage) | (없음) |
| `lib/hooks/useGeolocation.ts` | 위치 권한 + 좌표 hook (contract: `{coordinates, error, loading, request}`) | lib/location.ts |
| `components/cards/*.tsx` (5개) | recharts 카드 | recharts |
| `components/dashboard/DashboardGrid.tsx` | 2x3 그리드 | (없음) |
| `components/dashboard/CharacterReport.tsx` | MBTI 헤더 | (재사용) |
| `components/dashboard/ErrorBoundary.tsx` | 에러 격리 (React 표준 ErrorBoundary) | (없음) |
| `components/neighborhood/NeighborhoodPicker.tsx` | 주소 검색 모달 | (재사용 + 변환) |
| `components/ui/*.tsx` (4개) | 프리미티브 | Tailwind |

### 10.2 패키지 의존성
```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "swr": "^2.2.5",
    "recharts": "^2.12.7",
    "html-to-image": "^1.11.11",
    "clsx": "^2.1.1"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "@types/react": "^19.0.0",
    "@types/node": "^20.0.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/postcss": "^4.0.0",
    "postcss": "^8.4.0",
    "vitest": "^2.1.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.4.0",
    "jsdom": "^25.0.0"
  }
}
```

---

## 11. 제거 대상 (Toss/RN 전용)

- ❌ `granite.config.ts`
- ❌ `app.json`
- ❌ `index.js`
- ❌ `.granite/`, `.swc/`, `dist/`
- ❌ `src/_app.tsx` (Granite 진입점)
- ❌ `src/screens/*.tsx` (3개)
- ❌ `src/components/cards/*.tsx` (5개 — recharts로 재작성)
- ❌ `src/components/common/*.tsx` (3개)
- ❌ `src/components/modals/*.tsx` (1개)
- ❌ `src/services/location.ts` (RN 버전)
- ❌ `src/services/storage.ts` (RN 버전)
- ❌ `src/utils/shareLink.ts` (RN 버전)
- ❌ `src/utils/haptics.ts` (RN 버전)
- ❌ `assets/` (RN 전용 이미지)
- ❌ `@apps-in-toss/framework`
- ❌ `@granite-js/*`
- ❌ `@toss/tds-react-native`
- ❌ `react-native`, `react-native-svg`, `react-native-view-shot`
- ❌ `react-native-gifted-charts`
- ❌ `brick-module`
- ❌ `@babel/runtime`
- ❌ `@apps-in-toss/cli` (devDependency)
- ❌ `assets/` (RN 전용 이미지 자산)

**이들은 모두 `archive/toss-app/`로 이동** (git history 보존)

---

## 12. Vercel 배포

### 12.1 설정
- **GitHub 연동**: `main` 브랜치 push → 자동 빌드/배포
- **빌드 명령**: `next build` (Next.js 기본)
- **출력 디렉토리**: `.next/` (자동)
- **환경변수**: 0개 (모두 무키 API)
- **도메인**: `<project-name>.vercel.app` (기본) 또는 커스텀

### 12.2 빌드 산출물
- `next build` → `.next/standalone/` (서버리스 호환)
- 정적 자산: `.next/static/`
- SSG/SSR: App Router 기본 (mixed)

### 12.3 PWA — **Out of Scope (본 마이그레이션 범위 밖)**
- 별도 후속 작업으로 분리
- 필요 시 `app/manifest.ts` + `next-pwa` 도입

---

## 13. 단계별 실행 계획 (7 Phases)

| Phase | 작업 | 산출물 | 검증 |
|---|---|---|---|
| **1. Bootstrap** | `npx create-next-app@latest` + 의존성 추가 | `package.json`, `next.config.ts`, `tailwind.config.ts` | `yarn dev` → 빈 페이지 200 OK |
| **2. Archive** | 기존 RN 코드를 **`git mv`**로 `archive/toss-app/`로 이동 (history 보존) | archive 디렉토리 구조 | `git log --follow src/_app.tsx` 추적 가능, `ls archive/toss-app/` 확인 |
| **3. Design Tokens** | `globals.css` + `tailwind.config.ts`에 TDS 토큰 정의 | CSS vars + Tailwind 클래스 | Storybook 또는 단일 페이지에서 색상 확인 |
| **4. Reuse + Test** | `types/`, `utils/`, `scripts/` 복사 + Vitest 설정 | 4개 파일 + `vitest.config.ts` | `yarn verify` + `yarn test` 모두 통과 |
| **5. API Layer** | 6종 API 재작성 (Next.js fetch + SWR hooks) | `lib/api/*.ts` (6개) + `lib/hooks/*.ts` (3개) | curl로 6종 API 직접 fetch + 30분 캐시 동작 |
| **6. Cards** | recharts로 5종 카드 재구현 | `components/cards/*.tsx` (5개) | 브라우저에서 카드 5종 정상 렌더링 |
| **7. Pages + Deploy** | 3개 페이지 (Home/Onboarding/Settings) + Vercel 배포 | `app/*` (3개) + Vercel URL | Vercel URL에서 전체 흐름 동작 |

각 Phase마다 TDD (RED → GREEN → SURFACE) 적용.

### Phase 2 상세 명령 (git history 보존)
```bash
mkdir -p archive/toss-app
git mv src archive/toss-app/
git mv scripts archive/toss-app/
git mv granite.config.ts archive/toss-app/
git mv app.json archive/toss-app/
git mv index.js archive/toss-app/
git mv assets archive/toss-app/ 2>/dev/null || true
# 검증: git log --follow archive/toss-app/src/_app.tsx 추적 가능
```

### Phase 4 상세 명령 (reusable 코드 이전 + import 경로 수정)
```bash
# 1. reusable 파일 복사 (git mv로 history 보존)
git mv src/types types       # types는 archive에서 제외 (재사용 대상)
git mv src/utils/characterEngine.ts utils/
git mv src/utils/format.ts utils/
# 2. import 경로 일괄 수정
find . -name "*.ts" -not -path "*/node_modules/*" -not -path "*/archive/*" \
  -exec sed -i '' "s|from '\\.\\./\\.\\./types|from '@/types|g" {} \;
find . -name "*.ts" -not -path "*/node_modules/*" -not -path "*/archive/*" \
  -exec sed -i '' "s|from '\\.\\./types|from '@/types|g" {} \;
# 3. verify-engine.ts는 archive 안에 남겨두므로 별도 처리 불필요
# 4. Vitest 설정 추가
yarn add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
# 5. vitest.config.ts 생성
echo 'import { defineConfig } from "vitest/config"; export default defineConfig({ test: { environment: "jsdom" } });' > vitest.config.ts
# 6. 검증: yarn verify && yarn test 모두 통과
```

---

## 14. 성공 기준 (Acceptance Criteria)

| # | 기준 | 검증 방법 |
|---|---|---|
| AC1 | `yarn dev` → 200 OK, 페이지 로드 1.5초 이내 | curl localhost:3000 |
| AC2 | 6종 API 모두 200 OK + zod schema 검증 통과 | curl + `WeatherResponseSchema.parse()`, `AirQualityResponseSchema.parse()` 등 (6종 스키마 모두 통과) |
| AC3 | 5종 카드 모두 정상 렌더링 | 브라우저 스크린샷 |
| AC4 | MBTI 캐릭터 6종 모두 한 번씩 등장 | 시간/데이터 모킹 테스트 |
| AC5 | 위치 권한 → 자동 인식 → 수동 보정 | 브라우저 E2E (Playwright) |
| AC6 | 친구 동네 추가/삭제/비교 | 브라우저 E2E |
| AC7 | 30분 캐시 + localStorage fallback | 네트워크 끊김 시뮬레이션 |
| AC8 | 공유 (Web Share API) 동작 | 모바일 Safari/Chrome |
| AC9 | 다크모드 자동 전환 | prefers-color-scheme 토글 |
| AC10 | `yarn build` 성공 + Vercel 배포 성공 | 빌드 로그 + Vercel URL 200 |
| AC11 | `yarn test` 100% 통과 (characterEngine, format, API) | Vitest 출력 |
| AC12 | Vitest + RTL 컴포넌트 테스트 80%+ 커버리지 | `yarn test --coverage` |

---

## 15. 위험 요소 및 대응 (Risks & Mitigations)

| 위험 | 확률 | 영향 | 대응 |
|---|---|---|---|
| Open-Meteo 응답 schema 변경 | 낮음 | 중 | 응답 시 zod 검증, 실패 시 fallback |
| Nominatim Rate limit (1 req/sec) | 중 | 낮 | 위치 변경 시 throttle |
| Vercel 무료 티어 quota 초과 | 낮음 | 중 | 캐시 TTL로 호출 절감 |
| Web Share API 미지원 (데스크탑 Chrome) | 중 | 낮 | clipboard fallback |
| `navigator.vibrate` 미지원 (iOS Safari) | 중 | 없음 | 조용히 무시 (try-catch) |
| recharts SSR hydration mismatch | 중 | 중 | `'use client'` 명시, dynamic import |
| localStorage SSR 접근 에러 | 중 | 중 | `typeof window === 'undefined'` 가드 |
| 한글 폰트 깜빡임 (FOUT) | 중 | 낮 | `next/font` preload |

---

## 16. 명시적 비범위 (Out of Scope)

- ❌ 인증/사용자 계정
- ❌ DB 도입
- ❌ API Routes (서버 코드) — 순수 클라이언트 + RSC
- ❌ PWA (선택, 시간 허용 시)
- ❌ 다국어
- ❌ 챌린지 출품
- ❌ 백엔드 서버

---

## 17. 참고 문서 (References)

- `docs/ARCHITECTURE.md` — 현재 RN 아키텍처 (마이그레이션 전)
- `docs/DATA_SOURCES.md` — 6종 API 검증 (변경 없음)
- `docs/DESIGN_SYSTEM.md` — MBTI 캐릭터 (로직 재사용)
- `archive/toss-app/README.md` — 기존 RN 코드 복원 가이드
- Next.js 15 문서: <https://nextjs.org/docs>
- recharts: <https://recharts.org/>
- Vercel: <https://vercel.com/docs>

---

**End of spec — next: commit → spec review loop → writing-plans**

---

## 부록 A. TDS 디자인 토큰 매핑 (CSS vars)

`app/globals.css`의 `@theme` 블록에 정의:

```css
@import "tailwindcss";

@theme {
  /* Primary */
  --color-tds-blue: #3182F6;
  --color-tds-blue-light: #E8F3FF;

  /* Grey scale */
  --color-tds-grey-50: #F9FAFB;
  --color-tds-grey-100: #F2F4F6;
  --color-tds-grey-200: #E5E8EB;
  --color-tds-grey-400: #B0B8C1;
  --color-tds-grey-500: #8B95A1;
  --color-tds-grey-700: #4E5968;
  --color-tds-grey-900: #191F28;

  /* Status */
  --color-tds-green: #03B26C;
  --color-tds-yellow: #FFC342;
  --color-tds-orange: #FF8A00;
  --color-tds-red: #F04452;
  --color-tds-purple: #8B5CF6;

  /* Background (adaptive via prefers-color-scheme) */
  --color-tds-bg: #FFFFFF;
  --color-tds-fg: #191F28;

  /* Spacing / Radius (디자인 시스템 일관성) */
  --radius-tds-sm: 8px;
  --radius-tds-md: 12px;
  --radius-tds-lg: 16px;
  --radius-tds-xl: 24px;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-tds-bg: #191F28;
    --color-tds-fg: #FFFFFF;
    --color-tds-grey-50: #1E232B;
    --color-tds-grey-100: #252B33;
    --color-tds-grey-200: #2E343C;
    --color-tds-grey-500: #6B7682;
    --color-tds-grey-700: #B0B8C1;
    --color-tds-grey-900: #FFFFFF;
  }
}
```

**Tailwind v4 사용법**:
```tsx
// ❌ 잘못: hex 하드코드
<div className="bg-[#3182F6]">

// ✅ 올바름: 토큰 참조 (자동 다크모드)
<div className="bg-tds-blue text-tds-grey-900 dark:bg-tds-grey-900 dark:text-tds-white">
```

**recharts 사용법** (CSS vars는 JS에서 직접 참조):
```tsx
<Line stroke="var(--color-tds-blue)" />
<Pie fill="var(--color-tds-green)" />
```

---

## 부록 B. 검증 커맨드 모음 (수동 QA)

```bash
# Phase 1: 부트스트랩
yarn dev &
sleep 3
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000  # → 200

# Phase 2: archive 이력 보존
git log --follow archive/toss-app/src/_app.tsx  # → 커밋 히스토리 추적 가능

# Phase 3: TDS 토큰
grep -E "color-tds-(blue|grey-900)" app/globals.css  # → 2개 이상 매치
yarn dev &
curl -s http://localhost:3000 | grep -E "tds-(blue|grey)"  # → 토큰 클래스 적용 확인

# Phase 4: 재사용 + Vitest
yarn verify   # 기존 verify-engine.ts 통과
yarn test     # Vitest 통과

# Phase 5: 6종 API
for url in \
  "https://api.open-meteo.com/v1/forecast?latitude=37.5665&longitude=126.9780&current=temperature_2m" \
  "https://air-quality-api.open-meteo.com/v1/air-quality?latitude=37.5665&longitude=126.9780&current=pm2_5" \
  "https://date.nager.at/api/v3/PublicHolidays/2026/KR"; do
  curl -sI "$url" | head -1  # → 200 OK
done

# Phase 6: 카드 렌더링
yarn dev &
sleep 3
# Playwright 또는 curl로 페이지 HTML 확인

# Phase 7: Vercel 빌드
yarn build  # → exit 0
git push origin main  # → Vercel 자동 배포
curl -sI https://<project>.vercel.app | head -1  # → 200
```
