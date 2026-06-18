# 📊 데이터 소스 (DATA_SOURCES)

> 6종 데이터 모두 **무키(API Key 불필요) + CORS 허용 + 영구 무료** 검증 완료.

---

## ✅ 무키 검증 매트릭스 (2026-06-18 기준)

| # | 카테고리 | API | 무키 | CORS | 응답시간 | 커버리지 |
|---|---|---|:---:|:---:|---|---|
| 1 | 🌤️ 날씨 | Open-Meteo Forecast | ✅ | ✅ | < 200ms | 전세계 |
| 2 | 🌫️ 미세먼지 | Open-Meteo Air Quality | ✅ | ✅ | < 200ms | 전세계 |
| 3 | 🚴 따릉이 | Seoul Open Data | ✅ | ✅ | < 300ms | 서울 |
| 4 | 🎭 공휴일 | Nager Date | ✅ | ✅ | < 100ms | 100+ 국가 |
| 5 | 📍 주소→좌표 | Open-Meteo Geocoding | ✅ | ✅ | < 200ms | 전세계 |
| 6 | 📍 좌표→주소 | Nominatim Reverse | ✅ | ✅ | < 500ms | 전세계 |

**검증 방법**: `curl -sI -H "Origin: https://test.com" <API_URL>` → `access-control-allow-origin: *` 확인.

---

## 1️⃣ Open-Meteo Forecast (날씨)

### 엔드포인트
```
https://api.open-meteo.com/v1/forecast
```

### 파라미터
| 파라미터 | 값 | 필수 |
|---|---|---|
| `latitude` | 위도 (예: 37.5665) | ✅ |
| `longitude` | 경도 (예: 126.9780) | ✅ |
| `current` | 현재 날씨 필드 (예: `temperature_2m,weather_code`) | ✅ |
| `hourly` | 시간별 필드 (예: `temperature_2m,precipitation_probability`) | 선택 |
| `timezone` | `Asia/Seoul` | ✅ |
| `forecast_days` | 1~16 (기본 7) | 선택 |

### 호출 예시
```bash
curl "https://api.open-meteo.com/v1/forecast?latitude=37.5665&longitude=126.9780&current=temperature_2m,weather_code&hourly=temperature_2m,precipitation_probability&timezone=Asia%2FSeoul&forecast_days=1"
```

### 응답 예시 (발췌)
```json
{
  "current": {
    "time": "2026-06-18T17:45",
    "temperature_2m": 27.2,
    "weather_code": 1,
    "interval": 900
  },
  "hourly": {
    "time": ["2026-06-18T00:00", ...],
    "temperature_2m": [20.9, 20.3, 19.9, ...],
    "precipitation_probability": [59, 60, 56, ...]
  }
}
```

### weather_code 매핑
| 코드 | 의미 | 이모지 |
|---|---|---|
| 0 | 맑음 | ☀️ |
| 1, 2, 3 | 구름 조금/많음 | ⛅ |
| 45, 48 | 안개 | 🌫️ |
| 51, 53, 55 | 이슬비 | 🌦️ |
| 61, 63, 65 | 비 | 🌧️ |
| 71, 73, 75 | 눈 | ❄️ |
| 80, 81, 82 | 소나기 | 🌦️ |
| 95, 96, 99 | 천둥번개 | ⛈️ |

### TypeScript 타입
```typescript
interface WeatherResponse {
  current: {
    time: string;
    temperature_2m: number;
    weather_code: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    precipitation_probability: number[];
  };
}
```

### 사용처
- `WeatherCard` — 24시간 기온 라인 차트
- `CharacterEngine` — "산책러버" / "출근러" 캐릭터 결정

---

## 2️⃣ Open-Meteo Air Quality (미세먼지)

### 엔드포인트
```
https://air-quality-api.open-meteo.com/v1/air-quality
```

### 파라미터
| 파라미터 | 값 | 필수 |
|---|---|---|
| `latitude` | 위도 | ✅ |
| `longitude` | 경도 | ✅ |
| `current` | `pm10,pm2_5,european_aqi,ozone` 등 | ✅ |
| `hourly` | 시간별 필드 | 선택 |
| `timezone` | `Asia/Seoul` | ✅ |

