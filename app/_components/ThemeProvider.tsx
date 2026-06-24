'use client';
import { useEffect } from 'react';
import { storage } from '@/lib/storage';

export type ThemePref = 'light' | 'dark' | 'auto';

/**
 * 기본 테마. 사용자 명시 저장값이 없을 때 적용.
 * - 변경 이력: v0.x → 'auto' (시스템 설정 따름). 2026-06-24 다크모드 디폴트 정책으로 'dark'로 변경.
 */
export const DEFAULT_THEME_PREF: ThemePref = 'dark';

/**
 * localStorage 'themePref'를 읽어 html[data-theme]을 즉시 설정.
 * ThemeProvider 마운트(useEffect) 전 또는 React hydrate 전에 호출되어 FOUC를 방지한다.
 *
 * - 저장값 없음 → 디폴트(DEFAULT_THEME_PREF = 'dark') 적용
 * - 'dark' | 'light' → 해당 속성 설정
 * - 'auto' | 그 외 → 속성 제거 (prefers-color-scheme에 위임)
 * - JSON parse 실패 → 안전한 디폴트('dark') 적용
 */
export function applyThemeFromStorage(): void {
  if (typeof document === 'undefined') return;
  const html = document.documentElement;
  const applyDefault = () => {
    try {
      html.setAttribute('data-theme', DEFAULT_THEME_PREF);
    } catch {
      /* no-op */
    }
  };
  try {
    const raw = localStorage.getItem('themePref');
    if (raw === null) {
      applyDefault();
      return;
    }
    const pref = JSON.parse(raw) as ThemePref | null;
    if (pref === 'dark' || pref === 'light') {
      html.setAttribute('data-theme', pref);
    } else if (pref === 'auto') {
      html.removeAttribute('data-theme');
    } else {
      applyDefault();
    }
  } catch {
    // localStorage 접근 불가 또는 JSON 파싱 실패 → 안전한 디폴트
    applyDefault();
  }
}

/**
 * applyThemeFromStorage를 인라인 IIFE 스크립트로 직렬화.
 * layout.tsx의 <head>에 그대로 주입되어 React hydrate 전에 실행된다.
 * dangerouslySetInnerHTML로만 사용 (XSS 안전: 사용자 입력 미포함).
 */
export const THEME_FOUC_SCRIPT = `(function(){try{var raw=localStorage.getItem("themePref");if(raw===null){document.documentElement.setAttribute("data-theme","${DEFAULT_THEME_PREF}");return;}var pref=JSON.parse(raw);if(pref==="dark"||pref==="light"){document.documentElement.setAttribute("data-theme",pref);}else{document.documentElement.removeAttribute("data-theme");}}catch(e){try{document.documentElement.setAttribute("data-theme","${DEFAULT_THEME_PREF}");}catch(_){}}})();`;

/**
 * 사용자가 선택한 테마 (light/dark/auto)를 html[data-theme]에 반영.
 * - 마운트 시 즉시 적용 (storage 변경 시 동기)
 * - storage 변경 시에도 반영 (settings에서 토글 가능)
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // hydrate 시점에 한 번 더 동기화 (FOUC 인라인 스크립트가 이미 처리했으면 idempotent)
    applyThemeFromStorage();
    // 다른 탭/창에서 토글 시 동기화
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'themePref') applyThemeFromStorage();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  return <>{children}</>;
}

/**
 * 클라이언트에서 테마 토글 헬퍼.
 */
export function setThemePref(pref: ThemePref): void {
  storage.set('themePref', pref);
  if (typeof document !== 'undefined') {
    const html = document.documentElement;
    if (pref === 'auto') {
      html.removeAttribute('data-theme');
    } else {
      html.setAttribute('data-theme', pref);
    }
  }
}
