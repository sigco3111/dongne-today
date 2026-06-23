import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { searchAddress } from './geocoding';

const mockNominatimResponse = [
  {
    place_id: 1,
    lat: '37.5665',
    lon: '126.9780',
    display_name: '강남구, 서울특별시, 대한민국',
    name: '강남구',
    type: 'district',
    importance: 0.8,
  },
];

describe('searchAddress (Nominatim wrapper)', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockNominatimResponse,
    } as Response);
  });
  afterEach(() => { vi.restoreAllMocks(); });

  it('returns empty array for empty query', async () => {
    expect(await searchAddress('')).toEqual([]);
  });

  it('returns parsed results with displayName and lat/lon as numbers', async () => {
    const result = await searchAddress('강남구');
    expect(result).toHaveLength(1);
    expect(result[0].lat).toBe(37.5665);
    expect(result[0].lon).toBe(126.9780);
    expect(result[0].displayName).toContain('강남구');
  });

  it('returns empty array when no results', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => [] } as Response);
    expect(await searchAddress('xyzxyz')).toEqual([]);
  });

  it('throws on non-OK response', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 } as Response);
    await expect(searchAddress('Seoul')).rejects.toThrow();
  });
});
