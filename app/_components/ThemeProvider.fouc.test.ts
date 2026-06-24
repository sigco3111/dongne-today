import { describe, it, expect, beforeEach } from 'vitest';
import { applyThemeFromStorage } from './ThemeProvider';

describe('FOUC 방지: applyThemeFromStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('localStorage 비어있을 때 다크모드(data-theme="dark")를 즉시 적용한다 (디폴트)', () => {
    applyThemeFromStorage();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('localStorage "light" → data-theme="light"', () => {
    localStorage.setItem('themePref', JSON.stringify('light'));
    applyThemeFromStorage();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('localStorage "auto" → data-theme 속성 제거 (CSS @media 위임)', () => {
    localStorage.setItem('themePref', JSON.stringify('auto'));
    applyThemeFromStorage();
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
  });

  it('localStorage "dark" → data-theme="dark"', () => {
    localStorage.setItem('themePref', JSON.stringify('dark'));
    applyThemeFromStorage();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('localStorage에 잘못된 값 → 안전한 디폴트(data-theme="dark") 적용', () => {
    localStorage.setItem('themePref', '"broken-value"');
    applyThemeFromStorage();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('localStorage JSON parse 실패 → 안전한 디폴트 적용', () => {
    localStorage.setItem('themePref', '{not json');
    applyThemeFromStorage();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
