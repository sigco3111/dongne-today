'use client';

// SSR-safe localStorage wrapper. Typed get/set with silent failure on parse / quota errors.
// Server-rendering(RSC) 환경에서 호출되어도 안전하도록 가드.
// vitest jsdom 환경에서는 globalThis.localStorage를 사용 (window.localStorage가 노출되지 않음).

type LS = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

function pickLS(): LS | null {
  // Next.js SSR/edge runtime: window.localStorage가 메서드 없는 stub일 수 있어 확인 필수
  if (
    typeof window !== 'undefined' &&
    typeof window.localStorage !== 'undefined' &&
    typeof window.localStorage.getItem === 'function'
  ) {
    return window.localStorage;
  }
  if (typeof globalThis !== 'undefined') {
    const g = (globalThis as { localStorage?: LS }).localStorage;
    if (g && typeof g.getItem === 'function') {
      return g;
    }
  }
  return null;
}

export const storage = {
  get<T>(key: string): T | null {
    const ls = pickLS();
    if (!ls) return null;
    try {
      const raw = ls.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch (err) {
      if (typeof console !== 'undefined') {
        console.warn('[storage] get parse failed:', key, err);
      }
      return null;
    }
  },
  set<T>(key: string, value: T): void {
    const ls = pickLS();
    if (!ls) {
      if (typeof console !== 'undefined') {
        console.warn('[storage] set skipped: no localStorage (SSR or browser disabled)');
      }
      return;
    }
    try {
      ls.setItem(key, JSON.stringify(value));
    } catch (err) {
      if (typeof console !== 'undefined') {
        console.warn('[storage] set failed:', key, err);
      }
    }
  },
  remove(key: string): void {
    const ls = pickLS();
    if (!ls) return;
    ls.removeItem(key);
  },
};
