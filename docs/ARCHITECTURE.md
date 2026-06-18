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
   │  • Open-Meteo Forecast       • Open-Meteo Air Q. │
   │  • Seoul 따릉이              • Nager Date          │
   │  • Open-Meteo Geocoding      • Nominatim Reverse  │
   └──────────────────────────────────────────────────┘
```

**핵심**: 미니앱 → 외부 API 직접 호출. 중간 서버 0개.

---

## 🧩 컴포넌트 구조

```
src/
├── App.tsx                          # 루트, Granite Router 설정
├── screens/
│   ├── HomeScreen.tsx               # 메인 대시보드 (2x3 카드)
│   ├── OnboardingScreen.tsx         # 첫 실행: 위치 권한 + 동네 인식
│   └── SettingsScreen.tsx           # 친구 동네 추가/수정
├── components/
│   ├── cards/
│   │   ├── WeatherCard.tsx          # 🌤️ 라인 차트 + 현재 기온
│   │   ├── AirQualityCard.tsx       # 🌫️ 게이지 + 캐릭터 표정
│   │   ├── BikeShareCard.tsx        # 🚴 도넛 + 가용률
│   │   ├── HolidayCard.tsx          # 🎭 배지 + 공휴일 표시
│   │   └── CompareCard.tsx          # 👥 친구 동네 막대 비교
│   ├── common/
│   │   ├── Dashboard.tsx            # 2x3 카드 그리드
│   │   ├── CharacterReport.tsx      # MBTI 캐릭터 + 한 줄
│   │   └── TDSChart.tsx             # 차트 래퍼
│   └── modals/
│       └── NeighborhoodPicker.tsx   # 동네 검색/선택
├── services/
│   ├── api/
│   │   ├── weather.ts               # Open-Meteo 호출 + 타입
│   │   ├── airQuality.ts            # 미세먼지 호출 + 타입
│   │   ├── bikeShare.ts             # 따릉이 호출 + 타입
│   │   ├── holidays.ts              # 공휴일 호출 + 타입
│   │   └── geocoding.ts             # 주소/좌표 변환
│   ├── storage.ts                   # 토스 storage 래퍼
│   └── location.ts                  # getCurrentLocation 래퍼
├── utils/
│   ├── characterEngine.ts           # MBTI 캐릭터 결정 룰
│   ├── shareLink.ts                 # 토스 share 링크 생성
│   └── format.ts                    # 날짜/숫자 포맷
└── types/
    └── index.ts                     # 전역 타입
```

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
const [weather, air, bike, holiday] = await Promise.all([
  api.weather.fetch(lat, lon),       // Open-Meteo
  api.airQuality.fetch(lat, lon),    // Open-Meteo AQ
  api.bikeShare.fetchNearest(lat, lon), // Seoul 따릉이
  api.holidays.fetch(today),         // Nager Date
]);

const character = characterEngine.decide({ weather, air, bike, holiday });
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
    <BikeShareCard data={bike} />
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

## 🎨 디자인 시스템 (TDS)

토스 앱인토스의 모든 비게임 미니앱은 **TDS (Toss Design System)** 사용이 검수 필수.

```typescript
// TDS 사용 예시
import { Text, Button } from '@toss/tds-react-native';

<Text typography="t1" color="adaptiveGrey900">
  우리 동네 오늘
</Text>

<Button variant="primary" onPress={refresh}>
  새로고침
</Button>
```

**차트**: TDS에 전용 차트 컴포넌트가 없어서 React Native 차트 라이브러리 사용 권장:
- `react-native-gifted-charts` (가볍고 TDS 톤과 어울림)
- `victory-native` (기능 풍부)
- `react-native-svg-charts` (커스텀 자유도 ↑)

**자세한 디자인 톤**: `docs/DESIGN_SYSTEM.md`

---

## 🔐 권한 처리

| 권한 | SDK | 시점 |
|---|---|---|
| 위치 | `getCurrentLocation` | 온보딩 1회 |
| 연락처 (선택) | `fetchContacts` | 친구 동네 자동완성용 (선택적) |
| 알림 (선택) | `requestNotificationAgreement` | 출근길 알림 (선택적) |

**UX**: 첫 화면에서 권한 요청 dialog → 거부해도 핵심 기능 동작 (수동 동네 입력 fallback).

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
2. **따릉이 sample 키**: 일일 100~500 호출 제한. 사용자 늘면 sample quota 가능성 → 정식 키 발급 권장 (토스 콘솔에서 안내).
3. **Open-Meteo 무료 tier**: 분당 600 호출. 우리 앱엔 충분.

---

**다음 문서**: [`DATA_SOURCES.md`](./DATA_SOURCES.md) — 6종 API 검증 결과 + 응답 예시
