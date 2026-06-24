'use client';

/**
 * navigator.geolocation 단발성 호출 — Promise 래퍼.
 * - enableHighAccuracy=false: 배터리/시간 절약
 * - timeout=10s: 응답 없으면 reject
 * - maximumAge=5min: 캐시된 좌표 재사용 (재요청 부담 경감)
 *
 * SSR / 미지원 환경에서는 즉시 reject.
 */
export function getCurrentCoords(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      reject(new Error('이 브라우저는 위치 서비스를 지원하지 않습니다.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => reject(new Error(err.message)),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 },
    );
  });
}
export type Coords = { lat: number; lon: number };

/**
 * navigator.geolocation.watchPosition 단발성 호출 — 콜백으로 좌표 수신.
 * - enableHighAccuracy=false: 배터리/시간 절약
 * - timeout=10s: 응답 없으면 reject (초기 1회)
 * - maximumAge=1min: 빠른 업데이트
 * - 거리 임계값 100m: 동네 단위 (시 단위 이동 감지)
 *
 * SSR / 미지원 환경에서는 reject.
 * 반환: watch ID (cleanup 시 clearWatch에 넘김)
 */
export function watchCoords(
  onChange: (coords: Coords) => void,
  onError?: (err: Error) => void,
): number {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    onError?.(new Error('이 브라우저는 위치 서비스를 지원하지 않습니다.'));
    return -1;
  }
  return navigator.geolocation.watchPosition(
    (pos) => onChange({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
    (err) => onError?.(new Error(err.message)),
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 60 * 1000 },
  );
}

/**
 * watchPosition cleanup. SSR 환경에서는 silent noop.
 */
export function clearWatch(watchId: number): void {
  if (typeof window === 'undefined' || !navigator.geolocation || watchId < 0) return;
  navigator.geolocation.clearWatch(watchId);
}