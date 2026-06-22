# 우리 동네 오늘 — Vercel Web Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert `dongne-today` from a Toss Apps-in-Toss Granite/React Native mini-app to a Next.js 15 web app deployed on Vercel with 1:1 feature parity.

**Architecture:** Greenfield rewrite. Reuse framework-agnostic code (`types/`, `utils/`, `scripts/`) via `git mv`. Replace Toss SDK with Web APIs (localStorage, navigator.geolocation, Web Share). Hybrid data fetching: RSC for holidays (24h cache), SWR for location-based data (30min cache). recharts replaces react-native-gifted-charts. Tailwind v4 (CSS-first, no `tailwind.config.ts`) with TDS design tokens via `@theme` block.

**Tech Stack:** Next.js 15 App Router · React 19 · TypeScript 5 strict · Tailwind CSS v4 (CSS-first) · recharts 2.x · SWR 2.x · Vitest · @testing-library/react · zod · Web APIs (localStorage, navigator.geolocation, navigator.share, navigator.vibrate) · Vercel

---

## Prerequisites

```bash
# Working directory
cd /Users/hjshin/Desktop/project/work/ai-driven-dev/dongne-today

# Verify Node and Yarn
node --version  # v20.x.x or v22.x.x
yarn --version  # 4.x.x
```

**Read first:**
- Spec: `docs/superpowers/specs/2026-06-22-vercel-web-migration-design.md`
- External API contracts: `docs/DATA_SOURCES.md`
- Character engine logic: `src/utils/characterEngine.ts` (will be reused)

---

## Phase 1: Bootstrap Next.js 15 Project

### Task 1.1: Initialize package.json

**Files:**
- Modify: `package.json` (replace existing)

- [ ] **Step 1: Replace package.json with Next.js 15 stack**

```json
{
  "name": "dongne-today",
  "version": "1.0.0",
  "description": "우리 동네 오늘 — 동네 컨디션 인포그래픽 대시보드 (Next.js 15 + Vercel)",
  "private": true,
  "license": "MIT",
  "author": "sigco3111",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/sigco3111/dongne-today.git"
  },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "verify": "tsx scripts/verify-engine.ts"
  },
  "engines": {
    "node": ">=20"
  },
  "dependencies": {
    "next": "15.0.3",
    "react": "19.0.0-rc-66855b96-20241106",
    "react-dom": "19.0.0-rc-66855b96-20241106",
    "swr": "^2.2.5",
    "recharts": "^2.13.3",
    "html-to-image": "^1.11.11",
    "zod": "^3.23.8",
    "clsx": "^2.1.1"
  },
  "devDependencies": {
    "typescript": "^5.6.3",
    "@types/react": "npm:types-react@rc",
    "@types/react-dom": "npm:types-react-dom@rc",
    "@types/node": "^22.9.0",
    "@vitejs/plugin-react": "^4.3.3",
    "@testing-library/react": "^16.0.1",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/user-event": "^14.5.2",
    "@tailwindcss/postcss": "^4.0.0-beta.4",
    "tailwindcss": "^4.0.0-beta.4",
    "postcss": "^8.4.49",
    "vitest": "^2.1.5",
    "jsdom": "^25.0.1",
    "tsx": "^4.19.2",
    "eslint": "^9.14.0",
    "eslint-config-next": "15.0.3"
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add package.json
git -c user.email=sigco3111@users.noreply.github.com -c user.name=sigco3111 \
  commit -m "build(deps): replace Granite/RN stack with Next.js 15 + React 19"
```

### Task 1.2: Create tsconfig.json

**Files:**
- Modify: `tsconfig.json` (replace existing)

- [ ] **Step 1: Write tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", "archive", ".next"]
}
```

- [ ] **Step 2: Commit**

```bash
git add tsconfig.json
git -c user.email=sigco3111@users.noreply.github.com -c user.name=sigco3111 \
  commit -m "build(tsconfig): Next.js 15 strict + @/* path alias"
```

### Task 1.3: Create next.config.ts

**Files:**
- Create: `next.config.ts`

- [ ] **Step 1: Write next.config.ts**

```typescript
import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  // External API 도메인 (next/image 사용 시)
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'static.toss.im' },
    ],
  },
  // 헤더 (CORS, 캐싱)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default config;
```

- [ ] **Step 2: Commit**

```bash
git add next.config.ts
git -c user.email=sigco3111@users.noreply.github.com -c user.name=sigco3111 \
  commit -m "build(next): NextConfig with image domains + security headers"
```

### Task 1.4: Create postcss.config.mjs (Tailwind v4)

**Files:**
- Create: `postcss.config.mjs`

- [ ] **Step 1: Write postcss.config.mjs**

```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add postcss.config.mjs
git -c user.email=sigco3111@users.noreply.github.com -c user.name=sigco3111 \
  commit -m "build(postcss): Tailwind v4 PostCSS plugin (CSS-first, no config file)"
```

### Task 1.5: Create next-env.d.ts

**Files:**
- Create: `next-env.d.ts`

- [ ] **Step 1: Write next-env.d.ts**

```typescript
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.
```

### Task 1.6: Run yarn install and verify

- [ ] **Step 1: Install dependencies**

```bash
yarn install
```

Expected: No errors. Should complete in 1-2 min.

- [ ] **Step 2: Verify next is installed**

```bash
yarn next --version
```

Expected: `15.0.3` (or close)

- [ ] **Step 3: Commit lockfile**

```bash
git add yarn.lock
git -c user.email=sigco3111@users.noreply.github.com -c user.name=sigco3111 \
  commit -m "build: lockfile after yarn install"
```

### Task 1.7: Create app/layout.tsx (root layout)

**Files:**
- Create: `app/layout.tsx`

- [ ] **Step 1: Write app/layout.tsx (TDS font + tokens — but globals.css is Phase 3)**

```typescript
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
```

- [ ] **Step 2: Create minimal globals.css (placeholder until Phase 3)**

```css
/* Phase 3 will replace this with @theme TDS tokens */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 3: Create minimal app/page.tsx**

```typescript
export default function HomePage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>우리 동네 오늘</h1>
      <p>Phase 1 부트스트랩 완료. Phase 7에서 실제 대시보드 구현.</p>
    </main>
  );
}
```

- [ ] **Step 4: Start dev server and verify**

```bash
yarn dev &
sleep 5
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000
```

Expected: `200`

- [ ] **Step 5: Kill dev server**

```bash
pkill -f "next dev" || true
```

- [ ] **Step 6: Commit**

```bash
git add app/ next-env.d.ts
git -c user.email=sigco3111@users.noreply.github.com -c user.name=sigco3111 \
  commit -m "feat(app): root layout + HomePage placeholder"
```

---

## Phase 2: Archive RN/Granite Code (git history preserved)

### Task 2.1: Create archive/ directory and move RN code with git mv

- [ ] **Step 1: Create archive directory and git mv all RN files**

```bash
mkdir -p archive/toss-app
git mv src archive/toss-app/
git mv scripts archive/toss-app/
git mv granite.config.ts archive/toss-app/
git mv app.json archive/toss-app/
git mv index.js archive/toss-app/
# assets/ may not exist; handle gracefully
[ -d assets ] && git mv assets archive/toss-app/ || true
# .granite/, .swc/ are gitignored already
```

- [ ] **Step 2: Verify history is preserved**

```bash
git log --follow archive/toss-app/src/_app.tsx | head -5
```

Expected: Should show commit history including the original creation and any subsequent commits.

- [ ] **Step 3: Verify tree state**

```bash
ls archive/toss-app/ && echo "---" && ls -la
```

Expected:
- `archive/toss-app/` contains: `src/`, `scripts/`, `granite.config.ts`, `app.json`, `index.js`
- Root: `app/`, `docs/`, `node_modules/`, `package.json`, etc. (no `src/` or `granite.config.ts`)

- [ ] **Step 4: Commit**

```bash
git add -A
git -c user.email=sigco3111@users.noreply.github.com -c user.name=sigco3111 \
  commit -m "archive: move RN/Granite app to archive/toss-app/ (history preserved via git mv)"
```

### Task 2.2: Create archive/toss-app/README.md (restoration guide)

**Files:**
- Create: `archive/toss-app/README.md`

- [ ] **Step 1: Write restoration guide**

````markdown
# Archive: 토스 앱인토스 (Toss Apps-in-Toss) 버전

> 2026-06-22 Vercel 전환 시점에 보존. git history 그대로 유지.

## 복원 방법

```bash
# 1. archive에서 root로 복원 (git mv로 history 유지)
git mv archive/toss-app/src .
git mv archive/toss-app/scripts .
git mv archive/toss-app/granite.config.ts .
git mv archive/toss-app/app.json .
git mv archive/toss-app/index.js .
[ -d archive/toss-app/assets ] && git mv archive/toss-app/assets . || true

# 2. 옛 package.json 복원 (이전 커밋에서)
git log --all --oneline -- package.json | head -5
git checkout <commit-hash> -- package.json

# 3. 의존성 설치
yarn install
```

## 아카이브 사유

