# 🏘️ 우리 동네 오늘 (dongne-today)

> **토스 앱인토스 바이브코딩 챌린지 출품작** — "일상이 편해지는 순간"을 만드는 동네 컨디션 리포트 미니앱

[![Apps in Toss Challenge](https://img.shields.io/badge/Apps%20in%20Toss-Granite%20Hackathon-3182F6?style=for-the-badge&logo=toss&logoColor=white)](https://toss.im/apps-in-toss/blog/2606_vibecoding_challenge)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](./LICENSE)
[![No Backend](https://img.shields.io/badge/Backend-None-success?style=flat-square)](./docs/ARCHITECTURE.md)
[![No API Key](https://img.shields.io/badge/API%20Key-Not%20Required-success?style=flat-square)](./docs/DATA_SOURCES.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![No Build Step](https://img.shields.io/badge/Build-Zero--Config-FF6B35?style=flat-square)]()

[🇰🇷 한국어](#-한국어) · [🇺🇸 English](#-english)

---

## 🇰🇷 한국어

### 💡 한 줄 컨셉

**"내 동네의 오늘을 6가지 데이터로 한눈에 — 친구 동네랑 비교까지"**

토스 앱 안에서 실행되는 미니앱으로, 사용자의 현재 동네에 대한 **오늘의 컨디션(날씨·미세먼지·따릉이·공휴일·동네 비교)**을 인포그래픽 대시보드로 보여주고, **MBTI 캐릭터형 한 줄 리포트**로 동네 성격을 표현해요.

### ✨ 핵심 기능

| # | 기능 | 시각화 | 데이터 소스 |
|---|---|---|---|
| 1 | 🌤️ **오늘 날씨** (24시간 hourly) | 라인 차트 | Open-Meteo (무키) |
| 2 | 🌫️ **미세먼지 PM2.5/PM10** | 게이지 + 캐릭터 표정 | Open-Meteo Air Quality (무키) |
| 3 | 🚴 **따릉이 가용률** | 도넛 차트 | 서울 열린데이터 (무키) |
| 4 | 🎭 **공휴일 여부** | 배지 + 캐릭터 톤 변화 | Nager Date API (무키) |
| 5 | 📍 **우리 동네 행정구역** | 자동 인식 + 수동 보정 | Open-Meteo Geocoding (무키) |
| 6 | 👥 **친구 동네 비교** | 가로 막대 비교 차트 | 사용자 입력 + Open-Meteo |

### 🎯 차별화 포인트

- **🎨 화려한 인포그래픽 대시보드** — 도넛/라인/막대/게이지 혼합, 토스 디자인 시스템
- **👥 친구 동네 비교** — 토스 시너지 100%, 공유 욕구 폭발
- **🎭 MBTI 캐릭터형 한 줄 리포트** — "우리 동네는 ☀️ 활동적인 E형 산책러버"
- **💸 서버 비용 0원** — 외부 API만 호출, 데이터는 클라이언트 처리
- **🔑 API 키 발급 0건** — 6종 모두 무키 + 영구 무료

### 🚀 빠른 시작

> ⚠️ **다른 PC에서 작업 예정** — 아래 환경만 세팅하면 5분 안에 시작 가능

```bash
# 1. 저장소 클론
git clone https://github.com/sigco3111/dongne-today.git
cd dongne-today

# 2. 토스 앱인토스 개발 환경 세팅 (Granite)
#    docs/SETUP.md 참고 — Yarn 4 + Node 20 필요
yarn install
yarn dev

# 3. 토스 샌드박스 앱에서 QR 스캔 → 테스트
```

### 📂 문서 구조

| 문서 | 용도 |
|---|---|
| [AGENTS.md](./AGENTS.md) | **다른 PC에서 작업하는 AI 에이전트용 가이드** (필독) |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | 앱 아키텍처 + 데이터 흐름 |
| [docs/DATA_SOURCES.md](./docs/DATA_SOURCES.md) | 6종 데이터 소스 검증 결과 + 응답 예시 |
| [docs/DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md) | MBTI 캐릭터 6종 + 디자인 톤 |
| [docs/SETUP.md](./docs/SETUP.md) | 토스 앱인토스 Granite 환경 세팅 |
| [docs/CHECKLIST.md](./docs/CHECKLIST.md) | 챌린지 출품 체크리스트 + 일정 |
| [docs/AI_VIBE_CODING.md](./docs/AI_VIBE_CODING.md) | AI 비브코딩 워크플로 (AX MCP 활용) |

### 🎯 챌린지 출품 정보

| 항목 | 값 |
|---|---|
| 챌린지명 | 6월 바이브코딩 챌린지 \| 일상이 편해지는 순간 |
| 플랫폼 | 토스 앱인토스 (Apps in Toss) |
| 출품 마감 | 2026년 6월 30일 |
| 결과 발표 | 2026년 7월 마지막 주 |
| 상금 | 최대 300만원 |
| 테마 적합성 | ⭐⭐⭐⭐⭐ (일상 편의 + 동네 컨디션) |
| AU 잠재력 | ⭐⭐⭐ (날씨/미세먼지는 매일 확인 트리거) |

---

## 🇺🇸 English

### 💡 One-line Concept

**"Your neighborhood's today at a glance — compare with friends' neighborhoods too"**

A mini-app running inside the Toss app that shows your current neighborhood's **today's condition (weather, fine dust, bike-share, public holidays, neighborhood comparison)** as an infographic dashboard, and expresses your neighborhood's personality through a **MBTI-style character report**.

### ✨ Core Features

| # | Feature | Visualization | Data Source |
|---|---|---|---|
| 1 | 🌤️ **Today's Weather** (24-hour hourly) | Line Chart | Open-Meteo (no key) |
| 2 | 🌫️ **Fine Dust PM2.5/PM10** | Gauge + Character Expression | Open-Meteo Air Quality (no key) |
| 3 | 🚴 **Bike-Share Availability** | Donut Chart | Seoul Open Data (no key) |
| 4 | 🎭 **Public Holiday Status** | Badge + Character Tone Shift | Nager Date API (no key) |
| 5 | 📍 **Neighborhood District** | Auto-detect + Manual Adjust | Open-Meteo Geocoding (no key) |
| 6 | 👥 **Friend Neighborhood Compare** | Horizontal Bar Comparison | User Input + Open-Meteo |

### 🎯 Differentiation

- **🎨 Rich Infographic Dashboard** — Donut/line/bar/gauge combo, Toss Design System
- **👥 Friend Neighborhood Comparison** — 100% Toss synergy, viral sharing potential
- **🎭 MBTI Character Report** — "Our neighborhood is ☀️ Active E-type Stroll Lover"
- **💸 Zero Backend Cost** — External APIs only, client-side processing
- **🔑 Zero API Keys** — All 6 sources are keyless + permanently free

### 🚀 Quick Start

> ⚠️ **Work planned on another PC** — only need below environment to start in 5 minutes

```bash
# 1. Clone repository
git clone https://github.com/sigco3111/dongne-today.git
cd dongne-today

# 2. Setup Toss Apps-in-Toss dev environment (Granite)
#    See docs/SETUP.md — requires Yarn 4 + Node 20
yarn install
yarn dev

# 3. Scan QR in Toss Sandbox app → test
```

### 📂 Documentation

| Document | Purpose |
|---|---|
| [AGENTS.md](./AGENTS.md) | **AI agent guide for working on another PC** (must-read) |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | App architecture + data flow |
| [docs/DATA_SOURCES.md](./docs/DATA_SOURCES.md) | 6 data sources verification + response samples |
| [docs/DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md) | 6 MBTI characters + design tone |
| [docs/SETUP.md](./docs/SETUP.md) | Toss Apps-in-Toss Granite setup |
| [docs/CHECKLIST.md](./docs/CHECKLIST.md) | Challenge submission checklist + timeline |
| [docs/AI_VIBE_CODING.md](./docs/AI_VIBE_CODING.md) | AI vibe coding workflow (using AX MCP) |

---

## 📜 License

MIT License — see [LICENSE](./LICENSE) for details.

## 🙏 Credits

Built with [Toss Granite Framework](https://granite.run/) · [Open-Meteo](https://open-meteo.com/) · [Seoul Open Data](https://data.seoul.go.kr/)
