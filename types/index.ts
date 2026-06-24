/**
 * 우리 동네 오늘 — 전역 타입 정의
 *
 * 모든 화면/서비스/유틸이 공유하는 도메인 타입.
 * API 응답 타입은 각 services/api/*.ts에서 정의하고 여기서 re-export.
 */

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface Neighborhood extends Coordinates {
  name: string;
  /** 행정구역 (구/동), Nominatim reverse 결과의 address.county 등 */
  district?: string;
}

/** 하루 자외선 (UV) 데이터 */
export interface UVData {
  /** 현재 자외선 지수 (0~11+) */
  current: number;
  /** 구름 보정 없는 맑은 날 UV 지수 */
  currentClearSky: number;
  /** 자외선 등급 라벨 (낮음/보통/높음/매우높음/위험) */
  level: 'low' | 'moderate' | 'high' | 'very_high' | 'extreme';
  /** 자외선 보호 권고 메시지 */
  advice: string;
  /** 24시간 시간별 UV 지수 */
  hourly: number[];
  /** 오늘 자외선 최대치 */
  maxToday: number;
  fetchedAt: string;
}

/** 일출/일몰 데이터 */
export interface SunData {
  /** 오늘 일출 (ISO) */
  sunrise: string;
  /** 오늘 일몰 (ISO) */
  sunset: string;
  /** 일출 시간 (HH:mm) */
  sunriseLabel: string;
  /** 일몰 시간 (HH:mm) */
  sunsetLabel: string;
  /** 일조 시간 (분) */
  daylightMinutes: number;
  /** 일조 시간 라벨 ("14시간 35분") */
  daylightLabel: string;
  /** 남은 햇살 시간 (분) */
  remainingMinutes: number;
  fetchedAt: string;
}

/** 주간 예보 (7일) */
export interface WeeklyData {
  /** 날짜 목록 */
  dates: string[];
  /** 날짜 라벨 ("오늘", "내일", "M/D") */
  dateLabels: string[];
  /** 일별 최고 기온 */
  maxTemps: number[];
  /** 일별 최저 기온 */
  minTemps: number[];
  /** 일별 강수확률 최대값 (%) */
  precipProbs: number[];
  /** 일별 강수량 합계 (mm) */
  precipSums: number[];
  /** 일별 날씨 코드 */
  weatherCodes: number[];
  /** 일별 자외선 최대치 */
  uvMax: number[];
  fetchedAt: string;
}

/** Open-Meteo WeatherResponse 파싱 후 사용되는 통합 날씨 데이터.
 * current/hourly/daily 모두 포함 — 카드 컴포넌트가 필요한 필드만 추출해서 사용. */
export interface WeatherData {
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
    /** 체감온도 (°C) */
    apparent_temperature: number[];
    /** 풍속 (km/h) */
    wind_speed_10m: number[];
    /** 자외선 지수 */
    uv_index: number[];
    /** 강수확률 (%) */
    precipitation_probability: number[];
  };
  current: {
    temperature_2m: number;
    weather_code: number;
    time: string;
    /** 체감온도 (°C) */
    apparent_temperature: number;
    /** 풍속 (km/h) */
    wind_speed_10m: number;
    /** 풍향 (°) */
    wind_direction_10m: number;
    /** 상대습도 (%) */
    relative_humidity_2m: number;
    /** 자외선 지수 */
    uv_index: number;
    /** 구름 보정 자외선 */
    uv_index_clear_sky: number;
  };
  daily: {
    time: string[];
    sunrise: string[];
    sunset: string[];
    /** 일조 시간 (초) */
    daylight_duration: number[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    precipitation_probability_max: number[];
    uv_index_max: number[];
  };
  fetchedAt: string;
}

export interface AirQualityData {
  current: {
    pm2_5: number;
    pm10: number;
    /** 오존 (μg/m³) — Open-Meteo european_aqi 산정 보조 */
    ozone: number;
    /** 유럽 통합 AQI (0~100+) */
    europeanAqi: number;
    time: string;
  };
  /** 통합 지수 (계산된 값) */
  level: 'good' | 'moderate' | 'bad' | 'very_bad';
  fetchedAt: string;
}

export interface PrecipitationData {
  hourly: {
    time: string[];
    precipitation: number[];
    precipitation_probability: number[];
  };
  daily: {
    time: string[];
    precipitation_sum: number[];
    precipitation_probability_max: number[];
  };
  /** 오늘 일일 강수량 합계 (mm) */
  todaySum: number;
  /** 오늘 일일 강수확률 최대값 (%) */
  todayProbabilityMax: number;
  fetchedAt: string;
}

export interface HolidayData {
  isHoliday: boolean;
  isWeekday: boolean;
  /** 공휴일명 (없으면 null) */
  holidayName: string | null;
  /** 다음 공휴일까지 남은 일수 (0 = 오늘 공휴일) */
  daysUntilNext: number;
  fetchedAt: string;
}

export type CharacterKind =
  | 'E_ACTIVE'
  | 'I_QUIET'
  | 'CULTURALIST'
  | 'COMMUTER_DONGNE'
  | 'SUN_GUARD'
  | 'MASK_DONGNE'
  | 'WALK_LOVER'
  | 'HEAT_WAVE'
  | 'COLD_WAVE'
  | 'BIG_DIURNAL'
  | 'COASTAL';

export interface CharacterReport {
  kind: CharacterKind;
  emoji: string;
  line: string;
  subline: string;
  /** 디버그용 — 어떤 조건으로 결정됐는지 */
  matchedRule: string;
}

export interface FriendNeighborhood extends Neighborhood {
  addedAt: string;
}

export interface DashboardData {
  neighborhood: Neighborhood;
  weather: WeatherData;
  airQuality: AirQualityData;
  precipitation: PrecipitationData;
  holiday: HolidayData;
  character: CharacterReport;
  /** 친구 동네별 날씨 (비교 카드용) */
  friendsWeather: Array<{
    friend: FriendNeighborhood;
    weather: WeatherData;
  }>;
  fetchedAt: string;
}

export interface CachedReport<T> {
  data: T;
  timestamp: number;
}

/** 캐릭터 히스토리 1일치 엔트리 — 결정된 날짜 + 캐릭터 정보 */
export interface CharacterHistoryEntry {
  /** YYYY-MM-DD */
  date: string;
  kind: CharacterKind;
  emoji: string;
  /** 결정 시 line (예: "자외선 폭주 — 선크림 동네") */
  line: string;
}

/** 최근 N일 캐릭터 히스토리 (최대 7일) */
export interface CharacterHistory {
  entries: CharacterHistoryEntry[];
  fetchedAt: string;
}

export const CACHE_TTL_MS = 30 * 60 * 1000; // 30분

export const CHARACTER_HISTORY_LIMIT = 7;

export interface StorageKeys {
  neighborhood: Neighborhood;
  friendNeighborhoods: FriendNeighborhood[];
  lastVisitDate: string;
  cachedReport_v2: CachedReport<DashboardData>;
  onboardingDone: boolean;
  characterHistory_v1: CharacterHistory;
}