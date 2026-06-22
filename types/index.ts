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

export interface WeatherData {
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
  };
  current: {
    temperature_2m: number;
    weather_code: number;
    time: string;
  };
  fetchedAt: string;
}

export interface AirQualityData {
  current: {
    pm2_5: number;
    pm10: number;
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
  | 'MASK_DONGNE'
  | 'WALK_LOVER';

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

export const CACHE_TTL_MS = 30 * 60 * 1000; // 30분

export interface StorageKeys {
  neighborhood: Neighborhood;
  friendNeighborhoods: FriendNeighborhood[];
  lastVisitDate: string;
  cachedReport_v2: CachedReport<DashboardData>;
  onboardingDone: boolean;
}