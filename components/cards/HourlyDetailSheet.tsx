'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Area, AreaChart, CartesianGrid } from 'recharts';
import type { WeatherData, AirQualityData } from '@/types';
import { formatHourLabel } from '@/utils/format';
import { X, Wind, Droplets, Thermometer, Sun } from 'lucide-react';

export type HourlyMetric = 'temperature' | 'feels' | 'wind' | 'humidity' | 'uv' | 'pm25' | 'precip';

export interface HourlyDetailSheetProps {
  open: boolean;
  onClose: () => void;
  weather: WeatherData;
  airQuality: AirQualityData;
  /** 열릴 때 기본 선택 metric */
  defaultMetric?: HourlyMetric;
}

const METRIC_LABELS: Record<HourlyMetric, { label: string; unit: string; icon: typeof Wind }> = {
  temperature: { label: '기온', unit: '°C', icon: Thermometer },
  feels: { label: '체감', unit: '°C', icon: Thermometer },
  wind: { label: '풍속', unit: 'm/s', icon: Wind },
  humidity: { label: '습도', unit: '%', icon: Droplets },
  uv: { label: '자외선', unit: '', icon: Sun },
  pm25: { label: 'PM2.5', unit: 'μg/m³', icon: Wind },
  precip: { label: '강수확률', unit: '%', icon: Droplets },
};

const METRIC_COLORS: Record<HourlyMetric, string> = {
  temperature: 'var(--color-tds-blue)',
  feels: 'var(--color-tds-orange)',
  wind: 'var(--color-tds-grey-500)',
  humidity: 'var(--color-tds-blue-light)',
  uv: 'var(--color-tds-red)',
  pm25: 'var(--color-tds-purple)',
  precip: 'var(--color-tds-blue)',
};

function metricValue(metric: HourlyMetric, data: WeatherData, airQuality: AirQualityData, idx: number): number {
  switch (metric) {
    case 'temperature': return data.hourly.temperature_2m[idx] ?? 0;
    case 'feels': return data.hourly.apparent_temperature[idx] ?? 0;
    case 'wind': return data.hourly.wind_speed_10m[idx] ?? 0;
    case 'humidity': return data.current.relative_humidity_2m;
    case 'uv': return data.hourly.uv_index[idx] ?? 0;
    case 'pm25': return airQuality.current.pm2_5;
    case 'precip': return data.hourly.precipitation_probability[idx] ?? 0;
  }
}

function buildChartData(metric: HourlyMetric, weather: WeatherData, airQuality: AirQualityData) {
  return weather.hourly.time.slice(0, 24).map((t, i) => ({
    time: formatHourLabel(t),
    value: metricValue(metric, weather, airQuality, i),
  }));
}

export function HourlyDetailSheet({
  open,
  onClose,
  weather,
  airQuality,
  defaultMetric = 'temperature',
}: HourlyDetailSheetProps) {
  const [metric, setMetric] = useState<HourlyMetric>(defaultMetric);
  const [hourIdx, setHourIdx] = useState(0);

  useEffect(() => {
    if (open) setMetric(defaultMetric);
  }, [open, defaultMetric]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const chartData = buildChartData(metric, weather, airQuality);
  const value = metricValue(metric, weather, airQuality, hourIdx);
  const meta = METRIC_LABELS[metric];
  const color = METRIC_COLORS[metric];
  const hourLabel = chartData[hourIdx]?.time ?? '--';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm animate-stagger"
      role="dialog"
      aria-modal="true"
      aria-label="시간별 상세"
      data-testid="hourly-detail-sheet"
      onClick={onClose}
    >
      <div
        className="w-full max-w-screen-md bg-tds-bg rounded-tds-xl shadow-tds-lg overflow-hidden animate-stagger animate-stagger-1"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-tds-grey-200">
          <div>
            <div className="text-tds-st3 text-tds-grey-500 font-medium">시간별 상세</div>
            <div className="text-tds-t3 font-bold text-tds-grey-900 mt-0.5 tabular-nums">{hourLabel}</div>
          </div>
          <Button variant="weak" size="sm" onClick={onClose} aria-label="닫기" data-testid="sheet-close">
            <X size={14} strokeWidth={2} />
            닫기
          </Button>
        </div>

        <div className="p-5">
          {/* Metric tabs */}
          <div className="flex flex-wrap gap-1.5 mb-4" role="tablist">
            {(Object.keys(METRIC_LABELS) as HourlyMetric[]).map((m) => {
              const isActive = metric === m;
              return (
                <button
                  key={m}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setMetric(m)}
                  data-testid={`metric-tab-${m}`}
                  className={
                    isActive
                      ? 'px-3 py-1.5 rounded-tds-pill text-tds-st3 font-semibold bg-tds-blue text-white transition-colors'
                      : 'px-3 py-1.5 rounded-tds-pill text-tds-st3 font-medium bg-tds-grey-100 text-tds-grey-700 hover:bg-tds-grey-200 transition-colors'
                  }
                >
                  {METRIC_LABELS[m].label}
                </button>
              );
            })}
          </div>

          {/* Big value */}
          <div className="flex items-baseline gap-2 mb-4" data-testid="sheet-current-value">
            <span className="text-5xl font-bold tabular-nums leading-none" style={{ color }}>
              {metric === 'uv' || metric === 'pm25' ? Math.round(value) : value.toFixed(1)}
            </span>
            {meta.unit && <span className="text-tds-st2 text-tds-grey-500">{meta.unit}</span>}
            <span className="text-tds-st3 text-tds-grey-500 ml-2">{meta.label}</span>
          </div>

          {/* Hourly chart */}
          <Card padding="sm" variant="flat">
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="sheetGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity={0.45} />
                      <stop offset="100%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--color-tds-grey-200)" strokeDasharray="3 3" />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'var(--color-tds-grey-500)' }} interval={3} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--color-tds-grey-500)' }} width={32} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--color-tds-surface-elevated)',
                      border: '1px solid var(--color-tds-grey-200)',
                      borderRadius: 10,
                      fontSize: 12,
                    }}
                    formatter={(v: number) => [`${v.toFixed(1)}${meta.unit ? ' ' + meta.unit : ''}`, meta.label]}
                  />
                  <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill="url(#sheetGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Hour slider */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-tds-st3 text-tds-grey-500 font-medium">시간 슬라이더</span>
              <span className="text-tds-st3 text-tds-grey-700 tabular-nums font-semibold">{hourLabel}</span>
            </div>
            <input
              type="range"
              min={0}
              max={Math.max(0, chartData.length - 1)}
              value={hourIdx}
              onChange={(e) => setHourIdx(Number(e.target.value))}
              aria-label="시간 슬라이더"
              data-testid="hour-slider"
              className="w-full h-2 bg-tds-grey-100 rounded-full appearance-none cursor-pointer accent-tds-blue"
            />
            <div className="flex justify-between text-tds-st3 text-tds-grey-400 mt-1 tabular-nums">
              <span>자정</span>
              <span>정오</span>
              <span>자정</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}