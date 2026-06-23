'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useNeighborhood } from '@/lib/hooks/useNeighborhood';
import { useFriends } from '@/lib/hooks/useFriends';
import { useDashboardData } from '@/lib/hooks/useDashboardData';
import { fetchHolidays } from '@/lib/api/holidays';
import { fetchWeather } from '@/lib/api/weather';
import type { WeatherResponse } from '@/lib/api/schemas';
import { DashboardGrid, type DashboardGridProps } from '@/components/dashboard/DashboardGrid';
import { Button } from '@/components/ui/Button';
import { haptic } from '@/lib/haptics';
import { shareOrCopy } from '@/lib/share';
import type { HolidayData, Neighborhood, FriendNeighborhood } from '@/types';

/**
 * PublicHoliday[] + 오늘 날짜 → HolidayData 빌드.
 * - 오늘이 공휴일이면 isHoliday=true, holidayName 세팅, daysUntilNext=0
 * - 아니면 다음 공휴일 D-day 계산 (이미 지난 공휴일은 건너뜀)
 */
function buildHolidayData(hols: Awaited<ReturnType<typeof fetchHolidays>>, now: Date): HolidayData {
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

  // 첫 실행: 동네 미설정이면 온보딩으로 리다이렉트
  useEffect(() => {
    if (!nbLoading && !neighborhood) router.push('/onboarding');
  }, [nbLoading, neighborhood, router]);

  // 공휴일 — 올해 + 내년 합쳐서 fetch (연말 경계 대비)
  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    Promise.all([fetchHolidays(year), fetchHolidays(year + 1)])
      .then(([a, b]) => buildHolidayData([...a, ...b], now))
      .catch(() => {
        /* silent — 공휴일 API 실패해도 대시보드는 동작 */
      });
  }, []);

  // 친구 동네 날씨 — CompareCard 용
  useEffect(() => {
    if (!friends.length) {
      setFriendWeather([]);
      return;
    }
    Promise.all(
      friends.map(async (f): Promise<DashboardGridProps['friends'][number]> => {
        const weather: WeatherResponse = await fetchWeather(f.lat, f.lon);
        const friend: FriendNeighborhood = { ...f, addedAt: new Date().toISOString() };
        // Domain 매핑 — API 응답을 카드 컴포넌트가 기대하는 WeatherData 로 캐스팅.
        // (현재 구조: hourly.time/temperature_2m 은 양쪽 모두 존재)
        return { friend, weather: weather as unknown as DashboardGridProps['friends'][number]['weather'] };
      }),
    ).then(setFriendWeather).catch(() => {
      /* silent */
    });
  }, [friends]);

  if (nbLoading || !neighborhood) return <div className="text-tds-grey-500">위치 확인 중…</div>;

  const onShare = async () => {
    haptic('tap');
    const result = await shareOrCopy({
      title: '우리 동네 오늘',
      text: `${neighborhood.name} — ${data ? `${data.weather.current.temperature_2m}°C` : ''}`,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    });
    haptic(result === 'shared' ? 'success' : result === 'copied' ? 'tap' : 'error');
  };

  // useDashboardData 의 raw API 응답을 DashboardGrid 의 도메인 타입으로 캐스팅.
  // (cards 컴포넌트는 hourly/current 의 핵심 필드만 사용 → 런타임 호환)
  const gridData: DashboardGridProps['data'] = data
    ? (data as unknown as DashboardGridProps['data'])
    : null;

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <span className="text-tds-st2 text-tds-grey-700">📍 {neighborhood.name}</span>
        <div className="flex gap-2">
          <Button variant="weak" onClick={() => { haptic('tap'); refresh(); }}>새로고침</Button>
          <Button variant="primary" onClick={onShare}>공유</Button>
        </div>
      </div>
      <DashboardGrid
        neighborhood={neighborhood as Neighborhood}
        isLoading={isLoading}
        data={gridData}
        holiday={holiday}
        friends={friendWeather}
      />
      <div className="mt-4 flex justify-center">
        <Button variant="ghost" onClick={() => router.push('/settings')}>설정</Button>
      </div>
    </>
  );
}