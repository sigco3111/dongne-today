import { WeatherResponseSchema, type WeatherResponse } from './schemas';
import type { WeatherData } from '@/types';

const BASE_URL = 'https://api.open-meteo.com/v1/forecast';

const CURRENT_FIELDS = [
  'temperature_2m',
  'weather_code',
  'apparent_temperature',
  'wind_speed_10m',
  'wind_direction_10m',
  'relative_humidity_2m',
  'uv_index',
  'uv_index_clear_sky',
].join(',');

const HOURLY_FIELDS = [
  'temperature_2m',
  'precipitation_probability',
  'apparent_temperature',
  'wind_speed_10m',
  'uv_index',
  'uv_index_clear_sky',
].join(',');

const DAILY_FIELDS = [
  'sunrise',
  'sunset',
  'daylight_duration',
  'weather_code',
  'temperature_2m_max',
  'temperature_2m_min',
  'precipitation_sum',
  'precipitation_probability_max',
  'uv_index_max',
].join(',');

/** WeatherResponse → WeatherData 변환. null 배열을 0으로 정규화. */
function toWeatherData(res: WeatherResponse): WeatherData {
  const nz = <T,>(arr: Array<T | null>): T[] => arr.map((v) => (v ?? 0) as T);
  const nzInt = (arr: Array<number | null>): number[] => arr.map((v) => (v ?? 0));
  return {
    current: res.current,
    hourly: {
      time: res.hourly.time,
      temperature_2m: nz(res.hourly.temperature_2m),
      precipitation_probability: nzInt(res.hourly.precipitation_probability),
      apparent_temperature: nz(res.hourly.apparent_temperature),
      wind_speed_10m: nz(res.hourly.wind_speed_10m),
      uv_index: nz(res.hourly.uv_index),
      weather_code: [],
    },
    daily: {
      time: res.daily.time,
      sunrise: res.daily.sunrise,
      sunset: res.daily.sunset,
      daylight_duration: nz(res.daily.daylight_duration),
      weather_code: res.daily.weather_code,
      temperature_2m_max: nz(res.daily.temperature_2m_max),
      temperature_2m_min: nz(res.daily.temperature_2m_min),
      precipitation_sum: nz(res.daily.precipitation_sum),
      precipitation_probability_max: nzInt(res.daily.precipitation_probability_max),
      uv_index_max: nz(res.daily.uv_index_max),
    },
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * Open-Meteo 통합 fetch — current + hourly + daily 모두 한 번에.
 * WeatherCard(24h 기온) / UVCard(자외선) / SunCard(일출/일몰) / WeeklyCard(7일) / PrecipitationCard(강수)
 * 가 이 단일 fetch 결과를 공유 — 외부 API 호출 횟수 불변.
 */
export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const url = new URL(BASE_URL);
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lon));
  url.searchParams.set('current', CURRENT_FIELDS);
  url.searchParams.set('hourly', HOURLY_FIELDS);
  url.searchParams.set('daily', DAILY_FIELDS);
  url.searchParams.set('timezone', 'Asia/Seoul');
  url.searchParams.set('forecast_days', '7');

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Weather API failed: ${res.status}`);
  }
  const json = await res.json();
  const parsed = WeatherResponseSchema.parse(json);
  return toWeatherData(parsed);
}