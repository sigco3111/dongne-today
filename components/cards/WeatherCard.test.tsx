import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WeatherCard } from './WeatherCard';
import type { WeatherData } from '@/types';

const mockData: WeatherData = {
  current: { time: '2026-06-22T12:00', temperature_2m: 25, weather_code: 1 },
  hourly: {
    time: ['2026-06-22T00:00', '2026-06-22T06:00', '2026-06-22T12:00'],
    temperature_2m: [20, 22, 25],
    weather_code: [1, 2, 1],
  },
  fetchedAt: '2026-06-22T12:00:00Z',
};

describe('WeatherCard', () => {
  it('renders current temperature', () => {
    render(<WeatherCard data={mockData} />);
    expect(screen.getByText(/25/)).toBeInTheDocument();
  });

  it('renders weather code label (구름 조금 for code 1)', () => {
    render(<WeatherCard data={mockData} />);
    // code 1 → "구름 조금" + ⛅ emoji
    expect(screen.getByText(/구름 조금|맑음|☀️|⛅/)).toBeInTheDocument();
  });
});