import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { HolidayData } from '@/types';
import { formatDaysUntil } from '@/utils/format';

export interface HolidayCardProps {
  data: HolidayData;
}

/**
 * 공휴일 카드 — 오늘 공휴일 여부 + 다음 공휴일 D-day
 * - 공휴일이면 빨간 배지 + "오늘은 공휴일!"
 * - 평일/주말 배지 + 다음 공휴일명·D-N
 *
 * 타입 주의: HolidayData의 필드명은 holidayName / daysUntilNext
 * (이전 plan 예시와 다름 — types/index.ts 기준)
 */
export function HolidayCard({ data }: HolidayCardProps) {
  return (
    <Card>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-tds-st1">🎭</span>
        <h3 className="text-tds-st1 font-medium">공휴일</h3>
      </div>
      {data.isHoliday ? (
        <div className="flex flex-col gap-2">
          <Badge variant="red">🎉 {data.holidayName ?? '공휴일'}</Badge>
          <span className="text-tds-st3 text-tds-grey-500">오늘은 공휴일!</span>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <Badge variant="grey">{data.isWeekday ? '평일' : '주말'}</Badge>
          {data.holidayName !== null && data.daysUntilNext > 0 && (
            <span className="text-tds-st3 text-tds-grey-500">
              다음 공휴일: {data.holidayName} ({formatDaysUntil(data.daysUntilNext)})
            </span>
          )}
        </div>
      )}
    </Card>
  );
}