- 토스 앱인토스 Granite 1.x + React Native 0.72의 운영 마찰 (DevTools standalone 포트 충돌 등)
- Vercel 전환 결정 (2026-06-22 챌린지 300만원 포기)
- 다음 세션이 Vercel 버전으로 이어가도록 의도적 백업

## 기술 스택 (당시)

- `@apps-in-toss/framework` 1.5.2
- `@granite-js/react-native` 0.1.28
- `@toss/tds-react-native` 1.3.8
- `react-native` 0.72.6
- `react-native-gifted-charts` 1.4.43

## 다음 단계 (Vercel 버전)

- 1:1 기능 동등성 — `docs/superpowers/specs/2026-06-22-vercel-web-migration-design.md` 참고
- 7 Phase 구현 계획 — `docs/superpowers/plans/2026-06-22-vercel-web-migration.md`
````

- [ ] **Step 2: Commit**

```bash
git add archive/toss-app/README.md
git -c user.email=sigco3111@users.noreply.github.com -c user.name=sigco3111 \
  commit -m "docs(archive): RN/Granite 버전 복원 가이드"
```

---

## Phase 3: TDS Design Tokens (Tailwind v4 CSS-first)

### Task 3.1: Replace globals.css with TDS @theme block

**Files:**
- Modify: `app/globals.css` (replace placeholder from Task 1.7)

- [ ] **Step 1: Write full globals.css with TDS tokens + dark mode**

```css
@import "tailwindcss";

/* ============================================
   TDS Design Tokens (Toss Design System)
   v4 CSS-first @theme block — no tailwind.config.ts
   ============================================ */

@theme {
  /* Primary */
  --color-tds-blue: #3182F6;
  --color-tds-blue-light: #E8F3FF;
  --color-tds-blue-dark: #1B6EE0;

  /* Grey scale */
  --color-tds-grey-50: #F9FAFB;
  --color-tds-grey-100: #F2F4F6;
  --color-tds-grey-200: #E5E8EB;
  --color-tds-grey-400: #B0B8C1;
  --color-tds-grey-500: #8B95A1;
  --color-tds-grey-700: #4E5968;
  --color-tds-grey-900: #191F28;

  /* Status */
  --color-tds-green: #03B26C;
  --color-tds-yellow: #FFC342;
  --color-tds-orange: #FF8A00;
  --color-tds-red: #F04452;
  --color-tds-purple: #8B5CF6;

  /* Background / Foreground (light mode default) */
  --color-tds-bg: #FFFFFF;
  --color-tds-fg: #191F28;

  /* Radius */
  --radius-tds-sm: 8px;
  --radius-tds-md: 12px;
  --radius-tds-lg: 16px;
  --radius-tds-xl: 24px;

  /* Spacing (TDS scale) */
  --spacing-tds-xs: 4px;
  --spacing-tds-sm: 8px;
  --spacing-tds-md: 12px;
  --spacing-tds-lg: 16px;
  --spacing-tds-xl: 24px;

  /* Font (Pretendard via next/font — see app/layout.tsx) */
  --font-tds-sans: 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif;

  /* Font size (TDS scale) */
  --text-tds-t1: 24px;
  --text-tds-t2: 20px;
  --text-tds-t3: 18px;
  --text-tds-st1: 16px;
  --text-tds-st2: 14px;
  --text-tds-st3: 12px;
}

/* ============================================
   Dark mode (auto)
   ============================================ */

@media (prefers-color-scheme: dark) {
  :root {
    --color-tds-bg: #191F28;
    --color-tds-fg: #FFFFFF;
    --color-tds-grey-50: #1E232B;
    --color-tds-grey-100: #252B33;
    --color-tds-grey-200: #2E343C;
    --color-tds-grey-500: #6B7682;
    --color-tds-grey-700: #B0B8C1;
    --color-tds-grey-900: #FFFFFF;
  }
}

/* ============================================
   Base layer
   ============================================ */

@layer base {
  html {
    font-family: var(--font-tds-sans);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  body {
    background: var(--color-tds-bg);
    color: var(--color-tds-fg);
    line-height: 1.5;
  }
  *:focus-visible {
    outline: 2px solid var(--color-tds-blue);
    outline-offset: 2px;
  }
}
```

- [ ] **Step 2: Verify dev server still works**

```bash
yarn dev &
sleep 5
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000
pkill -f "next dev" || true
```

Expected: `200`

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git -c user.email=sigco3111@users.noreply.github.com -c user.name=sigco3111 \
  commit -m "feat(design): TDS design tokens via Tailwind v4 @theme + dark mode"
```

### Task 3.2: Update layout.tsx to use Pretendard font

**Files:**
- Modify: `app/layout.tsx` (add next/font/google Pretendard)

- [ ] **Step 1: Update app/layout.tsx**

```typescript
import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-tds-sans',
  display: 'swap',
});

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
    <html lang="ko" className={inter.variable}>
      <body className="bg-tds-bg text-tds-fg antialiased">
        <Suspense>{children}</Suspense>
      </body>
    </html>
  );
}
```

> Note: Korean glyphs need `next/font/local` for Pretendard Variable. For now, Inter + system fallback works. Can switch to Pretendard in a follow-up.

- [ ] **Step 2: Commit**

```bash
git add app/layout.tsx
git -c user.email=sigco3111@users.noreply.github.com -c user.name=sigco3111 \
  commit -m "feat(layout): Inter font via next/font (Korean fallback to system)"
```

---

## Phase 4: Reuse Framework-Agnostic Code + Vitest Setup

### Task 4.1: git mv types, utils (reusable) to root

- [ ] **Step 1: Move types/ to root (git mv preserves history)**

```bash
git mv archive/toss-app/src/types types
```

- [ ] **Step 2: Move characterEngine and format to utils/ (git mv)**

```bash
mkdir -p utils
git mv archive/toss-app/src/utils/characterEngine.ts utils/
git mv archive/toss-app/src/utils/format.ts utils/
```

- [ ] **Step 3: Verify history preserved**

```bash
git log --follow types/index.ts | head -3
git log --follow utils/characterEngine.ts | head -3
```

Expected: Both should show original creation commit

- [ ] **Step 4: Commit**

```bash
git add -A
git -c user.email=sigco3111@users.noreply.github.com -c user.name=sigco3111 \
  commit -m "refactor: git mv reusable types/utils to root (history preserved)"
```

### Task 4.2: Verify characterEngine still works (no RN imports)

- [ ] **Step 1: Read types/index.ts and characterEngine.ts**

```bash
grep -n "react-native\|@apps-in-toss\|@granite\|@toss/tds" types/index.ts utils/characterEngine.ts utils/format.ts
```

Expected: **No output** (zero matches — pure TypeScript, framework-agnostic)

- [ ] **Step 2: Run existing verify-engine.ts to confirm logic still passes**

```bash
cd archive/toss-app && yarn verify
```

Expected: 16/16 pass (or whatever the current count is)

> If yarn verify fails because verify-engine.ts uses `'../src/...'` paths, we need to fix those paths in archive before running. The plan focuses on the NEW utils/ in root — archive's verify-engine is a self-contained snapshot.

### Task 4.3: Create vitest.config.ts

**Files:**
- Create: `vitest.config.ts`

- [ ] **Step 1: Write vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'archive', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: ['**/*.test.{ts,tsx}', '**/*.config.{ts,js,mjs}', 'archive/**', '.next/**'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

- [ ] **Step 2: Create vitest.setup.ts**

```typescript
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 3: Commit**

```bash
git add vitest.config.ts vitest.setup.ts
git -c user.email=sigco3111@users.noreply.github.com -c user.name=sigco3111 \
  commit -m "test: vitest config with jsdom + React plugin + @ alias"
```

### Task 4.4: Write failing test for characterEngine

**Files:**
- Create: `utils/characterEngine.test.ts`

- [ ] **Step 1: Write the failing test (RED)**

```typescript
import { describe, it, expect } from 'vitest';
import { decideCharacter } from './characterEngine';
import type { DashboardData } from '@/types';

const baseData: DashboardData = {
  weather: {
    current: { time: '2026-06-22T12:00', temperature_2m: 25, weather_code: 1 },
    hourly: { time: [], temperature_2m: [], precipitation_probability: [] },
  },
  airQuality: {
    current: { pm10: 20, pm2_5: 10, ozone: 50, european_aqi: 30 },
    hourly: { pm10: [], pm2_5: [] },
  },
  precipitation: {
    daily: { time: [], precipitation_sum: [], precipitation_probability_max: [] },
    hourly: { time: [], precipitation: [], precipitation_probability: [] },
    todaySum: 0,
    todayProbabilityMax: 10,
  },
  holiday: { isHoliday: false, isWeekday: true, name: null, daysUntil: null },
  neighborhood: { name: '강남구', lat: 37.5, lon: 127 },
};

describe('decideCharacter', () => {
  it('returns MASK_DONGNE when PM2.5 >= 75', () => {
    const data = { ...baseData, airQuality: { ...baseData.airQuality, current: { ...baseData.airQuality.current, pm2_5: 80 } } };
    expect(decideCharacter(data, new Date('2026-06-22T15:00:00'))).toBe('MASK_DONGNE');
  });

  it('returns E_ACTIVE when precipitation low + weather good', () => {
    const data = { ...baseData, holiday: { ...baseData.holiday, isWeekday: true } };
    // Tuesday 14:00 (no rush hour)
    expect(decideCharacter(data, new Date('2026-06-23T14:00:00'))).toBe('E_ACTIVE');
  });

  it('returns I_QUIET as default', () => {
    // Saturday (not weekday), not holiday, high PM2.5 won't apply if <75
    const data: DashboardData = {
      ...baseData,
      holiday: { isHoliday: false, isWeekday: false, name: null, daysUntil: null },
      weather: { ...baseData.weather, current: { ...baseData.weather.current, weather_code: 61 } }, // rain
    };
    expect(decideCharacter(data, new Date('2026-06-20T14:00:00'))).toBe('I_QUIET');
  });
});
```

