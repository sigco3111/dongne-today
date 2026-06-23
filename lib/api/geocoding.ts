import { searchAddressNominatim } from './nominatim';
import type { NominatimSearchResult } from './schemas';

export interface GeocodingResult {
  name: string;
  lat: number;
  lon: number;
  displayName?: string;
  type?: string;
}

/**
 * 한글/영어 모두 지원하는 주소 검색.
 * Nominatim 사용 (Open-Meteo Geocoding 은 한글 미지원 + 행정구역 인식 약함).
 * NominatimSearchResult → GeocodingResult 매핑.
 */
export async function searchAddress(query: string, count = 5): Promise<GeocodingResult[]> {
  const results = await searchAddressNominatim(query, count);
  return results.map((r: NominatimSearchResult) => ({
    name: r.display_name,
    lat: parseFloat(r.lat),
    lon: parseFloat(r.lon),
    displayName: r.display_name,
    type: r.type,
  }));
}
