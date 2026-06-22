# 📓 작업 로그 (WORK_LOG)

> AGENTS.md 권장 — 날짜별 진행 상황 + 결정 + 삽질 기록.
> 다른 PC에서 이어받을 때 이 파일만 읽어도 맥락 파악 가능.

---

## 2026-06-19 (Fri) — Phase 1 부트스트랩 완료

### ✅ 완료

#### 환경
- Node v25.8.2, Yarn 4.5.0 (Corepack), TypeScript 5.4 확인
- `yarn install` 성공 (1,284 패키지)
- `granite build` 성공 → `dongne-today.ait` (1.9MB ZIP) 생성

#### 의존성 매트릭스 (검증된 안정 스택)
```json
{
  "@apps-in-toss/framework": "1.5.2",
  "@granite-js/native": "^0.1.28",
  "@granite-js/plugin-router": "^0.1.28",
  "@granite-js/react-native": "^0.1.28",
  "@toss/tds-react-native": "1.3.8",
  "react": "18.2.0",
  "react-native": "0.72.6"
}
```

> `appsInToss` plugin이 공식 지원하는 RN 버전: `'0.72.6' | '0.84.0'`.
> TDS는 React 19 미지원이라 RN 0.84 사용 불가 → 0.72.6 선택.

#### 구현 (24개 파일, src/ 전체 채움)
- `src/types/index.ts` — 전역 도메인 타입
- `src/services/` — storage, location, 6종 API + 통합 캐시
- `src/utils/` — characterEngine (6종 MBTI), format, shareLink
- `src/components/` — 5개 차트 카드, Dashboard, CharacterReport, NeighborhoodPicker
- `src/screens/` — Onboarding, Home, Settings
- `src/_app.tsx` — Granite 진입점 (TDSProvider + 라우터)

### 🔧 삽질 → 학습

| 문제 | 해결 |
|---|---|
| `npmAuthToken` SETUP.md 가이드 outdated | TDS가 2025-10부터 public npm — 토큰 불필요. SETUP.md 업데이트함 |
| Yarn 4가 상위 디렉토리 package.json을 프로젝트 root로 인식 | 부모 package.json에 `workspaces: ["dongne-today"]` 명시 |
| PnP 모드 강제 (RN 비호환) | `.yarnrc.yml`에 `nodeLinker: node-modules` 추가 |
| `@granite-js/react-native` 1.x에서 `defineConfig` 없음 | `/config` 서브패스로 이동 — `import { defineConfig } from '@granite-js/react-native/config'` |
| TDS 색상 API 변경 | `colors.adaptiveGrey900` → `colors.grey900` (adaptive prefix 제거) |
| `Button` prop 차이 | `variant` → `type`, `style`은 `'fill'\|'weak'` |
| `Badge` prop 차이 | `variant` → `type`, `style` → `badgeStyle` |
| `App.tsx` 위치 | Granite은 `src/_app.tsx` (underscore prefix 필수) |
| `Top`에 `left` 슬롯 없음 | 헤더 직접 구성 (`View` + `Button` + `Txt`) |
| `InitialProps` 위치 | `@granite-js/react-native`에서 직접 import (framework가 re-export 안 함) |
| `SearchField.onChangeText` 없음 | `onChange` + `e.nativeEvent.text` |
| `BikeShareStation` 좌표 필드명 | API: `stationLatitude` → 타입: `latitude` 매핑 |

### 📋 다음 단계 (Phase 2 — 6/21-22)

- [ ] 토스 샌드박스 앱에서 실제 디바이스 테스트 (iOS + Android)
- [ ] API 응답 실제 검증 (curl로 6종 endpoint 동작 확인)
- [ ] 캐릭터 엔진 6종 실제 시나리오 검증
- [ ] 캐시 fallback 동작 확인 (네트워크 끊은 후)
- [ ] 디자인 폴리싱 (Phase 4 — 6/25-26)

### 📁 빌드 산출물

- `dongne-today.ait` (1.9MB ZIP) — 토스 콘솔 업로드용
- 위치: `/Users/hjshin/Desktop/project/work/ai-driven-dev/dongne-today/`
- .gitignore에 등록 (추적 안 함)

### ⚠️ 주의사항 (다음 PC 작업 시)

1. **상위 디렉토리 격리 필수** — 부모 package.json에 `workspaces` 추가
2. **`.yarnrc.yml`에 `nodeLinker: node-modules`** — RN은 PnP 비호환
3. **API 키 0개** — 모든 데이터는 클라이언트에서 직접 fetch
4. **따릉이 sample 키 quota** — 일일 100~500 호출, 트래픽 늘면 정식 키 발급 필요
5. **TDS 버전 lock** — `1.3.8` 그대로 유지 (업그레이드 시 React/RN 호환 재검증)

### 🔗 참고 링크

- 빌드 명령: `yarn granite build` → `dongne-today.ait` 생성
- 개발 서버: `yarn granite dev` → QR 코드 → 토스 샌드박스 앱으로 스캔
- 토스 콘솔: <https://apps-in-toss.toss.im/>
- 챌린지: <https://toss.im/apps-in-toss/blog/2606_vibecoding_challenge>

---

## 2026-06-22 (Sun) — Phase 2: 따릉이 → Open-Meteo 강수 swap

### 배경
- 서울 따릉이는 서울 한정 데이터 → 전국 앱 확장 불가
- Open-Meteo 강수확률/강수량은 전국 커버, 무키, CORS OK
- 사용자 요청으로 1:1 교체 (6 카드 → 6 카드 유지)

### 변경 (런타임)
- **삭제**: `services/api/bikeShare.ts`, `components/cards/BikeShareCard.tsx`
- **신규**: `services/api/precipitation.ts`, `components/cards/PrecipitationCard.tsx`
- **타입**: `BikeShareData` → `PrecipitationData` (hourly + daily + todaySum + todayProbabilityMax)
- **캐시 키**: `cachedReport` → `cachedReport_v2` (구 사용자 stale cache 무효화)
- **E형 활동가 시그널**: `bikeShare.averageAvailable >= 50` → `precipitation.todayProbabilityMax < 30 && todaySum < 1 && weatherCode <= 3`
- **카드 시각화**: 도넛 (가용률) → 24h hourly LineChart (강수확률)

### 변경 (문서)
- 8개 doc 갱신: DATA_SOURCES / ARCHITECTURE / DESIGN_SYSTEM / CHECKLIST / WORK_LOG / README / AGENTS / src/README
- 그 외 historical entries (2026-06-19)는 따릉이 맥락 유지 (변경 이력 보존)

### 검증
- `yarn type-check` → exit 0, 에러 0건
- `yarn verify` → 16/16 통과 (기존 14 + boundary 2)
- Open-Meteo curl → CORS `*`, JSON shape 확인
- boundary 테스트: probability=30 NOT match (strict `<`), sum=1 NOT match (strict `<`)

### 영향
- 17개 파일 수정, 2개 파일 삭제, 2개 파일 신규
- 커밋 2건: `refactor(data)` + `docs: sync`