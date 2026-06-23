'use client';
import { Card } from '@/components/ui/Card';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import type { PrecipitationData } from '@/types';
import { formatHourLabel, formatPercent } from '@/utils/format';

export interface PrecipitationCardProps {
  data: PrecipitationData;
}

/**
 * 강수확률 카드 — 오늘 24시간 강수확률 area chart
 * - 최대 확률 강조 (큰 글씨)
 * - 그라데이션 area chart
 */
export function PrecipitationCard({ data }: PrecipitationCardProps) {
  const chartData = data.hourly.time.slice(0, 24).map((t, i) => ({
    time: formatHourLabel(t),
    prob: data.hourly.precipitation_probability[i] ?? 0,
  }));
  const maxProb = Math.max(...chartData.map((d) => d.prob), 0);

  return (
    <Card>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-tds-st1">🌧️</span>
        <h3 className="text-tds-st1 font-medium">강수확률</h3>
      </div>
      <div className="text-tds-t2 font-bold text-tds-grey-900 mb-1">
        오늘 최대 {formatPercent(maxProb)}
      </div>
      <div className="h-24">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="precipGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-tds-blue)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="var(--color-tds-blue)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: 'var(--color-tds-grey-500)' }}
              interval={3}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'var(--color-tds-grey-500)' }}
              width={28}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--color-tds-bg)',
                border: '1px solid var(--color-tds-grey-200)',
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey="prob"
              stroke="var(--color-tds-blue)"
              fill="url(#precipGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}