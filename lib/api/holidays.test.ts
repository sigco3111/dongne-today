import { describe, it, expect, vi } from 'vitest';
import { fetchHolidays } from './holidays';

const mockHolidays = [
  { date: '2026-01-01', localName: '새해', name: "New Year's Day", global: true, types: ['Public'] },
];

describe('fetchHolidays', () => {
  it('fetches from date.nager.at with KR country', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => mockHolidays } as Response);
    await fetchHolidays(2026);
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('2026/KR'), expect.any(Object));
  });

  it('returns parsed holidays', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => mockHolidays } as Response);
    const result = await fetchHolidays(2026);
    expect(result[0].localName).toBe('새해');
  });

  it('throws on non-OK response', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 } as Response);
    await expect(fetchHolidays(2026)).rejects.toThrow();
  });
});
