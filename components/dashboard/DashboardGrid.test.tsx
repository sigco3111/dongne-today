import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardGrid } from './DashboardGrid';
import type {
  AirQualityData,
  CharacterHistoryEntry,
  HolidayData,
  Neighborhood,
  PrecipitationData,
  WeatherData,
} from '@/types';
import type { CompareEntry } from '@/components/cards/CompareCard';

const makeNeighborhood = (): Neighborhood => ({
  name: '테스트동네',
  lat: 37.5665,
  lon: 126.978,
  district: '종로구',
});

const makeWeather = (): WeatherData => ({
  current: {
    time: '2026-06-22T12:00',
    temperature_2m: 24,
    weather_code: 0,
    apparent_temperature: 25,
    wind_speed_10m: 3,
    wind_direction_10m: 0,
    relative_humidity_2m: 50,
    uv_index: 4,
    uv_index_clear_sky: 5,
  },
  hourly: {
    time: Array.from({ length: 24 }, (_, i) => `2026-06-22T${String(i).padStart(2, '0')}:00`),
    temperature_2m: Array.from({ length: 24 }, () => 22),
    weather_code: Array.from({ length: 24 }, () => 0),
    apparent_temperature: Array.from({ length: 24 }, () => 22),
    wind_speed_10m: Array.from({ length: 24 }, () => 3),
    uv_index: Array.from({ length: 24 }, () => 3),
    precipitation_probability: Array.from({ length: 24 }, () => 0),
  },
  daily: {
    time: ['2026-06-20', '2026-06-21', '2026-06-22', '2026-06-23', '2026-06-24', '2026-06-25', '2026-06-26'],
    sunrise: Array(7).fill('2026-06-22T05:30'),
    sunset: Array(7).fill('2026-06-22T19:45'),
    daylight_duration: Array(7).fill(51000),
    weather_code: [0, 1, 0, 61, 0, 1, 0],
    temperature_2m_max: [28, 30, 25, 22, 27, 29, 31],
    temperature_2m_min: [18, 20, 19, 17, 18, 19, 20],
    precipitation_sum: [0, 0, 0, 5.2, 0, 0, 0],
    precipitation_probability_max: [0, 5, 10, 80, 20, 5, 0],
    uv_index_max: [7, 8, 6, 3, 7, 8, 9],
  },
  fetchedAt: '2026-06-22T12:00:00Z',
});

const makeAirQuality = (): AirQualityData => ({
  current: { pm2_5: 22, pm10: 30, ozone: 55, europeanAqi: 40, time: '2026-06-22T12:00' },
  level: 'moderate',
  fetchedAt: '2026-06-22T12:00:00Z',
});

const makePrecipitation = (): PrecipitationData => ({
  hourly: {
    time: Array.from({ length: 24 }, (_, i) => `2026-06-22T${String(i).padStart(2, '0')}:00`),
    precipitation: Array.from({ length: 24 }, () => 0),
    precipitation_probability: Array.from({ length: 24 }, () => 0),
  },
  daily: {
    time: ['2026-06-20', '2026-06-21', '2026-06-22'],
    precipitation_sum: [0, 0, 0],
    precipitation_probability_max: [0, 5, 10],
  },
  todaySum: 0,
  todayProbabilityMax: 10,
  fetchedAt: '2026-06-22T12:00:00Z',
});

const makeHoliday = (): HolidayData => ({
  isHoliday: false,
  isWeekday: true,
  holidayName: null,
  daysUntilNext: 14,
  fetchedAt: '2026-06-22T12:00:00Z',
});

const makeFriends = (): CompareEntry[] => [];

const makeHistoryItems = (): Array<{ date: string; entry: CharacterHistoryEntry | null }> => [
  { date: '2026-06-20', entry: { date: '2026-06-20', kind: 'E_ACTIVE', emoji: '☀️', line: '활동 E형' } },
  { date: '2026-06-21', entry: { date: '2026-06-21', kind: 'E_ACTIVE', emoji: '☀️', line: '활동 E형' } },
  { date: '2026-06-22', entry: null },
];

describe('DashboardGrid', () => {
  it('이번 주 동네 리포트(WeeklyReportCard)는 정확히 1번만 렌더링된다', () => {
    render(
      <DashboardGrid
        neighborhood={makeNeighborhood()}
        isLoading={false}
        data={{
          weather: makeWeather(),
          airQuality: makeAirQuality(),
          precipitation: makePrecipitation(),
        }}
        holiday={makeHoliday()}
        friends={makeFriends()}
        historyItems={makeHistoryItems()}
      />,
    );

    // WeeklyReportCard의 h3 헤딩은 "이번 주 동네 리포트" (WeeklyCard의 "7일 예보"와 구분됨)
    const reportHeadings = screen.getAllByText('이번 주 동네 리포트');
    expect(reportHeadings).toHaveLength(1);
  });

  it('이번 주 동네 리포트(WeeklyReportCard)의 4개 통계 타일이 각각 1번씩만 렌더링된다', () => {
    render(
      <DashboardGrid
        neighborhood={makeNeighborhood()}
        isLoading={false}
        data={{
          weather: makeWeather(),
          airQuality: makeAirQuality(),
          precipitation: makePrecipitation(),
        }}
        holiday={makeHoliday()}
        friends={makeFriends()}
        historyItems={makeHistoryItems()}
      />,
    );

    // stat-* testid는 StatTile에 직접 부착되어 있어 Card를 거치지 않고 DOM에 노출됨
    expect(screen.getAllByTestId('stat-pm')).toHaveLength(1);
    expect(screen.getAllByTestId('stat-temp')).toHaveLength(1);
    expect(screen.getAllByTestId('stat-rain')).toHaveLength(1);
    expect(screen.getAllByTestId('stat-character')).toHaveLength(1);
  });

  it('7일 예보(WeeklyCard)는 이번 주 동네 리포트(WeeklyReportCard)와 별개로 1번씩 렌더링된다', () => {
    render(
      <DashboardGrid
        neighborhood={makeNeighborhood()}
        isLoading={false}
        data={{
          weather: makeWeather(),
          airQuality: makeAirQuality(),
          precipitation: makePrecipitation(),
        }}
        holiday={makeHoliday()}
        friends={makeFriends()}
        historyItems={makeHistoryItems()}
      />,
    );

    expect(screen.getAllByText('이번 주 동네 리포트')).toHaveLength(1);
    expect(screen.getAllByText('7일 예보')).toHaveLength(1);
  });

  it('빈 히스토리에서도 이번 주 동네 리포트가 정확히 1번만 렌더링된다', () => {
    render(
      <DashboardGrid
        neighborhood={makeNeighborhood()}
        isLoading={false}
        data={{
          weather: makeWeather(),
          airQuality: makeAirQuality(),
          precipitation: makePrecipitation(),
        }}
        holiday={makeHoliday()}
        friends={makeFriends()}
        historyItems={[]}
      />,
    );

    expect(screen.getAllByText('이번 주 동네 리포트')).toHaveLength(1);
    expect(screen.getAllByTestId('stat-pm')).toHaveLength(1);
  });
});
