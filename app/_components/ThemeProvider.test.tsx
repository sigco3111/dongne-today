import { describe, it, expect, beforeEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { ThemeProvider, setThemePref, type ThemePref } from './ThemeProvider';
import { storage } from '@/lib/storage';

describe('ThemeProvider', () => {
  beforeEach(() => {
    // Reset localStorage between tests
    storage.remove('themePref');
    document.documentElement.removeAttribute('data-theme');
  });

  describe('기본값 (localStorage 비어있을 때)', () => {
    it('html[data-theme="dark"]을 적용한다 (다크모드가 디폴트)', () => {
      render(<ThemeProvider><span>child</span></ThemeProvider>);
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('setThemePref("dark") 호출 시 html[data-theme="dark"]이 설정된다', () => {
      render(<ThemeProvider><span>child</span></ThemeProvider>);
      act(() => setThemePref('dark'));
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });

  describe('사용자 명시 저장값 처리', () => {
    it('저장된 "light" → html[data-theme="light"]', () => {
      storage.set<ThemePref>('themePref', 'light');
      render(<ThemeProvider><span>child</span></ThemeProvider>);
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('저장된 "auto" → data-theme 속성 제거 (prefers-color-scheme 위임)', () => {
      storage.set<ThemePref>('themePref', 'auto');
      render(<ThemeProvider><span>child</span></ThemeProvider>);
      expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
    });

    it('저장된 "dark" → html[data-theme="dark"]', () => {
      storage.set<ThemePref>('themePref', 'dark');
      render(<ThemeProvider><span>child</span></ThemeProvider>);
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });

  describe('setThemePref 헬퍼', () => {
    it('"light" 저장 → html[data-theme="light"] + localStorage 갱신', () => {
      render(<ThemeProvider><span>child</span></ThemeProvider>);
      act(() => setThemePref('light'));
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
      expect(storage.get<ThemePref>('themePref')).toBe('light');
    });

    it('"auto" 저장 → data-theme 속성 제거 + localStorage 갱신', () => {
      render(<ThemeProvider><span>child</span></ThemeProvider>);
      act(() => setThemePref('auto'));
      expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
      expect(storage.get<ThemePref>('themePref')).toBe('auto');
    });

    it('"dark" 저장 → html[data-theme="dark"] + localStorage 갱신', () => {
      render(<ThemeProvider><span>child</span></ThemeProvider>);
      act(() => setThemePref('dark'));
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      expect(storage.get<ThemePref>('themePref')).toBe('dark');
    });
  });
});
