'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getCurrentCoords } from '@/lib/location';
import { reverseGeocode } from '@/lib/api/nominatim';
import { searchAddress } from '@/lib/api/geocoding';
import { storage } from '@/lib/storage';
import { haptic } from '@/lib/haptics';
import type { Neighborhood } from '@/types';

export default function OnboardingPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{ name: string; lat: number; lon: number }>>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 현재 위치를 자동 감지해서 저장 → 홈으로 이동
  const detectLocation = async () => {
    setBusy(true);
    setError(null);
    try {
      const { lat, lon } = await getCurrentCoords();
      const rev = await reverseGeocode(lat, lon);
      const name =
        rev?.address?.suburb ??
        rev?.address?.neighbourhood ??
        rev?.address?.city ??
        '현재 위치';
      storage.set<Neighborhood>('neighborhood', { name, lat, lon });
      storage.set('onboardingDone', true);
      haptic('success');
      router.push('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : '위치를 가져올 수 없습니다.');
      haptic('error');
    } finally {
      setBusy(false);
    }
  };

  const search = async () => {
    if (!query.trim()) return;
    setBusy(true);
    try {
      const r = await searchAddress(query);
      setResults(
        r.map((g) => {
          const parts = (g.displayName ?? g.name).split(',').map((s) => s.trim()).filter(Boolean);
          const short = parts.length <= 2 ? (g.displayName ?? g.name) : parts.slice(0, 2).join(', ');
          return { name: short, lat: g.lat, lon: g.lon };
        }),
      );
    } catch {
      setResults([]);
    } finally {
      setBusy(false);
    }
  };

  // 검색 결과 선택 — 저장 후 홈으로 이동
  const pick = (n: { name: string; lat: number; lon: number }) => {
    storage.set<Neighborhood>('neighborhood', n);
    storage.set('onboardingDone', true);
    haptic('success');
    router.push('/');
  };

  return (
    <main className="mx-auto max-w-screen-sm p-4">
      <h1 className="text-tds-t2 font-bold mb-4">우리 동네 설정</h1>

      <Card className="mb-4">
        <h2 className="text-tds-st1 font-medium mb-2">📍 자동 인식</h2>
        <p className="text-tds-st3 text-tds-grey-500 mb-3">
          위치 권한을 허용하면 동네를 자동으로 찾아드려요.
        </p>
        <Button onClick={detectLocation} disabled={busy}>
          {busy ? '확인 중…' : '내 위치로 설정'}
        </Button>
        {error && <p className="mt-2 text-tds-st3 text-tds-red">{error}</p>}
      </Card>

      <Card>
        <h2 className="text-tds-st1 font-medium mb-2">🔍 수동 검색</h2>
        <div className="flex gap-2 mb-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && search()}
            placeholder="도시명 입력 (예: Seoul, Tokyo)"
            className="flex-1 px-3 py-2 rounded-tds-md border border-tds-grey-200 bg-tds-bg text-tds-st2"
          />
          <Button variant="weak" onClick={search} disabled={busy}>검색</Button>
        </div>
        <ul className="space-y-2">
          {results.map((r, i) => (
            <li key={i}>
              <button
                onClick={() => pick(r)}
                className="w-full text-left p-2 rounded-tds-sm hover:bg-tds-grey-100"
              >
                {r.name}
              </button>
            </li>
          ))}
        </ul>
      </Card>
    </main>
  );
}