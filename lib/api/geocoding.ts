import { GeocodingResponseSchema, type GeocodingResult } from './schemas';

const BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';

export async function searchAddress(query: string, count = 5): Promise<GeocodingResult[]> {
  if (!query.trim()) return [];
  const url = new URL(BASE_URL);
  url.searchParams.set('name', query);
  url.searchParams.set('count', String(count));
  url.searchParams.set('language', 'en');
  url.searchParams.set('format', 'json');

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Geocoding API failed: ${res.status}`);
  const json = await res.json();
  return GeocodingResponseSchema.parse(json).results ?? [];
}
