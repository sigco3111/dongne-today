'use client';
import { Card } from '@/components/ui/Card';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Area, ComposedChart } from 'recharts';
import type { WeatherData } from '@/types';
import { formatTemp, formatHourLabel } from '@/utils/format';
import { Sun, Cloud, CloudRain, CloudLightning, CloudFog, CloudSnow, Wind, Droplets } from 'lucide-react';

const WEATHER_ICONS: Record<number, { Icon: typeof Sun; label: string; color: string }> = {
  0: { Icon: Sun, label: '맑음', color: 'var(--color-tds-yellow)' },
  1: { Icon: Cloud, label: '구름 조금', color: 'var(--color-tds-grey-500)' },
  2: { Icon: Cloud, label: '구름 많음', color: 'var(--color-tds-grey-500)' },
  3: { Icon: Cloud, label: '흐림', color: 'var(--color-tds-grey-700)' },
  45: { Icon: CloudFog, label: '안개', color: 'var(--color-tds-grey-500)' },
  51: { Icon: CloudRain, label: '이슬비', color: 'var(--color-tds-blue)' },
  53: { Icon: CloudRain, label: '이슬비', color: 'var(--color-tds-blue)' },
  55: { Icon: CloudRain, label: '이슬비', color: 'var(--color-tds-blue)' },
  61: { Icon: CloudRain, label: '비', color: 'var(--color-tds-blue)' },
  63: { Icon: CloudRain, label: '비', color: 'var(--color-tds-blue)' },
  65: { Icon: CloudRain, label: '폭우', color: 'var(--color-tds-blue)' },
  71: { Icon: CloudSnow, label: '눈', color: 'var(--color-tds-blue-light)' },
  73: { Icon: CloudSnow, label: '눈', color: 'var(--color-tds-blue-light)' },
  75: { Icon: CloudSnow, label: '폭설', color: 'var(--color-tds-blue-light)' },
  80: { Icon: CloudRain, label: '소나기', color: 'var(--color-tds-blue)' },
  81: { Icon: CloudRain, label: '소나기', color: 'var(--color-tds-blue)' },
  82: { Icon: CloudRain, label: '폭우', color: 'var(--color-tds-blue)' },
  95: { Icon: CloudLightning, label: '천둥번개', color: 'var(--color-tds-orange)' },
  96: { Icon: CloudLightning, label: '천둥번개', color: 'var(--color-tds-orange)' },
  99: { Icon: CloudLightning, label: '천둥번개', color: 'var(--color-tds-orange)' },
};

function compass(deg: number): string {
  const dirs = ['북', '북동', '동', '남동', '남', '남서', '서', '북서'];
  const idx = Math.round(deg / 45) % 8;
  return dirs[idx];
}

export function WeatherCard({ data }: { data: WeatherData }) {
  const code = data.current.weather_code;
  const meta = WEATHER_ICONS[code] ?? { Icon: Cloud, label: '알 수 없음', color: 'var(--color-tds-grey-500)' };
  const { Icon } = meta;

  const chartData = data.hourly.time.slice(0, 24).map((t, i) => ({
    time: formatHourLabel(t),
    temp: data.hourly.temperature_2m[i] ?? 0,
    feels: data.hourly.apparent_temperature[i] ?? 0,
  }));

  const feelsNow = data.current.apparent_temperature;
  const feelsDelta = feelsNow - data.current.temperature_2m;
  const feelsHint = Math.abs(feelsDelta) < 0.5
    ? '체감 동일'
    : feelsDelta > 0
      ? `체감 +${feelsDelta.toFixed(1)}°`
      : `체감 ${feelsDelta.toFixed(1)}°`;

  return (
    <Card className="animate-stagger animate-stagger-1" padding="md">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-tds-st1 font-semibold text-tds-grey-900 tracking-tight">오늘 날씨</h3>
        <Icon size={28} strokeWidth={1.75} style={{ color: meta.color }} />
      </div>
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-tds-t1 font-bold text-tds-grey-900 tabular-nums leading-none">
          {formatTemp(data.current.temperature_2m)}
        </span>
        <span className="text-tds-st2 text-tds-grey-500 font-medium">{meta.label}</span>
      </div>
      <div className="flex items-center gap-2 mb-3 text-tds-st3 text-tds-grey-500">
        <span className="font-medium">{feelsHint}</span>
        <span className="text-tds-grey-200">·</span>
        <span className="flex items-center gap-1">
          <Wind size={11} strokeWidth={2} />
          <span className="tabular-nums">{data.current.wind_speed_10m.toFixed(1)}</span>
          <span>m/s</span>
        </span>
        <span className="text-tds-grey-200">·</span>
        <span className="flex items-center gap-1">
          <Droplets size={11} strokeWidth={2} />
          <span className="tabular-nums">{Math.round(data.current.relative_humidity_2m)}</span>
          <span>%</span>
        </span>
      </div>
      <div className="h-28 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="weatherGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-tds-blue)" stopOpacity={0.25} />
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
              formatter={(value: number, name: string) => [formatTemp(value), name === 'temp' ? '기온' : '체감']}
            />
            <Area type="monotone" dataKey="temp" stroke="none" fill="url(#weatherGrad)" />
            <Line
              type="monotone"
              dataKey="temp"
              name="temp"
              stroke="var(--color-tds-blue)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: 'var(--color-tds-blue)', stroke: 'white', strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="feels"
              name="feels"
              stroke="var(--color-tds-orange)"
              strokeWidth={1.5}
              strokeDasharray="4 3"
              dot={false}
              activeDot={{ r: 4, fill: 'var(--color-tds-orange)', stroke: 'white', strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-3 text-tds-st3 text-tds-grey-500 mt-1">
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-0.5 bg-tds-blue rounded-full" />
          <span>기온</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-0.5 bg-tds-orange rounded-full border-dashed" style={{ borderTop: '1px dashed var(--color-tds-orange)', background: 'transparent', height: 0 }} />
          <span>체감</span>
        </span>
        <span className="ml-auto text-tds-grey-400">
          풍향 <span className="font-semibold text-tds-grey-700">{compass(data.current.wind_direction_10m)}</span>
        </span>
      </div>
    </Card>
  );
}