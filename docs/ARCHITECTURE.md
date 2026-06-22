# 🏗️ 아키텍처 (ARCHITECTURE)

> 토스 앱인토스 Granite 프레임워크 기반 미니앱 — **서버 0, API 키 0** 구조

---

## 📐 전체 구조

```
┌─────────────────────────────────────────────────────────────┐
│  토스 앱 (Toss App)                                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Granite 미니앱 (React Native)                          │ │
│  │                                                         │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │ │
│  │  │ 위치 수신    │  │ 6종 데이터   │  │ 친구 동네    │    │ │
│  │  │ 1회 (스토리)│─→│ fetch + 캐시 │←─│ 사용자 입력  │    │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘    │ │
│  │         │                │                │            │ │
│  │         └────────────────┼────────────────┘            │ │
│  │                          ▼                             │ │
│  │              ┌──────────────────────┐                  │ │
│  │              │ 데이터 통합 + 룰 엔진 │                  │ │
│  │              │ (MBTI 캐릭터 결정)    │                  │ │
│  │              └──────────────────────┘                  │ │
│  │                          │                             │ │
│  │                          ▼                             │ │
│  │              ┌──────────────────────┐                  │ │
│  │              │ 인포그래픽 대시보드    │                  │ │
│  │              │ (TDS + 차트 라이브러리)│                  │ │
│  │              └──────────────────────┘                  │ │
│  │                          │                             │ │
│  │                          ▼                             │ │
│  │              ┌──────────────────────┐                  │ │
│  │              │ 공유 (share link)    │                  │ │
│  │              │ + storage 저장       │                  │ │
│  │              └──────────────────────┘                  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ HTTPS fetch (직접)
                          ▼
   ┌──────────────────────────────────────────────────┐
   │  외부 공개 API (모두 무키, 영구 무료)              │
    │  • Open-Meteo Forecast       • Open-Meteo Air Q.   │
    │  • Open-Meteo Precipitation  • Nager Date          │
    │  • Open-Meteo Geocoding      • Nominatim Reverse  │
   └──────────────────────────────────────────────────┘
```

**핵심**: 미니앱 → 외부 API 직접 호출. 중간 서버 0개.

---

## 🧩 컴포넌트 구조 (2026-06-19 기준 실제 구현)

```
src/
├── _app.tsx                          # Granite 진입점 (AppsInToss.registerApp + TDSProvider + ErrorBoundary)
├── screens/
│   ├── HomeScreen.tsx                # 메인 대시보드 (2x3 카드 + 공유/새로고침/설정 + 햅틱)
│   ├── OnboardingScreen.tsx          # 첫 실행: 위치 권한 + 자동 인식 + 수동 입력 fallback
│   └── SettingsScreen.tsx            # 우리 동네 변경 + 친구 동네 추가/삭제
├── components/
│   ├── cards/
│   │   ├── WeatherCard.tsx           # 🌤️ 라인 차트 (LineChart) + 현재 기온 + 라벨
│   │   ├── AirQualityCard.tsx        # 🌫️ 도넛 (PieChart) + 등급 라벨
│   │   ├── PrecipitationCard.tsx    # 🌧️ 24h 라인 (LineChart) + 강수확률/강수량
│   │   ├── HolidayCard.tsx           # 🎭 Badge (TDS) + 다음 공휴일 D-N
│   │   └── CompareCard.tsx           # 👥 막대 (BarChart) + 우리 + 친구 동네
│   ├── common/
│   │   ├── Dashboard.tsx             # 2x3 그리드 레이아웃 (ScrollView)
│   │   ├── CharacterReport.tsx       # MBTI 캐릭터 헤더 (이모지 + 한 줄)
│   │   └── ErrorBoundary.tsx         # 클래스형 에러 바운더리 (TDS fallback)
│   └── modals/
│       └── NeighborhoodPicker.tsx    # 주소 검색/선택 모달 (Geocoding API)
├── services/
│   ├── api/
│   │   ├── weather.ts                # Open-Meteo Forecast + weather_code 라벨 매핑
│   │   ├── airQuality.ts             # Open-Meteo AQ + PM2.5 → 등급 분류
│   │   ├── precipitation.ts          # Open-Meteo Precipitation (daily/hourly)
│   │   ├── holidays.ts               # Nager Date (올해+내년) + 다음 공휴일까지 D-day
│   │   ├── geocoding.ts              # Open-Meteo Geocoding forward + Nominatim reverse (1초 throttle)
│   │   └── index.ts                  # fetchAllData + getDashboard (30분 캐시 + fallback)
│   ├── storage.ts                    # 토스 Storage typed 래퍼 (JSON 직렬화 + 캐시 헬퍼)
│   └── location.ts                   # getCurrentLocation + reverse geocode 조합
├── utils/
│   ├── characterEngine.ts            # 6종 MBTI 캐릭터 결정 (시간 의존, 우선순위 룰)
│   ├── format.ts                     # 온도/시간/거리/날짜/percent 포맷
│   ├── shareLink.ts                  # 토스 share({ message }) + getTossShareLink
│   └── haptics.ts                    # generateHapticFeedback 래퍼 (tap/success/error/tick/wiggle)
└── types/
    └── index.ts                      # Neighborhood, WeatherData, AirQualityData, PrecipitationData, HolidayData, CharacterReport, DashboardData, CachedReport, StorageKeys

scripts/
└── verify-engine.ts                  # 캐릭터 엔진 + 포맷 유틸 단위 테스트 (jest 없이 assert 사용)
```

