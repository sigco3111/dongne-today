'use client';
import { Card } from '@/components/ui/Card';
import { TrendingUp, Droplets, Sun, Wind } from 'lucide-react';
import type { WeatherData, AirQualityData, CharacterHistoryEntry } from '@/types';
import { CHARACTERS } from '@/utils/characterEngine';

export interface WeeklyReportCardProps {
  weather: WeatherData;
  airQuality: AirQualityData;
  /** 이번 주 캐릭터 히스토리 (오늘부터 6일 전까지) */
  history: CharacterHistoryEntry[];
}

interface WeekStats {
  avgPm25: number;
  avgTemp: number;
  rainyDays: number;
  clearDays: number;
  dominantKind: CharacterHistoryEntry['kind'] | null;
  dominantCount: number;
}

function computeStats(weather: WeatherData, airQuality: AirQualityData, history: CharacterHistoryEntry[]): WeekStats {
  // airQuality는 현재 값만 (시간별 평균은 응답에 있으나 단순화)
  const pm25 = airQuality.current.pm2_5;

  const daily = weather.daily;
  const days = daily.time.length;

  let tempSum = 0;
  let tempCount = 0;
  let rainy = 0;
  let clear = 0;
  for (let i = 0; i < days; i++) {
    const max = daily.temperature_2m_max[i];
    const min = daily.temperature_2m_min[i];
    if (typeof max === 'number' && typeof min === 'number') {
      tempSum += (max + min) / 2;
      tempCount += 1;
    }
    const sum = daily.precipitation_sum[i] ?? 0;
    if (sum > 1) rainy += 1;
    const code = daily.weather_code[i] ?? -1;
    if (code === 0 || code === 1) clear += 1;
  }
  const avgTemp = tempCount > 0 ? tempSum / tempCount : 0;

  // 캐릭터 mode
  const counts = new Map<string, number>();
  for (const e of history) counts.set(e.kind, (counts.get(e.kind) ?? 0) + 1);
  let dominantKind: WeekStats['dominantKind'] = null;
  let dominantCount = 0;
  for (const [k, c] of counts) {
    if (c > dominantCount) {
      dominantKind = k as WeekStats['dominantKind'];
      dominantCount = c;
    }
  }

  return { avgPm25: pm25, avgTemp, rainyDays: rainy, clearDays: clear, dominantKind, dominantCount };
}

function pm25Grade(pm: number): { label: string; color: string } {
  if (pm <= 15) return { label: '좋음', color: 'var(--color-tds-green)' };
  if (pm <= 35) return { label: '보통', color: 'var(--color-tds-yellow)' };
  if (pm <= 75) return { label: '나쁨', color: 'var(--color-tds-orange)' };
  return { label: '매우나쁨', color: 'var(--color-tds-red)' };
}

export function WeeklyReportCard({ weather, airQuality, history }: WeeklyReportCardProps) {
  const stats = computeStats(weather, airQuality, history);
  const pm = pm25Grade(stats.avgPm25);
  const dominant = stats.dominantKind ? CHARACTERS[stats.dominantKind] : null;

  return (
    <Card className="col-span-full animate-stagger animate-stagger-5" padding="md" data-testid="weekly-report-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp size={18} strokeWidth={1.75} className="text-tds-grey-700" />
          <h3 className="text-tds-st1 font-semibold text-tds-grey-900 tracking-tight">이번 주 동네 리포트</h3>
        </div>
        <span className="text-tds-st3 text-tds-grey-500">7일 통계</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatTile
          icon={<Wind size={16} strokeWidth={1.75} />}
          label="평균 미세먼지"
          value={`${Math.round(stats.avgPm25)}`}
          unit="μg/m³"
          sub={pm.label}
          color={pm.color}
          testId="stat-pm"
        />
        <StatTile
          icon={<Sun size={16} strokeWidth={1.75} />}
          label="평균 기온"
          value={`${stats.avgTemp.toFixed(1)}`}
          unit="°C"
          sub={`맑은 날 ${stats.clearDays}일`}
          color="var(--color-tds-orange)"
          testId="stat-temp"
        />
        <StatTile
          icon={<Droplets size={16} strokeWidth={1.75} />}
          label="비 온 날"
          value={`${stats.rainyDays}`}
          unit="일"
          sub={`총 ${stats.clearDays}일 맑음`}
          color="var(--color-tds-blue)"
          testId="stat-rain"
        />
        <StatTile
          icon={<span className="text-base leading-none">{dominant?.emoji ?? '—'}</span>}
          label="주간 단골 캐릭터"
          value={dominant ? `${stats.dominantCount}일` : '0일'}
          unit=""
          sub={dominant?.line ?? '데이터 모음 중'}
          color="var(--color-tds-purple)"
          testId="stat-character"
        />
      </div>
    </Card>
  );
}

function StatTile({
  icon,
  label,
  value,
  unit,
  sub,
  color,
  testId,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  sub: string;
  color: string;
  testId: string;
}) {
  return (
    <div
      className="flex flex-col gap-1.5 p-3 rounded-tds-md bg-tds-grey-50/60 dark:bg-tds-grey-100/40"
      data-testid={testId}
    >
      <div className="flex items-center gap-1.5 text-tds-st3 text-tds-grey-500 font-medium">
        <span style={{ color }} aria-hidden="true">{icon}</span>
        <span>{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-tds-t2 font-bold text-tds-grey-900 tabular-nums leading-none">{value}</span>
        {unit && <span className="text-tds-st3 text-tds-grey-500">{unit}</span>}
      </div>
      <div className="text-tds-st3 text-tds-grey-500 truncate" title={sub}>{sub}</div>
    </div>
  );
}