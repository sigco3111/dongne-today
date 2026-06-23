'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useNeighborhood } from '@/lib/hooks/useNeighborhood';
import { useFriends } from '@/lib/hooks/useFriends';
import { useDashboardData } from '@/lib/hooks/useDashboardData';
import { fetchHolidays } from '@/lib/api/holidays';
import type { PublicHoliday } from '@/lib/api/schemas';
import { fetchWeather } from '@/lib/api/weather';
import { DashboardGrid } from '@/components/dashboard/DashboardGrid';
import { Button } from '@/components/ui/Button';
import { haptic } from '@/lib/haptics';
import { shareOrCopy } from '@/lib/share';
import type { HolidayData, Neighborhood, FriendNeighborhood } from '@/types';
import { RefreshCw, Share2, Settings as SettingsIcon, MapPin, Loader2 } from 'lucide-react';
import type { DashboardGridProps } from '@/components/dashboard/DashboardGrid';

function buildHolidayData(hols: PublicHoliday[], now: Date): HolidayData {
  const today = now.toISOString().slice(0, 10);
  const found = hols.find((h) => h.date === today);
  const dow = now.getDay();
  const isWeekday = dow >= 1 && dow <= 5;
  let daysUntilNext = 0;
  let nextName: string | null = null;
  if (!found) {
    for (const h of hols) {
      if (h.date > today) {
        const diff = new Date(h.date).getTime() - now.getTime();
        daysUntilNext = Math.max(1, Math.ceil(diff / 86400000));
        nextName = h.localName;
        break;
      }
    }
  }
  return {
    isHoliday: !!found,
    isWeekday,
    holidayName: found?.localName ?? nextName,
    daysUntilNext: found ? 0 : daysUntilNext,
    fetchedAt: now.toISOString(),
  };
}

export function HomeContent() {
  const router = useRouter();
  const { neighborhood, isLoading: nbLoading } = useNeighborhood();
  const { friends } = useFriends();
  const { data, isLoading, refresh } = useDashboardData(neighborhood);
  const [holiday, setHoliday] = useState<HolidayData>({
    isHoliday: false,
    isWeekday: true,
    holidayName: null,
    daysUntilNext: 0,
    fetchedAt: new Date().toISOString(),
  });
  const [friendWeather, setFriendWeather] = useState<DashboardGridProps['friends']>([]);

  useEffect(() => {
    if (!nbLoading && !neighborhood) router.push('/onboarding');
  }, [nbLoading, neighborhood, router]);

  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    Promise.all([fetchHolidays(year), fetchHolidays(year + 1)])
      .then(([a, b]) => buildHolidayData([...a, ...b], now))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!friends.length) {
      setFriendWeather([]);
      return;
    }
    Promise.all(
      friends.map(async (f): Promise<DashboardGridProps['friends'][number]> => {
        const weather = await fetchWeather(f.lat, f.lon);
        const friend: FriendNeighborhood = { ...f, addedAt: new Date().toISOString() };
        return { friend, weather: weather as unknown as DashboardGridProps['friends'][number]['weather'] };
      }),
    ).then(setFriendWeather).catch(() => {});
  }, [friends]);

  if (nbLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-tds-grey-500">
        <Loader2 size={32} strokeWidth={2} className="animate-spin mb-3 text-tds-blue" />
        <span className="text-tds-st2">동네를 찾는 중…</span>
      </div>
    );
  }
  if (!neighborhood) return null;

  const onShare = async () => {
    haptic('tap');
    const result = await shareOrCopy({
      title: '우리 동네 오늘',
      text: `${neighborhood.name} — ${data ? `${data.weather.current.temperature_2m}°C` : ''}`,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    });
    haptic(result === 'shared' ? 'success' : result === 'copied' ? 'tap' : 'error');
  };

  const gridData: DashboardGridProps['data'] = data
    ? (data as unknown as DashboardGridProps['data'])
    : null;

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-1.5 text-tds-st2 text-tds-grey-700 font-medium">
          <MapPin size={14} strokeWidth={2} className="text-tds-blue" />
          {neighborhood.name}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="weak"
            size="sm"
            onClick={() => {
              haptic('tap');
              refresh();
            }}
            aria-label="새로고침"
          >
            <RefreshCw size={14} strokeWidth={2} />
            새로고침
          </Button>
          <Button variant="primary" size="sm" onClick={onShare} aria-label="공유">
            <Share2 size={14} strokeWidth={2} />
            공유
          </Button>
        </div>
      </div>
      <DashboardGrid
        neighborhood={neighborhood as Neighborhood}
        isLoading={isLoading}
        data={gridData}
        holiday={holiday}
        friends={friendWeather}
      />
      <div className="mt-6 flex justify-center">
        <Button variant="ghost" onClick={() => router.push('/settings')}>
          <SettingsIcon size={14} strokeWidth={2} />
          설정
        </Button>
      </div>
    </>
  );
}
