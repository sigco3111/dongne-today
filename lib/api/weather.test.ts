import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchWeather } from './weather';

const mockResponse = {
  current: { time: '2026-06-22T12:00', temperature_2m: 25.5, weather_code: 1 },
  hourly: { time: ['2026-06-22T00:00'], temperature_2m: [20], precipitation_probability: [10] },
};

describe('fetchWeather', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as Response);
  });
  afterEach(() => { vi.restoreAllMocks(); });

  it('fetches weather with correct params', async () => {
    await fetchWeather(37.5, 127);
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('api.open-meteo.com/v1/forecast'));
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('latitude=37.5'));
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('longitude=127'));
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('timezone=Asia%2FSeoul'));
  });

  it('returns parsed weather data', async () => {
    const result = await fetchWeather(37.5, 127);
    expect(result.current.temperature_2m).toBe(25.5);
    expect(result.hourly.precipitation_probability).toEqual([10]);
  });

  it('throws on non-OK response', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 } as Response);
    await expect(fetchWeather(37.5, 127)).rejects.toThrow(/500/);
  });

  it('throws on invalid schema', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ invalid: 'shape' }),
    } as Response);
    await expect(fetchWeather(37.5, 127)).rejects.toThrow();
  });
});
