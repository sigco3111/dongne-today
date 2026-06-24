'use client';
import { Card } from '@/components/ui/Card';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Area, ComposedChart } from 'recharts';
import type { WeatherData } from '@/types';
import { formatHourLabel } from '@/utils/format';
import { Sun, Shield } from 'lucide-react';

type Level = 'low' | 'moderate' | 'high' | 'very_high' | 'extreme';

function grade(uv: number): { level: Level; label: string; color: string; advice: string } {
  if (uv < 3) return { level: 'low', label: '낮음', color: 'var(--color-tds-green)', advice: '자외선 거의 없음' };
  if (uv < 6) return { level: 'moderate', label: '보통', color: 'var(--color-tds-yellow)', advice: '선크림 가볍게' };
  if (uv < 8) return { level: 'high', label: '높음', color: 'var(--color-tds-orange)', advice: '선크림 + 모자' };
  if (uv < 11) return { level: 'very_high', label: '매우 높음', color: 'var(--color-tds-red)', advice: '외출 자제 권장' };
  return { level: 'extreme', label: '위험', color: 'var(--color-tds-purple)', advice: '외출 금지' };
}

export function UVCard({ data }: { data: WeatherData }) {
  const uvNow = data.current.uv_index;
  const uvClear = data.current.uv_index_clear_sky;
  const meta = grade(uvClear);

  const chartData = data.hourly.time.slice(0, 24).map((t, i) => ({
    time: formatHourLabel(t),
    uv: data.hourly.uv_index[i] ?? 0,
  }));

  const maxUv = Math.max(...chartData.map((d) => d.uv), 0);

  return (
    <Card className="animate-stagger animate-stagger-3" padding="md">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-tds-st1 font-semibold text-tds-grey-900 tracking-tight">자외선</h3>
        <Shield size={20} strokeWidth={1.75} style={{ color: meta.color }} />
      </div>
      <div className="flex items-baseline gap-1.5 mb-1">
        <span className="text-tds-t1 font-bold tabular-nums leading-none" style={{ color: meta.color }}>
          {uvNow.toFixed(1)}
        </span>
        <span className="text-tds-st2 text-tds-grey-700 font-semibold">{meta.label}</span>
        <span className="text-tds-st3 text-tds-grey-500 ml-auto">맑음 {uvClear.toFixed(1)}</span>
      </div>
      <div className="text-tds-st3 text-tds-grey-500 mb-3 font-medium">{meta.advice}</div>
      <div className="h-16 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="uvGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={meta.color} stopOpacity={0.45} />
                <stop offset="100%" stopColor={meta.color} stopOpacity={0} />
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
              width={24}
              axisLine={false}
              tickLine={false}
              domain={[0, 11]}
              ticks={[0, 3, 6, 9, 11]}
            />
            <Tooltip
              cursor={{ stroke: meta.color, strokeWidth: 1, strokeDasharray: '3 3' }}
              contentStyle={{
                background: 'var(--color-tds-surface-elevated)',
                border: '1px solid var(--color-tds-grey-200)',
                borderRadius: 10,
                fontSize: 12,
                boxShadow: 'var(--shadow-tds-md)',
              }}
              formatter={(v: number) => [`${v.toFixed(1)} (${grade(v).label})`, '자외선']}
            />
            <Area type="monotone" dataKey="uv" stroke="none" fill="url(#uvGrad)" />
            <Line
              type="monotone"
              dataKey="uv"
              stroke={meta.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: meta.color, stroke: 'white', strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-between text-tds-st3 text-tds-grey-500 mt-1">
        <span>오늘 최대 <span className="font-semibold tabular-nums text-tds-grey-900">{maxUv.toFixed(1)}</span></span>
        <Sun size={12} className="text-tds-yellow" />
      </div>
    </Card>
  );
}