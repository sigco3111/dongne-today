'use client';
import { Card } from '@/components/ui/Card';
import { CalendarRange, Sprout } from 'lucide-react';
import type { CharacterHistoryEntry } from '@/types';

const DAY_LABELS = ['오늘', '1일 전', '2일 전', '3일 전', '4일 전', '5일 전', '6일 전'];
const DOW = ['일', '월', '화', '수', '목', '금', '토'];

export interface CharacterHistoryCardProps {
  /** today부터 6일 전까지 (길이 7), 결측일은 null */
  items: Array<{ date: string; entry: CharacterHistoryEntry | null }>;
  onCellClick?: (date: string, entry: CharacterHistoryEntry | null) => void;
}

function dowShort(date: string): string {
  const d = new Date(date);
  return DOW[d.getDay()];
}

/** 항목 수에 따라 그리드 컬럼 수 결정 (모바일 우선). */
function gridColsFor(total: number): string {
  if (total <= 1) return 'grid-cols-1';
  if (total === 2) return 'grid-cols-2';
  if (total <= 4) return 'grid-cols-4';
  return 'grid-cols-4 sm:grid-cols-7';
}

export function CharacterHistoryCard({ items, onCellClick }: CharacterHistoryCardProps) {
  // entry가 있는 날만 노출 — 데이터 없는 날은 "?" 대신 카드에서 숨김 (축적 UX)
  const populated = items
    .slice(0, 7)
    .map((it, i) => ({ ...it, dayOffset: i }))
    .filter(
      (it): it is { date: string; entry: CharacterHistoryEntry; dayOffset: number } =>
        it.entry !== null,
    );

  const total = populated.length;
  const isFull = total >= 7;

  return (
    <Card
      className="col-span-full animate-stagger animate-stagger-5"
      padding="md"
      data-testid="character-history-card"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CalendarRange size={18} strokeWidth={1.75} className="text-tds-grey-700" />
          <h3 className="text-tds-st1 font-semibold text-tds-grey-900 tracking-tight">
            최근 7일 동네 성격
          </h3>
        </div>
        <span
          className="text-tds-st3 text-tds-grey-500 tabular-nums"
          data-testid="history-progress"
        >
          {isFull ? 'localStorage' : `${total}/7`}
        </span>
      </div>

      {total === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-6 text-tds-st3 text-tds-grey-500"
          data-testid="history-empty"
        >
          <p className="font-medium text-tds-grey-700">아직 기록된 캐릭터가 없어요</p>
          <p className="mt-1 text-tds-grey-400">매일 방문하면 동네 성격이 쌓여요</p>
        </div>
      ) : (
        <>
          <div className={`grid ${gridColsFor(total)} gap-2`} role="list">
            {populated.map(({ date, entry, dayOffset }) => (
              <button
                key={date}
                type="button"
                role="listitem"
                aria-label={`${DAY_LABELS[dayOffset]} ${entry.kind}`}
                onClick={() => onCellClick?.(date, entry)}
                data-testid={`history-cell-${dayOffset}`}
                className="flex flex-col items-center gap-1 py-2 px-1 rounded-tds-md hover:bg-tds-grey-50 dark:hover:bg-tds-grey-100 transition-colors"
              >
                <span
                  className={`text-tds-st3 font-semibold ${
                    dayOffset === 0 ? 'text-tds-blue' : 'text-tds-grey-500'
                  }`}
                >
                  {DAY_LABELS[dayOffset]}
                </span>
                <span className="text-tds-st3 text-tds-grey-500 tabular-nums">
                  {dowShort(date)}
                </span>
                <span
                  className="text-2xl leading-none my-1"
                  data-testid={`history-emoji-${dayOffset}`}
                  aria-hidden="true"
                >
                  {entry.emoji}
                </span>
                <span className="text-tds-st3 text-tds-grey-700 text-center leading-tight line-clamp-2 h-7">
                  {entry.line}
                </span>
              </button>
            ))}
          </div>
          {!isFull && (
            <div
              className="flex items-center gap-1.5 mt-3 text-tds-st3 text-tds-grey-500"
              data-testid="history-accumulation-hint"
            >
              <Sprout size={12} strokeWidth={2} className="text-tds-green shrink-0" />
              <span>매일 방문하면 캐릭터가 쌓여요</span>
            </div>
          )}
        </>
      )}
    </Card>
  );
}