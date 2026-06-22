# AGENTS.md — 다른 PC에서 작업하는 AI 에이전트 가이드

> **이 문서는 sigco3111/dongne-today 저장소에서 작업하는 AI 에이전트(Claude Code, Codex, Cursor 등) 전용입니다.**
> 다른 PC에서 진행한다고 했으므로, 처음 보는 에이전트도 이 문서만 읽으면 맥락 파악 가능.

---

## 🎯 프로젝트 한 줄 요약

**토스 앱인토스 바이브코딩 챌린지 (2026년 6월) 출품작.**
"우리 동네 오늘" — 사용자의 현재 동네 컨디션(날씨/미세먼지/강수확률/공휴일)을 인포그래픽 대시보드 + MBTI 캐릭터형 한 줄 리포트로 보여주는 미니앱. **서버 0, API 키 0**.

---

## 📂 프로젝트 구조 (현재 상태)

```
dongne-today/
├── README.md                   # 프로젝트 소개 (한/영)
├── AGENTS.md                   # ← 이 파일 (다른 PC 에이전트 가이드)
├── LICENSE                     # MIT
├── .gitignore                  # 토스 Granite + Node + Yarn
├── docs/
│   ├── ARCHITECTURE.md         # 앱 아키텍처 + 데이터 흐름
│   ├── DATA_SOURCES.md         # 6종 데이터 소스 검증 결과
│   ├── DESIGN_SYSTEM.md        # MBTI 캐릭터 6종 + 디자인 톤
│   ├── SETUP.md                # 토스 앱인토스 Granite 환경 세팅
│   ├── CHECKLIST.md            # 챌린지 출품 체크리스트 + 일정
│   └── AI_VIBE_CODING.md       # AI 비브코딩 워크플로 (AX MCP 활용)
└── (구현 시작 시 추가)
    ├── granite.config.ts
    ├── package.json
    ├── app.json
    └── src/
        ├── components/
        ├── screens/
        ├── services/
        └── utils/
```

---

## 🚨 절대 어기지 말 것 (Red Lines)

### 1. **백엔드 서버 만들지 마**
- ❌ Express, FastAPI, Node 서버 절대 금지
- ❌ Vercel/Netlify/AWS 배포 금지
- ✅ 모든 데이터는 클라이언트에서 외부 API로 직접 fetch
- ✅ 사용자 데이터는 토스 `storage` SDK에만 저장

### 2. **API 키 발급 받지 마**
- ❌ 기상청, 에어코리아, data.go.kr 등 키 발급 필요한 API 사용 금지
- ✅ 6종 데이터는 모두 무키 (Open-Meteo, Nager Date, 서울 sample, Geocoding)
- ⚠️ 만약 새 데이터 추가하고 싶다면 먼저 DATA_SOURCES.md에 "무키 + CORS OK" 검증 후 결정

### 3. **토스 결제/송금/자산 SDK 사용하지 마**
- ❌ `getConsentedUserData`로 결제 내역 받는 것 시도 금지
- ❌ 토스 친구 목록 SDK는 존재하지 않음 (가정 금지)
- ✅ `appLogin`, `storage`, `getCurrentLocation`, `fetchContacts` 등만 사용

### 4. **출품 마감: 2026년 6월 30일 23:59 (한국 시간)**
- 12일 남음 (2026-06-18 기준)
- 늦으면 자동 탈락
- 일정은 CHECKLIST.md 참고

---

## 🔍 핵심 기술 결정 (이미 확정됨)

### 1. **플랫폼: 토스 앱인토스 (Apps in Toss)**
- 프레임워크: **Granite** (React Native 기반, 토스 공식)
- 디자인 시스템: **TDS (Toss Design System)** — 비게임 미니앱 필수
- 빌드: `npm run granite build`
- 배포: 토스 콘솔에 ZIP 업로드

### 2. **SDK 사용 가능 목록** (native-modules 2.9.1 기준)

| ✅ 사용 가능 | ❌ 사용 불가 |
|---|---|
| `appLogin` (토스 로그인) | 결제/송금/자산 내역 |
| `storage` (KV 저장) | 토스 친구 목록 |
| `getCurrentLocation` (1회) | 카드 사용 내역 |
| `location` 트래킹 | 카테고리별 지출 |
| `fetchContacts` (디바이스 연락처) | |
| `share` (공유 링크) | |
| `getClipboardText` / `setClipboardText` | |
| `fetchAlbumPhotos` | |
| `requestNotificationAgreement` | |
| `generateHapticFeedback` | |

### 3. **데이터 소스 6종 (모두 무키)**

| # | 카테고리 | API URL |
|---|---|---|
| 1 | 날씨 | `https://api.open-meteo.com/v1/forecast` |
| 2 | 미세먼지 | `https://air-quality-api.open-meteo.com/v1/air-quality` |
| 3 | 강수확률/강수량 | `https://api.open-meteo.com/v1/forecast` (daily+hourly precipitation vars) |
| 4 | 공휴일 | `https://date.nager.at/api/v3/PublicHolidays/{year}/KR` |
| 5 | 주소→좌표 | `https://geocoding-api.open-meteo.com/v1/search?name={name}` |
| 6 | 좌표→주소 | `https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lon}&format=json` |

