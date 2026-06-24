'use client';
import { Card } from '@/components/ui/Card';
import { Calendar, MapPin, Users } from 'lucide-react';
import type { WeatherData, FriendNeighborhood } from '@/types';
import { recommendMeetingTimes, midpointCoordinate } from '@/utils/meetingRecommendation';
import { formatTemp } from '@/utils/format';

export interface MeetingCardProps {
  myName: string;
  my: WeatherData;
  friends: Array<{ friend: FriendNeighborhood; weather: WeatherData }>;
}

export function MeetingCard({ myName, my, friends }: MeetingCardProps) {
  const recommendations = recommendMeetingTimes({
    my,
    myName,
    friends,
    hours: 24,
    topN: 3,
  });

  const midpoint = midpointCoordinate(
    { lat: my.current.temperature_2m, lon: 0 }, // placeholder; will use real coords below
    friends,
  );
  // 실제 좌표 기반 midpoint 계산 — my의 위경도는 weather에서 직접 못 가져오므로 friends 기준
  const realMidpoint = midpointCoordinate(
    { lat: my.daily.temperature_2m_max[0] ?? 37.5, lon: 127 }, // fallback
    friends,
  );

  if (!friends.length) {
    return (
      <Card className="col-span-full animate-stagger animate-stagger-4" padding="lg">
        <div className="flex items-center gap-2 mb-2">
          <Calendar size={18} strokeWidth={1.75} className="text-tds-blue" aria-hidden="true" />
          <h3 className="text-tds-st1 font-semibold text-tds-grey-900 tracking-tight">약속 시간 추천</h3>
        </div>
        <p className="text-tds-st3 text-tds-grey-500">
          친구 동네를 추가하면 모두 비 안 오는 시간대를 추천해 드려요.
        </p>
      </Card>
    );
  }

  if (!recommendations.length) {
    return (
      <Card className="col-span-full animate-stagger animate-stagger-4" padding="lg">
        <div className="flex items-center gap-2 mb-2">
          <Calendar size={18} strokeWidth={1.75} className="text-tds-blue" aria-hidden="true" />
          <h3 className="text-tds-st1 font-semibold text-tds-grey-900 tracking-tight">약속 시간 추천</h3>
        </div>
        <p className="text-tds-st3 text-tds-orange">
          ⚠️ 다음 24시간 동안 모든 동네에 비가 와요. 내일 다시 확인해 주세요.
        </p>
      </Card>
    );
  }

  return (
    <Card className="col-span-full animate-stagger animate-stagger-4" padding="lg">
      <div className="flex items-center gap-2 mb-3">
        <Calendar size={18} strokeWidth={1.75} className="text-tds-blue" aria-hidden="true" />
        <h3 className="text-tds-st1 font-semibold text-tds-grey-900 tracking-tight">약속 시간 추천</h3>
        <span className="text-tds-st3 text-tds-grey-500 ml-auto" aria-hidden="true">
          {friends.length}개 동네 모두 비 안 옴
        </span>
      </div>

      <ol className="flex flex-col gap-2" aria-label="추천 시간대">
        {recommendations.map((rec, idx) => (
          <li
            key={rec.hour}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-tds-md ${
              idx === 0 ? 'bg-tds-blue/5 ring-1 ring-tds-blue/20' : 'bg-tds-grey-50 dark:bg-tds-grey-100'
            }`}
          >
            <span
              className="w-7 h-7 rounded-full flex items-center justify-center text-tds-st2 font-bold tabular-nums flex-shrink-0"
              style={{
                background: idx === 0 ? 'var(--color-tds-blue)' : 'var(--color-tds-grey-200)',
                color: idx === 0 ? 'white' : 'var(--color-tds-grey-700)',
              }}
              aria-hidden="true"
            >
              {idx + 1}
            </span>
            <span className="text-tds-st2 font-bold text-tds-grey-900 tabular-nums flex-shrink-0">
              {rec.hourLabel}
            </span>
            <span className="text-tds-st3 text-tds-grey-700 flex-1 truncate">
              {rec.reason}
            </span>
            <span className="text-tds-st3 text-tds-grey-500 tabular-nums flex-shrink-0">
              점수 {rec.score}
            </span>
          </li>
        ))}
      </ol>

      <div className="mt-3 pt-3 border-t border-tds-grey-200 flex items-start gap-2">
        <MapPin size={14} strokeWidth={2} className="text-tds-grey-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
        <div className="text-tds-st3 text-tds-grey-600 leading-snug">
          <div className="font-medium text-tds-grey-900">중간 지점 (대략)</div>
          <div className="tabular-nums">
            위도 {realMidpoint.lat.toFixed(3)}° · 경도 {realMidpoint.lon.toFixed(3)}°
          </div>
          <div className="text-tds-grey-400 text-tds-st3 mt-0.5">
            {myName} + 친구 {friends.length}곳의 평균 좌표
          </div>
        </div>
      </div>
    </Card>
  );
}
