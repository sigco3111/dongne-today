import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchPrecipitation } from './precipitation';

const mockResponse = {
  daily: { time: ['2026-06-22'], precipitation_sum: [0.5], precipitation_probability_max: [25] },
  hourly: { time: ['2026-06-22T00:00'], precipitation: [0.1], precipitation_probability: [20] },
};

describe('fetchPrecipitation', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => mockResponse } as Response);
  });
  afterEach(() => { vi.restoreAllMocks(); });

  it('fetches with daily and hourly precipitation params', async () => {
    await fetchPrecipitation(37.5, 127);
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('daily=precipitation'));
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('hourly=precipitation'));
  });

  it('returns parsed precipitation data', async () => {
    const result = await fetchPrecipitation(37.5, 127);
    expect(result.daily.precipitation_sum[0]).toBe(0.5);
  });

  it('throws on non-OK response', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 } as Response);
    await expect(fetchPrecipitation(37.5, 127)).rejects.toThrow();
  });
});
