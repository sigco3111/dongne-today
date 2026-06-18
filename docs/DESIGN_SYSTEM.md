# 🎨 디자인 시스템 (DESIGN_SYSTEM)

> 토스 TDS (Toss Design System) + MBTI 캐릭터형 한 줄 리포트

---

## 🎨 TDS (Toss Design System) 기본

토스 앱인토스의 모든 비게임 미니앱은 **TDS 사용이 검수 필수**예요. 외부 라이브러리(예: MUI, Chakra) 사용 금지.

### 사용 패키지
```json
{
  "@toss/tds-react-native": "^2.x",
  "@toss/tds-mobile": "^2.x"
}
```

### 기본 색상 (adaptive)
```typescript
import { colors } from '@toss/tds-react-native';

// 배경
colors.adaptiveGrey50   // #F9FAFB
colors.adaptiveGrey100  // #F2F4F6 (배경)
colors.adaptiveBackground  // #FFFFFF

// 텍스트
colors.adaptiveGrey900  // #191F28 (제목)
colors.adaptiveGrey700  // #4E5968 (본문)
colors.adaptiveGrey500  // #8B95A1 (부가)

// 강조
colors.adaptiveBlue500  // #3182F6 (토스 블루)
colors.adaptiveGreen500 // #03B26C (좋음)
colors.adaptiveRed500   // #F04452 (나쁨)
colors.adaptiveYellow500 // #FFC342 (주의)
```

### 타이포그래피
```typescript
<Text typography="t1">가장 큰 제목 (24pt)</Text>
<Text typography="t2">섹션 제목 (20pt)</Text>
<Text typography="t3">카드 제목 (18pt)</Text>
<Text typography="st1">본문 강조 (16pt)</Text>
<Text typography="st2">본문 (14pt)</Text>
<Text typography="st3">부가 설명 (12pt)</Text>
```

---

## 🏗️ 화면 레이아웃