### 호출 예시
```bash
curl "https://air-quality-api.open-meteo.com/v1/air-quality?latitude=37.5665&longitude=126.9780&current=pm10,pm2_5,european_aqi&hourly=pm10,pm2_5&timezone=Asia%2FSeoul"
```

### 응답 예시 (발췌)
```json
{
  "current": {
    "pm10": 18.0,
    "pm2_5": 14.7,
    "ozone": 110.0,
    "european_aqi": 71
  },
  "hourly": {
    "pm10": [50.8, 51.0, 49.5, ...],
    "pm2_5": [47.0, 47.1, 45.4, ...]
  }
}
```

### PM2.5 기준 (한국 환경부)
| 등급 | PM2.5 (μg/m³) | 표시 |
|---|---|---|
| 좋음 | 0~15 | 😊 |
| 보통 | 16~35 | 😐 |
| 나쁨 | 36~75 | 😷 |
| 매우 나쁨 | 76+ | 🤢 |

### TypeScript 타입
```typescript
interface AirQualityResponse {
  current: {
    pm10: number;
    pm2_5: number;
    ozone: number;
    european_aqi: number;
  };
  hourly: {
    pm10: number[];
    pm2_5: number[];
  };
}
```

### 사용처
- `AirQualityCard` — 게이지 + 캐릭터 표정
- `CharacterEngine` — "마스크 동네" / "산책러버" 캐릭터 결정

---

## 3️⃣ Seoul 따릉이 (Bike-Share)

### 엔드포인트
```
http://openapi.seoul.go.kr:8088/{KEY}/json/bikeList/{START}/{END}/
```

**무키 호출**: `{KEY}` 위치에 `sample` 사용.

### 호출 예시
```bash
curl "http://openapi.seoul.go.kr:8088/sample/json/bikeList/1/5/"
```

### 응답 예시
```json
{
  "rentBikeStatus": {
    "list_total_count": 5,
    "RESULT": {"CODE": "INFO-000", "MESSAGE": "정상 처리되었습니다."},
    "row": [
      {
        "rackTotCnt": "15",
        "stationName": "102. 망원역 1번출구 앞",
        "parkingBikeTotCnt": "6",
        "shared": "40",
        "stationLatitude": "37.55564880",
        "stationLongitude": "126.91062927",
        "stationId": "ST-4"
      }
    ]
  }
}
```

### 활용 전략
- 우리 동네 중심 가장 가까운 따릉이 대여소 3~5개 찾기
- 각 대여소의 `shared` 값 (가용률 %) 계산
- 동네 전체 평균 가용률 → 도넛 차트

### TypeScript 타입
```typescript
interface BikeStation {
  stationId: string;
  stationName: string;
  rackTotCnt: number;          // 총 거치대
  parkingBikeTotCnt: number;   // 현재 자전거 수
  shared: number;              // 가용률 (%)
  stationLatitude: number;
  stationLongitude: number;
}
```

### 주의
- `sample` 키는 quota 작음 (일 100~500회). 정식 키 발급은 토스 콘솔 가이드 따름.
- HTTP만 지원 (HTTPS는 미제공이지만 CORS는 OK)

---

## 4️⃣ Nager Date API (공휴일)

### 엔드포인트
```
https://date.nager.at/api/v3/PublicHolidays/{year}/KR
```

### 호출 예시
```bash
curl "https://date.nager.at/api/v3/PublicHolidays/2026/KR"
```

### 응답 예시 (발췌)
```json
[
  {"date": "2026-01-01", "localName": "새해", "global": true, "types": ["Public"]},
  {"date": "2026-05-05", "localName": "어린이날", "global": true, "types": ["Public"]},
  {"date": "2026-06-06", "localName": "현충일", "global": true, "types": ["Public"]},
  {"date": "2026-08-17", "localName": "광복절", "global": true, "types": ["Public"]}
]
```

