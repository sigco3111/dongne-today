# 우리 동네 오늘 (Next.js 15 + Vercel)

> 2026-06-22 Vercel 전환 — `archive/toss-app/`에 토스 앱인토스 버전 보존

## 🇰🇷 한국어

### 💡 한 줄 컨셉

**"내 동네의 오늘을 6가지 데이터로 한눈에 — 친구 동네랑 비교까지"**

### ✨ 핵심 기능

| # | 기능 | 시각화 | 데이터 소스 |
|---|---|---|---|
| 1 | 🌤️ **오늘 날씨** (24시간 hourly) | 라인 차트 | Open-Meteo (무키) |
| 2 | 🌫️ **미세먼지 PM2.5/PM10** | 게이지 + 캐릭터 표정 | Open-Meteo Air Quality (무키) |
| 3 | 🌧️ **강수확률/강수량** (24시간 hourly) | 영역 차트 | Open-Meteo (무키) |
| 4 | 🎭 **공휴일 여부** | 배지 + 캐릭터 톤 변화 | Nager Date API (무키) |
| 5 | 📍 **우리 동네 행정구역** | 자동 인식 + 수동 보정 | Open-Meteo Geocoding + Nominatim (무키) |
| 6 | 👥 **친구 동네 비교** | 가로 막대 비교 차트 | 사용자 입력 + Open-Meteo |

### 🎨 차별화 포인트

- **🎨 인포그래픽 대시보드** — 도넛/라인/막대/영역 혼합, TDS 디자인 토큰
- **👥 친구 동네 비교** — 최대 5개 동네 비교
- **🎭 MBTI 캐릭터형 한 줄 리포트** — "우리 동네는 ☀️ 활동적인 E형 산책러버"
- **💸 서버 비용 0원** — 외부 API만 호출, 데이터는 클라이언트/RSC에서 처리
- **🔑 API 키 발급 0건** — 6종 모두 무키 + 영구 무료

## 🇺🇸 English

### 💡 One-line Concept

**"Your neighborhood's today at a glance — compare with friends' neighborhoods too"**

A web app that shows your current neighborhood's **today's condition (weather, fine dust, precipitation, public holidays, neighborhood comparison)** as an infographic dashboard, and expresses your neighborhood's personality through a **MBTI-style character report**.

### ✨ Core Features

| # | Feature | Visualization | Data Source |
|---|---|---|---|
| 1 | 🌤️ **Today's Weather** (24-hour hourly) | Line Chart | Open-Meteo (no key) |
| 2 | 🌫️ **Fine Dust PM2.5/PM10** | Radial Gauge + Character Expression | Open-Meteo Air Quality (no key) |
| 3 | 🌧️ **Precipitation Probability** (24-hour hourly) | Area Chart | Open-Meteo (no key) |
| 4 | 🎭 **Public Holiday Status** | Badge + Character Tone Shift | Nager Date API (no key) |
| 5 | 📍 **Neighborhood District** | Auto-detect + Manual Adjust | Open-Meteo Geocoding + Nominatim (no key) |
| 6 | 👥 **Friend Neighborhood Compare** | Horizontal Bar Comparison | User Input + Open-Meteo |

### 🚀 Quick Start

```bash
# 1. 저장소 클론
git clone https://github.com/sigco3111/dongne-today.git
cd dongne-today

# 2. 의존성 설치
yarn install  # or npm install

# 3. 개발 서버
yarn dev  # http://localhost:3000

# 4. 빌드 (Vercel 자동 감지)
yarn build
```

### 🧪 테스트

```bash
yarn test         # Vitest (29 tests)
yarn test:watch   # watch mode
yarn test:coverage  # coverage report
yarn type-check   # TypeScript 검증
```

## 🏗️ 아키텍처

- **Next.js 15** App Router + React 19 + TypeScript strict
- **Tailwind CSS v4** (CSS-first `@theme`) + TDS 디자인 토큰
- **recharts** (LineChart / RadialBarChart / AreaChart / BarChart)
- **SWR** (30분 캐시, 클라이언트) + **localStorage** (영구, 클라이언트) + **Next.js fetch cache** (24h, RSC)
- **Vitest** + **React Testing Library** (29 테스트)
- **Web APIs**: navigator.geolocation / navigator.share / navigator.vibrate / localStorage
- **Vercel** 자동 배포 (Git push → 빌드 → 배포)

### 하이브리드 데이터 fetching

| 데이터 | 위치 | 캐시 | 메커니즘 |
|---|---|---|---|
| 공휴일 (위치 무관) | RSC | 24h | `fetch(..., { next: { revalidate: 86400 } })` |
| 날씨/미세먼지/강수 (위치 의존) | Client | 30분 | SWR `refreshInterval` |
| 영구 (neighborhood, friends) | Client | 영구 | localStorage typed wrapper |

## 📂 프로젝트 구조

```
dongne-today/
├── app/                            # Next.js App Router
│   ├── layout.tsx                  # 루트 (TDS tokens + Inter font)
│   ├── page.tsx                    # 메인 대시보드 (Home)
│   ├── onboarding/page.tsx         # 위치 권한 + 자동 인식
│   ├── settings/page.tsx           # 우리/친구 동네 관리
│   ├── _components/HomeContent.tsx # 메인 클라이언트
│   └── globals.css                 # TDS @theme 블록
├── components/
│   ├── cards/                      # 5종 recharts 카드
│   ├── dashboard/                  # DashboardGrid + CharacterReport
│   └── ui/                         # Card, Badge, Button, Skeleton
├── lib/
│   ├── api/                        # 6 API 클라이언트 + zod schemas
│   ├── hooks/                      # useDashboardData (SWR) 등 4종
│   ├── storage.ts                  # SSR-safe localStorage wrapper
│   ├── share.ts                    # Web Share API + clipboard fallback
│   ├── haptics.ts                  # navigator.vibrate wrapper
│   └── location.ts                 # navigator.geolocation wrapper
├── utils/
│   ├── characterEngine.ts          # 6종 MBTI 결정 룰 (재사용)
│   └── format.ts                   # 온도/시간/거리/날짜 포맷 (재사용)
├── types/index.ts                  # 도메인 타입 (재사용)
├── archive/toss-app/               # 토스 앱인토스 코드 (보존)
├── scripts/verify-engine.ts        # Node assert 단위 테스트
├── public/
├── docs/                           # 문서 (변경 없음, 일부 outdated 가능)
├── archive/toss-app/README.md      # RN/Granite 복원 가이드
├── docs/superpowers/specs/         # 디자인 스펙
├── docs/superpowers/plans/         # 구현 계획
├── next.config.ts
├── postcss.config.mjs
├── tsconfig.json                   # "jsx": "preserve" + @/* alias
├── vitest.config.ts
└── package.json
```

## 📚 문서

- 디자인 스펙: `docs/superpowers/specs/2026-06-22-vercel-web-migration-design.md`
- 구현 계획: `docs/superpowers/plans/2026-06-22-vercel-web-migration.md`
- API 명세: `docs/DATA_SOURCES.md` (변경 없음)
- 아카이브 (Toss 버전 복원): `archive/toss-app/README.md`

## 📜 License

MIT License — see [LICENSE](./LICENSE) for details.

## 🙏 Credits

Built with [Next.js 15](https://nextjs.org/) · [Vercel](https://vercel.com/) · [Tailwind CSS v4](https://tailwindcss.com/) · [recharts](https://recharts.org/) · [Open-Meteo](https://open-meteo.com/) · [Nager Date](https://date.nager.at/) · [OpenStreetMap Nominatim](https://nominatim.org/) · TDS (Toss Design System) tokens
