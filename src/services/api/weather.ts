/**
 * Open-Meteo Forecast — 날씨
 * https://api.open-meteo.com/v1/forecast
 * 무키, 영구 무료, CORS 허용
 */

import type { WeatherData, Coordinates } from '../../types';

const BASE_URL = 'https://api.open-meteo.com/v1/forecast';

interface OpenMeteoForecastResponse {
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
  };
  current: {
    time: string;
    temperature_2m: number;
    weather_code: number;
  };
}

export const weather = {
  async fetch({ lat, lon }: Coordinates): Promise<WeatherData> {
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      current: 'temperature_2m,weather_code',
      hourly: 'temperature_2m,weather_code',
      forecast_days: '1',
      timezone: 'auto',
    });
    const res = await fetch(`${BASE_URL}?${params}`);
    if (!res.ok) {
      throw new Error(`Weather API failed: ${res.status}`);
    }
    const json: OpenMeteoForecastResponse = await res.json();
    return {
      hourly: json.hourly,
      current: json.current,
      fetchedAt: new Date().toISOString(),
    };
  },
};

/** weather_code → 한글 라벨 + 이모지 */
export const WEATHER_CODE_MAP: Record<
  number,
  { label: string; emoji: string }
> = {
  0: { label: '맑음', emoji: '☀️' },
  1: { label: '대체로 맑음', emoji: '🌤️' },
  2: { label: '구름 조금', emoji: '⛅' },
  3: { label: '흐림', emoji: '☁️' },
  45: { label: '안개', emoji: '🌫️' },
  48: { label: '서리 안개', emoji: '🌫️' },
  51: { label: '이슬비', emoji: '🌦️' },
  53: { label: '이슬비', emoji: '🌦️' },
  55: { label: '강한 이슬비', emoji: '🌧️' },
  61: { label: '비', emoji: '🌧️' },
  63: { label: '비', emoji: '🌧️' },
  65: { label: '강한 비', emoji: '⛈️' },
  71: { label: '눈', emoji: '🌨️' },
  73: { label: '눈', emoji: '🌨️' },
  75: { label: '강한 눈', emoji: '❄️' },
  80: { label: '소나기', emoji: '🌦️' },
  81: { label: '소나기', emoji: '🌧️' },
  82: { label: '강한 소나기', emoji: '⛈️' },
  95: { label: '천둥번개', emoji: '⛈️' },
  96: { label: '우박', emoji: '🌨️' },
  99: { label: '강한 우박', emoji: '🌨️' },
};

export function getWeatherLabel(code: number): { label: string; emoji: string } {
  return WEATHER_CODE_MAP[code] ?? { label: '알 수 없음', emoji: '🌡️' };
}