### TypeScript 타입
```typescript
interface PublicHoliday {
  date: string;           // YYYY-MM-DD
  localName: string;
  name: string;           // 영문명
  global: boolean;
  types: string[];
}
```

### 사용처
- 오늘 날짜가 공휴일이면 `HolidayCard`에 배지 표시
- 캐릭터 톤 변화 ("🎉 광복절 연휴 동네")

### 주의
- 데이터는 해당 연도 1년치 한 번에 받음 (가벼움)
- 12/31 지나면 다음 연도 자동 fetch

---

## 5️⃣ Open-Meteo Geocoding (주소 → 좌표)

### 엔드포인트
```
https://geocoding-api.open-meteo.com/v1/search?name={name}&count={n}&language={lang}
```

### 호출 예시
```bash
curl "https://geocoding-api.open-meteo.com/v1/search?name=Gangnam&count=3&language=en&format=json"
```

### 응답 예시 (발췌)
```json
{
  "results": [
    {
      "id": 12606505,
      "name": "Gangnam",
      "latitude": 35.4244,
      "longitude": 126.59221,
      "country_code": "KR",
      "admin1": "Jeollanam-do",
      "admin2": "Gochang-gun",
      "admin3": "Mujang-myeon"
    }
  ]
}
```

### 주의
- **한글 검색 미지원** — 영문만 가능
- 한국 행정구역 영문명 매핑 필요 (예: "강남구" → "Gangnam-gu")
- 또는 사용자 입력으로 받은 동네명을 **사전 매핑 테이블**로 영문 변환

### 대안
- Nominatim Forward (영문 검색 가능)
- 또는 **토스 getCurrentLocation 한 번 → 좌표만 사용, 동네명은 Nominatim Reverse로**

---

## 6️⃣ Nominatim Reverse (좌표 → 주소)

### 엔드포인트
```
https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lon}&format=json
```

### 호출 예시
```bash
curl "https://nominatim.openstreetmap.org/reverse?lat=37.4979&lon=127.0276&format=json"
```

### 응답 예시 (발췌)
```json
{
  "address": {
    "neighbourhood": "역삼동",
    "suburb": "강남구",
    "city": "서울특별시",
    "country": "대한민국"
  }
}
```

### 활용 전략
1. 온보딩에서 `getCurrentLocation` → 좌표 받기
2. Nominatim Reverse → 동네명 추출
3. 사용자에게 "역삼동으로 인식했어요" 확인
4. 다르면 수동 선택 → Geocoding Forward로 좌표 재설정

### 주의
- **Rate limit: 1 req/sec** — throttle 필수
- User-Agent 헤더 권장 (`dongne-today/1.0`)

---

## 📐 Rate Limit 가이드

| API | 무료 한도 | 우리 사용량 (예상) | OK? |
|---|---|---|---|
| Open-Meteo | 600 req/min | < 10 req/min/user | ✅ |
| Seoul 따릉이 (sample) | ~500/day | < 200/day | ⚠️ |
| Nager Date | 무제한 | 1 req/year | ✅ |
| Open-Meteo Geocoding | 무제한 | < 5 req/session | ✅ |
| Nominatim | 1 req/sec | 1 req/session | ✅ |

**따릉이 sample quota 위험** → 챌린지 출품 후 토스 콘솔 가이드에 따라 정식 키 발급 권장.

---

## 🚫 사용 안 하는 API (검증 결과)

| API | 사유 |
|---|---|
| 기상청 단기예보 | 키 발급 + 만료 관리 필요 |
| 에어코리아 | 키 발급 + 만료 관리 필요 |
| data.go.kr 문화행사 | 키 발급 + quota 작음 |
| 서울시 지하철 실시간 | sample quota 작음 (정식 키 필요) |
| 서울시 실시간 인구 | sample quota 작음 (정식 키 필요) |

**대체**: 정밀 데이터보다 **대중적 즐거움** 위주로 6종 선별.

---

**다음 문서**: [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) — MBTI 캐릭터 + 디자인 톤
