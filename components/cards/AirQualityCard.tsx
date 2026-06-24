'use client';
import { Card } from '@/components/ui/Card';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';
import type { AirQualityData } from '@/types';
import { Wind, Smile, Meh, Frown, Skull } from 'lucide-react';

function grade(pm25: number): {
  label: string;
  color: string;
  Icon: typeof Smile;
} {
  if (pm25 <= 15) return { label: '좋음', color: 'var(--color-tds-green)', Icon: Smile };
  if (pm25 <= 35) return { label: '보통', color: 'var(--color-tds-yellow)', Icon: Meh };
  if (pm25 <= 75) return { label: '나쁨', color: 'var(--color-tds-orange)', Icon: Frown };
  return { label: '매우 나쁨', color: 'var(--color-tds-red)', Icon: Skull };
}

export function AirQualityCard({ data }: { data: AirQualityData }) {
  const pm25 = data.current.pm2_5;
  const pm10 = data.current.pm10;
  const ozone = data.current.ozone;
  const aqi = data.current.europeanAqi;
  const { label, color, Icon } = grade(pm25);
  const ratio = Math.min(100, (pm25 / 100) * 100);
  const aqiLevel = aqi <= 50 ? '좋음' : aqi <= 100 ? '보통' : aqi <= 150 ? '나쁨' : '매우나쁨';

  return (
    <Card className="animate-stagger animate-stagger-2" padding="md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-tds-st1 font-semibold text-tds-grey-900 tracking-tight">미세먼지</h3>
        <Wind size={20} strokeWidth={1.75} className="text-tds-grey-500" aria-hidden="true" />
      </div>
      <div
        className="flex items-center gap-4"
        role="group"
        aria-label={`미세먼지 등급 ${label}, PM2.5 ${Math.round(pm25)}μg/m³`}
      >
        <div className="relative w-20 h-20 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              innerRadius="75%"
              outerRadius="100%"
              data={[{ name: 'pm25', value: ratio, fill: color }]}
              startAngle={90}
              endAngle={-270}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar background={{ fill: 'var(--color-tds-grey-100)' }} dataKey="value" cornerRadius={8} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon size={22} strokeWidth={1.75} style={{ color }} aria-label={label} />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-tds-t3 font-bold tracking-tight" style={{ color }}>
            <span aria-hidden="true">{label}</span>
            <span className="sr-only">미세먼지 등급 {label}</span>
          </div>
          <div className="text-tds-st3 text-tds-grey-500 mt-0.5">
            PM2.5 <span className="font-semibold tabular-nums text-tds-grey-900">{Math.round(pm25)}</span>
            <span className="text-tds-st3 ml-1">μg/m³</span>
          </div>
          <div className="text-tds-st3 text-tds-grey-500 mt-0.5 flex flex-wrap gap-x-2">
            <span>
              PM10 <span className="font-semibold tabular-nums text-tds-grey-700">{Math.round(pm10)}</span>
            </span>
            <span className="text-tds-grey-300" aria-hidden="true">·</span>
            <span>
              O₃ <span className="font-semibold tabular-nums text-tds-grey-700">{Math.round(ozone)}</span>
            </span>
            <span className="text-tds-grey-300" aria-hidden="true">·</span>
            <span>
              AQI <span className="font-semibold tabular-nums text-tds-grey-700">{aqi}</span>
              <span className="ml-1 text-tds-st3 text-tds-grey-400">({aqiLevel})</span>
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
