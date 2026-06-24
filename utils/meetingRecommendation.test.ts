import { describe, it, expect } from 'vitest';
import { recommendMeetingTimes, midpointCoordinate } from './meetingRecommendation';
import type { WeatherData, FriendNeighborhood } from '@/types';

function mkWeather(precips: number[], temps: number[]): WeatherData {
  const hourlyLen = Math.max(precips.length, temps.length, 24);
  return {
    current: {
      time: '2026-06-23T15:00',
      temperature_2m: temps[0] ?? 20,
      weather_code: 0,
      apparent_temperature: temps[0] ?? 20,
      wind_speed_10m: 5,
      wind_direction_10m: 0,
      relative_humidity_2m: 50,
      uv_index: 3,
      uv_index_clear_sky: 4,
    },
    hourly: {
      time: Array.from({ length: hourlyLen }, (_, i) => `2026-06-23T${String(i).padStart(2, '0')}:00`),
      temperature_2m: Array.from({ length: hourlyLen }, (_, i) => temps[i] ?? temps[temps.length - 1] ?? 20),
      weather_code: [],
      apparent_temperature: Array.from({ length: hourlyLen }, () => 20),
      wind_speed_10m: Array.from({ length: hourlyLen }, () => 5),
      uv_index: Array.from({ length: hourlyLen }, () => 3),
      precipitation_probability: Array.from({ length: hourlyLen }, (_, i) => precips[i] ?? precips[precips.length - 1] ?? 0),
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
    fetchedAt: '2026-06-23T15:00:00Z',
  };
}

describe('recommendMeetingTimes', () => {
  it('returns empty array when all hours have rain somewhere', () => {
    const my = mkWeather([80, 80, 80], [20, 20, 20]);
    const result = recommendMeetingTimes({
      my,
      myName: 'Seoul',
      friends: [],
      hours: 3,
    });
    expect(result).toEqual([]);
  });

  it('returns dry hours when available', () => {
    const my = mkWeather([10, 60, 5, 80, 10], [22, 22, 22, 22, 22]);
    const friendW = mkWeather([20, 80, 10, 90, 15], [22, 22, 22, 22, 22]);
    const friend: FriendNeighborhood = {
      name: 'Busan',
      lat: 35.1,
      lon: 129.0,
      addedAt: '2026-06-22',
    };
    const result = recommendMeetingTimes({
      my,
      myName: 'Seoul',
      friends: [{ friend, weather: friendW }],
      hours: 5,
    });
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].details.length).toBe(2);
    // All recommendations should have low precip probability
    result.forEach((r) => {
      r.details.forEach((d) => expect(d.precipProb).toBeLessThan(30));
    });
  });

  it('ranks ideal temperature hours higher than cold hours', () => {
    const my = mkWeather([10, 10, 10], [22, 5, 15]);
    const result = recommendMeetingTimes({
      my,
      myName: 'Seoul',
      friends: [],
      hours: 3,
    });
    expect(result.length).toBe(3);
    // Hour 0 (22°C ideal) should rank higher than hour 1 (5°C cold)
    expect(result[0].score).toBeGreaterThanOrEqual(result[1].score);
  });
});

describe('midpointCoordinate', () => {
  it('returns my coordinate when no friends', () => {
    const m = midpointCoordinate({ lat: 37.5, lon: 127.0 }, []);
    expect(m).toEqual({ lat: 37.5, lon: 127.0 });
  });

  it('averages coordinates of all participants', () => {
    const f1: FriendNeighborhood = { name: 'B', lat: 35.0, lon: 129.0, addedAt: '2026-06-22' };
    const f2: FriendNeighborhood = { name: 'C', lat: 35.5, lon: 128.0, addedAt: '2026-06-22' };
    const m = midpointCoordinate(
      { lat: 37.5, lon: 127.0 },
      [
        { friend: f1, weather: mkWeather([], []) },
        { friend: f2, weather: mkWeather([], []) },
      ],
    );
    expect(m.lat).toBeCloseTo((37.5 + 35.0 + 35.5) / 3);
    expect(m.lon).toBeCloseTo((127.0 + 129.0 + 128.0) / 3);
  });
});
