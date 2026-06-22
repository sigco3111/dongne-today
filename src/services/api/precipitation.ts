/**
 * Open-Meteo Forecast — 강수 확률 / 강수량
 * https://api.open-meteo.com/v1/forecast
 * 무키, 영구 무료, CORS 허용
 *
 * 전국 단위 데이터 (서울 따릉이 한계를 전국 커버리지로 확장).
 * hourly: 다음 7일 시간별 강수량(mm) + 강수확률(%)
 * daily : 다음 7일 일별 강수량 합계(mm) + 일 최대 강수확률(%)
 */

import type { PrecipitationData, Coordinates } from '../../types';

const BASE_URL = 'https://api.open-meteo.com/v1/forecast';

interface OpenMeteoForecastResponse {
  hourly: {
    time: string[];
    precipitation: number[];
    precipitation_probability: number[];
  };
  daily: {
    time: string[];
    precipitation_sum: number[];
    precipitation_probability_max: number[];
  };
}

export const precipitation = {
  async fetch({ lat, lon }: Coordinates): Promise<PrecipitationData> {
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      daily: 'precipitation_sum,precipitation_probability_max',
      hourly: 'precipitation,precipitation_probability',
      forecast_days: '7',
      timezone: 'Asia/Seoul',
    });
    const res = await fetch(`${BASE_URL}?${params}`);
    if (!res.ok) {
      throw new Error(`Precipitation API failed: ${res.status}`);
    }
    const json: OpenMeteoForecastResponse = await res.json();

    // Open-Meteo daily[0]이 오늘 (Asia/Seoul TZ 기준)
    const todaySum = json.daily.precipitation_sum[0] ?? 0;
    const todayProbabilityMax =
      json.daily.precipitation_probability_max[0] ?? 0;

    return {
      hourly: json.hourly,
      daily: json.daily,
      todaySum,
      todayProbabilityMax,
      fetchedAt: new Date().toISOString(),
    };
  },
};
