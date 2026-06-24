import type { MetadataRoute } from 'next';

/**
 * PWA manifest — 빌드 시 /manifest.webmanifest로 생성.
 * 홈 화면 추가 + 앱 아이콘 + 테마 색상.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '우리 동네 오늘',
    short_name: '동네오늘',
    description: '동네의 오늘을 한눈에 — 날씨, 미세먼지, 강수, 공휴일, 친구 동네 비교',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#FAFAF7',
    theme_color: '#3182F6',
    lang: 'ko',
    icons: [
      {
        src: '/icon.svg',
        sizes: '192x192 512x512',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  };
}
