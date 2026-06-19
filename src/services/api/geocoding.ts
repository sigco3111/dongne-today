/**
 * 주소 ↔ 좌표 변환
 * - forward (주소 → 좌표): Open-Meteo Geocoding
 * - reverse (좌표 → 주소): Nominatim OpenStreetMap
 *
 * 두 API 모두 무키, 영구 무료, CORS 허용.
 * Nominatim은 1 req/sec rate limit이 있어 throttle 필요.
 */

import type { Neighborhood, Coordinates } from '../../types';

const FORWARD_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const REVERSE_URL = 'https://nominatim.openstreetmap.org/reverse';

interface OpenMeteoGeocodingResponse {
  results?: Array<{
    latitude: number;
    longitude: number;
    name: string;
    country: string;
    admin1?: string;
    admin2?: string;
    admin3?: string;
  }>;
}

interface NominatimReverseResponse {
  address?: {
    city?: string;
    county?: string;
    state?: string;
    suburb?: string;
    neighbourhood?: string;
  };
  display_name?: string;
}

// Nominatim 1 req/sec throttle
let lastReverseCallAt = 0;

export const geocoding = {
  /** 주소 → 좌표 */
  async forward(query: string): Promise<Neighborhood[]> {
    const params = new URLSearchParams({
      // 한글 query는 URL 인코딩 필수 — 403 Forbidden 방지
      name: query,
      count: '5',
      language: 'ko',
      format: 'json',
    });
    const res = await fetch(`${FORWARD_URL}?${params.toString()}`);
    if (!res.ok) {
      throw new Error(`Geocoding API failed: ${res.status}`);
    }
    const json: OpenMeteoGeocodingResponse = await res.json();
    return (json.results ?? []).map((r) => ({
      name: r.name,
      district: r.admin2 ?? r.admin1,
      lat: r.latitude,
      lon: r.longitude,
    }));
  },

  /** 좌표 → 행정구역 이름 (한국어 우선) */
  async reverse(lat: number, lon: number): Promise<string> {
    // throttle: 최소 1초 간격
    const now = Date.now();
    const wait = Math.max(0, 1000 - (now - lastReverseCallAt));
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    lastReverseCallAt = Date.now();

    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lon.toString(),
      format: 'json',
      'accept-language': 'ko',
      zoom: '10',
    });
    const res = await fetch(`${REVERSE_URL}?${params}`, {
      headers: { 'User-Agent': 'dongne-today/0.1 (sigco3111)' },
    });
    if (!res.ok) {
      throw new Error(`Reverse Geocoding API failed: ${res.status}`);
    }
    const json: NominatimReverseResponse = await res.json();
    const a = json.address;
    return (
      a?.suburb ??
      a?.neighbourhood ??
      a?.county ??
      a?.city ??
      json.display_name?.split(',')[0]?.trim() ??
      '알 수 없는 동네'
    );
  },
};