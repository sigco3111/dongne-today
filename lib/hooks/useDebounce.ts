'use client';
import { useEffect, useState } from 'react';

/**
 * 디바운스된 값 반환 — 빠르게 변하는 값을 일정 시간(ms) 동안 묶음.
 * 검색 자동완성에 적합.
 */
export function useDebounce<T>(value: T, delayMs: number = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}
