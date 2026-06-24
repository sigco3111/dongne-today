'use client';
import { useEffect, useMemo, useState } from 'react';
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
import { storage } from '@/lib/storage';
import { notify, shouldNotify, markNotified } from '@/lib/notify';
import { exportNodeToPng, downloadDataUrl } from '@/lib/exportImage';
import type { HolidayData, Neighborhood, FriendNeighborhood, CharacterHistoryEntry } from '@/types';
import { RefreshCw, Share2, Settings as SettingsIcon, MapPin, Loader2, Download } from 'lucide-react';
import type { DashboardGridProps } from '@/components/dashboard/DashboardGrid';
import { decideAndSave, getHistoryForRange } from '@/utils/characterHistory';

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
  const [historyTick, setHistoryTick] = useState(0);

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
        return { friend, weather };
      }),
    ).then(setFriendWeather).catch(() => {});
  }, [friends]);

  useEffect(() => {
    if (!data) return;
    try {
      const report = decideAndSave({
        weather: data.weather,
        airQuality: data.airQuality,
        precipitation: data.precipitation,
        holiday,
      });
      if (typeof window !== 'undefined') {
        console.log('[dongne] decideAndSave:', report.kind, report.matchedRule);
      }
      setHistoryTick((t) => t + 1);

      if (typeof window !== 'undefined') {
        const notifyOn = storage.get<boolean>('notifyEnabled');
        const pm25 = data.airQuality.current.pm2_5;
        const todayMax = data.weather.daily.temperature_2m_max[0];
        const todayMin = data.weather.daily.temperature_2m_min[0];
        if (notifyOn) {
          if (pm25 >= 75 && shouldNotify('pm25_bad')) {
            notify({
              title: '미세먼지 나쁨',
              body: `${neighborhood?.name ?? '우리 동네'} 미세먼지 ${Math.round(pm25)}μg/m³ — 마스크 챙기세요.`,
              level: 'warning',
              tag: 'pm25_bad',
            });
            markNotified('pm25_bad');
          } else if (todayMax != null && todayMax >= 33 && shouldNotify('heat_wave')) {
            notify({
              title: '폭염 경보',
              body: `오늘 최고 ${todayMax.toFixed(0)}°C — 물 자주 마시고 그늘에서 쉬어요.`,
              level: 'danger',
              tag: 'heat_wave',
            });
            markNotified('heat_wave');
          } else if (todayMin != null && todayMin <= -5 && shouldNotify('cold_wave')) {
            notify({
              title: '한파 경보',
              body: `오늘 최저 ${todayMin.toFixed(0)}°C — 롱패딩 필수.`,
              level: 'danger',
              tag: 'cold_wave',
            });
            markNotified('cold_wave');
          }
        }
      }
    } catch (err) {
      if (typeof window !== 'undefined') {
        console.error('[dongne] decideAndSave failed:', err);
      }
    }
  }, [data, holiday, neighborhood?.name]);

  const historyItems = useMemo(
    () => getHistoryForRange(7).map((item): { date: string; entry: CharacterHistoryEntry | null } => ({
      date: item.date,
      entry: item.entry ? {
        date: item.entry.date,
        kind: item.entry.kind,
        emoji: item.entry.emoji,
        line: item.entry.line,
      } : null,
    })),
    [historyTick],
  );

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

  const onExport = async () => {
    haptic('tap');
    const root = document.getElementById('dashboard-root');
    if (!root) {
      haptic('error');
      return;
    }
    const result = await exportNodeToPng(root, {
      fileName: `dongne-today-${neighborhood.name}-${new Date().toISOString().slice(0, 10)}.png`,
    });
    if (!result) {
      haptic('error');
      return;
    }
    downloadDataUrl(result.dataUrl, result.fileName);
    haptic('success');
  };

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
      <div id="dashboard-root" className="contents">
        <DashboardGrid
          neighborhood={neighborhood as Neighborhood}
          isLoading={isLoading}
          data={data ?? null}
          holiday={holiday}
          friends={friendWeather}
          historyItems={historyItems}
        />
        <div className="mt-6 flex justify-center gap-2">
          <Button variant="ghost" onClick={onExport} aria-label="대시보드 PNG로 저장">
            <Download size={14} strokeWidth={2} />
            PNG로 저장
          </Button>
          <Button variant="ghost" onClick={() => router.push('/settings')}>
            <SettingsIcon size={14} strokeWidth={2} />
            설정
          </Button>
        </div>
      </div>
    </>
  );
}
