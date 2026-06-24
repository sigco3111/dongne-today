'use client';

import { toPng } from 'html-to-image';

/**
 * DOM 요소를 PNG data URL로 변환. html-to-image 사용 (무키, 클라이언트 only).
 * - 배경 흰색 강제 (다크모드 PNG도 깔끔하게)
 * - 실패 시 null 반환
 */
export async function exportNodeToPng(
  node: HTMLElement,
  options: { pixelRatio?: number; fileName?: string } = {},
): Promise<{ dataUrl: string; fileName: string } | null> {
  if (typeof window === 'undefined' || !node) return null;
  try {
    const dataUrl = await toPng(node, {
      backgroundColor: '#FAFAF7',
      pixelRatio: options.pixelRatio ?? 2,
      cacheBust: true,
    });
    return {
      dataUrl,
      fileName: options.fileName ?? `dongne-today-${new Date().toISOString().slice(0, 10)}.png`,
    };
  } catch (err) {
    if (typeof console !== 'undefined') {
      console.warn('[exportPng] failed:', err);
    }
    return null;
  }
}

/**
 * data URL → 브라우저 다운로드 트리거.
 */
export function downloadDataUrl(dataUrl: string, fileName: string): void {
  if (typeof window === 'undefined') return;
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
