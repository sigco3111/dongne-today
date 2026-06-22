/**
 * 우리 동네 오늘 — 포맷 유틸
 */

export function formatTemp(c: number): string {
  return `${Math.round(c)}°`;
}

export function formatPercent(v: number): string {
  return `${Math.round(v)}%`;
}

export function formatPm(value: number): string {
  return `${Math.round(value)}`;
}

/** "HH:00" → "오전 9시" / "오후 3시" */
export function formatHourLabel(iso: string): string {
  const hour = new Date(iso).getHours();
  if (hour === 0) return '자정';
  if (hour === 12) return '정오';
  if (hour < 12) return `오전 ${hour}시`;
  return `오후 ${hour - 12}시`;
}

/** "HH:00" → "9시" (짧은 형태) */
export function formatHourShort(iso: string): string {
  const hour = new Date(iso).getHours();
  return `${hour}시`;
}

/** ISO 날짜 → "오늘" / "내일" / "MM월 DD일" */
export function formatRelativeDate(iso: string): string {
  const target = new Date(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const targetDay = new Date(
    target.getFullYear(),
    target.getMonth(),
    target.getDate(),
  );
  if (targetDay.getTime() === today.getTime()) return '오늘';
  if (targetDay.getTime() === tomorrow.getTime()) return '내일';
  return `${target.getMonth() + 1}월 ${target.getDate()}일`;
}

/** N일 후 → "D-3" 형식 */
export function formatDaysUntil(n: number): string {
  if (n <= 0) return '오늘';
  if (n === 1) return '내일';
  return `D-${n}`;
}

/** 거리 m → "350m" / "1.2km" */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}