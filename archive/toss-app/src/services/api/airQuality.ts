/**
 * Open-Meteo Air Quality — 미세먼지 (PM2.5/PM10)
 * https://air-quality-api.open-meteo.com/v1/air-quality
 * 무키, 영구 무료, CORS 허용
 */

import type { AirQualityData, Coordinates } from '../../types';

const BASE_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';

interface OpenMeteoAirQualityResponse {
  current: {
    time: string;
    pm2_5: number;
    pm10: number;
  };
}

export const airQuality = {
  async fetch({ lat, lon }: Coordinates): Promise<AirQualityData> {
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      current: 'pm2_5,pm10',
      timezone: 'auto',
    });
    const res = await fetch(`${BASE_URL}?${params}`);
    if (!res.ok) {
      throw new Error(`AirQuality API failed: ${res.status}`);
    }
    const json: OpenMeteoAirQualityResponse = await res.json();
    const pm2_5 = json.current.pm2_5;
    return {
      current: json.current,
      level: classifyPM25(pm2_5),
      fetchedAt: new Date().toISOString(),
    };
  },
};

/** PM2.5 → 통합 등급 (한국 환경부 기준 단순화) */
function classifyPM25(value: number): AirQualityData['level'] {
  if (value <= 15) return 'good';
  if (value <= 35) return 'moderate';
  if (value <= 75) return 'bad';
  return 'very_bad';
}

export const AIR_QUALITY_LABEL: Record<
  AirQualityData['level'],
  { label: string; emoji: string; color: string }
> = {
  good: { label: '좋음', emoji: '😊', color: '#03B26C' },
  moderate: { label: '보통', emoji: '🙂', color: '#FFC342' },
  bad: { label: '나쁨', emoji: '😷', color: '#FF8A00' },
  very_bad: { label: '매우 나쁨', emoji: '😷', color: '#F04452' },
};