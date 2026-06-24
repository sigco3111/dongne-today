import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HourlyDetailSheet } from './HourlyDetailSheet';
import type { WeatherData, AirQualityData } from '@/types';

const makeWeather = (): WeatherData => ({
  current: {
    time: '2026-06-22T12:00',
    temperature_2m: 25,
    weather_code: 0,
    apparent_temperature: 27,
    wind_speed_10m: 3.5,
    wind_direction_10m: 90,
    relative_humidity_2m: 55,
    uv_index: 5,
    uv_index_clear_sky: 6,
  },
  hourly: {
    time: Array.from({ length: 24 }, (_, i) => `2026-06-22T${String(i).padStart(2, '0')}:00`),
    temperature_2m: Array.from({ length: 24 }, (_, i) => 18 + (i % 12)),
    weather_code: [],
    apparent_temperature: Array.from({ length: 24 }, () => 20),
    wind_speed_10m: Array.from({ length: 24 }, (_, i) => i % 5),
    uv_index: Array.from({ length: 24 }, (_, i) => Math.max(0, 8 - Math.abs(i - 13))),
    precipitation_probability: Array.from({ length: 24 }, (_, i) => i < 6 ? 30 : 5),
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

const makeAir = (): AirQualityData => ({
  current: { pm2_5: 25, pm10: 35, ozone: 60, europeanAqi: 45, time: '2026-06-22T12:00' },
  level: 'moderate',
  fetchedAt: '2026-06-22T12:00:00Z',
});

describe('HourlyDetailSheet', () => {
  it('does not render when closed', () => {
    render(<HourlyDetailSheet open={false} onClose={() => {}} weather={makeWeather()} airQuality={makeAir()} />);
    expect(screen.queryByTestId('hourly-detail-sheet')).not.toBeInTheDocument();
  });

  it('renders when open with default metric tab', () => {
    render(<HourlyDetailSheet open onClose={() => {}} weather={makeWeather()} airQuality={makeAir()} />);
    expect(screen.getByTestId('hourly-detail-sheet')).toBeInTheDocument();
    expect(screen.getByTestId('metric-tab-temperature').getAttribute('aria-selected')).toBe('true');
  });

  it('shows current value for selected metric', () => {
    render(<HourlyDetailSheet open onClose={() => {}} weather={makeWeather()} airQuality={makeAir()} />);
    const value = screen.getByTestId('sheet-current-value');
    expect(value.textContent).toBeTruthy();
  });

  it('switches metric on tab click', () => {
    render(<HourlyDetailSheet open onClose={() => {}} weather={makeWeather()} airQuality={makeAir()} />);
    fireEvent.click(screen.getByTestId('metric-tab-pm25'));
    expect(screen.getByTestId('metric-tab-pm25').getAttribute('aria-selected')).toBe('true');
    expect(screen.getByTestId('metric-tab-temperature').getAttribute('aria-selected')).toBe('false');
  });

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn();
    render(<HourlyDetailSheet open onClose={onClose} weather={makeWeather()} airQuality={makeAir()} />);
    fireEvent.click(screen.getByTestId('sheet-close'));
    expect(onClose).toHaveBeenCalled();
  });

  it('renders hour slider', () => {
    render(<HourlyDetailSheet open onClose={() => {}} weather={makeWeather()} airQuality={makeAir()} />);
    const slider = screen.getByTestId('hour-slider');
    expect(slider).toBeInTheDocument();
    expect(slider.getAttribute('max')).toBe('23');
  });
});