> Note: The exact test cases depend on the original `decideCharacter` signature. If the function doesn't take a `Date` parameter, drop it. Check `utils/characterEngine.ts:1-50` for actual signature.

- [ ] **Step 2: Run test to verify it passes (the code already exists)**

```bash
yarn test utils/characterEngine.test.ts
```

Expected: PASS (because `utils/characterEngine.ts` was moved as-is in Task 4.1)

- [ ] **Step 3: If test fails, fix the test cases to match the actual function signature**

- [ ] **Step 4: Commit**

```bash
git add utils/characterEngine.test.ts
git -c user.email=sigco3111@users.noreply.github.com -c user.name=sigco3111 \
  commit -m "test: characterEngine decision rules (3 cases)"
```

### Task 4.5: Run full test suite to verify Phase 4

- [ ] **Step 1: Run all tests**

```bash
yarn test
```

Expected: PASS

- [ ] **Step 2: Run type-check**

```bash
yarn type-check
```

Expected: No errors (or only archive-related errors which can be excluded)

- [ ] **Step 3: Verify dev server still works**

```bash
yarn dev &
sleep 5
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000
pkill -f "next dev" || true
```

Expected: `200`

- [ ] **Step 4: Commit (if any fixes)**

```bash
# If no fixes needed, skip this commit
```

---

## Phase 5: API Layer (6 APIs + SWR hooks + zod)

### Task 5.1: Create zod schemas for weather API

**Files:**
- Create: `lib/api/schemas.ts`

- [ ] **Step 1: Write zod schemas**

```typescript
import { z } from 'zod';

export const WeatherResponseSchema = z.object({
  current: z.object({
    time: z.string(),
    temperature_2m: z.number(),
    weather_code: z.number().int(),
  }),
  hourly: z.object({
    time: z.array(z.string()),
    temperature_2m: z.array(z.number()),
    precipitation_probability: z.array(z.number()),
  }),
});

export const AirQualityResponseSchema = z.object({
  current: z.object({
    pm10: z.number(),
    pm2_5: z.number(),
    ozone: z.number(),
    european_aqi: z.number().int(),
  }),
  hourly: z.object({
    pm10: z.array(z.number()),
    pm2_5: z.array(z.number()),
  }),
});

export const PrecipitationResponseSchema = z.object({
  daily: z.object({
    time: z.array(z.string()),
    precipitation_sum: z.array(z.number()),
    precipitation_probability_max: z.array(z.number()),
  }),
  hourly: z.object({
    time: z.array(z.string()),
    precipitation: z.array(z.number()),
    precipitation_probability: z.array(z.number()),
  }),
});

export const PublicHolidaySchema = z.object({
  date: z.string(),
  localName: z.string(),
  name: z.string(),
  global: z.boolean(),
  types: z.array(z.string()),
});

export const GeocodingResultSchema = z.object({
  id: z.number(),
  name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  country_code: z.string().optional(),
  admin1: z.string().optional(),
  admin2: z.string().optional(),
  admin3: z.string().optional(),
});

export const GeocodingResponseSchema = z.object({
  results: z.array(GeocodingResultSchema).optional(),
});

export const NominatimAddressSchema = z.object({
  neighbourhood: z.string().optional(),
  suburb: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

export const NominatimResponseSchema = z.object({
  address: NominatimAddressSchema.optional(),
});

export type WeatherResponse = z.infer<typeof WeatherResponseSchema>;
export type AirQualityResponse = z.infer<typeof AirQualityResponseSchema>;
export type PrecipitationResponse = z.infer<typeof PrecipitationResponseSchema>;
export type PublicHoliday = z.infer<typeof PublicHolidaySchema>;
export type GeocodingResult = z.infer<typeof GeocodingResultSchema>;
export type NominatimResponse = z.infer<typeof NominatimResponseSchema>;
```

- [ ] **Step 2: Commit**

```bash
git add lib/api/schemas.ts
git -c user.email=sigco3111@users.noreply.github.com -c user.name=sigco3111 \
  commit -m "feat(api): zod schemas for 6 external APIs"
```

### Task 5.2: Write weather API client (TDD)

**Files:**
- Create: `lib/api/weather.ts`
- Create: `lib/api/weather.test.ts`

- [ ] **Step 1: Write failing test (RED)**

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchWeather } from './weather';

const mockResponse = {
  current: { time: '2026-06-22T12:00', temperature_2m: 25.5, weather_code: 1 },
  hourly: { time: ['2026-06-22T00:00'], temperature_2m: [20], precipitation_probability: [10] },
};

describe('fetchWeather', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as Response);
  });
  afterEach(() => { vi.restoreAllMocks(); });

  it('fetches weather with correct params', async () => {
    await fetchWeather(37.5, 127);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('api.open-meteo.com/v1/forecast'),
    );
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('latitude=37.5'));
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('longitude=127'));
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('timezone=Asia%2FSeoul'));
  });

  it('returns parsed weather data', async () => {
    const result = await fetchWeather(37.5, 127);
    expect(result.current.temperature_2m).toBe(25.5);
    expect(result.hourly.precipitation_probability).toEqual([10]);
  });

  it('throws on non-OK response', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 } as Response);
    await expect(fetchWeather(37.5, 127)).rejects.toThrow(/500/);
  });

  it('throws on invalid schema', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ invalid: 'shape' }),
    } as Response);
    await expect(fetchWeather(37.5, 127)).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify RED**

```bash
yarn test lib/api/weather.test.ts
```

Expected: FAIL (module not found)

- [ ] **Step 3: Write implementation (GREEN)**

```typescript
import { WeatherResponseSchema, type WeatherResponse } from './schemas';

const BASE_URL = 'https://api.open-meteo.com/v1/forecast';

export async function fetchWeather(lat: number, lon: number): Promise<WeatherResponse> {
  const url = new URL(BASE_URL);
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lon));
  url.searchParams.set('current', 'temperature_2m,weather_code');
  url.searchParams.set('hourly', 'temperature_2m,precipitation_probability');
  url.searchParams.set('timezone', 'Asia/Seoul');
  url.searchParams.set('forecast_days', '1');

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Weather API failed: ${res.status}`);
  }
  const json = await res.json();
  return WeatherResponseSchema.parse(json);
}
```

- [ ] **Step 4: Run test to verify GREEN**

```bash
yarn test lib/api/weather.test.ts
```

Expected: PASS (4/4)

- [ ] **Step 5: Commit**

```bash
git add lib/api/weather.ts lib/api/weather.test.ts
git -c user.email=sigco3111@users.noreply.github.com -c user.name=sigco3111 \
  commit -m "feat(api): weather fetcher with zod validation (4 tests)"
```

### Task 5.3: Write airQuality API client (TDD)

**Files:**
- Create: `lib/api/airQuality.ts`
- Create: `lib/api/airQuality.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchAirQuality } from './airQuality';

const mockResponse = {
  current: { pm10: 20, pm2_5: 15, ozone: 50, european_aqi: 30 },
  hourly: { pm10: [20, 22], pm2_5: [15, 17] },
};

describe('fetchAirQuality', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => mockResponse } as Response);
  });
  afterEach(() => { vi.restoreAllMocks(); });

  it('fetches from air-quality-api.open-meteo.com', async () => {
    await fetchAirQuality(37.5, 127);
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('air-quality-api.open-meteo.com'));
  });

  it('returns parsed air quality data', async () => {
    const result = await fetchAirQuality(37.5, 127);
    expect(result.current.pm2_5).toBe(15);
  });

  it('throws on non-OK response', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 503 } as Response);
    await expect(fetchAirQuality(37.5, 127)).rejects.toThrow(/503/);
  });
});
```

- [ ] **Step 2: Write implementation**

```typescript
import { AirQualityResponseSchema, type AirQualityResponse } from './schemas';

const BASE_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';

export async function fetchAirQuality(lat: number, lon: number): Promise<AirQualityResponse> {
  const url = new URL(BASE_URL);
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lon));
  url.searchParams.set('current', 'pm10,pm2_5,ozone,european_aqi');
  url.searchParams.set('hourly', 'pm10,pm2_5');
  url.searchParams.set('timezone', 'Asia/Seoul');

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`AirQuality API failed: ${res.status}`);
  }
  const json = await res.json();
  return AirQualityResponseSchema.parse(json);
}
```

- [ ] **Step 3: Run + commit**

```bash
yarn test lib/api/airQuality.test.ts
git add lib/api/airQuality.ts lib/api/airQuality.test.ts
git -c user.email=sigco3111@users.noreply.github.com -c user.name=sigco3111 \
  commit -m "feat(api): airQuality fetcher with zod validation"
