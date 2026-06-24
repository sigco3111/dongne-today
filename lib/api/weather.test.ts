import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchWeather } from './weather';

const mockResponse = {
  current: {
    time: '2026-06-23T12:00',
    temperature_2m: 25.5,
    weather_code: 1,
    apparent_temperature: 27.3,
    wind_speed_10m: 5.2,
    wind_direction_10m: 102,
    relative_humidity_2m: 57,
    uv_index: 7.2,
    uv_index_clear_sky: 7.6,
  },
  hourly: {
    time: ['2026-06-23T00:00', '2026-06-23T01:00'],
    temperature_2m: [22.0, 21.5],
    precipitation_probability: [10, 15],
    apparent_temperature: [23.6, 23.3],
    wind_speed_10m: [6.0, 4.6],
    uv_index: [0.0, 0.0],
    uv_index_clear_sky: [0.0, 0.0],
  },
  daily: {
    time: ['2026-06-23', '2026-06-24'],
    sunrise: ['2026-06-23T05:11', '2026-06-24T05:11'],
    sunset: ['2026-06-23T19:56', '2026-06-24T19:57'],
    daylight_duration: [53119.83, 53112.69],
    weather_code: [1, 2],
    temperature_2m_max: [29.5, 30.2],
    temperature_2m_min: [18.6, 18.0],
    precipitation_sum: [0.2, 0.0],
    precipitation_probability_max: [14, 0],
    uv_index_max: [7.65, 8.0],
  },
};

describe('fetchWeather', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as Response);
  });
  afterEach(() => { vi.restoreAllMocks(); });

  it('fetches weather with correct base URL and timezone', async () => {
    await fetchWeather(37.5, 127);
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('api.open-meteo.com/v1/forecast'));
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('latitude=37.5'));
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('longitude=127'));
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('timezone=Asia%2FSeoul'));
  });

  it('requests UV index, sun, feels-like, wind, and daily forecast params', async () => {
    await fetchWeather(37.5, 127);
    const url = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    expect(url).toContain('uv_index');
    expect(url).toContain('apparent_temperature');
    expect(url).toContain('wind_speed_10m');
    expect(url).toContain('sunrise');
    expect(url).toContain('forecast_days=7');
  });

  it('returns parsed weather data with new fields', async () => {
    const result = await fetchWeather(37.5, 127);
    expect(result.current.temperature_2m).toBe(25.5);
    expect(result.current.uv_index).toBe(7.2);
    expect(result.current.apparent_temperature).toBe(27.3);
    expect(result.current.relative_humidity_2m).toBe(57);
    expect(result.current.wind_speed_10m).toBe(5.2);
    expect(result.hourly.precipitation_probability).toEqual([10, 15]);
    expect(result.hourly.uv_index).toEqual([0.0, 0.0]);
    expect(result.hourly.apparent_temperature).toEqual([23.6, 23.3]);
  });

  it('returns parsed daily forecast (sunrise/sunset/temps/uv)', async () => {
    const result = await fetchWeather(37.5, 127);
    expect(result.daily.time).toHaveLength(2);
    expect(result.daily.sunrise[0]).toBe('2026-06-23T05:11');
    expect(result.daily.sunset[0]).toBe('2026-06-23T19:56');
    expect(result.daily.daylight_duration[0]).toBeCloseTo(53119.83);
    expect(result.daily.temperature_2m_max[0]).toBe(29.5);
    expect(result.daily.uv_index_max[0]).toBe(7.65);
  });

  it('throws on non-OK response', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 } as Response);
    await expect(fetchWeather(37.5, 127)).rejects.toThrow(/500/);
  });

  it('throws on invalid schema (missing new fields)', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ current: { time: 'x', temperature_2m: 1, weather_code: 1 } }),
    } as Response);
    await expect(fetchWeather(37.5, 127)).rejects.toThrow();
  });
});