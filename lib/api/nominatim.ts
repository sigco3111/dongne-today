import { NominatimResponseSchema, type NominatimResponse } from './schemas';

const BASE_URL = 'https://nominatim.openstreetmap.org/reverse';

// Nominatim rate limit: 1 req/sec
let lastCallAt = 0;
const MIN_INTERVAL = 1100;

export async function reverseGeocode(lat: number, lon: number): Promise<NominatimResponse | null> {
  const now = Date.now();
  const wait = MIN_INTERVAL - (now - lastCallAt);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastCallAt = Date.now();

  const url = new URL(BASE_URL);
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('lon', String(lon));
  url.searchParams.set('format', 'json');
  url.searchParams.set('accept-language', 'ko');

  const res = await fetch(url.toString(), {
    headers: { 'User-Agent': 'dongne-today/1.0' },
  });
  if (!res.ok) throw new Error(`Nominatim API failed: ${res.status}`);
  return NominatimResponseSchema.parse(await res.json());
}
