import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: '우리 동네 오늘',
  description: '동네의 오늘을 한눈에 — 날씨, 미세먼지, 강수, 공휴일, 친구 동네 비교',
  authors: [{ name: 'sigco3111' }],
  openGraph: {
    title: '우리 동네 오늘',
    description: '동네의 오늘을 한눈에',
    type: 'website',
    locale: 'ko_KR',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#191F28' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-tds-bg text-tds-fg antialiased">
        <Suspense>{children}</Suspense>
      </body>
    </html>
  );
}
