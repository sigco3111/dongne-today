import {
  NominatimResponseSchema,
  NominatimSearchResponseSchema,
  type NominatimResponse,
  type NominatimSearchResult,
} from './schemas';

const REVERSE_URL = 'https://nominatim.openstreetmap.org/reverse';
const SEARCH_URL = 'https://nominatim.openstreetmap.org/search';

// Nominatim rate limit: 1 req/sec — 양 reverse/search 공유 throttle
let lastCallAt = 0;
const MIN_INTERVAL = 1100;

async function throttle() {
  const now = Date.now();
  const wait = MIN_INTERVAL - (now - lastCallAt);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastCallAt = Date.now();
}

export async function reverseGeocode(lat: number, lon: number): Promise<NominatimResponse | null> {
  await throttle();

  const url = new URL(REVERSE_URL);
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

/**
 * 한글/영어 모두 지원하는 주소 검색.
 * Open-Meteo Geocoding 은 영어 + 행정구역 인식 약함 → Nominatim 우선.
 * 결과: 한국어 display_name + 좌표.
 */
export async function searchAddressNominatim(query: string, limit = 5): Promise<NominatimSearchResult[]> {
  if (!query.trim()) return [];
  await throttle();

  const url = new URL(SEARCH_URL);
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'json');
  url.searchParams.set('accept-language', 'ko');
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('addressdetails', '1');
  // 한국 결과 우선 + 한국 행정구역 포함
  url.searchParams.set('countrycodes', 'kr');

  const res = await fetch(url.toString(), {
    headers: { 'User-Agent': 'dongne-today/1.0' },
  });
  if (!res.ok) throw new Error(`Nominatim search failed: ${res.status}`);
  const json = await res.json();
  return NominatimSearchResponseSchema.parse(json);
}
