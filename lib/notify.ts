/**
 * 브라우저 내장 Notification API 래퍼 — 푸시 서버 없이 로컬 알림.
 * - permission: 'default' → 'requestPermission' 후 'granted' 가능
 * - 앱이 떠있을 때만 발동 (백그라운드 푸시는 PUSH 서버 필요 → 본 프로젝트 제외)
 * - 이미 permission이 'denied'면 silent noop
 */
'use client';

export type NotifyLevel = 'info' | 'warning' | 'danger';

export interface NotifyOptions {
  title: string;
  body: string;
  level?: NotifyLevel;
  /** 알림 클릭 시 포커스할 경로 (기본 '/') */
  url?: string;
  /** 고유 태그 — 중복 알림 합치기 */
  tag?: string;
  /** 자동 닫힘 ms (기본 8000) */
  autoCloseMs?: number;
}

const LEVEL_ICONS: Record<NotifyLevel, string> = {
  info: '🌤️',
  warning: '⚠️',
  danger: '🚨',
};

/**
 * 권한 상태 조회. SSR 환경에서는 'unsupported' 반환.
 */
export function notificationPermission(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

/**
 * 권한 요청. 이미 결정된 상태에서는 즉시 반환.
 * 거부됨/미지원 → false. 허용 → true.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  try {
    const result = await Notification.requestPermission();
    return result === 'granted';
  } catch {
    return false;
  }
}

/**
 * 알림 표시. 권한 없으면 silent noop.
 * 반환: 표시된 Notification 인스턴스 (또는 null).
 */
export function notify(options: NotifyOptions): Notification | null {
  if (typeof window === 'undefined' || !('Notification' in window)) return null;
  if (Notification.permission !== 'granted') return null;
  const icon = LEVEL_ICONS[options.level ?? 'info'];
  try {
    const n = new Notification(`${icon} ${options.title}`, {
      body: options.body,
      tag: options.tag,
      icon: '/icon.svg',
      badge: '/icon.svg',
    });
    const url = options.url ?? '/';
    n.onclick = () => {
      window.focus();
      if (url && typeof window.location !== 'undefined') {
        window.location.href = url;
      }
      n.close();
    };
    if (options.autoCloseMs !== 0) {
      setTimeout(() => n.close(), options.autoCloseMs ?? 8000);
    }
    return n;
  } catch {
    return null;
  }
}

/**
 * 미세먼지/폭염/한파 임계치 알림 — 한 번만 발송되도록 가드.
 */
const LAST_FIRED_KEY = 'lastFiredNotify';
type FiredKind = 'pm25_bad' | 'heat_wave' | 'cold_wave';

interface LastFired {
  [k: string]: string; // date string (YYYY-MM-DD)
}

export function shouldNotify(kind: FiredKind): boolean {
  if (typeof window === 'undefined') return false;
  const last = JSON.parse(localStorage.getItem(LAST_FIRED_KEY) ?? '{}') as LastFired;
  const today = new Date().toISOString().slice(0, 10);
  return last[kind] !== today;
}

export function markNotified(kind: FiredKind): void {
  if (typeof window === 'undefined') return;
  const last = JSON.parse(localStorage.getItem(LAST_FIRED_KEY) ?? '{}') as LastFired;
  const today = new Date().toISOString().slice(0, 10);
  last[kind] = today;
  try {
    localStorage.setItem(LAST_FIRED_KEY, JSON.stringify(last));
  } catch {
    // silent
  }
}
