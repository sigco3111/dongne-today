import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import { Outfit } from 'next/font/google';
import { SwRegister } from './_components/SwRegister';
import { ThemeProvider, THEME_FOUC_SCRIPT } from './_components/ThemeProvider';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-tds-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: { default: '우리 동네 오늘', template: '%s · 우리 동네 오늘' },
  description: '동네의 오늘을 한눈에 — 날씨, 미세먼지, 강수, 공휴일, 친구 동네 비교',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'),
  applicationName: '우리 동네 오늘',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '동네오늘',
  },
  formatDetection: { telephone: false },
  openGraph: {
    title: '우리 동네 오늘',
    description: '동네의 오늘을 한눈에',
    type: 'website',
    locale: 'ko_KR',
    images: ['/opengraph-image'],
  },
};


export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAFAF7' },
    { media: '(prefers-color-scheme: dark)', color: '#191F28' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={outfit.variable} suppressHydrationWarning>
      <body
        className="bg-tds-bg text-tds-fg antialiased min-h-[100dvh]"
        suppressHydrationWarning
      >
        <script dangerouslySetInnerHTML={{ __html: THEME_FOUC_SCRIPT }} />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-tds-md focus:bg-tds-blue focus:text-white focus:shadow-lg"
        >
          본문으로 건너뛰기
        </a>
        <Suspense>
          <ThemeProvider>{children}</ThemeProvider>
        </Suspense>
        <SwRegister />
      </body>
    </html>
  );
}
