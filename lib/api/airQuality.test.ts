import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchAirQuality } from './airQuality';

const mockResponse = {
  current: { pm10: 20, pm2_5: 15, ozone: 50, european_aqi: 30 },
  hourly: { pm10: [20, 22], pm2_5: [15, 17] },
};

describe('fetchAirQuality', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => mockResponse } as Response);
  });
  afterEach(() => { vi.restoreAllMocks(); });

  it('fetches from air-quality-api.open-meteo.com', async () => {
    await fetchAirQuality(37.5, 127);
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('air-quality-api.open-meteo.com'));
  });

  it('returns parsed air quality data', async () => {
    const result = await fetchAirQuality(37.5, 127);
    expect(result.current.pm2_5).toBe(15);
  });

  it('throws on non-OK response', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 503 } as Response);
    await expect(fetchAirQuality(37.5, 127)).rejects.toThrow(/503/);
  });
});
