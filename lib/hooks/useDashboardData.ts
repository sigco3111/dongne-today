'use client';
import useSWR from 'swr';
import { fetchWeather } from '@/lib/api/weather';
import { fetchAirQuality } from '@/lib/api/airQuality';
import { fetchPrecipitation } from '@/lib/api/precipitation';
import type {
  WeatherData,
  AirQualityData,
  PrecipitationData,
} from '@/types';

export interface DashboardData {
  weather: WeatherData;
  airQuality: AirQualityData;
  precipitation: PrecipitationData;
}

async function fetcher([, lat, lon]: [string, number, number]): Promise<DashboardData> {
  const [weather, airQuality, precipitation] = await Promise.all([
    fetchWeather(lat, lon),
    fetchAirQuality(lat, lon),
    fetchPrecipitation(lat, lon),
  ]);
  return { weather, airQuality, precipitation };
}

/**
 * 대시보드 3종 데이터 병렬 fetch + SWR 캐싱.
 * - 키: ['dashboard', lat, lon] — 동네 변경 시 자동 refetch.
 * - refreshInterval: 30분 — 외부 API 갱신 주기와 맞춤.
 * - keepPreviousData: 동네 전환 시 깜빡임 방지.
 *
 * weather 응답은 통합 (current + hourly + daily 7일) — 단일 fetch로 6종 카드 지원.
 */
export function useDashboardData(neighborhood: { lat: number; lon: number } | null) {
  const key = neighborhood
    ? (['dashboard', neighborhood.lat, neighborhood.lon] as const)
    : null;
  const { data, error, isLoading, mutate } = useSWR<DashboardData, Error>(key, fetcher, {
    refreshInterval: 30 * 60 * 1000,
    dedupingInterval: 30 * 60 * 1000,
    revalidateOnFocus: true,
    keepPreviousData: true,
  });
  return { data, error, isLoading, refresh: mutate };
}