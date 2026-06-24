'use client';
import { Card } from '@/components/ui/Card';
import type { WeatherData } from '@/types';
import { CalendarDays, Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudFog } from 'lucide-react';

const WEATHER_ICON: Record<number, { Icon: typeof Sun; color: string }> = {
  0: { Icon: Sun, color: 'var(--color-tds-yellow)' },
  1: { Icon: Sun, color: 'var(--color-tds-yellow)' },
  2: { Icon: Cloud, color: 'var(--color-tds-grey-500)' },
  3: { Icon: Cloud, color: 'var(--color-tds-grey-700)' },
  45: { Icon: CloudFog, color: 'var(--color-tds-grey-500)' },
  48: { Icon: CloudFog, color: 'var(--color-tds-grey-500)' },
  51: { Icon: CloudRain, color: 'var(--color-tds-blue)' },
  53: { Icon: CloudRain, color: 'var(--color-tds-blue)' },
  55: { Icon: CloudRain, color: 'var(--color-tds-blue)' },
  61: { Icon: CloudRain, color: 'var(--color-tds-blue)' },
  63: { Icon: CloudRain, color: 'var(--color-tds-blue)' },
  65: { Icon: CloudRain, color: 'var(--color-tds-blue)' },
  71: { Icon: CloudSnow, color: 'var(--color-tds-blue-light)' },
  73: { Icon: CloudSnow, color: 'var(--color-tds-blue-light)' },
  75: { Icon: CloudSnow, color: 'var(--color-tds-blue-light)' },
  80: { Icon: CloudRain, color: 'var(--color-tds-blue)' },
  81: { Icon: CloudRain, color: 'var(--color-tds-blue)' },
  82: { Icon: CloudRain, color: 'var(--color-tds-blue)' },
  95: { Icon: CloudLightning, color: 'var(--color-tds-orange)' },
  96: { Icon: CloudLightning, color: 'var(--color-tds-orange)' },
  99: { Icon: CloudLightning, color: 'var(--color-tds-orange)' },
};

function formatDateLabel(iso: string, index: number): string {
  if (index === 0) return '오늘';
  if (index === 1) return '내일';
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function formatDayOfWeek(iso: string, index: number): string {
  if (index === 0) return '오늘';
  if (index === 1) return '내일';
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return days[new Date(iso).getDay()];
}

export function WeeklyCard({ data }: { data: WeatherData }) {
  const days = data.daily.time.slice(0, 7);

  return (
    <Card className="col-span-full animate-stagger animate-stagger-5" padding="md">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CalendarDays size={18} strokeWidth={1.75} className="text-tds-grey-700" />
          <h3 className="text-tds-st1 font-semibold text-tds-grey-900 tracking-tight">7일 예보</h3>
        </div>
        <span className="text-tds-st3 text-tds-grey-500">Open-Meteo</span>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {days.map((iso, i) => {
          const code = data.daily.weather_code[i] ?? 0;
          const meta = WEATHER_ICON[code] ?? { Icon: Cloud, color: 'var(--color-tds-grey-500)' };
          const { Icon } = meta;
          const max = Math.round(data.daily.temperature_2m_max[i] ?? 0);
          const min = Math.round(data.daily.temperature_2m_min[i] ?? 0);
          const prob = data.daily.precipitation_probability_max[i] ?? 0;
          const uv = data.daily.uv_index_max[i] ?? 0;

          return (
            <div
              key={iso}
              className="flex flex-col items-center gap-1 py-2 rounded-tds-md hover:bg-tds-grey-50 dark:hover:bg-tds-grey-100 transition-colors"
            >
              <span className={`text-tds-st3 font-semibold ${i === 0 ? 'text-tds-blue' : 'text-tds-grey-500'}`}>
                {formatDayOfWeek(iso, i)}
              </span>
              <span className="text-tds-st3 text-tds-grey-500 tabular-nums">
                {formatDateLabel(iso, i)}
              </span>
              <Icon size={20} strokeWidth={1.75} style={{ color: meta.color }} className="my-1" />
              <div className="flex items-baseline gap-1">
                <span className="text-tds-st2 font-bold tabular-nums text-tds-grey-900">{max}°</span>
                <span className="text-tds-st3 text-tds-grey-500 tabular-nums">{min}°</span>
              </div>
              <div className="flex items-center gap-1 text-tds-st3 text-tds-blue tabular-nums h-4">
                {prob >= 10 ? (
                  <>
                    <CloudRain size={10} strokeWidth={2} />
                    <span>{prob}%</span>
                  </>
                ) : (
                  <span className="text-tds-grey-400">·</span>
                )}
              </div>
              <div className="flex items-center gap-0.5 text-tds-st3 text-tds-grey-500 tabular-nums">
                {uv >= 6 && (
                  <>
                    <Sun size={9} strokeWidth={2} className="text-tds-orange" />
                    <span>{uv.toFixed(0)}</span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}