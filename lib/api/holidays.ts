import { z } from 'zod';
import { PublicHolidaySchema, type PublicHoliday } from './schemas';

const BASE_URL = 'https://date.nager.at/api/v3/PublicHolidays';

export async function fetchHolidays(year: number): Promise<PublicHoliday[]> {
  const url = `${BASE_URL}/${year}/KR`;
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error(`Holidays API failed: ${res.status}`);
  const json = await res.json();
  return z.array(PublicHolidaySchema).parse(json);
}
