'use client';
import { Card } from '@/components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, LabelList, Tooltip } from 'recharts';
import type { WeatherData, FriendNeighborhood } from '@/types';
import { formatTemp } from '@/utils/format';
import { Users } from 'lucide-react';

export interface CompareEntry {
  friend: FriendNeighborhood;
  weather: WeatherData;
}

export function CompareCard({ my, friends }: { my: WeatherData; friends: CompareEntry[] }) {
  const data = [
    { name: '우리', temp: my.current.temperature_2m, color: 'var(--color-tds-blue)' },
    ...friends.map((f) => ({
      name: f.friend.name,
      temp: f.weather.current.temperature_2m,
      color: 'var(--color-tds-grey-400)',
    })),
  ];

  if (data.length === 1) {
    return (
      <Card variant="flat" className="col-span-full animate-stagger animate-stagger-5">
        <div className="flex items-center gap-3 py-2">
          <Users size={20} strokeWidth={1.75} className="text-tds-grey-500" />
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
        <Users size={18} strokeWidth={1.75} className="text-tds-grey-700" />
        <h3 className="text-tds-st1 font-semibold text-tds-grey-900 tracking-tight">친구 동네 비교</h3>
      </div>
      <div className="h-44 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 28, left: 8, bottom: 0 }} barCategoryGap={8}>
            <XAxis
              type="number"
              tick={{ fontSize: 10, fill: 'var(--color-tds-grey-500)', fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 12, fill: 'var(--color-tds-grey-700)', fontWeight: 600 }}
              width={64}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: 'var(--color-tds-grey-100)' }}
              contentStyle={{
                background: 'var(--color-tds-surface-elevated)',
                border: '1px solid var(--color-tds-grey-200)',
                borderRadius: 10,
                fontSize: 12,
                boxShadow: 'var(--shadow-tds-md)',
              }}
              formatter={(value: number) => [formatTemp(value), '기온']}
            />
            <Bar dataKey="temp" radius={[0, 8, 8, 0]}>
              {data.map((entry, idx) => (
                <Cell key={idx} fill={entry.color} />
              ))}
              <LabelList
                dataKey="temp"
                position="right"
                formatter={(v: unknown) => formatTemp(v as number)}
                style={{ fill: 'var(--color-tds-grey-700)', fontSize: 12, fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