```

### Task 5.4: Write precipitation API client (TDD)

- [ ] **Step 1: Write test + implementation** (similar pattern to 5.2/5.3)

```typescript
// lib/api/precipitation.ts
import { PrecipitationResponseSchema, type PrecipitationResponse } from './schemas';

const BASE_URL = 'https://api.open-meteo.com/v1/forecast';

export async function fetchPrecipitation(lat: number, lon: number): Promise<PrecipitationResponse> {
  const url = new URL(BASE_URL);
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lon));
  url.searchParams.set('daily', 'precipitation_sum,precipitation_probability_max');
  url.searchParams.set('hourly', 'precipitation,precipitation_probability');
  url.searchParams.set('forecast_days', '7');
  url.searchParams.set('timezone', 'Asia/Seoul');

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Precipitation API failed: ${res.status}`);
  return PrecipitationResponseSchema.parse(await res.json());
}
```

- [ ] **Step 2: Test (similar to weather.test.ts)**

- [ ] **Step 3: Commit**

```bash
git add lib/api/precipitation.ts lib/api/precipitation.test.ts
git -c user.email=sigco3111@users.noreply.github.com -c user.name=sigco3111 \
  commit -m "feat(api): precipitation fetcher with zod validation"
```

### Task 5.5: Write holidays API client (RSC-compatible, 24h cache)

**Files:**
- Create: `lib/api/holidays.ts`
- Create: `lib/api/holidays.test.ts`

- [ ] **Step 1: Write implementation (no fetch in test — RSC handles caching)**

```typescript
import { z } from 'zod';
import { PublicHolidaySchema, type PublicHoliday } from './schemas';

const BASE_URL = 'https://date.nager.at/api/v3/PublicHolidays';

/**
 * Server Component fetch — Next.js fetch cache, 24h revalidate.
 * Do NOT use in Client Components (would lose cache).
 */
export async function fetchHolidays(year: number): Promise<PublicHoliday[]> {
  const url = `${BASE_URL}/${year}/KR`;
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error(`Holidays API failed: ${res.status}`);
  const json = await res.json();
  return z.array(PublicHolidaySchema).parse(json);
}
```

- [ ] **Step 2: Test with fetch mock**

```typescript
import { describe, it, expect, vi } from 'vitest';
import { fetchHolidays } from './holidays';

const mockHolidays = [
  { date: '2026-01-01', localName: '새해', name: 'New Year\'s Day', global: true, types: ['Public'] },
];

describe('fetchHolidays', () => {
  it('fetches from date.nager.at with KR country', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => mockHolidays } as Response);
    await fetchHolidays(2026);
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('2026/KR'), expect.any(Object));
  });

  it('returns parsed holidays', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => mockHolidays } as Response);
    const result = await fetchHolidays(2026);
    expect(result[0].localName).toBe('새해');
  });
});
```

- [ ] **Step 3: Commit**

```bash
git add lib/api/holidays.ts lib/api/holidays.test.ts
git -c user.email=sigco3111@users.noreply.github.com -c user.name=sigco3111 \
  commit -m "feat(api): holidays fetcher (RSC, 24h revalidate)"
```

### Task 5.6: Write geocoding (forward) + nominatim (reverse) API clients

- [ ] **Step 1: Write lib/api/geocoding.ts**

```typescript
import { GeocodingResponseSchema, type GeocodingResult } from './schemas';

const BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';

export async function searchAddress(query: string, count = 5): Promise<GeocodingResult[]> {
  if (!query.trim()) return [];
  const url = new URL(BASE_URL);
  url.searchParams.set('name', query);
  url.searchParams.set('count', String(count));
  url.searchParams.set('language', 'en');
  url.searchParams.set('format', 'json');

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Geocoding API failed: ${res.status}`);
  const json = await res.json();
  return GeocodingResponseSchema.parse(json).results ?? [];
}
```

- [ ] **Step 2: Write lib/api/nominatim.ts**

```typescript
import { NominatimResponseSchema, type NominatimResponse } from './schemas';

const BASE_URL = 'https://nominatim.openstreetmap.org/reverse';

// Nominatim rate limit: 1 req/sec
let lastCallAt = 0;
const MIN_INTERVAL = 1100;

export async function reverseGeocode(lat: number, lon: number): Promise<NominatimResponse | null> {
  const now = Date.now();
  const wait = MIN_INTERVAL - (now - lastCallAt);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastCallAt = Date.now();

  const url = new URL(BASE_URL);
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('lon', String(lon));
  url.searchParams.set('format', 'json');
  url.searchParams.set('accept-language', 'ko');

  const res = await fetch(url.toString(), {
    headers: { 'User-Agent': 'dongne-today/1.0' },
  });
  if (!res.ok) throw new Error(`Nominatim API failed: ${res.status}`);
  return NominatimResponseSchema.parse(await res.json());
}
```

- [ ] **Step 3: Tests + commit**

```bash
git add lib/api/geocoding.ts lib/api/geocoding.test.ts lib/api/nominatim.ts lib/api/nominatim.test.ts
git -c user.email=sigco3111@users.noreply.github.com -c user.name=sigco3111 \
  commit -m "feat(api): geocoding forward + nominatim reverse (1s throttle)"
```

### Task 5.7: Create SWR hooks

**Files:**
- Create: `lib/hooks/useDashboardData.ts`
- Create: `lib/hooks/useNeighborhood.ts`
- Create: `lib/hooks/useFriends.ts`
- Create: `lib/hooks/useGeolocation.ts`

- [ ] **Step 1: Write useDashboardData**

```typescript
'use client';
import useSWR from 'swr';
import { fetchWeather } from '@/lib/api/weather';
import { fetchAirQuality } from '@/lib/api/airQuality';
import { fetchPrecipitation } from '@/lib/api/precipitation';
import type { Neighborhood, WeatherData, AirQualityData, PrecipitationData } from '@/types';

export interface DashboardData {
  weather: WeatherData;
  airQuality: AirQualityData;
  precipitation: PrecipitationData;
}

async function fetcher([, lat, lon]: [string, number, number]): Promise<DashboardData> {
  const [weather, airQuality, precipitation] = await Promise.all([
    fetchWeather(lat, lon),
    fetchAirQuality(lat, lon),
    fetchPrecipitation(lat, lon),
  ]);
  return { weather, airQuality, precipitation };
}

export function useDashboardData(neighborhood: Neighborhood | null) {
  const key = neighborhood ? ['dashboard', neighborhood.lat, neighborhood.lon] as const : null;
  const { data, error, isLoading, mutate } = useSWR(key, fetcher, {
    refreshInterval: 30 * 60 * 1000,
    dedupingInterval: 30 * 60 * 1000,
    revalidateOnFocus: true,
    keepPreviousData: true,
  });
  return { data, error, isLoading, refresh: mutate };
}
```

- [ ] **Step 2: Write useNeighborhood (localStorage + SWR)**

```typescript
'use client';
import { useEffect, useState } from 'react';
import { storage } from '@/lib/storage';
import type { Neighborhood } from '@/types';

const KEY = 'neighborhood' as const;

export function useNeighborhood() {
  const [neighborhood, setNeighborhood] = useState<Neighborhood | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const stored = storage.get<Neighborhood>(KEY);
    setNeighborhood(stored);
    setLoading(false);
  }, []);

  const save = (n: Neighborhood) => {
    storage.set(KEY, n);
    setNeighborhood(n);
  };

  const clear = () => {
    storage.remove(KEY);
    setNeighborhood(null);
  };

  return { neighborhood, isLoading, save, clear };
}
```

- [ ] **Step 3: Write useFriends (localStorage)**

```typescript
'use client';
import { useEffect, useState, useCallback } from 'react';
import { storage } from '@/lib/storage';
import type { Neighborhood } from '@/types';

const KEY = 'friendNeighborhoods' as const;
const MAX_FRIENDS = 5;

export function useFriends() {
  const [friends, setFriends] = useState<Neighborhood[]>([]);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const stored = storage.get<Neighborhood[]>(KEY) ?? [];
    setFriends(stored);
    setLoading(false);
  }, []);

  const add = useCallback((n: Neighborhood) => {
    setFriends((prev) => {
      if (prev.length >= MAX_FRIENDS) return prev;
      const next = [...prev, n];
      storage.set(KEY, next);
      return next;
    });
  }, []);

  const remove = useCallback((index: number) => {
    setFriends((prev) => {
      const next = prev.filter((_, i) => i !== index);
      storage.set(KEY, next);
      return next;
    });
  }, []);

  return { friends, isLoading, add, remove, maxFriends: MAX_FRIENDS };
}
```

- [ ] **Step 4: Write useGeolocation**

```typescript
'use client';
import { useState, useCallback } from 'react';

export interface Coords { lat: number; lon: number; }
export type GeolocationState = {
  coordinates: Coords | null;
  error: string | null;
  loading: boolean;
  request: () => void;
};

