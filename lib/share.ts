'use client';

/**
 * 공유 payload 인터페이스 — Web Share API 명세 호환
 */
export interface SharePayload {
  title: string;
  text: string;
  url?: string;
}

/**
 * 공유 시도 — Web Share API 우선, 실패/미지원 시 클립보드 fallback.
 *
 * @returns 'shared' (Web Share 성공), 'copied' (클립보드 복사 성공), 'failed' (둘 다 실패)
 *
 * SSR-safe: navigator 미정의 시 'failed' 반환.
 */
export async function shareOrCopy(payload: SharePayload): Promise<'shared' | 'copied' | 'failed'> {
  if (typeof navigator === 'undefined') return 'failed';
  // 1. Web Share API (모바일 우선)
  if (navigator.share) {
    try {
      await navigator.share(payload);
      return 'shared';
    } catch {
      // 사용자가 취소했거나 미지원 — clipboard 로 fallback
    }
  }
  // 2. Clipboard API fallback
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(`${payload.text}\n${payload.url ?? ''}`);
      return 'copied';
    } catch {
      return 'failed';
    }
  }
  return 'failed';
}