'use client';
import { useEffect, useState, useCallback } from 'react';
import { storage } from '@/lib/storage';
import type { Neighborhood } from '@/types';

const KEY = 'friendNeighborhoods' as const;
const MAX_FRIENDS = 5;

/**
 * 비교용 "친구 동네" 목록 (최대 5개).
 * - add(n): 5개 초과 시 silent drop, 변경분만 storage.set 호출.
 * - remove(index): 인덱스 기반 제거.
 */
export function useFriends() {
  const [friends, setFriends] = useState<Neighborhood[]>([]);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const stored = storage.get<Neighborhood[]>(KEY) ?? [];
    setFriends(stored);
    setLoading(false);
  }, []);

  const add = useCallback((n: Neighborhood) => {
    setFriends((prev) => {
      if (prev.length >= MAX_FRIENDS) return prev;
      const next = [...prev, n];
      storage.set(KEY, next);
      return next;
    });
  }, []);

  const remove = useCallback((index: number) => {
    setFriends((prev) => {
      const next = prev.filter((_, i) => i !== index);
      storage.set(KEY, next);
      return next;
    });
  }, []);

  return { friends, isLoading, add, remove, maxFriends: MAX_FRIENDS };
}
