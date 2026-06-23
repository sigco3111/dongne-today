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
 *   3. WALK_LOVER: pm2.5 <= 15 AND weather_code <= 2
 *   4. CULTURALIST: 공휴일
 *   5. E_ACTIVE: todayProbabilityMax < 30 AND todaySum < 1 AND weather_code <= 3
 *   6. I_QUIET: 기본값
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
    ...overrides,
  },
  hourly: { time: [], temperature_2m: [], weather_code: [] },
  fetchedAt: '2026-06-22T12:00:00Z',
});

const makeAir = (overrides: Partial<AirQualityData['current']> = {}): AirQualityData => ({
  current: {
    time: '2026-06-22T12:00',
    pm2_5: 20,
    pm10: 30,
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
});
