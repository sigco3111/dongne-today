import { PrecipitationResponseSchema, type PrecipitationResponse } from './schemas';

const BASE_URL = 'https://api.open-meteo.com/v1/forecast';

export async function fetchPrecipitation(lat: number, lon: number): Promise<PrecipitationResponse> {
  const url = new URL(BASE_URL);
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lon));
  url.searchParams.set('daily', 'precipitation_sum,precipitation_probability_max');
  url.searchParams.set('hourly', 'precipitation,precipitation_probability');
  url.searchParams.set('forecast_days', '7');
  url.searchParams.set('timezone', 'Asia/Seoul');

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Precipitation API failed: ${res.status}`);
  return PrecipitationResponseSchema.parse(await res.json());
}
