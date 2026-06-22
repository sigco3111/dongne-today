/**
 * Nager.Date — 공휴일
 * https://date.nager.at/api/v3/PublicHolidays/{year}/KR
 * 무키, 영구 무료, CORS 허용
 */

import type { HolidayData } from '../../types';

const BASE_URL = 'https://date.nager.at/api/v3/PublicHolidays';

interface NagerHoliday {
  date: string;
  localName: string;
  name: string;
  countryCode: string;
  fixed: boolean;
  global: boolean;
}

export const holidays = {
  async fetchToday(): Promise<HolidayData> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const year = today.getFullYear();

    // 올해 + 내년 공휴일 한 번에 받아서 다음 공휴일 계산
    const [thisYear, nextYear] = await Promise.all([
      holidays.fetchYear(year),
      holidays.fetchYear(year + 1),
    ]);
    const all = [...thisYear, ...nextYear];

    const todayIso = today.toISOString().slice(0, 10);
    const todayHoliday = all.find((h) => h.date === todayIso);
    const isWeekday = today.getDay() >= 1 && today.getDay() <= 5;

    const future = all
      .map((h) => ({ ...h, days: daysBetween(todayIso, h.date) }))
      .filter((h) => h.days >= 0)
      .sort((a, b) => a.days - b.days);
    const nextHoliday = future[0];

    return {
      isHoliday: !!todayHoliday,
      isWeekday,
      holidayName: todayHoliday?.localName ?? null,
      daysUntilNext: nextHoliday?.days ?? -1,
      fetchedAt: new Date().toISOString(),
    };
  },

  async fetchYear(year: number): Promise<NagerHoliday[]> {
    const res = await fetch(`${BASE_URL}/${year}/KR`);
    if (!res.ok) {
      throw new Error(`Holidays API failed: ${res.status}`);
    }
    return (await res.json()) as NagerHoliday[];
  },
};

function daysBetween(fromIso: string, toIso: string): number {
  const a = new Date(fromIso).getTime();
  const b = new Date(toIso).getTime();
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}