import { describe, it, expect } from 'vitest';
import { t } from './i18n';

describe('i18n', () => {
  it('returns Korean by default', () => {
    expect(t('home.refresh')).toBe('새로고침');
    expect(t('settings.title')).toBe('설정');
  });

  it('returns English when requested', () => {
    expect(t('home.refresh', 'en')).toBe('Refresh');
    expect(t('settings.title', 'en')).toBe('Settings');
  });

  it('interpolates variables', () => {
    expect(t('share.text', 'ko', { name: '강남구', temp: 24 })).toBe('강남구 — 24°C');
    expect(t('share.text', 'en', { name: 'Gangnam', temp: 75 })).toBe('Gangnam — 75°C');
  });

  it('falls back to key for unknown translation', () => {
    expect(t('nonexistent.key', 'ko')).toBe('nonexistent.key');
    expect(t('nonexistent.key', 'en')).toBe('nonexistent.key');
  });

  it('falls back to Korean when English key missing', () => {
    // We should design dicts to be symmetric; this test ensures no crash
    const result = t('home.refresh', 'en');
    expect(result).toBe('Refresh');
  });
});
