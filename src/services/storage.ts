/**
 * 우리 동네 오늘 — 저장소 키 헬퍼
 *
 * 토스 SDK Storage는 string ↔ string만 지원.
 * JSON 직렬화/역직렬화 + 타입 안전성을 보장하는 래퍼.
 *
 * 캐시 무효화 정책:
 * - 30분 캐시는 CACHE_TTL_MS 상수 사용 (types/index.ts)
 * - 같은 날 재방문 시 즉시 반환
 */

import { Storage } from '@apps-in-toss/framework';
import type {
  Neighborhood,
  FriendNeighborhood,
  DashboardData,
  CachedReport,
  StorageKeys,
} from '../types';
import { CACHE_TTL_MS } from '../types';

async function getJson<K extends keyof StorageKeys>(
  key: K,
): Promise<StorageKeys[K] | null> {
  const raw = await Storage.getItem(key);
  if (raw == null) return null;
  try {
    return JSON.parse(raw) as StorageKeys[K];
  } catch {
    return null;
  }
}

async function setJson<K extends keyof StorageKeys>(
  key: K,
  value: StorageKeys[K],
): Promise<void> {
  await Storage.setItem(key, JSON.stringify(value));
}

export const storage = {
  // === 우리 동네 ===
  async getNeighborhood(): Promise<Neighborhood | null> {
    return getJson('neighborhood');
  },
  async setNeighborhood(n: Neighborhood): Promise<void> {
    await setJson('neighborhood', n);
  },

  // === 친구 동네 목록 (최대 5개) ===
  async getFriendNeighborhoods(): Promise<FriendNeighborhood[]> {
    return (await getJson('friendNeighborhoods')) ?? [];
  },
  async addFriendNeighborhood(friend: FriendNeighborhood): Promise<void> {
    const list = await storage.getFriendNeighborhoods();
    const next = [...list, friend].slice(-5);
    await setJson('friendNeighborhoods', next);
  },
  async removeFriendNeighborhood(index: number): Promise<void> {
    const list = await storage.getFriendNeighborhoods();
    list.splice(index, 1);
    await setJson('friendNeighborhoods', list);
  },
  async setFriendNeighborhoods(list: FriendNeighborhood[]): Promise<void> {
    await setJson('friendNeighborhoods', list.slice(0, 5));
  },

  // === 마지막 방문일 ===
  async getLastVisitDate(): Promise<string | null> {
    return getJson('lastVisitDate');
  },
  async setLastVisitDate(date: string): Promise<void> {
    await setJson('lastVisitDate', date);
  },

  // === 캐시 (30분) ===
  async getCachedReport(): Promise<CachedReport<DashboardData> | null> {
    return getJson('cachedReport');
  },
  async setCachedReport(report: DashboardData): Promise<void> {
    const cached: CachedReport<DashboardData> = {
      data: report,
      timestamp: Date.now(),
    };
    await setJson('cachedReport', cached);
  },
  async isCacheValid(): Promise<boolean> {
    const cached = await storage.getCachedReport();
    if (!cached) return false;
    return Date.now() - cached.timestamp < CACHE_TTL_MS;
  },
  async clearCache(): Promise<void> {
    await Storage.removeItem('cachedReport');
  },

  // === 온보딩 완료 여부 ===
  async isOnboardingDone(): Promise<boolean> {
    return (await getJson('onboardingDone')) ?? false;
  },
  async setOnboardingDone(): Promise<void> {
    await setJson('onboardingDone', true);
  },

  // === 전체 초기화 (디버그용) ===
  async clearAll(): Promise<void> {
    await Storage.clearItems();
  },
};