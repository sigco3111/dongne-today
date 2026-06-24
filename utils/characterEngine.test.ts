/**
 * characterEngine.test.ts
 *
 * decideCharacter 결정 규칙 테스트.
 * 시그니처: decideCharacter(input: CharacterInput): CharacterReport
 *   - input: { weather, airQuality, precipitation, holiday }
 *   - 시간은 new Date().getHours() 사용 → vi.setSystemTime 으로 통제
 *   - 반환은 { kind, emoji, line, subline, matchedRule }
 *
 * 우선순위 (높음 → 낮음):
 *   1. MASK_DONGNE: pm2.5 >= 75
 *   2. COMMUTER_DONGNE: 평일 7~9시
 *   3. HEAT_WAVE: 오늘 최고기온 >= 33°C
 *   4. COLD_WAVE: 오늘 최저기온 <= -5°C
 *   5. SUN_GUARD: uv_index_clear_sky >= 8
 *   6. WALK_LOVER: pm2.5 <= 15 AND weather_code <= 2
 *   7. COASTAL: humidity >= 80 AND wind >= 18km/h
 *   8. BIG_DIURNAL: 일교차 >= 12°C
 *   9. CULTURALIST: 공휴일
 *  10. E_ACTIVE: todayProbabilityMax < 30 AND todaySum < 1 AND weather_code <= 3
 *  11. I_QUIET: 기본값
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { decideCharacter } from './characterEngine';
import type {
  WeatherData,
  AirQualityData,
  PrecipitationData,
  HolidayData,
} from '@/types';

const makeWeather = (overrides: Partial<WeatherData['current']> = {}): WeatherData => ({
  current: {
    time: '2026-06-22T12:00',
    temperature_2m: 24,
    weather_code: 1,
    apparent_temperature: 24,
    wind_speed_10m: 3,
    wind_direction_10m: 0,
    relative_humidity_2m: 50,
    uv_index: 0,
    uv_index_clear_sky: 0,
    ...overrides,
  },
  hourly: {
    time: [],
    temperature_2m: [],
    weather_code: [],
    apparent_temperature: [],
    wind_speed_10m: [],
    uv_index: [],
    precipitation_probability: [],
  },
  daily: {
    time: [],
    sunrise: [],
    sunset: [],
    daylight_duration: [],
    weather_code: [],
    temperature_2m_max: [],
    temperature_2m_min: [],
    precipitation_sum: [],
    precipitation_probability_max: [],
    uv_index_max: [],
  },
  fetchedAt: '2026-06-22T12:00:00Z',
});

const makeAir = (overrides: Partial<AirQualityData['current']> = {}): AirQualityData => ({
  current: {
    pm2_5: 20,
    pm10: 30,
    ozone: 50,
    europeanAqi: 35,
    time: '2026-06-22T12:00',
    ...overrides,
  },
  level: 'moderate',
  fetchedAt: '2026-06-22T12:00:00Z',
});

const makePrecip = (
  overrides: Partial<Pick<PrecipitationData, 'todaySum' | 'todayProbabilityMax'>> = {}
): PrecipitationData => ({
  todaySum: 0,
  todayProbabilityMax: 10,
  hourly: { time: [], precipitation: [], precipitation_probability: [] },
  daily: { time: [], precipitation_sum: [], precipitation_probability_max: [] },
  fetchedAt: '2026-06-22T12:00:00Z',
  ...overrides,
});

const makeHoliday = (overrides: Partial<HolidayData> = {}): HolidayData => ({
  isHoliday: false,
  isWeekday: true,
  holidayName: null,
  daysUntilNext: 5,
  fetchedAt: '2026-06-22T12:00:00Z',
  ...overrides,
});

describe('decideCharacter', () => {
  beforeEach(() => {
    // 기본 시간: 평일 오후 3시 (출근시간대 밖)
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-22T15:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('Rule 1 — pm2.5 >= 75 → MASK_DONGNE (highest priority)', () => {
    const result = decideCharacter({
      weather: makeWeather({ weather_code: 0 }),
      airQuality: makeAir({ pm2_5: 80 }),
      precipitation: makePrecip(),
      holiday: makeHoliday({ isHoliday: true }), // 공휴일이어도 마스크가 이김
    });
    expect(result.kind).toBe('MASK_DONGNE');
    expect(result.matchedRule).toContain('pm2.5');
  });

  it('Rule 2 — 평일 7~9시 → COMMUTER_DONGNE', () => {
    vi.setSystemTime(new Date('2026-06-22T08:00:00')); // 월요일 8시
    const result = decideCharacter({
      weather: makeWeather(),
      airQuality: makeAir(),
      precipitation: makePrecip(),
      holiday: makeHoliday({ isWeekday: true }),
    });
    expect(result.kind).toBe('COMMUTER_DONGNE');
    expect(result.matchedRule).toContain('weekday');
  });

  it('Rule 3 — pm2.5 <= 15 AND weather_code <= 2 → WALK_LOVER', () => {
    const result = decideCharacter({
      weather: makeWeather({ weather_code: 2 }),
      airQuality: makeAir({ pm2_5: 10 }),
      precipitation: makePrecip(),
      holiday: makeHoliday(),
    });
    expect(result.kind).toBe('WALK_LOVER');
  });

  it('Rule 4 — 공휴일(평일 아님) → CULTURALIST', () => {
    const result = decideCharacter({
      weather: makeWeather({ weather_code: 61 }), // 비 → 산책/WALK 조건 미충족
      airQuality: makeAir({ pm2_5: 40 }),
      precipitation: makePrecip({ todayProbabilityMax: 80, todaySum: 5 }),
      holiday: makeHoliday({ isHoliday: true, isWeekday: false }),
    });
    expect(result.kind).toBe('CULTURALIST');
  });

  it('Rule 5 — 비 안 옴 + 좋은 날씨 → E_ACTIVE', () => {
    const result = decideCharacter({
      weather: makeWeather({ weather_code: 3 }),
      airQuality: makeAir({ pm2_5: 40 }), // WALK_LOVER 조건 미충족
      precipitation: makePrecip({ todayProbabilityMax: 10, todaySum: 0.2 }),
      holiday: makeHoliday(),
    });
    expect(result.kind).toBe('E_ACTIVE');
  });

  it('Rule 6 — 기본값 → I_QUIET', () => {
    const result = decideCharacter({
      weather: makeWeather({ weather_code: 61 }), // 비
      airQuality: makeAir({ pm2_5: 40 }), // WALK_LOVER 조건 미충족
      precipitation: makePrecip({ todayProbabilityMax: 80, todaySum: 5 }), // E_ACTIVE 조건 미충족
      holiday: makeHoliday({ isHoliday: false }),
    });
    expect(result.kind).toBe('I_QUIET');
    expect(result.matchedRule).toBe('default');
  });

  it('priority — MASK_DONGNE > COMMUTER_DONGNE', () => {
    vi.setSystemTime(new Date('2026-06-22T08:00:00')); // 평일 8시 (출근시간)
    const result = decideCharacter({
      weather: makeWeather(),
      airQuality: makeAir({ pm2_5: 100 }), // 마스크
      precipitation: makePrecip(),
      holiday: makeHoliday({ isWeekday: true }),
    });
    expect(result.kind).toBe('MASK_DONGNE'); // 출근 시간이어도 마스크 우선
  });

  it('Rule 7 — uv_index_clear_sky >= 8 → SUN_GUARD (자외선 매우 강함)', () => {
    vi.setSystemTime(new Date('2026-06-22T13:00:00')); // 한낮
    const result = decideCharacter({
      weather: makeWeather({ weather_code: 0, uv_index: 8.5, uv_index_clear_sky: 9.2 }),
      airQuality: makeAir({ pm2_5: 20 }), // 마스크/산책 조건 미충족
      precipitation: makePrecip({ todayProbabilityMax: 10, todaySum: 0 }), // 비 안 옴
      holiday: makeHoliday(),
    });
    expect(result.kind).toBe('SUN_GUARD');
    expect(result.matchedRule).toContain('uv_index');
  });

  it('SUN_GUARD — uv_index_clear_sky exactly 8.0 도 매칭', () => {
    const result = decideCharacter({
      weather: makeWeather({ uv_index: 7.5, uv_index_clear_sky: 8.0 }),
      airQuality: makeAir({ pm2_5: 30 }),
      precipitation: makePrecip(),
      holiday: makeHoliday(),
    });
    expect(result.kind).toBe('SUN_GUARD');
  });

  it('SUN_GUARD — uv_index_clear_sky 7.9 미스 (기존 우선순위 E_ACTIVE 등)', () => {
    const result = decideCharacter({
      weather: makeWeather({ uv_index: 7.0, uv_index_clear_sky: 7.9, weather_code: 1 }),
      airQuality: makeAir({ pm2_5: 30 }),
      precipitation: makePrecip({ todayProbabilityMax: 10, todaySum: 0 }),
      holiday: makeHoliday(),
    });
    expect(result.kind).not.toBe('SUN_GUARD');
    // 다른 룰 중 하나 — 우선순위: 마스크(>=75)>출근(평일7~9)>산책(pm<=15&wcode<=2)>문화인>E_ACTIVE>I_QUIET
  });

  it('priority — MASK_DONGNE > SUN_GUARD', () => {
    const result = decideCharacter({
      weather: makeWeather({ uv_index: 10, uv_index_clear_sky: 11 }),
      airQuality: makeAir({ pm2_5: 100 }), // 마스크 우선
      precipitation: makePrecip(),
      holiday: makeHoliday(),
    });
    expect(result.kind).toBe('MASK_DONGNE');
  });

  it('Rule 3 — 오늘 최고기온 >= 33°C → HEAT_WAVE (폭염)', () => {
    const w = makeWeather({ weather_code: 0 });
    w.daily.temperature_2m_max = [34];
    w.daily.temperature_2m_min = [22];
    const result = decideCharacter({
      weather: w,
      airQuality: makeAir({ pm2_5: 20 }),
      precipitation: makePrecip(),
      holiday: makeHoliday(),
    });
    expect(result.kind).toBe('HEAT_WAVE');
  });

  it('Rule 4 — 오늘 최저기온 <= -5°C → COLD_WAVE (한파)', () => {
    const w = makeWeather({ weather_code: 0 });
    w.daily.temperature_2m_max = [-2];
    w.daily.temperature_2m_min = [-8];
    const result = decideCharacter({
      weather: w,
      airQuality: makeAir({ pm2_5: 20 }),
      precipitation: makePrecip(),
      holiday: makeHoliday(),
    });
    expect(result.kind).toBe('COLD_WAVE');
  });

  it('Rule 7 — humidity >= 80 AND wind >= 18km/h → COASTAL (해변)', () => {
    const result = decideCharacter({
      weather: makeWeather({ weather_code: 3, relative_humidity_2m: 85, wind_speed_10m: 20 }),
      airQuality: makeAir({ pm2_5: 40 }),
      precipitation: makePrecip({ todayProbabilityMax: 30, todaySum: 1 }),
      holiday: makeHoliday(),
    });
    expect(result.kind).toBe('COASTAL');
  });

  it('Rule 8 — 일교차 >= 12°C → BIG_DIURNAL (환절기)', () => {
    const w = makeWeather({ weather_code: 0 });
    w.daily.temperature_2m_max = [22];
    w.daily.temperature_2m_min = [8]; // 일교차 14도
    const result = decideCharacter({
      weather: w,
      airQuality: makeAir({ pm2_5: 40 }),
      precipitation: makePrecip(),
      holiday: makeHoliday(),
    });
    expect(result.kind).toBe('BIG_DIURNAL');
  });

  it('priority — HEAT_WAVE > WALK_LOVER (폭염 우선)', () => {
    const w = makeWeather({ weather_code: 0 });
    w.daily.temperature_2m_max = [35];
    w.daily.temperature_2m_min = [25];
    const result = decideCharacter({
      weather: w,
      airQuality: makeAir({ pm2_5: 8 }), // WALK 조건 충족이지만 HEAT_WAVE 우선
      precipitation: makePrecip(),
      holiday: makeHoliday(),
    });
    expect(result.kind).toBe('HEAT_WAVE');
  });
});
