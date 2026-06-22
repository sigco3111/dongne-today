'use client';
import { useEffect, useState } from 'react';
import { storage } from '@/lib/storage';
import type { Neighborhood } from '@/types';

const KEY = 'neighborhood' as const;

/**
 * 단일 "내 동네" 상태를 localStorage 에 동기화.
 * - 마운트 시 storage 에서 hydrate, isLoading=false 로 전환.
 * - save(n): 저장 + state 업데이트 (동기).
 * - clear(): 제거 + state 비움.
 */
export function useNeighborhood() {
  const [neighborhood, setNeighborhood] = useState<Neighborhood | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const stored = storage.get<Neighborhood>(KEY);
    setNeighborhood(stored);
    setLoading(false);
  }, []);

  const save = (n: Neighborhood) => {
    storage.set(KEY, n);
    setNeighborhood(n);
  };

  const clear = () => {
    storage.remove(KEY);
    setNeighborhood(null);
  };

  return { neighborhood, isLoading, save, clear };
}
