import { AirQualityResponseSchema, type AirQualityResponse } from './schemas';

const BASE_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';

export async function fetchAirQuality(lat: number, lon: number): Promise<AirQualityResponse> {
  const url = new URL(BASE_URL);
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lon));
  url.searchParams.set('current', 'pm10,pm2_5,ozone,european_aqi');
  url.searchParams.set('hourly', 'pm10,pm2_5');
  url.searchParams.set('timezone', 'Asia/Seoul');

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`AirQuality API failed: ${res.status}`);
  }
  const json = await res.json();
  return AirQualityResponseSchema.parse(json);
}
