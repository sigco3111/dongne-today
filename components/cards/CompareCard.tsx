'use client';
import { Card } from '@/components/ui/Card';
import type { WeatherData, FriendNeighborhood } from '@/types';
import { formatTemp } from '@/utils/format';
import { Wind, Users } from 'lucide-react';

export interface CompareEntry {
  friend: FriendNeighborhood;
  weather: WeatherData;
}

interface CompareRow {
  name: string;
  emoji: string;
  color: string;
  temp: number;
  feels: number;
  windKmh: number;
  isMy: boolean;
}

export function CompareCard({ my, friends }: { my: WeatherData; friends: CompareEntry[] }) {
  const data: CompareRow[] = [
    {
      name: '우리 동네',
      emoji: '🏠',
      color: 'var(--color-tds-blue)',
      temp: my.current.temperature_2m,
      feels: my.current.apparent_temperature,
      windKmh: my.current.wind_speed_10m,
      isMy: true,
    },
    ...friends.map((f) => ({
      name: f.friend.name,
      emoji: '👥',
      color: 'var(--color-tds-grey-400)',
      temp: f.weather.current.temperature_2m,
      feels: f.weather.current.apparent_temperature,
      windKmh: f.weather.current.wind_speed_10m,
      isMy: false,
    })),
  ];

  if (data.length === 1) {
    return (
      <Card variant="flat" className="col-span-full animate-stagger animate-stagger-5">
        <div className="flex items-center gap-3 py-2">
          <Users size={20} strokeWidth={1.75} className="text-tds-grey-500" aria-hidden="true" />
          <div>
            <h3 className="text-tds-st1 font-semibold text-tds-grey-900 tracking-tight">친구 동네 비교</h3>
            <p className="text-tds-st3 text-tds-grey-500 mt-0.5">
              설정에서 최대 5개 동네를 추가해 비교해 보세요
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="col-span-full animate-stagger animate-stagger-5" padding="lg">
      <div className="flex items-center gap-2 mb-4">
        <Users size={18} strokeWidth={1.75} className="text-tds-grey-700" aria-hidden="true" />
        <h3 className="text-tds-st1 font-semibold text-tds-grey-900 tracking-tight">친구 동네 비교</h3>
        <span className="text-tds-st3 text-tds-grey-500 ml-auto" aria-hidden="true">
          기온 · 체감 · 풍속
        </span>
      </div>
      <ul className="flex flex-col gap-2" aria-label="친구 동네 비교">
        {data.map((row, idx) => (
          <li
            key={`${row.name}-${idx}`}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-tds-md ${
              row.isMy ? 'bg-tds-blue/5 ring-1 ring-tds-blue/20' : 'bg-tds-grey-50 dark:bg-tds-grey-100'
            }`}
          >
            <span className="text-xl" aria-hidden="true">
              {row.emoji}
            </span>
            <span className="flex-1 text-tds-st2 text-tds-grey-900 font-medium truncate">
              {row.name}
            </span>
            <div className="flex items-center gap-3 tabular-nums text-tds-st2">
              <span className="font-bold text-tds-grey-900">{formatTemp(row.temp)}</span>
              {Math.abs(row.feels - row.temp) >= 0.5 && (
                <span
                  className="text-tds-st3 text-tds-grey-500"
                  title={`체감 ${formatTemp(row.feels)}`}
                  aria-label={`체감 ${formatTemp(row.feels)}`}
                >
                  체감 {formatTemp(row.feels)}
                </span>
              )}
              <span
                className="text-tds-st3 text-tds-grey-500 flex items-center gap-0.5"
                title={`풍속 ${row.windKmh.toFixed(1)}km/h`}
                aria-label={`풍속 ${row.windKmh.toFixed(1)}km/h`}
              >
                <Wind size={10} strokeWidth={2} aria-hidden="true" />
                {row.windKmh.toFixed(0)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
