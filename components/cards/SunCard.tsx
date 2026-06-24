'use client';
import { Card } from '@/components/ui/Card';
import type { WeatherData } from '@/types';
import { Sunrise, Sunset } from 'lucide-react';

function formatHHMM(iso: string): string {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h <= 0) return `${m}분`;
  if (m === 0) return `${h}시간`;
  return `${h}시간 ${m}분`;
}

export function SunCard({ data }: { data: WeatherData }) {
  const today = new Date().toISOString().slice(0, 10);
  const idx = data.daily.time.findIndex((d) => d === today);
  const safeIdx = idx === -1 ? 0 : idx;

  const sunriseISO = data.daily.sunrise[safeIdx] ?? '';
  const sunsetISO = data.daily.sunset[safeIdx] ?? '';
  const daylightSec = data.daily.daylight_duration[safeIdx] ?? 0;
  const daylightMin = Math.round(daylightSec / 60);

  const sunriseLabel = sunriseISO ? formatHHMM(sunriseISO) : '--:--';
  const sunsetLabel = sunsetISO ? formatHHMM(sunsetISO) : '--:--';

  const now = Date.now();
  const sunriseMs = sunriseISO ? new Date(sunriseISO).getTime() : 0;
  const sunsetMs = sunsetISO ? new Date(sunsetISO).getTime() : 0;
  const remainingMin = sunsetMs > now ? Math.round((sunsetMs - now) / 60000) : 0;
  const elapsed = now > sunriseMs && sunsetMs > now ? (now - sunriseMs) / 60000 : 0;
  const progress = daylightMin > 0 ? Math.min(100, Math.max(0, (elapsed / daylightMin) * 100)) : 0;

  return (
    <Card className="animate-stagger animate-stagger-4" padding="md" data-testid="sun-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-tds-st1 font-semibold text-tds-grey-900 tracking-tight">일출·일몰</h3>
        <Sunset size={20} strokeWidth={1.75} className="text-tds-orange" />
      </div>

      {/* 상단: 일출 / 일몰 시간 */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Sunrise size={18} strokeWidth={1.75} className="text-tds-yellow flex-shrink-0" />
          <div className="flex flex-col">
            <span className="text-tds-st3 text-tds-grey-500 font-medium leading-none">일출</span>
            <span className="text-tds-st1 font-bold tabular-nums text-tds-grey-900 mt-1" data-testid="sunrise-label">
              {sunriseLabel}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-end">
            <span className="text-tds-st3 text-tds-grey-500 font-medium leading-none">일몰</span>
            <span className="text-tds-st1 font-bold tabular-nums text-tds-grey-900 mt-1" data-testid="sunset-label">
              {sunsetLabel}
            </span>
          </div>
          <Sunset size={18} strokeWidth={1.75} className="text-tds-orange flex-shrink-0" />
        </div>
      </div>

      {/* 진행 바 */}
      <div className="relative h-1.5 bg-tds-grey-100 rounded-full mb-3 overflow-visible" aria-label={`오늘 일조 ${progress.toFixed(0)}% 경과`}>
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-tds-yellow to-tds-orange rounded-full transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
        {progress > 0 && progress < 100 && (
          <div
            className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-tds-orange shadow-tds-sm border-2 border-white transition-all duration-700"
            style={{ left: `calc(${progress}% - 5px)` }}
            aria-hidden="true"
          />
        )}
      </div>

      {/* 하단: 일조 시간 + 남은 시간 */}
      <div className="flex items-end justify-between gap-2">
        <div className="flex flex-col">
          <span className="text-tds-st3 text-tds-grey-500 font-medium leading-none">일조 시간</span>
          <span className="text-tds-t3 font-bold tabular-nums text-tds-grey-900 mt-1" data-testid="daylight-label">
            {formatDuration(daylightMin)}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-tds-st3 text-tds-grey-500 font-medium leading-none">
            {remainingMin > 0 ? '일몰까지' : '오늘 일조'}
          </span>
          <span className="text-tds-st2 font-semibold tabular-nums text-tds-blue mt-1">
            {remainingMin > 0 ? formatDuration(remainingMin) : '완료'}
          </span>
        </div>
      </div>
    </Card>
  );
}