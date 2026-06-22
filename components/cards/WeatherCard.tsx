'use client';
import { Card } from '@/components/ui/Card';
import type { WeatherData } from '@/types';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { formatTemp, formatHourLabel } from '@/utils/format';

// Open-Meteo WMO weather codes → 라벨 + 이모지
// https://open-meteo.com/en/docs (WMO Weather interpretation codes)
const WEATHER_LABELS: Record<number, { label: string; emoji: string }> = {
  0: { label: '맑음', emoji: '☀️' },
  1: { label: '구름 조금', emoji: '⛅' },
  2: { label: '구름 많음', emoji: '⛅' },
  3: { label: '흐림', emoji: '☁️' },
  45: { label: '안개', emoji: '🌫️' },
  48: { label: '서리 안개', emoji: '🌫️' },
  51: { label: '이슬비', emoji: '🌦️' },
  61: { label: '비', emoji: '🌧️' },
  63: { label: '강한 비', emoji: '🌧️' },
  71: { label: '눈', emoji: '🌨️' },
  95: { label: '천둥번개', emoji: '⛈️' },
};

export interface WeatherCardProps {
  data: WeatherData;
}

/**
 * 오늘 날씨 카드 — 현재 기온/날씨 + 24시간 기온 라인차트
 */
export function WeatherCard({ data }: WeatherCardProps) {
  const code = data.current.weather_code;
  const meta = WEATHER_LABELS[code] ?? { label: '알 수 없음', emoji: '❓' };

  // 처음 24시간만 사용 (오늘 분량)
  const chartData = data.hourly.time.slice(0, 24).map((t, i) => ({
    time: formatHourLabel(t),
    temp: data.hourly.temperature_2m[i] ?? 0,
  }));

  return (
    <Card>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-tds-st1">🌤️</span>
        <h3 className="text-tds-st1 font-medium text-tds-grey-900">오늘 날씨</h3>
      </div>
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-tds-t1 font-bold text-tds-grey-900">
          {formatTemp(data.current.temperature_2m)}
        </span>
        <span className="text-tds-st2 text-tds-grey-700">
          {meta.emoji} {meta.label}
        </span>
      </div>
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: 'var(--color-tds-grey-500)' }}
              interval={3}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'var(--color-tds-grey-500)' }}
              width={28}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--color-tds-bg)',
                border: '1px solid var(--color-tds-grey-200)',
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Line
              type="monotone"
              dataKey="temp"
              stroke="var(--color-tds-blue)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}