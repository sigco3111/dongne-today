import { PrecipitationResponseSchema, type PrecipitationResponse } from './schemas';
import type { PrecipitationData } from '@/types';

const BASE_URL = 'https://api.open-meteo.com/v1/forecast';

function nzInt(arr: Array<number | null>): number[] {
  return arr.map((v) => (v ?? 0));
}

function toPrecipitationData(res: PrecipitationResponse): PrecipitationData {
  const hourly = {
    time: res.hourly.time,
    precipitation: nzInt(res.hourly.precipitation),
    precipitation_probability: nzInt(res.hourly.precipitation_probability),
  };
  const daily = {
    time: res.daily.time,
    precipitation_sum: nzInt(res.daily.precipitation_sum),
    precipitation_probability_max: nzInt(res.daily.precipitation_probability_max),
  };
  return {
    hourly,
    daily,
    todaySum: daily.precipitation_sum[0] ?? 0,
    todayProbabilityMax: daily.precipitation_probability_max[0] ?? 0,
    fetchedAt: new Date().toISOString(),
  };
}

export async function fetchPrecipitation(lat: number, lon: number): Promise<PrecipitationData> {
  const url = new URL(BASE_URL);
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lon));
  url.searchParams.set('daily', 'precipitation_sum,precipitation_probability_max');
  url.searchParams.set('hourly', 'precipitation,precipitation_probability');
  url.searchParams.set('forecast_days', '7');
  url.searchParams.set('timezone', 'Asia/Seoul');

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Precipitation API failed: ${res.status}`);
  return toPrecipitationData(PrecipitationResponseSchema.parse(await res.json()));
}