**진입점 컨벤션**: Granite은 `src/_app.tsx` (underscore prefix 필수). `_app.tsx`가 없으면 "Could not resolve src/_app.tsx" 에러.

---

## 🔄 데이터 흐름 (3단계)

### 1️⃣ 입력 단계

```typescript
// OnboardingScreen.tsx (앱 첫 실행)
const { latitude, longitude } = await getCurrentLocation();
const district = await geocoding.reverse(latitude, longitude);
// → "강남구" 자동 인식
storage.set('neighborhood', { name: district, lat, lon });
```

### 2️⃣ 통합 단계

```typescript
// HomeScreen.tsx (메인 진입)
const [weather, air, precipitation, holiday] = await Promise.all([
  api.weather.fetch(lat, lon),       // Open-Meteo
  api.airQuality.fetch(lat, lon),    // Open-Meteo AQ
  api.precipitation.fetch(lat, lon), // Open-Meteo Precipitation
  api.holidays.fetch(today),         // Nager Date
]);

const character = characterEngine.decide({ weather, air, precipitation, holiday });
const friends = storage.get('friendNeighborhoods') || [];

const compares = await Promise.all(
  friends.map(f => api.weather.fetch(f.lat, f.lon))
);
```

### 3️⃣ 출력 단계

```typescript
return (
  <Dashboard>
    <CharacterReport character={character} />  // MBTI 한 줄
    <WeatherCard data={weather} />
    <AirQualityCard data={air} />
    <PrecipitationCard data={precipitation} />
    <HolidayCard data={holiday} />
    <CompareCard my={weather} friends={compares} />
  </Dashboard>
);
```

---

## 💾 저장소 사용 (토스 SDK)

### storage 키 설계

| 키 | 타입 | 용도 |
|---|---|---|
| `neighborhood` | `{name, lat, lon}` | 우리 동네 (자동 인식) |
| `friendNeighborhoods` | `Array<{name, lat, lon}>` | 비교할 친구 동네 (최대 5개) |
| `lastVisitDate` | `string (ISO)` | 마지막 방문일 (캐시 무효화) |
| `cachedReport` | `DashboardData` | 30분 캐시 (API 호출 절감) |
| `onboardingDone` | `boolean` | 온보딩 완료 여부 |

### 캐시 전략

```typescript
const CACHE_TTL_MS = 30 * 60 * 1000; // 30분

async function getCachedOrFetch() {
  const cached = storage.get('cachedReport');
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const fresh = await fetchAllData();
  storage.set('cachedReport', { data: fresh, timestamp: now });
  return fresh;
}
```

