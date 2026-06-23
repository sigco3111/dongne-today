'use client';

/**
 * 햅틱 패턴 — 토스 generateHapticFeedback 패턴을 Web Vibration API 로 매핑.
 * - tap: 짧은 단일 진동 (버튼 탭)
 * - success: 짧-짧-짧 (성공 피드백)
 * - error: 길-길-길 (에러 피드백)
 */
export type HapticPattern = 'tap' | 'success' | 'error';

const PATTERNS: Record<HapticPattern, number | number[]> = {
  tap: 10,
  success: [10, 30, 10],
  error: [50, 50, 50],
};

/**
 * 진동 트리거. 미지원 브라우저 / SSR 환경에서는 silent.
 */
export function haptic(pattern: HapticPattern = 'tap'): void {
  if (typeof navigator === 'undefined') return;
  if (typeof navigator.vibrate !== 'function') return;
  try {
    navigator.vibrate(PATTERNS[pattern]);
  } catch {
    // silent
  }
}