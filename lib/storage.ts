'use client';

// SSR-safe localStorage wrapper. Typed get/set with silent failure on parse / quota errors.
// Server-rendering(RSC) 환경에서 호출되어도 안전하도록 isBrowser() 가드.

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export const storage = {
  get<T>(key: string): T | null {
    if (!isBrowser()) return null;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },
  set<T>(key: string, value: T): void {
    if (!isBrowser()) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // quota exceeded — silent
    }
  },
  remove(key: string): void {
    if (!isBrowser()) return;
    window.localStorage.removeItem(key);
  },
};