---

## 🎨 디자인 시스템 (TDS) — 실제 사용 API

토스 앱인토스의 모든 비게임 미니앱은 **TDS (Toss Design System)** 사용이 검수 필수.

> ⚠️ **docs/DESIGN_SYSTEM.md의 색상 코드는 outdated** — 실제 TDS 1.3.8은
> `colors.grey900` (adaptive prefix 없음), `colors.background` 등 단순 키 사용.

```typescript
// 실제 TDS 1.3.8 사용 예시 (2026-06-19)
import { Txt, Button, Top, colors } from '@toss/tds-react-native';

<Txt typography="t1" fontWeight="bold" color={colors.grey900}>
  우리 동네 오늘
</Txt>

<Button type="primary" onPress={refresh}>
  새로고침
</Button>

<Top
  title="우리 동네 오늘"
  right={<Button type="primary" style="weak">공유</Button>}
/>
```

**실제 차트 라이브러리**:
- `react-native-gifted-charts` 1.4.43 — LineChart, PieChart(donut), BarChart 사용
- TDS 색상은 `colors.blue500`, `colors.grey900` 등을 차트 색상에 직접 전달

**검수 시 주의** (TDS 위반):
- ❌ 외부 폰트 (Pretendard 등) — TDS 폰트만
- ❌ 외부 아이콘 세트 — 토스 토스페이스 이모지만
- ❌ 그라데이션/3D 효과 과다
- ❌ TDS 외 UI 컴포넌트 사용 (MUI, Chakra 등)

**자세한 디자인 톤**: `docs/DESIGN_SYSTEM.md` (단, 색상 API는 outdated)

---

## 🔐 권한 처리

| 권한 | SDK | 시점 |
|---|---|---|
| 위치 | `getCurrentLocation` | 온보딩 1회 |
| 연락처 (선택) | `fetchContacts` | 친구 동네 자동완성용 (선택적) |
| 알림 (선택) | `requestNotificationAgreement` | 출근길 알림 (선택적) |

**UX**: 첫 화면에서 권한 요청 dialog → 거부해도 핵심 기능 동작 (수동 동네 입력 fallback).

---

## 🧪 테스트 (verify 스크립트)

Jest 도입 없이 Node assert로 핵심 로직 단위 테스트 (`scripts/verify-engine.ts`).

**실행**: `yarn verify` — 14 시나리오 자동 검증

**커버리지**:
- `characterEngine.decideCharacter`: 6종 캐릭터 + 우선순위 (시간 mock으로 COMMUTER_DONGNE 회피)
- `format`: temp/percent/hourLabel/daysUntil/distance/relativeDate

**확장 시**: 새 캐릭터/포맷 추가 시 verify 스크립트에도 케이스 추가.

---

## 🚦 성능 고려

| 항목 | 목표 |
|---|---|
| 첫 paint | < 1.5초 |
| 데이터 fetch | 병렬 + 30분 캐시 |
| 차트 렌더링 | RN 차트 lazy load |
| 번들 크기 | < 500KB (Granite 자동 최적화) |

---

## 🧪 테스트 전략

1. **샌드박스 앱** — 토스 샌드박스 앱에서 QR 스캔 → 실제 디바이스 테스트
2. **에뮬레이터** — Granite 개발 서버 + iOS/Android 에뮬레이터
3. **API 응답 검증** — `docs/DATA_SOURCES.md`의 예시와 비교

**자동화 테스트는 챌린지 범위 밖** (12일 일정에 자동화 추가 시 시간 부족).

---

## 🚧 알려진 제약

1. **Nominatim rate limit**: 1 req/sec. 위치 변경 시 throttle 필요.
2. **Open-Meteo 무료 tier**: 분당 600 호출. 우리 앱엔 충분.
3. **Open-Meteo 응답 timezone 명시**: `timezone=Asia/Seoul` 필수 (auto 금지 — 시간 파싱 오류 위험).

---

**다음 문서**: [`DATA_SOURCES.md`](./DATA_SOURCES.md) — 6종 API 검증 결과 + 응답 예시
