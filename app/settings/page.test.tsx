import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { storage } from '@/lib/storage';

// Mock next/navigation so router.push doesn't blow up
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn(), forward: vi.fn() }),
}));

// Mock the storage-backed hooks so the page renders without real localStorage + SWR plumbing
vi.mock('@/lib/hooks/useNeighborhood', () => ({
  useNeighborhood: () => ({
    neighborhood: { name: '테스트동네', lat: 37.5665, lon: 126.978 },
    isLoading: false,
    save: vi.fn(),
    clear: vi.fn(),
  }),
}));
vi.mock('@/lib/hooks/useFriends', () => ({
  useFriends: () => ({ friends: [], add: vi.fn(), remove: vi.fn(), maxFriends: 5 }),
}));
vi.mock('@/lib/hooks/useAutoRedetect', () => ({
  useAutoRedetect: vi.fn(),
}));
vi.mock('@/lib/api/geocoding', () => ({
  searchAddress: vi.fn(async () => []),
}));
vi.mock('@/lib/notify', () => ({
  requestNotificationPermission: vi.fn(async () => false),
}));

// Mock theme pref cycle so the cycle button test stays deterministic
const mockCycleRef = vi.fn();
vi.mock('@/app/_components/ThemeProvider', async () => {
  const actual = await vi.importActual<typeof import('@/app/_components/ThemeProvider')>(
    '@/app/_components/ThemeProvider',
  );
  return {
    ...actual,
    setThemePref: vi.fn((p) => {
      mockCycleRef(p);
    }),
  };
});

import SettingsPage from './page';

describe('SettingsPage — theme default', () => {
  beforeEach(() => {
    storage.remove('themePref');
    storage.remove('neighborhood');
    storage.remove('onboardingDone');
    document.documentElement.removeAttribute('data-theme');
    mockCycleRef.mockClear();
  });

  it('localStorage 비어있을 때 테마 디폴트가 "다크"로 시작한다 (버튼 라벨 = "다크")', () => {
    render(<SettingsPage />);
    // 테마 카드의 순환 버튼. 초기 디폴트 = 'dark' → 라벨 "다크"
    const themeBtn = screen.getByRole('button', { name: /다크/i });
    expect(themeBtn).toBeInTheDocument();
  });

  it('localStorage 비어있을 때 테마 설명란에 "다크"가 표시된다', () => {
    const { container } = render(<SettingsPage />);
    const themeH2 = Array.from(container.querySelectorAll('h2')).find(
      (h) => h.textContent?.trim() === '테마',
    );
    expect(themeH2).toBeTruthy();
    const desc = themeH2!.parentElement?.querySelector('p');
    expect(desc?.textContent?.trim()).toBe('다크');
  });

  it('저장된 themePref="light"가 있으면 "라이트"로 시작한다', () => {
    storage.set('themePref', 'light');
    render(<SettingsPage />);
    const themeBtn = screen.getByRole('button', { name: /라이트/i });
    expect(themeBtn).toBeInTheDocument();
  });

  it('저장된 themePref="auto"가 있으면 "자동"으로 시작한다', () => {
    storage.set('themePref', 'auto');
    render(<SettingsPage />);
    const themeBtn = screen.getByRole('button', { name: /자동/i });
    expect(themeBtn).toBeInTheDocument();
  });

  it('테마 순환 버튼 클릭 시 setThemePref가 호출된다', () => {
    render(<SettingsPage />);
    const themeBtn = screen.getByRole('button', { name: /다크/i });
    fireEvent.click(themeBtn);
    // 초기 'dark' → 다음 'auto' 로 순환
    expect(mockCycleRef).toHaveBeenCalledWith('auto');
  });
});
