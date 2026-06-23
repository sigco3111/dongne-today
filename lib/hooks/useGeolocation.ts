'use client';
import { useState, useCallback } from 'react';

export interface Coords {
  lat: number;
  lon: number;
}

export type GeolocationState = {
  coordinates: Coords | null;
  error: string | null;
  loading: boolean;
  request: () => void;
};

/**
 * navigator.geolocation 단발성 요청 훅.
 * - 컴포넌트 마운트 시 자동 호출하지 않음 — 사용자 제스처(버튼 탭)로 request() 호출.
 * - enableHighAccuracy=false 로 배터리/시간 절약, maximumAge=5분 으로 재요청 부담 경감.
 */
export function useGeolocation(): GeolocationState {
  const [coordinates, setCoords] = useState<Coords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const request = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setError('이 브라우저는 위치 서비스를 지원하지 않습니다.');
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 },
    );
  }, []);

  return { coordinates, error, loading, request };
}