```
┌─────────────────────────────────┐
│ [←]  우리 동네 오늘       [공유] │  ← 헤더 (sticky)
├─────────────────────────────────┤
│                                 │
│   ┌─────────────────────────┐   │
│   │  📍 강남구               │   │
│   │  ☀️ E형 활동가 산책러버    │   │  ← MBTI 캐릭터 헤더
│   │  "오늘은 산책하기 완벽!"   │   │
│   └─────────────────────────┘   │
│                                 │
│   ┌──────────┐  ┌──────────┐    │
│   │  🌤️ 날씨  │  │ 🌫️ 미세먼지│    │  ← 2x3 카드 그리드
│   │  [차트]  │  │  [게이지] │    │
│   │  27° 맑음 │  │   좋음 😊  │    │
│   └──────────┘  └──────────┘    │
│                                 │
│   ┌──────────┐  ┌──────────┐    │
│   │ 🚴 따릉이  │  │ 🎭 공휴일  │    │
│   │  [도넛]  │  │   [배지]  │    │
│   │  65% 가용 │  │   평일     │    │
│   └──────────┘  └──────────┘    │
│                                 │
│   ┌─────────────────────────┐   │
│   │ 👥 친구 동네 비교           │   │  ← 풀폭 카드
│   │  [막대 차트]                │   │
│   │  우리 27°  | 홍대 28°  | ... │   │
│   └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

---

## 🎭 MBTI 캐릭터 6종

### 캐릭터 결정 룰 (priority 순)

```typescript
function decideCharacter(data: DashboardData): Character {
  // 1순위: 마스크 동네 (미세먼지 매우 나쁨)
  if (data.airQuality.pm2_5 >= 75) {
    return CHARACTERS.MASK_DONGNE;
  }
  // 2순위: 출근러 동네 (평일 + 출근시간 7-9시)
  if (data.holiday?.isWeekday && isRushHour()) {
    return CHARACTERS.COMMUTER_DONGNE;
  }
  // 3순위: 산책러버 (미세먼지 좋음 + 날씨 좋음)
  if (data.airQuality.pm2_5 <= 15 && data.weather.weather_code <= 2) {
    return CHARACTERS.WALK_LOVER;
  }
  // 4순위: 문화인 (공휴일)
  if (data.holiday?.isHoliday) {
    return CHARACTERS.CULTURALIST;
  }
  // 5순위: E형 활동가 (따릉이 가용률 50%↑)
  if (data.bikeShare.averageAvailable >= 50) {
    return CHARACTERS.E_ACTIVE;
  }
  // 6순위: 조용한 I형 (기본값)
  return CHARACTERS.I_QUIET;
}
```

### 캐릭터 일람표

| 캐릭터 | 이모지 | 한 줄 리포트 예시 | 등장 조건 |
|---|---|---|---|
| **E형 활동가** | ☀️ | "우리 동네는 활동적인 E형 — 바깥에서 만나요!" | 따릉이 50%+ + 날씨 좋음 |
| **조용한 I형** | 🌙 | "우리 동네는 차분한 I형 — 오늘은 집이 최고" | 기본값 |
| **문화인** | 🎨 | "현충일 연휴! 우리 동네는 문화인 — 한강에서 만나요" | 공휴일 |
| **출근러 동네** | 🚇 | "월요일 아침, 우리 동네는 출근러 — 화이팅!" | 평일 7-9시 |
| **마스크 동네** | 🌫️ | "미세먼지 부우 — 우리 동네는 마스크 동네 😷" | PM2.5 ≥ 75 |
| **산책러버** | ☁️ | "공기도 깨끗, 날씨도 좋아 — 산책러버 동네" | 미세먼지 좋음 + 날씨 좋음 |

### 캐릭터 비주얼

각 캐릭터는 **이모지 + 색상 + 한 줄 + 작은 일러스트** 4종으로 표현.

```typescript
const CHARACTERS = {
  E_ACTIVE: {
    emoji: '☀️',
    color: colors.adaptiveYellow500,
    line: '우리 동네는 활동적인 E형',
    subline: '바깥에서 만나요!',
    illustration: '🏃‍♂️🌳',  // 옵션 (TDS Lottie 또는 이모지)
  },
  I_QUIET: {
    emoji: '🌙',
    color: colors.adaptiveBlue500,
    line: '우리 동네는 차분한 I형',
    subline: '오늘은 집이 최고',
    illustration: '📚☕',
  },
  CULTURALIST: {
    emoji: '🎨',
    color: colors.adaptivePurple500,
    line: '공휴일! 우리 동네는 문화인',
    subline: '한강에서 만나요',
    illustration: '🎭🎪',
  },
  COMMUTER_DONGNE: {
    emoji: '🚇',
    color: colors.adaptiveGrey700,
    line: '월요일 아침, 우리 동네는 출근러',
    subline: '화이팅!',
    illustration: '💼🏃',
  },
  MASK_DONGNE: {
    emoji: '🌫️',
    color: colors.adaptiveGrey500,
    line: '미세먼지 부우 — 마스크 동네',
    subline: '마스크 챙기세요 😷',
    illustration: '😷🏠',
  },
  WALK_LOVER: {
    emoji: '☁️',
    color: colors.adaptiveGreen500,
    line: '공기도 깨끗, 날씨도 좋아',
    subline: '산책러버 동네 🚶‍♀️',
    illustration: '🐕🌸',
  },
} as const;
```

---

## 📊 차트 스타일 가이드

### 공통
- **그리드 라인**: `colors.adaptiveGrey200` (#E5E8EB), 점선
- **라벨**: `colors.adaptiveGrey500` (#8B95A1), 12pt
- **값 표시**: `colors.adaptiveGrey900` (#191F28), 14pt bold
- **애니메이션**: 첫 로드 시 600ms ease-out

### 차트별

#### 🌤️ 라인 차트 (기온)
```typescript
{
  type: 'line',
  color: colors.adaptiveBlue500,
  fillColor: 'rgba(49, 130, 246, 0.1)',  // 10% 투명
  lineWidth: 2.5,
  pointSize: 4,
  showGrid: true,
  gridType: 'dashed',
  xAxis: { type: 'time', format: 'HH:mm' },
  yAxis: { unit: '°C', min: 'auto' },
}
```

#### 🌫️ 게이지 (미세먼지)
```typescript
{
  type: 'gauge',
  segments: [
    { range: [0, 15], color: colors.adaptiveGreen500, label: '좋음' },
    { range: [16, 35], color: colors.adaptiveYellow500, label: '보통' },
    { range: [36, 75], color: colors.adaptiveOrange500, label: '나쁨' },
    { range: [76, 1000], color: colors.adaptiveRed500, label: '매우나쁨' },
  ],
  showValue: true,
  unit: 'μg/m³',
}
```

#### 🚴 도넛 (따릉이)
```typescript
{
  type: 'donut',
  segments: [
    { value: available, color: colors.adaptiveBlue500 },
    { value: unavailable, color: colors.adaptiveGrey200 },
  ],
  centerLabel: `${available}%`,
  centerSubLabel: '가용',
  thickness: 12,
}
```

#### 🎭 배지 (공휴일)
```typescript
// 단순 배지 (차트 아님)
<Badge variant={isHoliday ? 'red' : 'grey'}>
  {isHoliday ? `🎉 ${holidayName}` : '평일'}
