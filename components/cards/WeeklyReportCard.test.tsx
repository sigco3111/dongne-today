import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WeeklyReportCard } from './WeeklyReportCard';
import type { WeatherData, AirQualityData, CharacterHistoryEntry } from '@/types';

const makeWeather = (overrides: Partial<WeatherData['daily']> = {}): WeatherData => ({
  current: {
    time: '2026-06-22T12:00',
    temperature_2m: 25,
    weather_code: 0,
    apparent_temperature: 26,
    wind_speed_10m: 3,
    wind_direction_10m: 0,
    relative_humidity_2m: 50,
    uv_index: 0,
    uv_index_clear_sky: 0,
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
    time: ['2026-06-20', '2026-06-21', '2026-06-22'],
    sunrise: [],
    sunset: [],
    daylight_duration: [],
    weather_code: [0, 1, 61],
    temperature_2m_max: [28, 30, 25],
    temperature_2m_min: [18, 20, 22],
    precipitation_sum: [0, 0, 5.2],
    precipitation_probability_max: [0, 5, 80],
    uv_index_max: [7, 8, 3],
    ...overrides,
  },
  fetchedAt: '2026-06-22T12:00:00Z',
});

const makeAir = (): AirQualityData => ({
  current: { pm2_5: 22, pm10: 30, ozone: 55, europeanAqi: 40, time: '2026-06-22T12:00' },
  level: 'moderate',
  fetchedAt: '2026-06-22T12:00:00Z',
});

describe('WeeklyReportCard', () => {
  it('renders title and 4 stat tiles', () => {
    render(<WeeklyReportCard weather={makeWeather()} airQuality={makeAir()} history={[]} />);
    expect(screen.getByText('이번 주 동네 리포트')).toBeInTheDocument();
    expect(screen.getByTestId('stat-pm')).toBeInTheDocument();
    expect(screen.getByTestId('stat-temp')).toBeInTheDocument();
    expect(screen.getByTestId('stat-rain')).toBeInTheDocument();
    expect(screen.getByTestId('stat-character')).toBeInTheDocument();
  });

  it('counts rainy days (precipitation_sum > 1)', () => {
    render(<WeeklyReportCard weather={makeWeather()} airQuality={makeAir()} history={[]} />);
    const rain = screen.getByTestId('stat-rain');
    expect(rain.textContent).toContain('1'); // 6/22 only (5.2mm)
  });

  it('counts clear days (weather_code 0 or 1)', () => {
    render(<WeeklyReportCard weather={makeWeather()} airQuality={makeAir()} history={[]} />);
    expect(screen.getByTestId('stat-temp').textContent).toContain('맑은 날 2일');
  });

  it('shows most frequent character', () => {
    const history: CharacterHistoryEntry[] = [
      { date: '2026-06-20', kind: 'E_ACTIVE', emoji: '☀️', line: '활동 E형' },
      { date: '2026-06-21', kind: 'E_ACTIVE', emoji: '☀️', line: '활동 E형' },
      { date: '2026-06-22', kind: 'I_QUIET', emoji: '🌙', line: '차분 I형' },
    ];
    render(<WeeklyReportCard weather={makeWeather()} airQuality={makeAir()} history={history} />);
    const stat = screen.getByTestId('stat-character');
    expect(stat.textContent).toContain('2일'); // E_ACTIVE 2회
    expect(stat.textContent).toContain('활동적인 E형');
  });

  it('handles empty history gracefully', () => {
    render(<WeeklyReportCard weather={makeWeather()} airQuality={makeAir()} history={[]} />);
    expect(screen.getByTestId('stat-character').textContent).toContain('0일');
  });
});