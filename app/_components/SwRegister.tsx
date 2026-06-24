'use client';
import { useEffect } from 'react';

/**
 * Service Worker 등록 컴포넌트 — 마운트 시 1회 register.
 * SSR 안전 (typeof window 가드).
 * 오프라인 셸 + 정적 자산 캐시 사용.
 */
export function SwRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;
    if (process.env.NODE_ENV !== 'production') return; // dev에서는 SW 비활성 (HMR 충돌 방지)
    navigator.serviceWorker
      .register('/sw.js')
      .catch((err) => {
        if (typeof console !== 'undefined') {
          console.warn('[SW] registration failed:', err);
        }
      });
  }, []);
  return null;
}
