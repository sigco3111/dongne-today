'use client';

import { useEffect, useState, useCallback } from 'react';
import { storage } from '@/lib/storage';

/**
 * 가벼운 클라이언트 i18n — 한/영 토글.
 * - storage 'lang' 키에 영구 저장 (기본 'ko')
 * - React 외부에서도 사용 가능하도록 t() 단독 export
 * - SSR 환경에서는 'ko' 반환 (마크업은 한국어로 렌더 후 hydrate)
 *
 * 컴포넌트 내 사용:
 *   const { t, lang, setLang } = useI18n();
 *   <h1>{t('home.title')}</h1>
 *
 * 서버/유틸 사용:
 *   import { t } from '@/lib/i18n';
 *   t('home.title', 'en') // 영어 강제
 */

export type Lang = 'ko' | 'en';

export const LANG_OPTIONS: { value: Lang; label: string }[] = [
  { value: 'ko', label: '한국어' },
  { value: 'en', label: 'English' },
];

export type Dict = Record<string, string>;

const KO: Dict = {
  // App shell
  'app.title': '우리 동네 오늘',
  'app.subtitle': '오늘의 동네 컨디션을 한눈에',
  'app.tagline': '동네의 오늘을 한눈에 — 날씨, 미세먼지, 강수, 공휴일, 친구 동네 비교',

  // Home
  'home.refresh': '새로고침',
  'home.share': '공유',
  'home.export': 'PNG로 저장',
  'home.settings': '설정',
  'home.loading': '동네를 찾는 중…',
  'home.fallback': '불러오는 중…',
  'home.characterLoading': '오늘의 동네 성격을 분석하고 있어요…',

  // Cards
  'card.weather': '오늘 날씨',
  'card.air': '미세먼지',
  'card.uv': '자외선',
  'card.precip': '강수',
  'card.sun': '일출/일몰',
  'card.holiday': '공휴일',
  'card.weekly': '주간 예보',
  'card.characterHistory': '최근 7일 캐릭터',
  'card.compare': '친구 동네 비교',
  'card.weeklyReport': '주간 리포트',
  'card.hourly': '시간별 상세',

  // Settings
  'settings.title': '설정',
  'settings.back': '뒤로',
  'settings.myDongne': '우리 동네',
  'settings.unset': '미설정',
  'settings.change': '변경',
  'settings.reset': '초기화',
  'settings.theme': '테마',
  'settings.themeAuto': '시스템 설정',
  'settings.themeLight': '라이트',
  'settings.themeDark': '다크',
  'settings.themeAutoBtn': '자동',
  'settings.themeLightBtn': '라이트',
  'settings.themeDarkBtn': '다크',
  'settings.autoRedetect': '위치 자동 감지',
  'settings.autoRedetectDesc': '이동 시 (~500m+) 동네가 자동으로 바뀌어요. 배터리 소모 있음.',
  'settings.notify': '동네 이상치 알림',
  'settings.notifyDesc': '미세먼지 나쁨 / 폭염 / 한파 시 로컬 알림 (앱 사용 중일 때만).',
  'settings.friends': '친구 동네',
  'settings.friendsCount': '{current} / {max}',
  'settings.friendSearch': '친구 동네 검색',
  'settings.friendPlaceholder': '예: 강남구, 홍대, 해운대',
  'settings.searchFail': '검색에 실패했어요. 다시 시도해 주세요.',
  'settings.searchEmpty': '검색 결과가 없어요',
  'settings.remove': '삭제',
  'settings.add': '추가',
  'settings.notifyDenied': '알림 권한이 거부됐어요. 브라우저 설정에서 직접 허용해주세요.',

  // Onboarding
  'onboarding.title': '우리 동네 설정',
  'onboarding.subtitle': '자동 인식 또는 도시명으로 검색해 보세요',
  'onboarding.auto': '자동 인식',
  'onboarding.autoDesc': '위치 권한을 허용하면 현재 동네를 자동으로 찾아드려요. 거부해도 수동 검색으로 진행할 수 있어요.',
  'onboarding.detect': '내 위치로 설정',
  'onboarding.detecting': '확인 중…',
  'onboarding.manual': '수동 검색',
  'onboarding.searchPlaceholder': '예: Gangnam, 홍대, Seoul (자동완성)',
  'onboarding.searchEmpty': '검색 결과가 없어요',
  'onboarding.locationFail': '위치를 가져올 수 없습니다.',

  // Share / Export
  'share.title': '우리 동네 오늘',
  'share.text': '{name} — {temp}°C',

  // Theme / locale (settings UI)
  'lang.label': '언어',
  'lang.ko': '한국어',
  'lang.en': 'English',

  // Notification bodies
  'notif.pm25': '{name} 미세먼지 {pm25}μg/m³ — 마스크 챙기세요.',
  'notif.heat': '오늘 최고 {temp}°C — 물 자주 마시고 그늘에서 쉬어요.',
  'notif.cold': '오늘 최저 {temp}°C — 롱패딩 필수.',

  // Misc
  'common.error': '오류가 발생했어요',
  'common.cancel': '취소',
  'common.confirm': '확인',
};

