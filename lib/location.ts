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