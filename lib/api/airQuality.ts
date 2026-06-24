import { AirQualityResponseSchema, type AirQualityResponse } from './schemas';
import type { AirQualityData } from '@/types';

const BASE_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';

function gradePm25(pm25: number): AirQualityData['level'] {
  if (pm25 <= 15) return 'good';
  if (pm25 <= 35) return 'moderate';
  if (pm25 <= 75) return 'bad';
  return 'very_bad';
}

export function toAirQualityData(res: AirQualityResponse): AirQualityData {
  return {
    current: {
      pm2_5: res.current.pm2_5,
      pm10: res.current.pm10,
      ozone: res.current.ozone,
      europeanAqi: res.current.european_aqi,
      time: res.current.time,
    },
    level: gradePm25(res.current.pm2_5),
    fetchedAt: new Date().toISOString(),
  };
}

export async function fetchAirQuality(lat: number, lon: number): Promise<AirQualityData> {
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
  return toAirQualityData(AirQualityResponseSchema.parse(json));
}