export function useGeolocation(): GeolocationState {
  const [coordinates, setCoords] = useState<Coords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const request = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setError('이 브라우저는 위치 서비스를 지원하지 않습니다.');
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 },
    );
  }, []);

  return { coordinates, error, loading, request };
}
```

- [ ] **Step 5: Create lib/storage.ts (used by hooks above)**

```typescript
'use client';

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export const storage = {
  get<T>(key: string): T | null {
    if (!isBrowser()) return null;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },
  set<T>(key: string, value: T): void {
    if (!isBrowser()) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // quota exceeded — silent
    }
  },
  remove(key: string): void {
    if (!isBrowser()) return;
    window.localStorage.removeItem(key);
  },
};
```

- [ ] **Step 6: Commit**

```bash
git add lib/hooks/ lib/storage.ts
git -c user.email=sigco3111@users.noreply.github.com -c user.name=sigco3111 \
  commit -m "feat(hooks): useDashboardData (SWR) + useNeighborhood/Friends/Geolocation + localStorage"
```

### Task 5.8: Run all tests to verify Phase 5

- [ ] **Step 1: Run all tests**

```bash
yarn test
```

Expected: All pass

- [ ] **Step 2: Type-check**

```bash
yarn type-check
```

Expected: No errors (excluding archive)

---

## Phase 6: Dashboard Cards (recharts)

### Task 6.1: Create UI primitives (Card, Badge, Button)

**Files:**
- Create: `components/ui/Card.tsx`
- Create: `components/ui/Badge.tsx`
- Create: `components/ui/Button.tsx`
- Create: `components/ui/Skeleton.tsx`

- [ ] **Step 1: Write components/ui/Card.tsx**

```typescript
import { type ReactNode } from 'react';
import clsx from 'clsx';

export interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

export function Card({ children, className, padding = 'md' }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-tds-lg bg-tds-bg border border-tds-grey-200',
        'dark:border-tds-grey-200',
        padding === 'sm' && 'p-3',
        padding === 'md' && 'p-4',
        padding === 'lg' && 'p-6',
        className,
      )}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Write components/ui/Badge.tsx**

```typescript
import { type ReactNode } from 'react';
import clsx from 'clsx';

export type BadgeVariant = 'red' | 'green' | 'yellow' | 'grey' | 'purple';

export function Badge({ children, variant = 'grey' }: { children: ReactNode; variant?: BadgeVariant }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-0.5 rounded-tds-sm text-tds-st3 font-medium',
        variant === 'red' && 'bg-tds-red/10 text-tds-red',
        variant === 'green' && 'bg-tds-green/10 text-tds-green',
        variant === 'yellow' && 'bg-tds-yellow/20 text-tds-orange',
        variant === 'grey' && 'bg-tds-grey-100 text-tds-grey-700',
        variant === 'purple' && 'bg-tds-purple/10 text-tds-purple',
      )}
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 3: Write components/ui/Button.tsx**

```typescript
'use client';
import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';

export type ButtonVariant = 'primary' | 'weak' | 'ghost';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
}

export function Button({ variant = 'primary', className, children, ...rest }: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-tds-md px-4 py-2 text-tds-st2 font-medium transition-colors',
        variant === 'primary' && 'bg-tds-blue text-white hover:bg-tds-blue-dark',
        variant === 'weak' && 'bg-tds-grey-100 text-tds-grey-900 hover:bg-tds-grey-200',
        variant === 'ghost' && 'text-tds-blue hover:bg-tds-blue-light',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
```

- [ ] **Step 4: Write components/ui/Skeleton.tsx**

```typescript
import clsx from 'clsx';

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx('animate-pulse bg-tds-grey-100 rounded', className)} />;
}
```

- [ ] **Step 5: Commit**

```bash
git add components/ui/
git -c user.email=sigco3111@users.noreply.github.com -c user.name=sigco3111 \
  commit -m "feat(ui): Card, Badge, Button, Skeleton primitives (TDS tokens)"
```

### Task 6.2: Write WeatherCard with recharts (TDD)

**Files:**
- Create: `components/cards/WeatherCard.tsx`
- Create: `components/cards/WeatherCard.test.tsx`

- [ ] **Step 1: Write failing test (RED)**

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WeatherCard } from './WeatherCard';

const mockData = {
  current: { time: '2026-06-22T12:00', temperature_2m: 25, weather_code: 1 },
  hourly: {
    time: ['2026-06-22T00:00', '2026-06-22T06:00', '2026-06-22T12:00'],
    temperature_2m: [20, 22, 25],
    precipitation_probability: [10, 20, 30],
  },
};

describe('WeatherCard', () => {
  it('renders current temperature', () => {
    render(<WeatherCard data={mockData} />);
    expect(screen.getByText(/25/)).toBeInTheDocument();
  });

  it('renders weather code label', () => {
    render(<WeatherCard data={mockData} />);
    expect(screen.getByText(/맑음|구름|☀️|⛅/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify RED**

```bash
yarn test components/cards/WeatherCard.test.tsx
```

Expected: FAIL (module not found)

- [ ] **Step 3: Write implementation**

```typescript
'use client';
import { Card } from '@/components/ui/Card';
import type { WeatherData } from '@/types';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { formatTemp, formatHourLabel } from '@/utils/format';

const WEATHER_LABELS: Record<number, { label: string; emoji: string }> = {
  0: { label: '맑음', emoji: '☀️' },
  1: { label: '구름 조금', emoji: '⛅' },
  2: { label: '구름 많음', emoji: '⛅' },
  3: { label: '흐림', emoji: '☁️' },
  45: { label: '안개', emoji: '🌫️' },
  61: { label: '비', emoji: '🌧️' },
  95: { label: '천둥번개', emoji: '⛈️' },
};

