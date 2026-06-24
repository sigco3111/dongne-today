import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CharacterHistoryCard } from './CharacterHistoryCard';

function makeItems(
  specs: Array<{ date: string; kind?: 'E_ACTIVE' | 'SUN_GUARD' | 'I_QUIET'; emoji?: string; line?: string }>,
) {
  return specs.map((s) => ({
    date: s.date,
    entry: s.kind
      ? { date: s.date, kind: s.kind, emoji: s.emoji ?? '☀️', line: s.line ?? '활동 E형' }
      : null,
  }));
}

describe('CharacterHistoryCard', () => {
  it('renders title', () => {
    render(<CharacterHistoryCard items={[]} />);
    expect(screen.getByText('최근 7일 동네 성격')).toBeInTheDocument();
  });

  it('renders empty state when no entries populated', () => {
    render(<CharacterHistoryCard items={makeItems([{ date: '2026-06-22' }])} />);
    expect(screen.getByTestId('history-empty')).toBeInTheDocument();
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });

  it('renders 7 cells with emoji+line when all entries present', () => {
    const items = Array.from({ length: 7 }, (_, i) => {
      const d = new Date('2026-06-22');
      d.setDate(22 - i);
      return {
        date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
        entry: { date: '', kind: 'SUN_GUARD' as const, emoji: '🧴', line: '선크림' },
      };
    });
    render(<CharacterHistoryCard items={items} />);
    const cells = screen.getAllByRole('listitem');
    expect(cells).toHaveLength(7);
    expect(screen.getAllByTestId(/^history-emoji-/)).toHaveLength(7);
    // 가득 차면 누적 힌트 없음
    expect(screen.queryByTestId('history-accumulation-hint')).not.toBeInTheDocument();
    expect(screen.getByTestId('history-progress').textContent).toBe('localStorage');
  });

  it('hides null entries and shows only populated days', () => {
    const items = makeItems([
      { date: '2026-06-22', kind: 'E_ACTIVE', emoji: '☀️', line: '활동 E형' },
      { date: '2026-06-21' }, // null
      { date: '2026-06-20', kind: 'I_QUIET', emoji: '🌙', line: 'I형' },
      { date: '2026-06-19' }, // null
    ]);
    render(<CharacterHistoryCard items={items} />);
    // 4개가 아닌 2개만 렌더링
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getAllByTestId(/^history-emoji-/)).toHaveLength(2);
    // null 데이터의 "?" 라벨은 더 이상 등장하지 않음
    expect(screen.queryByLabelText(/데이터 없음/)).not.toBeInTheDocument();
    // 누적 힌트 등장
    expect(screen.getByTestId('history-accumulation-hint')).toBeInTheDocument();
    expect(screen.getByTestId('history-progress').textContent).toBe('2/7');
  });

  it('first cell highlighted with today label and blue color', () => {
    const items = makeItems([
      { date: '2026-06-22', kind: 'E_ACTIVE', emoji: '☀️', line: '활동 E형' },
    ]);
    render(<CharacterHistoryCard items={items} />);
    const cell = screen.getByTestId('history-cell-0');
    expect(cell).toBeInTheDocument();
    expect(screen.getByText('오늘')).toBeInTheDocument();
  });

  it('single populated day renders in single-column layout (no awkward empty grid)', () => {
    const items = makeItems([
      { date: '2026-06-22', kind: 'SUN_GUARD', emoji: '🧴', line: '선크림 동네' },
    ]);
    render(<CharacterHistoryCard items={items} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByTestId('history-progress').textContent).toBe('1/7');
  });
});