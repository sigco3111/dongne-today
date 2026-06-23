import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { searchAddress } from './geocoding';

const mockResponse = {
  results: [
    { id: 1, name: 'Seoul', latitude: 37.5665, longitude: 126.9780, country_code: 'KR' },
  ],
};

describe('searchAddress', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => mockResponse } as Response);
  });
  afterEach(() => { vi.restoreAllMocks(); });

  it('returns empty array for empty query', async () => {
    expect(await searchAddress('')).toEqual([]);
  });

  it('returns parsed results', async () => {
    const result = await searchAddress('Seoul');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Seoul');
  });

  it('returns empty array when no results', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) } as Response);
    expect(await searchAddress('xyzxyz')).toEqual([]);
  });

  it('throws on non-OK response', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 } as Response);
    await expect(searchAddress('Seoul')).rejects.toThrow();
  });
});
