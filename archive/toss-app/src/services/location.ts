/**
 * 우리 동네 오늘 — 위치 헬퍼
 *
 * 토스 SDK getCurrentLocation + Nominatim reverse geocoding을 묶어서
 * "현재 동네" 한 번에 얻기.
 */

import { getCurrentLocation, Accuracy, type Location } from '@apps-in-toss/framework';
import type { Neighborhood, Coordinates } from '../types';
import { geocoding } from './api/geocoding';

/** 토스 SDK에서 현재 위치 1회 받기 */
export async function getDeviceLocation(): Promise<Coordinates> {
  const location: Location = await getCurrentLocation({ accuracy: Accuracy.High });
  return { lat: location.coords.latitude, lon: location.coords.longitude };
}

/** 좌표 → 행정구역 이름 (예: "강남구") */
export async function reverseGeocode({ lat, lon }: Coordinates): Promise<string> {
  return geocoding.reverse(lat, lon);
}

/** 위치 + 동네명을 Neighborhood 객체로 변환 */
export async function detectNeighborhood(): Promise<Neighborhood> {
  const coords = await getDeviceLocation();
  const name = await reverseGeocode(coords);
  return { name, lat: coords.lat, lon: coords.lon };
}