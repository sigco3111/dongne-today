/**
 * characterHistory.test.ts
 *
 * - decideAndSave: 결정 + 저장 + 같은 날 덮어쓰기 + 7일 롤오버
 * - loadHistory: 손상된 데이터 → 빈 히스토리
 * - getHistoryForRange: 오늘부터 N-1일 전까지 날짜별 엔트리 반환, 결측일 null
 * - mostFrequentCharacter: 가장 많이 등장한 캐릭터, 동률이면 최신 날짜
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  decideAndSave,
  loadHistory,
  getHistoryForRange,
  mostFrequentCharacter,
  todayKey,
} from './characterHistory';
import { storage } from '@/lib/storage';
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
    weather_code: 0,
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
  current: { pm2_5: 20, pm10: 30, ozone: 50, europeanAqi: 35, time: '2026-06-22T12:00', ...overrides },
  level: 'moderate',
  fetchedAt: '2026-06-22T12:00:00Z',
});

const makePrecip = (overrides: Partial<Pick<PrecipitationData, 'todaySum' | 'todayProbabilityMax'>> = {}): PrecipitationData => ({
  todaySum: 0,
  todayProbabilityMax: 10,
  hourly: { time: [], precipitation: [], precipitation_probability: [] },
  daily: { time: [], precipitation_sum: [], precipitation_probability_max: [] },
  fetchedAt: '2026-06-22T12:00:00Z',
  ...overrides,
});

const makeHoliday = (): HolidayData => ({
  isHoliday: false,
  isWeekday: true,
  holidayName: null,
  daysUntilNext: 5,
  fetchedAt: '2026-06-22T12:00:00Z',
});

const fixedNow = new Date('2026-06-22T13:00:00');

describe('todayKey', () => {
  it('formats YYYY-MM-DD with leading zeros', () => {
    expect(todayKey(new Date('2026-01-05T10:00:00'))).toBe('2026-01-05');
    expect(todayKey(new Date('2026-12-31T23:59:59'))).toBe('2026-12-31');
  });
});

describe('loadHistory', () => {
  beforeEach(() => {
    storage.remove('characterHistory_v1');
  });
  afterEach(() => {
    storage.remove('characterHistory_v1');
  });

  it('returns empty history when storage is empty', () => {
    const result = loadHistory();
    expect(result.entries).toEqual([]);
  });

  it('returns empty history when storage is corrupted', () => {
    storage.set('characterHistory_v1', { entries: 'not-an-array' } as unknown as never);
    const result = loadHistory();
    expect(result.entries).toEqual([]);
  });
});

describe('decideAndSave', () => {
  beforeEach(() => {
    storage.remove('characterHistory_v1');
    vi.useFakeTimers();
    vi.setSystemTime(fixedNow);
  });
  afterEach(() => {
    vi.useRealTimers();
    storage.remove('characterHistory_v1');
  });

  it('saves today character with kind/emoji/line', () => {
    const report = decideAndSave({
      weather: makeWeather({ uv_index_clear_sky: 9 }),
      airQuality: makeAir({ pm2_5: 20 }),
      precipitation: makePrecip(),
      holiday: makeHoliday(),
    });
    expect(report.kind).toBe('SUN_GUARD');
    const history = loadHistory();
    expect(history.entries).toHaveLength(1);
    expect(history.entries[0]).toMatchObject({
      date: '2026-06-22',
      kind: 'SUN_GUARD',
      emoji: '🧴',
    });
  });

  it('overwrites same-day entry on second decide (latest wins)', () => {
    decideAndSave({
      weather: makeWeather({ weather_code: 1, uv_index_clear_sky: 0 }),
      airQuality: makeAir({ pm2_5: 20 }),
      precipitation: makePrecip(),
      holiday: makeHoliday(),
    });
    decideAndSave({
      weather: makeWeather({ weather_code: 1, uv_index_clear_sky: 9 }),
      airQuality: makeAir({ pm2_5: 20 }),
      precipitation: makePrecip(),
      holiday: makeHoliday(),
    });
    const history = loadHistory();
    expect(history.entries).toHaveLength(1);
    expect(history.entries[0].kind).toBe('SUN_GUARD');
  });

  it('caps entries at 7 (rolling window)', () => {
    for (let i = 0; i < 10; i++) {
      const day = new Date(fixedNow);
      day.setDate(fixedNow.getDate() - i);
      vi.setSystemTime(day);
      decideAndSave({
        weather: makeWeather({ weather_code: 0 }),
        airQuality: makeAir({ pm2_5: 20 }),
        precipitation: makePrecip(),
        holiday: makeHoliday(),
      });
    }
    const history = loadHistory();
    expect(history.entries.length).toBeLessThanOrEqual(7);
  });

  it('returns CharacterReport on each call', () => {
    const report = decideAndSave({
      weather: makeWeather({ weather_code: 61 }),
      airQuality: makeAir({ pm2_5: 50 }),
      precipitation: makePrecip({ todayProbabilityMax: 80, todaySum: 5 }),
      holiday: makeHoliday(),
    });
    expect(report.matchedRule).toBeTruthy();
    expect(report.line).toBeTruthy();
    expect(report.emoji).toBeTruthy();
  });
});

describe('getHistoryForRange', () => {
  beforeEach(() => {
    storage.remove('characterHistory_v1');
  });
  afterEach(() => {
    storage.remove('characterHistory_v1');
  });

  it('returns 7 dates from today backward with null entries (no history)', () => {
    const result = getHistoryForRange(7, fixedNow);
    expect(result).toHaveLength(7);
    expect(result[0].date).toBe('2026-06-22');
    expect(result[6].date).toBe('2026-06-16');
    expect(result.every((r) => r.entry === null)).toBe(true);
  });

  it('maps saved entries to correct dates', () => {
    storage.set('characterHistory_v1', {
      entries: [
        { date: '2026-06-22', kind: 'SUN_GUARD', emoji: '🧴', line: '선크림 동네' },
        { date: '2026-06-20', kind: 'E_ACTIVE', emoji: '☀️', line: '활동 E형' },
      ],
      fetchedAt: '2026-06-22T13:00:00Z',
    });
    const result = getHistoryForRange(7, fixedNow);
    expect(result[0].entry?.kind).toBe('SUN_GUARD'); // today
    expect(result[1].entry).toBeNull(); // 6/21 missing
    expect(result[2].entry?.kind).toBe('E_ACTIVE'); // 6/20
  });
});

describe('mostFrequentCharacter', () => {
  it('returns null for empty entries', () => {
    expect(mostFrequentCharacter([])).toBeNull();
  });

  it('returns the kind with highest count', () => {
    expect(
      mostFrequentCharacter([
        { date: '2026-06-20', kind: 'I_QUIET', emoji: '🌙', line: '' },
        { date: '2026-06-21', kind: 'E_ACTIVE', emoji: '☀️', line: '' },
        { date: '2026-06-22', kind: 'E_ACTIVE', emoji: '☀️', line: '' },
      ]),
    ).toBe('E_ACTIVE');
  });

  it('breaks ties by latest date', () => {
    expect(
      mostFrequentCharacter([
        { date: '2026-06-20', kind: 'I_QUIET', emoji: '🌙', line: '' },
        { date: '2026-06-21', kind: 'E_ACTIVE', emoji: '☀️', line: '' },
        { date: '2026-06-22', kind: 'I_QUIET', emoji: '🌙', line: '' },
      ]),
    ).toBe('I_QUIET');
  });
});