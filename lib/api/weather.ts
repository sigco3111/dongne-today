import { WeatherResponseSchema, type WeatherResponse } from './schemas';

const BASE_URL = 'https://api.open-meteo.com/v1/forecast';

export async function fetchWeather(lat: number, lon: number): Promise<WeatherResponse> {
  const url = new URL(BASE_URL);
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lon));
  url.searchParams.set('current', 'temperature_2m,weather_code');
  url.searchParams.set('hourly', 'temperature_2m,precipitation_probability');
  url.searchParams.set('timezone', 'Asia/Seoul');
  url.searchParams.set('forecast_days', '1');

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Weather API failed: ${res.status}`);
  }
  const json = await res.json();
  return WeatherResponseSchema.parse(json);
}
