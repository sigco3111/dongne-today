/**
 * 우리 동네 오늘 — Service Worker
 * - 네트워크 우선 (앱은 항상 fresh 데이터)
 * - 실패 시 캐시 fallback (오프라인 셸)
 * - 외부 API(Open-Meteo/Nager/Nominatim)는 캐시하지 않음 — 항상 최신 데이터
 *
 * 캐시 전략:
 *   - /api/* (Next API routes) — 현재 미사용이므로 생략
 *   - 정적 자산 (_next/static, icon-*.png) — cache-first
 *   - 페이지 라우트 (/) — network-first, 실패 시 캐시 fallback
 */

const CACHE_VERSION = 'v1';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const PAGE_CACHE = `pages-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  '/',
  '/onboarding',
  '/settings',
  '/manifest.webmanifest',
  '/opengraph-image',
  '/icon-192.png',
  '/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS).catch(() => {})),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k !== STATIC_CACHE && k !== PAGE_CACHE).map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 외부 API 요청은 통과 (캐시 X)
  if (
    url.hostname === 'api.open-meteo.com' ||
    url.hostname === 'air-quality-api.open-meteo.com' ||
    url.hostname === 'geocoding-api.open-meteo.com' ||
    url.hostname === 'date.nager.at' ||
    url.hostname === 'nominatim.openstreetmap.org'
  ) {
    return;
  }

  // 정적 자산 — cache-first
  if (url.pathname.startsWith('/_next/static') || url.pathname.startsWith('/icon-')) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((res) => {
        const copy = res.clone();
        caches.open(STATIC_CACHE).then((c) => c.put(request, copy));
        return res;
      })),
    );
    return;
  }

  // 페이지 네비게이션 — network-first, 실패 시 캐시 fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(PAGE_CACHE).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/'))),
    );
  }
});
