import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { HolidayData } from '@/types';
import { PartyPopper, Briefcase, Coffee, TreePalm } from 'lucide-react';

export function HolidayCard({ data }: { data: HolidayData }) {
  return (
    <Card className="animate-stagger animate-stagger-4" padding="md">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-tds-st1 font-semibold text-tds-grey-900 tracking-tight">공휴일</h3>
        {data.isHoliday
          ? <PartyPopper size={20} strokeWidth={1.75} className="text-tds-red" />
          : data.isWeekday
            ? <Briefcase size={20} strokeWidth={1.75} className="text-tds-grey-500" />
            : <TreePalm size={20} strokeWidth={1.75} className="text-tds-green" />}
      </div>
      {data.isHoliday ? (
        <div className="flex flex-col gap-2 mt-2">
          <Badge variant="red">{data.holidayName}</Badge>
          <span className="text-tds-st2 text-tds-grey-700 font-medium">오늘은 공휴일</span>
        </div>
      ) : (
        <div className="flex flex-col gap-2 mt-2">
          <Badge variant={data.isWeekday ? 'grey' : 'green'}>
            {data.isWeekday ? '평일' : '주말'}
          </Badge>
          {data.holidayName && data.daysUntilNext > 0 && (
            <span className="text-tds-st3 text-tds-grey-500">
              다음 휴일 <span className="font-semibold text-tds-grey-900">{data.holidayName}</span>
              {' · '}
              <span className="font-semibold tabular-nums text-tds-blue">D-{data.daysUntilNext}</span>
            </span>
          )}
        </div>
      )}
    </Card>
  );
}
