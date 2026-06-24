'use client';
import { useEffect, useRef } from 'react';
import { watchCoords, clearWatch } from '@/lib/location';
import { useNeighborhood } from './useNeighborhood';
import { reverseGeocode } from '@/lib/api/nominatim';
import { storage } from '@/lib/storage';

/**
 * 자동 위치 재감지 훅 — `enabled`가 true일 때만 watchPosition 시작.
 * - 좌표 변경 감지 → reverse geocode → 동네명 저장
 * - 거리 임계값 500m: 의미 있는 이동만 반영 (배터리/네트워크 절약)
 * - 페이지 언마운트 시 자동 cleanup.
 *
 * 주의: 모바일/배터리 영향 있음 → 사용자가 settings에서 명시적으로 켜야 함.
 */
export function useAutoRedetect(enabled: boolean): void {
  const { save } = useNeighborhood();
  const lastLat = useRef<number | null>(null);
  const lastLon = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === 'undefined' || !navigator.geolocation) return;

    const watchId = watchCoords(
      async ({ lat, lon }) => {
        // 초기화 또는 의미 있는 이동만 처리
        if (
          lastLat.current !== null &&
          lastLon.current !== null &&
          Math.abs(lat - lastLat.current) < 0.005 &&
          Math.abs(lon - lastLon.current) < 0.005
        ) {
          return; // ~500m 미만 이동은 무시
        }
        lastLat.current = lat;
        lastLon.current = lon;
        try {
          const rev = await reverseGeocode(lat, lon);
          const name =
            rev?.address?.suburb ?? rev?.address?.neighbourhood ?? rev?.address?.city ?? '현재 위치';
          const current = storage.get<{ name: string; lat: number; lon: number } | null>('neighborhood');
          // 동네 이름이 실제로 바뀌었을 때만 저장
          if (current?.name !== name) {
            save({ name, lat, lon });
          }
        } catch {
          // reverse geocode 실패는 silent — 다음 watchPosition에서 재시도
        }
      },
      () => {
        // 권한 거부 등 — 무시 (사용자가 명시적으로 켰어도 모바일 권한은 별도)
      },
    );

    return () => {
      clearWatch(watchId);
    };
  }, [enabled, save]);
}
