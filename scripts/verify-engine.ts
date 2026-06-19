/**
 * 캐릭터 엔진 + 포맷 유틸 빠른 검증 스크립트
 *
 * jest 도입 없이 Node assert로 핵심 로직 회귀 방지.
 * 실행: `node --import tsx scripts/verify-engine.ts` (tsx 필요)
 * 또는 tsc로 컴파일 후 `node scripts/verify-engine.js`
 *
 * 테스트 범위:
 * - characterEngine: 6종 캐릭터 결정 룰 + 우선순위
 * - format: 온도/시간/거리/날짜 포맷
 */

import { decideCharacter, CHARACTERS, CHARACTER_LIST } from '../src/utils/characterEngine';
import {
  formatTemp,
  formatPercent,
  formatHourLabel,
  formatDaysUntil,
  formatDistance,
  formatRelativeDate,
} from '../src/utils/format';
import type {
  WeatherData,
  AirQualityData,
  BikeShareData,
  HolidayData,
} from '../src/types';

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (e) {
    console.log(`❌ ${name}`);
    console.log(`   ${e instanceof Error ? e.message : e}`);
    failed++;
  }
}

function assertEqual<T>(actual: T, expected: T, msg = '') {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${msg}\n   actual:   ${JSON.stringify(actual)}\n   expected: ${JSON.stringify(expected)}`);
  }
}

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

// 현재 시간을 mock — 출근시간/낮/밤 각 시나리오 테스트 가능
function withMockedHour(hour: number, fn: () => void) {
  const RealDate = globalThis.Date;
  const fixed = new RealDate(2026, 5, 19, hour, 0, 0);
  // MockDate — Date 상속, 빈 인자 시 fixed 시간 반환
  const MockDate = function (this: unknown, ...args: unknown[]) {
    if (args.length === 0) {
      return new RealDate(fixed.getTime());
    }
    // @ts-expect-error variadic Date constructor
    return new RealDate(...args);
  };
  // prototype chain (now() 등 static 메서드 보존)
  MockDate.prototype = RealDate.prototype;
  MockDate.now = () => fixed.getTime();
  MockDate.parse = RealDate.parse;
  MockDate.UTC = RealDate.UTC;
  globalThis.Date = MockDate as unknown as DateConstructor;
  try {
    fn();
  } finally {
    globalThis.Date = RealDate;
  }
}

const fakeWeather = (code: number, temp = 25): WeatherData => ({
  hourly: { time: [], temperature_2m: [], weather_code: [] },
  current: { temperature_2m: temp, weather_code: code, time: '' },
  fetchedAt: '',
});

const fakeAir = (pm25: number): AirQualityData => ({
  current: { pm2_5: pm25, pm10: pm25 * 2, time: '' },
  level: pm25 <= 15 ? 'good' : pm25 <= 35 ? 'moderate' : pm25 <= 75 ? 'bad' : 'very_bad',
  fetchedAt: '',
});

const fakeBike = (avg: number): BikeShareData => ({
  averageAvailable: avg,
  totalStations: 100,
  fetchedAt: '',
});

const fakeHoliday = (over: Partial<HolidayData> = {}): HolidayData => ({
  isHoliday: false,
  isWeekday: true,
  holidayName: null,
  daysUntilNext: 5,
  fetchedAt: '',
  ...over,
});

// ===== 캐릭터 엔진 테스트 =====

test('MASK_DONGNE: PM2.5 >= 75', () => {
  const c = decideCharacter({
    weather: fakeWeather(0),
    airQuality: fakeAir(80),
    bikeShare: fakeBike(60),
    holiday: fakeHoliday(),
  });
  assertEqual(c.kind, 'MASK_DONGNE');
});

test('WALK_LOVER: PM2.5 <=15 AND weather_code <=2', () => {
  withMockedHour(15, () => {
    const c = decideCharacter({
      weather: fakeWeather(1),
      airQuality: fakeAir(10),
      bikeShare: fakeBike(40),
      holiday: fakeHoliday(),
    });
    assertEqual(c.kind, 'WALK_LOVER');
  });
});

test('CULTURALIST: 공휴일 (PM2.5 보통, 날씨 보통)', () => {
  withMockedHour(15, () => {
    const c = decideCharacter({
      weather: fakeWeather(3),
      airQuality: fakeAir(25),
      bikeShare: fakeBike(30),
      holiday: fakeHoliday({ isHoliday: true, holidayName: '광복절' }),
    });
    assertEqual(c.kind, 'CULTURALIST');
  });
});

test('E_ACTIVE: 따릉이 50%+ + 좋은 날씨', () => {
  withMockedHour(15, () => {
    const c = decideCharacter({
      weather: fakeWeather(1),
      airQuality: fakeAir(25),
      bikeShare: fakeBike(65),
      holiday: fakeHoliday(),
    });
    assertEqual(c.kind, 'E_ACTIVE');
  });
});

test('I_QUIET: 기본값 (모든 조건 보통)', () => {
  withMockedHour(15, () => {
    const c = decideCharacter({
      weather: fakeWeather(3),
      airQuality: fakeAir(40),
      bikeShare: fakeBike(30),
      holiday: fakeHoliday(),
    });
    assertEqual(c.kind, 'I_QUIET');
  });
});

test('COMMUTER_DONGNE: 평일 7-9시', () => {
  withMockedHour(8, () => {
    const c = decideCharacter({
      weather: fakeWeather(3),
      airQuality: fakeAir(25),
      bikeShare: fakeBike(30),
      holiday: fakeHoliday({ isWeekday: true }),
    });
    assertEqual(c.kind, 'COMMUTER_DONGNE');
  });
});

test('우선순위: 마스크 > 출근러 > 산책러 > 문화인 > 활동가 > I형', () => {
  withMockedHour(8, () => {
    // PM2.5 80 → 마스크가 최우선 (출근시간이어도 무시)
    const c = decideCharacter({
      weather: fakeWeather(0),
      airQuality: fakeAir(80),
      bikeShare: fakeBike(60),
      holiday: fakeHoliday({ isHoliday: true, isWeekday: true }),
    });
    assertEqual(c.kind, 'MASK_DONGNE');
  });
});

test('CHARACTER_LIST 6종 전부 존재', () => {
  assertEqual(CHARACTER_LIST.length, 6, '캐릭터 6종');
  for (const kind of CHARACTER_LIST) {
    assert(!!CHARACTERS[kind].line, `${kind} 라인 누락`);
    assert(!!CHARACTERS[kind].emoji, `${kind} 이모지 누락`);
  }
});

// ===== 포맷 유틸 테스트 =====

test('formatTemp: 반올림 + 도', () => {
  assertEqual(formatTemp(25.7), '26°');
  assertEqual(formatTemp(-2.3), '-2°');
});

test('formatPercent: 반올림 + %', () => {
  assertEqual(formatPercent(64.7), '65%');
  assertEqual(formatPercent(0), '0%');
});

test('formatHourLabel: 오전/오후/자정/정오', () => {
  assertEqual(formatHourLabel('2026-06-19T00:00:00'), '자정');
  assertEqual(formatHourLabel('2026-06-19T12:00:00'), '정오');
  assertEqual(formatHourLabel('2026-06-19T09:00:00'), '오전 9시');
  assertEqual(formatHourLabel('2026-06-19T15:00:00'), '오후 3시');
});

test('formatDaysUntil: D-N 형식', () => {
  assertEqual(formatDaysUntil(0), '오늘');
  assertEqual(formatDaysUntil(1), '내일');
  assertEqual(formatDaysUntil(3), 'D-3');
});

test('formatDistance: m / km', () => {
  assertEqual(formatDistance(350), '350m');
  assertEqual(formatDistance(1500), '1.5km');
});

test('formatRelativeDate: 오늘/내일/MM월 DD일', () => {
  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  assertEqual(formatRelativeDate(todayIso), '오늘');
  assertEqual(formatRelativeDate(tomorrow.toISOString()), '내일');
});

// ===== 결과 =====

console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);