'use client';
import { Card } from '@/components/ui/Card';
import { decideCharacter } from '@/utils/characterEngine';
import type { DashboardData } from '@/types';

export interface CharacterReportProps {
  data: DashboardData | null;
}

/**
 * MBTI 캐릭터 한 줄 리포트 카드
 * - decideCharacter()는 (weather, airQuality, precipitation, holiday) 입력 받음
 * - DashboardData는 그 4개 필드를 모두 포함하므로 구조적으로 호환
 */
export function CharacterReport({ data }: CharacterReportProps) {
  if (!data) {
    return (
      <Card className="col-span-full">
        <div className="text-tds-st2 text-tds-grey-500">데이터 로딩 중…</div>
      </Card>
    );
  }
  const char = decideCharacter(data);
  return (
    <Card className="col-span-full">
      <div className="flex items-center gap-3">
        <span className="text-4xl">{char.emoji}</span>
        <div>
          <div className="text-tds-t3 font-bold text-tds-grey-900">{char.line}</div>
          <div className="text-tds-st2 text-tds-grey-700">{char.subline}</div>
        </div>
      </div>
    </Card>
  );
}