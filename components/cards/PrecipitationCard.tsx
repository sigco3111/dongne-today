'use client';
import { Card } from '@/components/ui/Card';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import type { PrecipitationData } from '@/types';
import { formatHourLabel, formatPercent } from '@/utils/format';
import { CloudRain } from 'lucide-react';

export function PrecipitationCard({ data }: { data: PrecipitationData }) {
  const chartData = data.hourly.time.slice(0, 24).map((t, i) => ({
    time: formatHourLabel(t),
    prob: data.hourly.precipitation_probability[i] ?? 0,
  }));
  const maxProb = Math.max(...chartData.map((d) => d.prob), 0);

  return (
    <Card className="animate-stagger animate-stagger-3" padding="md">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-tds-st1 font-semibold text-tds-grey-900 tracking-tight">강수확률</h3>
        <CloudRain size={20} strokeWidth={1.75} className="text-tds-blue" />
      </div>
      <div className="flex items-baseline gap-1.5 mb-3">
        <span className="text-tds-t1 font-bold text-tds-grey-900 tabular-nums leading-none">
          {formatPercent(maxProb)}
        </span>
        <span className="text-tds-st2 text-tds-grey-500">오늘 최대</span>
      </div>
      <div className="h-20 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="precipGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-tds-blue)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="var(--color-tds-blue)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: 'var(--color-tds-grey-500)', fontWeight: 500 }}
              interval={3}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'var(--color-tds-grey-500)', fontWeight: 500 }}
              width={28}
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
            />
            <Tooltip
              cursor={{ stroke: 'var(--color-tds-blue)', strokeWidth: 1, strokeDasharray: '3 3' }}
              contentStyle={{
                background: 'var(--color-tds-surface-elevated)',
                border: '1px solid var(--color-tds-grey-200)',
                borderRadius: 10,
                fontSize: 12,
                boxShadow: 'var(--shadow-tds-md)',
              }}
            />
            <Area
              type="monotone"
              dataKey="prob"
              stroke="var(--color-tds-blue)"
              strokeWidth={2}
              fill="url(#precipGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
