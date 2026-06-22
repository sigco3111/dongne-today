'use client';
import { Card } from '@/components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import type { WeatherData, FriendNeighborhood } from '@/types';
import { formatTemp } from '@/utils/format';

export interface CompareEntry {
  friend: FriendNeighborhood;
  weather: WeatherData;
}

export interface CompareCardProps {
  my: WeatherData;
  friends: CompareEntry[];
}

/**
 * 친구 동네 비교 카드 — 수평 막대 차트
 * - 우리 동네는 블루 강조
 * - 친구 동네는 회색 (가독성 우선)
 */
export function CompareCard({ my, friends }: CompareCardProps) {
  const data = [
    { name: '우리', temp: my.current.temperature_2m, color: 'var(--color-tds-blue)' },
    ...friends.map((f) => ({
      name: f.friend.name,
      temp: f.weather.current.temperature_2m,
      color: 'var(--color-tds-grey-400)',
    })),
  ];

  return (
    <Card className="col-span-full">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-tds-st1">👥</span>
        <h3 className="text-tds-st1 font-medium">친구 동네 비교</h3>
      </div>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 60 }}>
            <XAxis
              type="number"
              tick={{ fontSize: 10, fill: 'var(--color-tds-grey-500)' }}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 12, fill: 'var(--color-tds-grey-700)' }}
              width={56}
            />
            <Bar dataKey="temp" radius={[0, 6, 6, 0]}>
              {data.map((entry, idx) => (
                <Cell key={idx} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="text-tds-st3 text-tds-grey-500 mt-2">
        우리 동네 {formatTemp(my.current.temperature_2m)} 기준
      </div>
    </Card>
  );
}