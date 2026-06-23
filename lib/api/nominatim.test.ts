import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { reverseGeocode } from './nominatim';

const mockResponse = {
  address: { suburb: '강남구', neighbourhood: '역삼동', city: '서울특별시' },
};

describe('reverseGeocode', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => mockResponse } as Response);
  });
  afterEach(() => { vi.restoreAllMocks(); });

  it('returns parsed address', async () => {
    const result = await reverseGeocode(37.5, 127);
    expect(result?.address?.suburb).toBe('강남구');
  });

  it('throttles consecutive calls (1+ second)', async () => {
    const start = Date.now();
    await reverseGeocode(37.5, 127);
    await reverseGeocode(37.6, 127.1);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(1000);
  });

  it('throws on non-OK response', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 } as Response);
    await expect(reverseGeocode(37.5, 127)).rejects.toThrow();
  });
});