</Badge>
```

#### 👥 막대 비교 (친구 동네)
```typescript
{
  type: 'horizontalBar',
  data: [
    { label: '우리', value: 27, color: colors.adaptiveBlue500 },
    { label: '홍대', value: 28, color: colors.adaptiveGrey400 },
    { label: '이태원', value: 27, color: colors.adaptiveGrey400 },
    ...
  ],
  unit: '°C',
  showLabels: true,
}
```

---

## 🎯 카드 컴포넌트 가이드

### 공통 카드
```typescript
<Card padding={20} borderRadius={16} background="white">
  <Flex direction="row" align="center" gap={8}>
    <Text typography="st1">🌤️</Text>
    <Text typography="t3" color={colors.adaptiveGrey900}>오늘 날씨</Text>
  </Flex>

  <Spacing size={12} />

  {/* 차트 영역 */}
  <Chart data={...} />

  <Spacing size={8} />

  {/* 값 표시 */}
  <Flex direction="row" justify="space-between">
    <Text typography="st1">{mainValue}</Text>
    <Text typography="st3" color={colors.adaptiveGrey500}>{subValue}</Text>
  </Flex>
</Card>
```

### 카드 hover/touch
- TDS 기본 ripple 효과 사용
- 탭 시 카드 내 데이터 새로고침 (단, 캐시 TTL 내면 fetch 스킵)

---

## 🌗 다크 모드

토스는 `colors.adaptive*` 사용 시 **자동 다크모드** 지원. 별도 작업 불필요.

단, 차트 색상은 다크모드에서 명도 ↑ 필요:
```typescript
const chartColor = useColorScheme() === 'dark'
  ? colors.adaptiveBlue400  // 다크모드는 살짝 밝게
  : colors.adaptiveBlue500;
```

---

## 🎉 공유 화면

사용자가 "공유" 버튼 누르면:

1. **현재 대시보드 PNG 스냅샷** 생성 (`react-native-view-shot`)
2. **MBTI 캐릭터 + 한 줄**을 함께 캡처
3. 토스 share SDK로 친구에게 전달

```
┌─────────────────────┐
│   우리 동네 오늘     │
│   📍 강남구           │
│                     │
│   ☀️ E형 활동가       │
│   "산책하기 완벽!"   │
│                     │
│  [대시보드 카드 6개]  │
│                     │
│  토스 앱에서 보기 →  │
└─────────────────────┘
```

---

## 🚫 금지 사항

- ❌ 외부 폰트 (Pretendard, Noto Sans 등) 사용 — TDS 폰트만
- ❌ 외부 아이콘 세트 (Material Icons 등) — 토스 토스페이스 이모지 + TDS 아이콘만
- ❌ 차트에 3D 효과, 그라데이션 과다 사용
- ❌ 카드 외곽 그림자 과다 (TDS 기본 elevation만)
- ❌ 애니메이션 과다 (페이지 전환 외 금지)

---

**다음 문서**: [`SETUP.md`](./SETUP.md) — 토스 앱인토스 Granite 환경 세팅
