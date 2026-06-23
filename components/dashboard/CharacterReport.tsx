'use client';
import { Card } from '@/components/ui/Card';
import { decideCharacter } from '@/utils/characterEngine';
import type { DashboardData } from '@/types';
import { MapPin, Sparkles } from 'lucide-react';

export function CharacterReport({
  data,
  neighborhoodName,
}: {
  data: DashboardData | null;
  neighborhoodName?: string;
}) {
  if (!data) {
    return (
      <Card variant="elevated" className="col-span-full">
        <div className="flex items-center gap-3 py-3 text-tds-grey-500">
          <Sparkles size={20} className="animate-pulse-soft" />
          <span className="text-tds-st2">오늘의 동네 성격을 분석하고 있어요…</span>
        </div>
      </Card>
    );
  }
  const char = decideCharacter(data);
  return (
    <Card
      variant="elevated"
      className="col-span-full relative overflow-hidden animate-stagger"
      padding="lg"
    >
      <div
        className="absolute -right-8 -top-8 text-[120px] leading-none opacity-[0.08] select-none pointer-events-none"
        aria-hidden="true"
      >
        {char.emoji}
      </div>
      {neighborhoodName && (
        <div className="flex items-center gap-1.5 text-tds-st3 text-tds-grey-500 mb-2 font-medium">
          <MapPin size={12} strokeWidth={2} />
          {neighborhoodName}
        </div>
      )}
      <div className="flex items-center gap-3 relative">
        <span className="text-5xl leading-none" aria-hidden="true">
          {char.emoji}
        </span>
        <div className="min-w-0">
          <div className="text-tds-t2 font-bold tracking-tight text-tds-grey-900 text-balance">
            {char.line}
          </div>
          <div className="text-tds-st2 text-tds-grey-700 mt-1 font-medium text-balance">
            {char.subline}
          </div>
        </div>
      </div>
    </Card>
  );
}