export function WeatherCard({ data }: { data: WeatherData }) {
  const code = data.current.weather_code;
  const meta = WEATHER_LABELS[code] ?? { label: '알 수 없음', emoji: '❓' };

  const chartData = data.hourly.time.slice(0, 24).map((t, i) => ({
    time: formatHourLabel(t),
    temp: data.hourly.temperature_2m[i] ?? 0,
  }));

  return (
    <Card>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-tds-st1">🌤️</span>
        <h3 className="text-tds-st1 font-medium text-tds-grey-900">오늘 날씨</h3>
      </div>
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-tds-t1 font-bold text-tds-grey-900">
          {formatTemp(data.current.temperature_2m)}
        </span>
        <span className="text-tds-st2 text-tds-grey-700">
          {meta.emoji} {meta.label}
        </span>
      </div>
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'var(--color-tds-grey-500)' }} interval={3} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--color-tds-grey-500)' }} width={28} />
            <Tooltip
              contentStyle={{
                background: 'var(--color-tds-bg)',
                border: '1px solid var(--color-tds-grey-200)',
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Line type="monotone" dataKey="temp" stroke="var(--color-tds-blue)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
```

- [ ] **Step 4: Run test to verify GREEN**

```bash
yarn test components/cards/WeatherCard.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/cards/WeatherCard.tsx components/cards/WeatherCard.test.tsx
git -c user.email=sigco3111@users.noreply.github.com -c user.name=sigco3111 \
  commit -m "feat(cards): WeatherCard with recharts LineChart (24h temp)"
```

### Task 6.3: Write AirQualityCard (gauge)

- [ ] **Step 1: Write test + implementation**

```typescript
// components/cards/AirQualityCard.tsx
'use client';
import { Card } from '@/components/ui/Card';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';
import type { AirQualityData } from '@/types';

function grade(pm25: number): { label: string; color: string; emoji: string } {
  if (pm25 <= 15) return { label: '좋음', color: 'var(--color-tds-green)', emoji: '😊' };
  if (pm25 <= 35) return { label: '보통', color: 'var(--color-tds-yellow)', emoji: '😐' };
  if (pm25 <= 75) return { label: '나쁨', color: 'var(--color-tds-orange)', emoji: '😷' };
  return { label: '매우 나쁨', color: 'var(--color-tds-red)', emoji: '🤢' };
}

export function AirQualityCard({ data }: { data: AirQualityData }) {
  const pm25 = data.current.pm2_5;
  const g = grade(pm25);
  const ratio = Math.min(100, (pm25 / 100) * 100);

  return (
    <Card>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-tds-st1">🌫️</span>
        <h3 className="text-tds-st1 font-medium">미세먼지</h3>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-20 h-20">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ name: 'pm25', value: ratio, fill: g.color }]} startAngle={90} endAngle={-270}>
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar background={{ fill: 'var(--color-tds-grey-100)' }} dataKey="value" cornerRadius={6} />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
        <div>
          <div className="text-tds-t2 font-bold" style={{ color: g.color }}>{g.label}</div>
          <div className="text-tds-st3 text-tds-grey-500">PM2.5 {pm25} μg/m³ {g.emoji}</div>
        </div>
      </div>
    </Card>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/cards/AirQualityCard.tsx
git -c user.email=sigco3111@users.noreply.github.com -c user.name=sigco3111 \
  commit -m "feat(cards): AirQualityCard with RadialBarChart (PM2.5 gauge)"
```

### Task 6.4: Write PrecipitationCard, HolidayCard, CompareCard

- [ ] **Step 1: PrecipitationCard** (AreaChart for 24h precipitation probability)

```typescript
// components/cards/PrecipitationCard.tsx
'use client';
import { Card } from '@/components/ui/Card';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import type { PrecipitationData } from '@/types';
import { formatHourLabel, formatPercent } from '@/utils/format';

export function PrecipitationCard({ data }: { data: PrecipitationData }) {
  const chartData = data.hourly.time.slice(0, 24).map((t, i) => ({
    time: formatHourLabel(t),
    prob: data.hourly.precipitation_probability[i] ?? 0,
  }));
  const maxProb = Math.max(...chartData.map((d) => d.prob), 0);

  return (
    <Card>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-tds-st1">🌧️</span>
        <h3 className="text-tds-st1 font-medium">강수확률</h3>
      </div>
      <div className="text-tds-t2 font-bold text-tds-grey-900 mb-1">
        오늘 최대 {formatPercent(maxProb)}
      </div>
      <div className="h-24">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="precipGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-tds-blue)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="var(--color-tds-blue)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'var(--color-tds-grey-500)' }} interval={3} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--color-tds-grey-500)' }} width={28} domain={[0, 100]} />
            <Tooltip contentStyle={{ background: 'var(--color-tds-bg)', border: '1px solid var(--color-tds-grey-200)', borderRadius: 8, fontSize: 12 }} />
            <Area type="monotone" dataKey="prob" stroke="var(--color-tds-blue)" fill="url(#precipGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
```

- [ ] **Step 2: HolidayCard**

```typescript
// components/cards/HolidayCard.tsx
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { HolidayData } from '@/types';
import { daysUntil } from '@/utils/format';

export function HolidayCard({ data }: { data: HolidayData }) {
  return (
    <Card>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-tds-st1">🎭</span>
        <h3 className="text-tds-st1 font-medium">공휴일</h3>
      </div>
      {data.isHoliday ? (
        <div className="flex flex-col gap-2">
          <Badge variant="red">🎉 {data.name}</Badge>
          <span className="text-tds-st3 text-tds-grey-500">오늘은 공휴일!</span>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <Badge variant="grey">{data.isWeekday ? '평일' : '주말'}</Badge>
          {data.name && data.daysUntil !== null && (
            <span className="text-tds-st3 text-tds-grey-500">다음 공휴일: {data.name} (D-{data.daysUntil})</span>
          )}
        </div>
      )}
    </Card>
  );
}
```

- [ ] **Step 3: CompareCard** (horizontal bar chart for my + friends)

```typescript
// components/cards/CompareCard.tsx
'use client';
import { Card } from '@/components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import type { WeatherData, Neighborhood } from '@/types';
import { formatTemp } from '@/utils/format';

export interface CompareEntry {
  neighborhood: Neighborhood;
  weather: WeatherData;
}

export function CompareCard({ my, friends }: { my: WeatherData; friends: CompareEntry[] }) {
  const data = [
    { name: '우리', temp: my.current.temperature_2m, color: 'var(--color-tds-blue)' },
    ...friends.map((f) => ({ name: f.neighborhood.name, temp: f.weather.current.temperature_2m, color: 'var(--color-tds-grey-400)' })),
  ];
  return (
    <Card className="col-span-full">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-tds-st1">👥</span>
        <h3 className="text-tds-st1 font-medium">친구 동네 비교</h3>
      </div>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 60 }}>
            <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--color-tds-grey-500)' }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: 'var(--color-tds-grey-700)' }} width={56} />
            <Bar dataKey="temp" radius={[0, 6, 6, 0]}>
              {data.map((entry, idx) => (
                <Cell key={idx} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add components/cards/
git -c user.email=sigco3111@users.noreply.github.com -c user.name=sigco3111 \
  commit -m "feat(cards): Precipitation, Holiday, Compare cards (recharts)"
```

### Task 6.5: Create CharacterReport + DashboardGrid

- [ ] **Step 1: CharacterReport** (uses characterEngine)

```typescript
// components/dashboard/CharacterReport.tsx
'use client';
import { Card } from '@/components/ui/Card';
import { decideCharacter } from '@/utils/characterEngine';
import type { DashboardData } from '@/types';

const CHARACTERS = {
  E_ACTIVE: { emoji: '☀️', color: 'var(--color-tds-yellow)', line: '우리 동네는 활동적인 E형', subline: '바깥에서 만나요!' },
  I_QUIET: { emoji: '🌙', color: 'var(--color-tds-blue)', line: '우리 동네는 차분한 I형', subline: '오늘은 집이 최고' },
  CULTURALIST: { emoji: '🎨', color: 'var(--color-tds-purple)', line: '공휴일! 우리 동네는 문화인', subline: '한강에서 만나요' },
  COMMUTER_DONGNE: { emoji: '🚇', color: 'var(--color-tds-grey-700)', line: '출근 시간! 우리 동네는 출근러', subline: '화이팅!' },
  MASK_DONGNE: { emoji: '🌫️', color: 'var(--color-tds-red)', line: '미세먼지 부우 — 마스크 동네', subline: '마스크 챙기세요 😷' },
  WALK_LOVER: { emoji: '☁️', color: 'var(--color-tds-green)', line: '공기도 깨끗, 날씨도 좋아', subline: '산책러버 동네 🚶‍♀️' },
} as const;

export function CharacterReport({ data, now = new Date() }: { data: DashboardData | null; now?: Date }) {
  if (!data) return <Card className="col-span-full"><div className="text-tds-st2 text-tds-grey-500">데이터 로딩 중…</div></Card>;
  const id = decideCharacter(data, now);
  const char = CHARACTERS[id];
  return (
    <Card className="col-span-full">
      <div className="flex items-center gap-3">
        <span className="text-4xl">{char.emoji}</span>
        <div>
          <div className="text-tds-t3 font-bold" style={{ color: char.color }}>{char.line}</div>
          <div className="text-tds-st2 text-tds-grey-700">{char.subline}</div>
        </div>
      </div>
    </Card>
  );
}
```

- [ ] **Step 2: DashboardGrid** (2x3 layout)

```typescript
// components/dashboard/DashboardGrid.tsx
'use client';
import { CharacterReport } from './CharacterReport';
import { WeatherCard } from '@/components/cards/WeatherCard';
import { AirQualityCard } from '@/components/cards/AirQualityCard';
import { PrecipitationCard } from '@/components/cards/PrecipitationCard';
import { HolidayCard } from '@/components/cards/HolidayCard';
import { CompareCard, type CompareEntry } from '@/components/cards/CompareCard';
import { Skeleton } from '@/components/ui/Skeleton';
import type { DashboardData, HolidayData, Neighborhood } from '@/types';

export interface DashboardGridProps {
  neighborhood: Neighborhood;
  isLoading: boolean;
  data: { weather: DashboardData['weather']; airQuality: DashboardData['airQuality']; precipitation: DashboardData['precipitation'] } | null;
  holiday: HolidayData;
  friends: Array<{ neighborhood: Neighborhood; weather: DashboardData['weather'] }>;
}

export function DashboardGrid({ neighborhood, isLoading, data, holiday, friends }: DashboardGridProps) {
  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-32" />)}
      </div>
    );
  }
  const dashboardData: DashboardData = {
    weather: data.weather,
    airQuality: data.airQuality,
    precipitation: data.precipitation,
    holiday,
    neighborhood,
  };
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="col-span-full">
        <CharacterReport data={dashboardData} />
      </div>
      <WeatherCard data={data.weather} />
      <AirQualityCard data={data.airQuality} />
      <PrecipitationCard data={data.precipitation} />
      <HolidayCard data={holiday} />
      <div className="col-span-full">
        <CompareCard my={data.weather} friends={friends} />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/dashboard/
git -c user.email=sigco3111@users.noreply.github.com -c user.name=sigco3111 \
  commit -m "feat(dashboard): CharacterReport + DashboardGrid (2x3 layout)"
```

---

## Phase 7: App Pages + Vercel Deploy

### Task 7.1: Create lib/share.ts + lib/haptics.ts + lib/location.ts

- [ ] **Step 1: lib/share.ts**

```typescript
'use client';

export interface SharePayload {
  title: string;
  text: string;
  url?: string;
}

export async function shareOrCopy(payload: SharePayload): Promise<'shared' | 'copied' | 'failed'> {
  if (typeof navigator === 'undefined') return 'failed';
  // 1. Try Web Share API (mobile)
  if (navigator.share) {
    try {
      await navigator.share(payload);
      return 'shared';
    } catch {
      // user cancelled or unsupported — fallback
    }
  }
  // 2. Fallback: clipboard
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
```

- [ ] **Step 2: lib/haptics.ts**

```typescript
'use client';

export type HapticPattern = 'tap' | 'success' | 'error';

const PATTERNS: Record<HapticPattern, number | number[]> = {
  tap: 10,
  success: [10, 30, 10],
  error: [50, 50, 50],
};

export function haptic(pattern: HapticPattern = 'tap'): void {
  if (typeof navigator === 'undefined') return;
  if (typeof navigator.vibrate !== 'function') return;
  try {
    navigator.vibrate(PATTERNS[pattern]);
  } catch {
    // silent
  }
}
```

- [ ] **Step 3: lib/location.ts**

```typescript
'use client';

export function getCurrentCoords(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      reject(new Error('이 브라우저는 위치 서비스를 지원하지 않습니다.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => reject(new Error(err.message)),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 },
    );
  });
}
```

- [ ] **Step 4: Commit**

```bash
git add lib/share.ts lib/haptics.ts lib/location.ts
git -c user.email=sigco3111@users.noreply.github.com -c user.name=sigco3111 \
  commit -m "feat(lib): share (Web Share + clipboard), haptics (vibrate), location (geolocation)"
```

### Task 7.2: Create app/page.tsx (Home / dashboard)

- [ ] **Step 1: Write Home page**

```typescript
// app/page.tsx
import { Suspense } from 'react';
import { HomeContent } from './_components/HomeContent';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-screen-sm p-4">
      <header className="mb-4">
        <h1 className="text-tds-t2 font-bold text-tds-grey-900">우리 동네 오늘</h1>
      </header>
      <Suspense fallback={<div className="text-tds-grey-500">로딩 중…</div>}>
        <HomeContent />
      </Suspense>
    </main>
  );
}
```

- [ ] **Step 2: Write HomeContent (client component using hooks)**

```typescript
// app/_components/HomeContent.tsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useNeighborhood } from '@/lib/hooks/useNeighborhood';
import { useFriends } from '@/lib/hooks/useFriends';
import { useDashboardData } from '@/lib/hooks/useDashboardData';
import { useGeolocation } from '@/lib/hooks/useGeolocation';
import { fetchHolidays, type HolidayData } from '@/lib/api/holidays';
import { fetchWeather } from '@/lib/api/weather';
import { getCurrentCoords } from '@/lib/location';
import { reverseGeocode } from '@/lib/api/nominatim';
import { storage } from '@/lib/storage';
import { DashboardGrid } from '@/components/dashboard/DashboardGrid';
import { Button } from '@/components/ui/Button';
import { haptic } from '@/lib/haptics';
import { shareOrCopy } from '@/lib/share';

export function HomeContent() {
  const router = useRouter();
  const { neighborhood, isLoading: nbLoading, save, clear } = useNeighborhood();
  const { friends, add, remove } = useFriends();
  const { data, isLoading, refresh } = useDashboardData(neighborhood);
  const [holiday, setHoliday] = useState<HolidayData>({ isHoliday: false, isWeekday: true, name: null, daysUntil: null });
  const [friendWeather, setFriendWeather] = useState<Array<{ neighborhood: typeof neighborhood; weather: Awaited<ReturnType<typeof fetchWeather>> }>>([]);

  // First-run: detect location
  useEffect(() => {
    if (!nbLoading && !neighborhood) router.push('/onboarding');
  }, [nbLoading, neighborhood, router]);

  // Holiday
  useEffect(() => {
    fetchHolidays(new Date().getFullYear())
      .then((hols) => {
        const today = new Date().toISOString().slice(0, 10);
        const found = hols.find((h) => h.date === today);
        const isWeekday = new Date().getDay() >= 1 && new Date().getDay() <= 5;
        setHoliday({
          isHoliday: !!found,
          isWeekday,
          name: found?.localName ?? null,
          daysUntil: null,
        });
      })
      .catch(() => {/* silent */});
  }, []);

  // Friend weather
  useEffect(() => {
    if (!friends.length) {
      setFriendWeather([]);
      return;
    }
    Promise.all(
      friends.map(async (f) => ({
        neighborhood: f,
        weather: await fetchWeather(f.lat, f.lon),
      })),
    ).then(setFriendWeather).catch(() => {/* silent */});
  }, [friends]);

  if (nbLoading || !neighborhood) return <div className="text-tds-grey-500">위치 확인 중…</div>;

  const onShare = async () => {
    haptic('tap');
    const result = await shareOrCopy({
      title: '우리 동네 오늘',
      text: `${neighborhood.name} — ${data ? `${data.weather.current.temperature_2m}°C` : ''}`,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    });
    haptic(result === 'shared' ? 'success' : result === 'copied' ? 'tap' : 'error');
  };

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <span className="text-tds-st2 text-tds-grey-700">📍 {neighborhood.name}</span>
        <div className="flex gap-2">
          <Button variant="weak" onClick={() => { haptic('tap'); refresh(); }}>새로고침</Button>
          <Button variant="primary" onClick={onShare}>공유</Button>
        </div>
      </div>
      <DashboardGrid
        neighborhood={neighborhood}
        isLoading={isLoading}
        data={data}
        holiday={holiday}
        friends={friendWeather}
      />
      <div className="mt-4 flex justify-center">
        <Button variant="ghost" onClick={() => router.push('/settings')}>설정</Button>
      </div>
    </>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx app/_components/
git -c user.email=sigco3111@users.noreply.github.com -c user.name=sigco3111 \
  commit -m "feat(app): Home page with dashboard grid + share + refresh"
```

### Task 7.3: Create app/onboarding/page.tsx

- [ ] **Step 1: Write onboarding page**

```typescript
// app/onboarding/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useGeolocation } from '@/lib/hooks/useGeolocation';
import { getCurrentCoords } from '@/lib/location';
import { reverseGeocode } from '@/lib/api/nominatim';
import { searchAddress } from '@/lib/api/geocoding';
import { storage } from '@/lib/storage';
import { haptic } from '@/lib/haptics';
import type { Neighborhood } from '@/types';

export default function OnboardingPage() {
  const router = useRouter();
  const { request } = useGeolocation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{ name: string; lat: number; lon: number }>>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detectLocation = async () => {
    setBusy(true);
    setError(null);
    try {
      const { lat, lon } = await getCurrentCoords();
      const rev = await reverseGeocode(lat, lon);
      const name = rev?.address?.suburb ?? rev?.address?.neighbourhood ?? rev?.address?.city ?? '현재 위치';
      storage.set<Neighborhood>('neighborhood', { name, lat, lon });
      storage.set('onboardingDone', true);
      haptic('success');
      router.push('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : '위치를 가져올 수 없습니다.');
      haptic('error');
    } finally {
      setBusy(false);
    }
  };

  const search = async () => {
    if (!query.trim()) return;
    setBusy(true);
    try {
      const r = await searchAddress(query);
      setResults(
        r.map((g) => ({
          name: [g.name, g.admin2, g.admin1, g.country_code].filter(Boolean).join(' '),
          lat: g.latitude,
          lon: g.longitude,
        })),
      );
    } catch {
      setResults([]);
    } finally {
      setBusy(false);
    }
  };

  const pick = (n: { name: string; lat: number; lon: number }) => {
    storage.set<Neighborhood>('neighborhood', n);
    storage.set('onboardingDone', true);
    haptic('success');
    router.push('/');
  };

  return (
    <main className="mx-auto max-w-screen-sm p-4">
      <h1 className="text-tds-t2 font-bold mb-4">우리 동네 설정</h1>
      <Card className="mb-4">
        <h2 className="text-tds-st1 font-medium mb-2">📍 자동 인식</h2>
        <p className="text-tds-st3 text-tds-grey-500 mb-3">위치 권한을 허용하면 동네를 자동으로 찾아드려요.</p>
        <Button onClick={detectLocation} disabled={busy}>
          {busy ? '확인 중…' : '내 위치로 설정'}
        </Button>
        {error && <p className="mt-2 text-tds-st3 text-tds-red">{error}</p>}
      </Card>
      <Card>
        <h2 className="text-tds-st1 font-medium mb-2">🔍 수동 검색</h2>
        <div className="flex gap-2 mb-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && search()}
            placeholder="도시명 입력 (예: Seoul, Tokyo)"
            className="flex-1 px-3 py-2 rounded-tds-md border border-tds-grey-200 bg-tds-bg text-tds-st2"
          />
          <Button variant="weak" onClick={search} disabled={busy}>검색</Button>
        </div>
        <ul className="space-y-2">
          {results.map((r, i) => (
            <li key={i}>
              <button onClick={() => pick(r)} className="w-full text-left p-2 rounded-tds-sm hover:bg-tds-grey-100">
                {r.name}
              </button>
            </li>
          ))}
        </ul>
      </Card>
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/onboarding/
git -c user.email=sigco3111@users.noreply.github.com -c user.name=sigco3111 \
  commit -m "feat(app): onboarding page (geolocation + manual search)"
```

### Task 7.4: Create app/settings/page.tsx

- [ ] **Step 1: Write settings page**

```typescript
// app/settings/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useNeighborhood } from '@/lib/hooks/useNeighborhood';
import { useFriends } from '@/lib/hooks/useFriends';
import { searchAddress } from '@/lib/api/geocoding';
import { storage } from '@/lib/storage';
import { haptic } from '@/lib/haptics';
import type { Neighborhood } from '@/types';

export default function SettingsPage() {
  const router = useRouter();
  const { neighborhood, clear: clearMy } = useNeighborhood();
  const { friends, remove, add, maxFriends } = useFriends();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Neighborhood[]>([]);
  const [busy, setBusy] = useState(false);

  const search = async () => {
    if (!query.trim()) return;
    setBusy(true);
    try {
      const r = await searchAddress(query);
      setResults(
        r.map((g) => ({
          name: [g.name, g.admin2].filter(Boolean).join(' '),
          lat: g.latitude,
          lon: g.longitude,
        })),
      );
    } catch {
      setResults([]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto max-w-screen-sm p-4">
      <header className="flex items-center gap-2 mb-4">
        <Button variant="ghost" onClick={() => router.push('/')}>←</Button>
        <h1 className="text-tds-t2 font-bold">설정</h1>
      </header>

      <Card className="mb-4">
        <h2 className="text-tds-st1 font-medium mb-2">우리 동네</h2>
        <p className="text-tds-st2 text-tds-grey-700 mb-3">📍 {neighborhood?.name ?? '미설정'}</p>
        <div className="flex gap-2">
          <Button variant="weak" onClick={() => router.push('/onboarding')}>변경</Button>
          <Button variant="ghost" onClick={() => { clearMy(); haptic('tap'); }}>초기화</Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-tds-st1 font-medium mb-2">친구 동네 ({friends.length}/{maxFriends})</h2>
        <ul className="space-y-2 mb-3">
          {friends.map((f, i) => (
            <li key={i} className="flex items-center justify-between p-2 rounded-tds-sm bg-tds-grey-50">
              <span className="text-tds-st2">{f.name}</span>
              <Button variant="ghost" onClick={() => { remove(i); haptic('tap'); }}>삭제</Button>
            </li>
          ))}
        </ul>
        {friends.length < maxFriends && (
          <>
            <div className="flex gap-2 mb-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && search()}
                placeholder="도시명 입력"
                className="flex-1 px-3 py-2 rounded-tds-md border border-tds-grey-200 bg-tds-bg text-tds-st2"
              />
              <Button variant="weak" onClick={search} disabled={busy}>검색</Button>
            </div>
            <ul className="space-y-2">
              {results.map((r, i) => (
                <li key={i} className="flex items-center justify-between p-2 rounded-tds-sm hover:bg-tds-grey-50">
                  <span className="text-tds-st2">{r.name}</span>
                  <Button variant="primary" onClick={() => { add(r); setResults([]); setQuery(''); haptic('success'); }}>추가</Button>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/settings/
git -c user.email=sigco3111@users.noreply.github.com -c user.name=sigco3111 \
  commit -m "feat(app): settings page (my neighborhood + friends management)"
```

### Task 7.5: Add Vercel deployment files

- [ ] **Step 1: Create vercel.json (optional, for explicit config)**

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs",
  "buildCommand": "next build",
  "outputDirectory": ".next",
  "installCommand": "yarn install"
}
```

> Optional — Next.js 15 auto-detected by Vercel. Skip if not needed.

- [ ] **Step 2: Update .gitignore**

Ensure `.next/`, `node_modules/`, `.env*` are in `.gitignore`. Verify and add if missing.

```bash
cat .gitignore | grep -E "^\.next|^node_modules|^\.env" || echo "Adding missing entries"
```

If any are missing, append:
```
.next/
node_modules/
.env*.local
```

- [ ] **Step 3: Update README.md with Vercel deployment instructions**

```markdown
# 우리 동네 오늘 (Next.js 15 + Vercel)

> 2026-06-22 Vercel 전환 — `archive/toss-app/`에 토스 앱인토스 버전 보존

## 로컬 개발

```bash
yarn install
yarn dev  # http://localhost:3000
```

## 테스트

```bash
yarn test         # Vitest
yarn test:watch   # watch 모드
yarn test:coverage  # 커버리지
yarn type-check   # TypeScript 검증
```

## 빌드 / 배포

```bash
yarn build  # 프로덕션 빌드
yarn start  # 프로덕션 서버
```

Vercel 배포: `git push origin main` → 자동 빌드/배포.
URL: `<project-name>.vercel.app`

## 아키텍처

- Next.js 15 App Router + React 19 + TypeScript strict
- Tailwind v4 (CSS-first) + TDS 디자인 토큰 (`app/globals.css`의 `@theme`)
- recharts (LineChart / RadialBarChart / AreaChart / BarChart)
- SWR (30분 캐시) + localStorage (영구 캐시) + Next.js fetch cache (24h, RSC only)
- Vitest + React Testing Library

## 문서

- 스펙: `docs/superpowers/specs/2026-06-22-vercel-web-migration-design.md`
- 구현 계획: `docs/superpowers/plans/2026-06-22-vercel-web-migration.md`
- API 명세: `docs/DATA_SOURCES.md` (변경 없음)
- 아카이브 (Toss 버전 복원): `archive/toss-app/README.md`
```

- [ ] **Step 4: Commit**

```bash
git add .gitignore README.md vercel.json 2>/dev/null || git add .gitignore README.md
git -c user.email=sigco3111@users.noreply.github.com -c user.name=sigco3111 \
  commit -m "docs: Vercel deployment README + gitignore refresh"
```

### Task 7.6: Final verification — full QA pass

- [ ] **Step 1: Run all tests**

```bash
yarn test
```

Expected: All pass (characterEngine, format, 6 APIs, WeatherCard, ...)

- [ ] **Step 2: Type-check**

```bash
yarn type-check
```

Expected: No errors

- [ ] **Step 3: Build**

```bash
yarn build
```

Expected: Build success, exit 0

- [ ] **Step 4: Smoke test dev server**

```bash
yarn dev &
sleep 8
# 1. Home page redirects to /onboarding (no neighborhood set)
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/         # 200
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/onboarding  # 200
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/settings    # 200
pkill -f "next dev" || true
```

Expected: All 200

- [ ] **Step 5: Direct API smoke tests**

```bash
# 6 APIs all return 200
for url in \
  "https://api.open-meteo.com/v1/forecast?latitude=37.5665&longitude=126.9780&current=temperature_2m" \
  "https://air-quality-api.open-meteo.com/v1/air-quality?latitude=37.5665&longitude=126.9780&current=pm2_5" \
  "https://api.open-meteo.com/v1/forecast?latitude=37.5665&longitude=126.9780&daily=precipitation_sum" \
  "https://date.nager.at/api/v3/PublicHolidays/2026/KR" \
  "https://geocoding-api.open-meteo.com/v1/search?name=Seoul&count=1" \
  "https://nominatim.openstreetmap.org/reverse?lat=37.5665&lon=126.9780&format=json"; do
  echo -n "$url → "
  curl -sI "$url" 2>/dev/null | head -1
done
```

Expected: Each line shows `HTTP/2 200` (or similar)

- [ ] **Step 6: Browser E2E with Playwright (optional, but recommended for AC3/AC4/AC5/AC6)**

If Playwright is installed:
```bash
npx playwright install chromium  # one-time
yarn add -D @playwright/test
npx playwright test e2e/
```

If skipped, document in commit message: "Manual browser verification deferred to Vercel preview URL".

### Task 7.7: Push to GitHub and trigger Vercel deploy

- [ ] **Step 1: Verify git state**

```bash
git status && git log --oneline -10
```

Expected: All Phase 7 commits present, no uncommitted changes

- [ ] **Step 2: Push to GitHub**

```bash
git push origin main
```

Expected: Push successful

- [ ] **Step 3: Trigger Vercel deployment**

Two options:
- **A. Auto-deploy**: Vercel is already connected to the repo. Push triggers deploy.
- **B. Manual**: <https://vercel.com/new> → Import `sigco3111/dongne-today` → Deploy.

- [ ] **Step 4: Verify Vercel URL**

```bash
curl -sI https://dongne-today.vercel.app 2>/dev/null | head -1
# or check Vercel dashboard for the actual URL
```

Expected: `HTTP/2 200` (after ~1-2 min build)

- [ ] **Step 5: Commit final verification log**

```bash
echo "✅ Vercel deployment verified at $(date -u +%Y-%m-%dT%H:%M:%SZ)" > DEPLOYMENT.md
git add DEPLOYMENT.md
git -c user.email=sigco3111@users.noreply.github.com -c user.name=sigco3111 \
  commit -m "docs: Vercel deployment verified"
```

---

## Acceptance Criteria Verification (cross-check with spec AC1-AC12)

| AC | Verification command | Status |
|---|---|---|
| AC1 | `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000` → 200 | ☐ |
| AC2 | 6 zod schemas parse real API responses | ☐ |
| AC3 | 5 cards render in browser (Playwright or manual) | ☐ |
| AC4 | characterEngine 6 cases (test file) | ☐ |
| AC5 | Playwright: location → auto-detect → manual override | ☐ |
| AC6 | Playwright: add/remove friend | ☐ |
| AC7 | SWR 30min + localStorage fallback (offline test) | ☐ |
| AC8 | Web Share API on mobile Safari/Chrome | ☐ |
| AC9 | `prefers-color-scheme: dark` toggle in DevTools | ☐ |
| AC10 | `yarn build` exit 0 + Vercel URL 200 | ☐ |
| AC11 | `yarn test` 100% pass | ☐ |
| AC12 | `yarn test:coverage` 80%+ | ☐ |

---

## End of Plan

**Total tasks: 30+**
**Total commits: 30+ (atomic, per task)**
**Estimated time: 4-6 hours of focused work**

When all tasks are complete, the project is a working Vercel-deployed Next.js 15 app with 1:1 feature parity to the original Toss version, ready for production use.

---

**Next step**: User chooses execution mode (Subagent-Driven recommended) → implementation begins.
