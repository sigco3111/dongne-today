'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getCurrentCoords } from '@/lib/location';
import { reverseGeocode } from '@/lib/api/nominatim';
import { searchAddress } from '@/lib/api/geocoding';
import { storage } from '@/lib/storage';
import { haptic } from '@/lib/haptics';
import type { Neighborhood } from '@/types';
import { MapPin, Search, Loader2, AlertCircle } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{ name: string; lat: number; lon: number }>>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debouncedQuery = useDebounce(query, 350);

  useEffect(() => {
    const q = debouncedQuery.trim();
    if (!q || q.length < 2) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setBusy(true);
    setError(null);
    searchAddress(q)
      .then((r) => {
        if (cancelled) return;
        setResults(
          r.map((g) => {
            const parts = (g.displayName ?? g.name).split(',').map((s) => s.trim()).filter(Boolean);
            const short = parts.length <= 2 ? (g.displayName ?? g.name) : parts.slice(0, 2).join(', ');
            return { name: short, lat: g.lat, lon: g.lon };
          }),
        );
      })
      .catch(() => {
        if (!cancelled) setResults([]);
      })
      .finally(() => {
        if (!cancelled) setBusy(false);
      });
    return () => { cancelled = true; };
  }, [debouncedQuery]);

  const detectLocation = async () => {
    setBusy(true);
    setError(null);
    try {
      const { lat, lon } = await getCurrentCoords();
      const rev = await reverseGeocode(lat, lon);
      const name =
        rev?.address?.suburb ?? rev?.address?.neighbourhood ?? rev?.address?.city ?? '현재 위치';
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

  const pick = (n: { name: string; lat: number; lon: number }) => {
    storage.set<Neighborhood>('neighborhood', n);
    storage.set('onboardingDone', true);
    haptic('success');
    router.push('/');
  };

  return (
    <main id="main" className="mx-auto max-w-screen-md px-4 py-5 sm:py-8 min-h-[100dvh]">
      <header className="mb-6">
        <h1 className="text-tds-t1 font-bold text-tds-grey-900 tracking-tight">우리 동네 설정</h1>
        <p className="text-tds-st2 text-tds-grey-500 mt-1">자동 인식 또는 도시명으로 검색해 보세요</p>
      </header>

      <Card className="mb-4 animate-stagger animate-stagger-1" padding="lg">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-9 h-9 rounded-tds-md bg-tds-blue/10 flex items-center justify-center text-tds-blue">
            <MapPin size={18} strokeWidth={2} />
          </div>
          <h2 className="text-tds-st1 font-semibold text-tds-grey-900 tracking-tight">자동 인식</h2>
        </div>
        <p className="text-tds-st3 text-tds-grey-500 mb-4 leading-relaxed">
          위치 권한을 허용하면 현재 동네를 자동으로 찾아드려요. 거부해도 수동 검색으로 진행할 수 있어요.
        </p>
        <Button onClick={detectLocation} disabled={busy}>
          {busy ? (
            <>
              <Loader2 size={14} strokeWidth={2} className="animate-spin" />
              확인 중…
            </>
          ) : (
            <>
              <MapPin size={14} strokeWidth={2} />
              내 위치로 설정
            </>
          )}
        </Button>
        {error && (
          <p className="mt-3 text-tds-st3 text-tds-red flex items-start gap-1.5">
            <AlertCircle size={14} strokeWidth={2} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </p>
        )}
      </Card>

      <Card className="animate-stagger animate-stagger-2" padding="lg">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-tds-md bg-tds-purple/10 flex items-center justify-center text-tds-purple">
            <Search size={18} strokeWidth={2} />
          </div>
          <h2 className="text-tds-st1 font-semibold text-tds-grey-900 tracking-tight">수동 검색</h2>
        </div>
        <div className="relative mb-3">
          <Search
            size={14}
            strokeWidth={2}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-tds-grey-400 pointer-events-none"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="예: 강남구, 홍대, 해운대, Seoul (자동완성)"
            className="w-full pl-9 pr-3 py-2.5 rounded-tds-md border border-tds-grey-200 bg-tds-bg text-tds-st2 text-tds-grey-900 placeholder:text-tds-grey-400 focus:border-tds-blue focus:outline-none transition-colors"
            aria-label="동네 검색"
          />
          {busy && (
            <Loader2
              size={14}
              strokeWidth={2}
              className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-tds-grey-400"
            />
          )}
        </div>
        {results.length > 0 && (
          <ul className="flex flex-col gap-1 animate-stagger animate-stagger-3">
            {results.map((r, i) => (
              <li key={i}>
                <button
                  onClick={() => pick(r)}
                  className="w-full text-left px-3 py-2.5 rounded-tds-md text-tds-st2 text-tds-grey-900 hover:bg-tds-blue-light active:scale-[0.99] transition-all duration-200"
                >
                  {r.name}
                </button>
              </li>
            ))}
          </ul>
        )}
        {!busy && results.length === 0 && debouncedQuery.trim().length >= 2 && (
          <p className="text-tds-st3 text-tds-grey-500 text-center py-4">검색 결과가 없어요</p>
        )}
      </Card>
    </main>
  );
}
