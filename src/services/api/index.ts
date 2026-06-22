/**
 * 우리 동네 오늘 — 6종 데이터 통합 fetch
 *
 * Phase 2 (6/21-22) 체크리스트 기준:
 * - 우리 동네 데이터 5종 병렬 fetch (Promise.all)
 * - 친구 동네는 weather만 비교용으로 fetch
 * - 30분 캐시는 types/index.ts의 CACHE_TTL_MS 사용
 */

import type {
  DashboardData,
  Neighborhood,
  FriendNeighborhood,
} from '../../types';
import { storage } from '../storage';
import { weather } from './weather';
import { airQuality } from './airQuality';
import { precipitation } from './precipitation';
import { holidays } from './holidays';
import { decideCharacter } from '../../utils/characterEngine';

export async function fetchAllData(
  neighborhood: Neighborhood,
  friends: FriendNeighborhood[] = [],
): Promise<DashboardData> {
  const [weatherData, airQualityData, precipitationData, holidayData] =
    await Promise.all([
      weather.fetch(neighborhood),
      airQuality.fetch(neighborhood),
      precipitation.fetch(neighborhood),
      holidays.fetchToday(),
    ]);

  const friendsWeather = await Promise.all(
    friends.map(async (friend) => ({
      friend,
      weather: await weather.fetch(friend),
    })),
  );

  const character = decideCharacter({
    weather: weatherData,
    airQuality: airQualityData,
    precipitation: precipitationData,
    holiday: holidayData,
  });

  return {
    neighborhood,
    weather: weatherData,
    airQuality: airQualityData,
    precipitation: precipitationData,
    holiday: holidayData,
    character,
    friendsWeather,
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * 캐시 확인 → fetch → 캐시 저장 (단일 진입점)
 * - 캐시 유효 시 즉시 반환
 * - fetch 실패 시 캐시 fallback (있는 경우)
 */
export async function getDashboard(
  neighborhood: Neighborhood,
  friends: FriendNeighborhood[] = [],
): Promise<DashboardData> {
  if (await storage.isCacheValid()) {
    const cached = await storage.getCachedReport();
    if (cached) return cached.data;
  }

  try {
    const fresh = await fetchAllData(neighborhood, friends);
    await storage.setCachedReport(fresh);
    return fresh;
  } catch (e) {
    // 네트워크 실패 → 캐시 fallback
    const cached = await storage.getCachedReport();
    if (cached) return cached.data;
    throw e;
  }
}