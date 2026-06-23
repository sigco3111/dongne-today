'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Search, Users, Trash2, Plus, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useNeighborhood } from '@/lib/hooks/useNeighborhood';
import { useFriends } from '@/lib/hooks/useFriends';
import { searchAddress } from '@/lib/api/geocoding';
import { haptic } from '@/lib/haptics';
import type { Neighborhood } from '@/types';

export default function SettingsPage() {
  const router = useRouter();
  const { neighborhood, clear: clearMy } = useNeighborhood();
  const { friends, remove, add, maxFriends } = useFriends();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Neighborhood[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async () => {
    if (!query.trim()) return;
    setBusy(true);
    setError(null);
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
      setError('검색에 실패했어요. 다시 시도해 주세요.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main id="main" className="mx-auto max-w-screen-md px-4 py-5 sm:py-8 min-h-[100dvh]">
      <header className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
          <ArrowLeft size={16} strokeWidth={2} />
          뒤로
        </Button>
        <h1 className="text-tds-t2 font-bold text-tds-grey-900 tracking-tight">설정</h1>
      </header>

      <Card className="mb-4 animate-stagger animate-stagger-1" padding="lg">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-tds-md bg-tds-blue/10 flex items-center justify-center text-tds-blue">
            <MapPin size={18} strokeWidth={2} />
          </div>
          <h2 className="text-tds-st1 font-semibold text-tds-grey-900 tracking-tight">우리 동네</h2>
        </div>
        <p className="text-tds-st2 text-tds-grey-700 font-medium mb-4">
          {neighborhood?.name ?? '미설정'}
        </p>
        <div className="flex gap-2">
          <Button variant="weak" size="sm" onClick={() => router.push('/onboarding')}>
            변경
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              clearMy();
              haptic('tap');
            }}
          >
            초기화
          </Button>
        </div>
      </Card>

      <Card className="animate-stagger animate-stagger-2" padding="lg">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-tds-md bg-tds-purple/10 flex items-center justify-center text-tds-purple">
            <Users size={18} strokeWidth={2} />
          </div>
          <h2 className="text-tds-st1 font-semibold text-tds-grey-900 tracking-tight">
            친구 동네
            <span className="text-tds-st3 text-tds-grey-500 font-normal ml-2">
              {friends.length} / {maxFriends}
            </span>
          </h2>
        </div>

        {friends.length > 0 && (
          <ul className="flex flex-col gap-1 mb-4">
            {friends.map((f, i) => (
              <li
                key={`${f.name}-${i}`}
                className="flex items-center justify-between px-3 py-2.5 rounded-tds-md bg-tds-grey-50 dark:bg-tds-grey-100"
              >
                <span className="text-tds-st2 text-tds-grey-900 font-medium">{f.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    remove(i);
                    haptic('tap');
                  }}
                  aria-label={`${f.name} 삭제`}
                >
                  <Trash2 size={14} strokeWidth={2} />
                </Button>
              </li>
            ))}
          </ul>
        )}

        {friends.length < maxFriends && (
          <>
            <div className="flex gap-2 mb-2">
              <div className="relative flex-1">
                <Search
                  size={14}
                  strokeWidth={2}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-tds-grey-400 pointer-events-none"
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && search()}
                  placeholder="예: 강남구, 홍대, 해운대"
                  className="w-full pl-9 pr-3 py-2.5 rounded-tds-md border border-tds-grey-200 bg-tds-bg text-tds-st2 text-tds-grey-900 placeholder:text-tds-grey-400 focus:border-tds-blue focus:outline-none transition-colors"
                />
              </div>
              <Button variant="weak" onClick={search} disabled={busy}>
                {busy ? (
                  <Loader2 size={14} strokeWidth={2} className="animate-spin" />
                ) : (
                  <Search size={14} strokeWidth={2} />
                )}
                검색
              </Button>
            </div>
            {error && (
              <p className="text-tds-st3 text-tds-red flex items-start gap-1.5 mb-2">
                <AlertCircle size={14} strokeWidth={2} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </p>
            )}
            {results.length > 0 ? (
              <ul className="flex flex-col gap-1">
                {results.map((r, i) => (
                  <li
                    key={`${r.name}-${i}`}
                    className="flex items-center justify-between px-3 py-2.5 rounded-tds-md hover:bg-tds-blue-light transition-colors"
                  >
                    <span className="text-tds-st2 text-tds-grey-900">{r.name}</span>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        add(r);
                        setResults([]);
                        setQuery('');
                        haptic('success');
                      }}
                    >
                      <Plus size={14} strokeWidth={2} />
                      추가
                    </Button>
                  </li>
                ))}
              </ul>
            ) : !busy && query ? (
              <p className="text-tds-st3 text-tds-grey-500 text-center py-2">검색 결과가 없어요</p>
            ) : null}
          </>
        )}
      </Card>
    </main>
  );
}