**자세한 응답 예시**: `docs/DATA_SOURCES.md` 참고

### 4. **시각화: 인포그래픽 대시보드**
- React Native 차트 라이브러리 사용 권장
- 토스 TDS 디자인 시스템 활용
- 카드 2x3 레이아웃, 각 카드 도넛/라인/막대/게이지 혼합
- 자세한 디자인 톤: `docs/DESIGN_SYSTEM.md`

### 5. **MBTI 캐릭터 6종**
- ☀️ E형 활동가 (강수확률 < 30% && 강수량 < 1mm + 날씨 좋음)
- 🌙 조용한 I형 (인구 적음 + 미세먼지 좋음)
- 🎨 문화인 (행사 3개↑)
- 🚇 출근러 동네 (지하철 관련도 — ⚠️ 일단 미사용)
- 🌫️ 마스크 동네 (미세먼지 나쁨)
- ☁️ 산책러버 (미세먼지 좋음 + 날씨 좋음)

---

## 🛠️ AI 비브코딩 워크플로

### 추천 도구: **AX (AppsInToss eXperience) MCP**

```bash
# 설치
brew tap toss/tap && brew install ax
# 또는
npm install -g @apps-in-toss/ax

# MCP 서버 시작 (Cursor/Claude에 자동 연결)
ax mcp start
```

**MCP가 제공하는 도구**:
- `search_docs` — AppsInToss 문서 검색
- `get_doc` — 문서 전체 내용
- `search_tds_rn_docs` — TDS React Native 문서
- `search_tds_web_docs` — TDS Web 문서
- `list_examples` — 코드 예제 목록
- `get_example` — 특정 예제 코드

### 비브코딩 워크플로 (4단계)

```
1️⃣ 브레인스토밍 (사용자와 대화)
   - 결정 포인트별 옵션 + 추천 제시
   - "그대로 진행해" 받으면 즉시 2단계로

2️⃣ Granite 프로젝트 부트스트랩
   - npx create-apps-in-toss@latest
   - 또는 apps-in-toss-examples 포크

3️⃣ 기능 구현 (하나씩)
   - 데이터 fetch 함수 → 차트 컴포넌트 → 화면 조립
   - AX MCP로 토스 SDK 사용법 실시간 조회

4️⃣ 토스 샌드박스 앱에서 테스트
   - yarn dev → QR 스캔
   - 콘솔 검수 시뮬레이션
```

**자세한 내용**: `docs/AI_VIBE_CODING.md`

---

## ✅ 작업 시작 체크리스트

새 PC에서 이 저장소를 받았다면:

- [ ] Node 20+ 설치 (`node --version`)
- [ ] Yarn 4 설치 (`corepack enable && yarn --version`)
- [ ] 토스 샌드박스 앱 설치 (iOS/Android)
- [ ] 토스 개발자 계정 확인 (apps-in-toss.toss.im)
- [ ] `npm install -g @apps-in-toss/ax` (AX MCP)
- [ ] `yarn install`
- [ ] `yarn dev` → QR 스캔 → 샌드박스에서 동작 확인

**자세한 세팅**: `docs/SETUP.md`

---

## 📞 사용자 컨텍스트

- **사용자**: sigco3111 (개발자, 한국어, 한국 시간대)
- **호칭**: "희정님" (캐주얼: "오빠")
- **선호**: 브레인스토밍 우선, 다층 옵션, 깊이 > 단순 정보
- **응답 언어**: 한국어

---

## 🚦 작업 진행 규칙

### 코드 작성 전
1. **docs/ 폴더 먼저 읽기** — 이미 결정된 사항 확인
2. **사용자에게 브레인스토밍** — 새 기능마다 옵션 2~3개 + 추천
3. **데이터 소스 추가 시** — 무키 + CORS OK 검증 후 DATA_SOURCES.md 업데이트

### 코드 작성 중
1. **주석은 한국어** — 사용자가 읽기 편하게
2. **함수명 영문, 변수명 영문** — 컨벤션
3. **타입 정의 적극 활용** — TypeScript

### 코드 작성 후
1. **토스 샌드박스에서 테스트**
2. **CHECKLIST.md 업데이트**
3. **사용자에게 결과 보고** (한국어)

---

## 🆘 막혔을 때

1. **AX MCP 도구 먼저** — `search_docs`로 토스 공식 문서 조회
2. **apps-in-toss-examples GitHub repo** — `https://github.com/toss/apps-in-toss-examples` 예제 코드
3. **Granite 문서** — `https://granite.run/`
4. **여전히 막힘 → 사용자에게 질문** (서브에이전트는 ask 불가)

---

## 📝 작업 로그

작업 시작 시 `docs/WORK_LOG.md` 파일을 만들어 날짜별 진행 상황 기록 권장.

---

**이 문서는 사용자가 다른 PC로 이주하면서도 맥락을 유지하기 위한 핵심 문서입니다. 변경 시 커밋 메시지에 `[agents]` 태그 달아주세요.**
