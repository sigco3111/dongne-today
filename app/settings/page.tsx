'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
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

  const search = async () => {
    if (!query.trim()) return;
    setBusy(true);
    try {
      const r = await searchAddress(query);
      setResults(
        r.map((g) => ({
          name: extractShortName(g.displayName ?? g.name),
          lat: g.lat,
          lon: g.lon,
        })),
      );
    } catch {
      setResults([]);
    } finally {
      setBusy(false);
    }
  };

  function extractShortName(displayName: string): string {
    const parts = displayName.split(',').map((s) => s.trim()).filter(Boolean);
    if (parts.length <= 2) return displayName;
    return parts.slice(0, 2).join(', ');
  }

  return (
    <main className="mx-auto max-w-screen-sm p-4">
      <header className="flex items-center gap-2 mb-4">
        <Button variant="ghost" onClick={() => router.push('/')}>←</Button>
        <h1 className="text-tds-t2 font-bold">설정</h1>
      </header>

      <Card className="mb-4">
        <h2 className="text-tds-st1 font-medium mb-2">우리 동네</h2>
        <p className="text-tds-st2 text-tds-grey-700 mb-3">📍 {neighborhood?.name ?? '미설정'}</p>
        <div className="flex gap-2">
          <Button variant="weak" onClick={() => router.push('/onboarding')}>변경</Button>
          <Button variant="ghost" onClick={() => { clearMy(); haptic('tap'); }}>초기화</Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-tds-st1 font-medium mb-2">친구 동네 ({friends.length}/{maxFriends})</h2>
        <ul className="space-y-2 mb-3">
          {friends.map((f, i) => (
            <li key={i} className="flex items-center justify-between p-2 rounded-tds-sm bg-tds-grey-50">
              <span className="text-tds-st2">{f.name}</span>
              <Button variant="ghost" onClick={() => { remove(i); haptic('tap'); }}>삭제</Button>
            </li>
          ))}
        </ul>
        {friends.length < maxFriends && (
          <>
            <div className="flex gap-2 mb-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && search()}
                placeholder="도시명 입력"
                className="flex-1 px-3 py-2 rounded-tds-md border border-tds-grey-200 bg-tds-bg text-tds-st2"
              />
              <Button variant="weak" onClick={search} disabled={busy}>검색</Button>
            </div>
            <ul className="space-y-2">
              {results.map((r, i) => (
                <li key={i} className="flex items-center justify-between p-2 rounded-tds-sm hover:bg-tds-grey-50">
                  <span className="text-tds-st2">{r.name}</span>
                  <Button variant="primary" onClick={() => { add(r); setResults([]); setQuery(''); haptic('success'); }}>추가</Button>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>
    </main>
  );
}