const EN: Dict = {
  // App shell
  'app.title': 'My Neighborhood Today',
  'app.subtitle': "Your neighborhood's condition at a glance",
  'app.tagline': "Your neighborhood's today — weather, fine dust, rain, holidays, friend compare",

  // Home
  'home.refresh': 'Refresh',
  'home.share': 'Share',
  'home.export': 'Save PNG',
  'home.settings': 'Settings',
  'home.loading': 'Finding your neighborhood…',
  'home.fallback': 'Loading…',
  'home.characterLoading': "Analyzing today's neighborhood character…",

  // Cards
  'card.weather': "Today's Weather",
  'card.air': 'Fine Dust',
  'card.uv': 'UV Index',
  'card.precip': 'Precipitation',
  'card.sun': 'Sunrise/Sunset',
  'card.holiday': 'Holiday',
  'card.weekly': 'Weekly Forecast',
  'card.characterHistory': 'Last 7 Days Character',
  'card.compare': 'Friend Compare',
  'card.weeklyReport': 'Weekly Report',
  'card.hourly': 'Hourly Detail',

  // Settings
  'settings.title': 'Settings',
  'settings.back': 'Back',
  'settings.myDongne': 'My Neighborhood',
  'settings.unset': 'Not set',
  'settings.change': 'Change',
  'settings.reset': 'Reset',
  'settings.theme': 'Theme',
  'settings.themeAuto': 'System',
  'settings.themeLight': 'Light',
  'settings.themeDark': 'Dark',
  'settings.themeAutoBtn': 'Auto',
  'settings.themeLightBtn': 'Light',
  'settings.themeDarkBtn': 'Dark',
  'settings.autoRedetect': 'Auto Location Detection',
  'settings.autoRedetectDesc': 'Auto-switch neighborhood when you move ~500m+. Uses battery.',
  'settings.notify': 'Threshold Alerts',
  'settings.notifyDesc': 'Local notifications on bad air / heat / cold (in-app only).',
  'settings.friends': 'Friend Neighborhoods',
  'settings.friendsCount': '{current} / {max}',
  'settings.friendSearch': 'Search friend neighborhood',
  'settings.friendPlaceholder': 'e.g. Gangnam, Hongdae, Busan',
  'settings.searchFail': 'Search failed. Please try again.',
  'settings.searchEmpty': 'No results',
  'settings.remove': 'Remove',
  'settings.add': 'Add',
  'settings.notifyDenied': 'Notification permission denied. Please allow it in browser settings.',

  // Onboarding
  'onboarding.title': 'Set Your Neighborhood',
  'onboarding.subtitle': 'Use auto-detect or search by city name',
  'onboarding.auto': 'Auto Detect',
  'onboarding.autoDesc': "Allow location to auto-find your neighborhood. You can also search manually if denied.",
  'onboarding.detect': 'Set My Location',
  'onboarding.detecting': 'Detecting…',
  'onboarding.manual': 'Manual Search',
  'onboarding.searchPlaceholder': 'e.g. Gangnam, Hongdae, Busan (autocomplete)',
  'onboarding.searchEmpty': 'No results',
  'onboarding.locationFail': 'Could not get your location.',

  // Share / Export
  'share.title': 'My Neighborhood Today',
  'share.text': '{name} — {temp}°C',

  // Theme / locale (settings UI)
  'lang.label': 'Language',
  'lang.ko': '한국어 (Korean)',
  'lang.en': 'English',

  // Notification bodies
  'notif.pm25': '{name} fine dust {pm25}μg/m³ — wear a mask.',
  'notif.heat': "Today's high {temp}°C — drink water and stay in the shade.",
  'notif.cold': "Today's low {temp}°C — heavy coat required.",

  // Misc
  'common.error': 'An error occurred',
  'common.cancel': 'Cancel',
  'common.confirm': 'OK',
};

const DICTS: Record<Lang, Dict> = { ko: KO, en: EN };

/**
 * Key → 번역된 문자열. {placeholder} 치환 지원.
 * 키가 없으면 키 자체를 그대로 반환 (개발 중 누락 감지 용이).
 */
export function t(key: string, lang: Lang = 'ko', vars?: Record<string, string | number>): string {
  const dict = DICTS[lang] ?? KO;
  let s = dict[key] ?? KO[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.replaceAll(`{${k}}`, String(v));
    }
  }
  return s;
}

/**
 * 현재 lang 상태를 구독하는 React 훅. lang 변경 시 리렌더.
 */
export function useI18n(): {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
} {
  const [lang, setLangState] = useState<Lang>('ko');

  useEffect(() => {
    const stored = storage.get<Lang>('lang');
    if (stored === 'ko' || stored === 'en') setLangState(stored);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    storage.set('lang', l);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = l;
    }
  }, []);

  const tFn = useCallback(
    (key: string, vars?: Record<string, string | number>) => t(key, lang, vars),
    [lang],
  );

  return { lang, setLang, t: tFn };
}
