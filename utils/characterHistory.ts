import { decideCharacter, CHARACTERS } from './characterEngine';
import { storage } from '@/lib/storage';
import type {
  CharacterHistory,
  CharacterHistoryEntry,
  CharacterKind,
  CharacterReport,
  WeatherData,
  AirQualityData,
  PrecipitationData,
  HolidayData,
} from '@/types';
import { CHARACTER_HISTORY_LIMIT } from '@/types';

export const CHARACTER_HISTORY_KEY = 'characterHistory_v1';

export interface DecideAndSaveInput {
  weather: WeatherData;
  airQuality: AirQualityData;
  precipitation: PrecipitationData;
  holiday: HolidayData;
  /** 주입 가능한 now (테스트 용이성) — 생략 시 new Date() */
  now?: Date;
}

/** 오늘 날짜 YYYY-MM-DD (로컬 시간 기준) */
export function todayKey(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** localStorage에서 캐릭터 히스토리 로드 — 손상 시 빈 배열 */
export function loadHistory(): CharacterHistory {
  const stored = storage.get<CharacterHistory>(CHARACTER_HISTORY_KEY);
  if (!stored || !Array.isArray(stored.entries)) {
    if (typeof console !== 'undefined') {
      console.log('[characterHistory] loadHistory: empty or invalid, returning []');
    }
    return { entries: [], fetchedAt: new Date().toISOString() };
  }
  if (typeof console !== 'undefined') {
    console.log('[characterHistory] loadHistory:', stored.entries.length, 'entries');
  }
  return stored;
}

/**
 * 캐릭터 결정 + 오늘 날짜로 히스토리에 저장.
 * - 같은 날 이미 기록이 있으면 line/emoji를 최신 결정값으로 덮어씀 (캐릭터 룰 변경 대응)
 * - 7일 지난 항목 자동 제거
 * - 결정 → 저장 → CharacterReport 반환
 */
export function decideAndSave(input: DecideAndSaveInput): CharacterReport {
  const report = decideCharacter(input);
  const now = input.now ?? new Date();
  const date = todayKey(now);

  const history = loadHistory();
  const filtered = history.entries.filter((e) => e.date !== date);
  const newEntry: CharacterHistoryEntry = {
    date,
    kind: report.kind,
    emoji: report.emoji,
    line: report.line,
  };
  const entries = [newEntry, ...filtered]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, CHARACTER_HISTORY_LIMIT);

  storage.set<CharacterHistory>(CHARACTER_HISTORY_KEY, {
    entries,
    fetchedAt: now.toISOString(),
  });

  if (typeof console !== 'undefined') {
    console.log('[characterHistory] decideAndSave:', {
      date,
      kind: report.kind,
      emoji: report.emoji,
      totalEntries: entries.length,
      matchedRule: report.matchedRule,
    });
  }

  return report;
}

/**
 * 오늘부터 N-1일 전까지 날짜 배열 + 각 날짜의 캐릭터 (없으면 null).
 * 7일치 (오늘~6일 전) 항상 반환, 결측일은 null.
 */
export function getHistoryForRange(
  days: number = CHARACTER_HISTORY_LIMIT,
  now: Date = new Date(),
): Array<{ date: string; entry: CharacterHistoryEntry | null }> {
  const history = loadHistory();
  const byDate = new Map(history.entries.map((e) => [e.date, e]));
  const out: Array<{ date: string; entry: CharacterHistoryEntry | null }> = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = todayKey(d);
    out.push({ date: key, entry: byDate.get(key) ?? null });
  }
  return out;
}

/**
 * 7일 중 가장 많이 등장한 캐릭터 — 동률이면 최신 날짜 우선.
 */
export function mostFrequentCharacter(
  entries: CharacterHistoryEntry[],
): CharacterKind | null {
  if (!entries.length) return null;
  const counts = new Map<CharacterKind, { count: number; latest: string }>();
  for (const e of entries) {
    const cur = counts.get(e.kind);
    if (!cur) {
      counts.set(e.kind, { count: 1, latest: e.date });
    } else {
      cur.count += 1;
      if (e.date > cur.latest) cur.latest = e.date;
    }
  }
  let best: { kind: CharacterKind; count: number; latest: string } | null = null;
  for (const [kind, info] of counts) {
    if (
      !best ||
      info.count > best.count ||
      (info.count === best.count && info.latest > best.latest)
    ) {
      best = { kind, ...info };
    }
  }
  return best ? best.kind : null;
}

/** 캐릭터 kind → CHARACTERS 메타 (UI 표시용) */
export function getCharacterMeta(kind: CharacterKind): CharacterReport {
  const base = CHARACTERS[kind];
  return { ...base, matchedRule: '' };
}