// scripts/verify-dark-mode.mjs
// Surface verification: 다크모드 디폴트 + FOUC 방지 + UI 검증
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const SCREENSHOT_DIR = resolve(process.cwd(), 'claudedocs');
mkdirSync(SCREENSHOT_DIR, { recursive: true });

const NEIGHBORHOOD = {
  name: '강남구',
  lat: 37.4979,
  lon: 127.0276,
  district: '강남구',
};

const DARK_BG = 'rgb(22, 26, 23)'; // #161A17 — globals.css 다크 BG
const browser = await chromium.launch({
  headless: true,
  executablePath:
    process.env.CHROMIUM_PATH ||
    '/Users/hjshin/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
});

const results = [];
function record(name, pass, detail) {
  results.push({ name, pass, detail });
  console.log(`[${pass ? 'PASS' : 'FAIL'}] ${name}${detail ? ' — ' + detail : ''}`);
}

// =========================================================================
// S1: First visit with empty localStorage → html[data-theme="dark"] 즉시 적용
// =========================================================================
{
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    locale: 'ko-KR',
    timezoneId: 'Asia/Seoul',
    colorScheme: 'light', // 시스템이 라이트 선호여도 dark가 디폴트여야 함
  });
  const page = await ctx.newPage();

  // localStorage는 처음부터 비어있음 (브라우저 컨텍스트가 새롭기 때문)

  // domcontentloaded 직후 data-theme 확인 (React hydrate 전 FOUC 스크립트 검증)
  await page.goto('http://localhost:3000/onboarding', { waitUntil: 'domcontentloaded' });
  const dataThemeAfterDOMReady = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));

  // neighborhood 주입 후 / 로 이동
  await page.evaluate((n) => {
    localStorage.setItem('neighborhood', JSON.stringify(n));
    localStorage.setItem('onboardingDone', 'true');
  }, NEIGHBORHOOD);

  await page.waitForTimeout(500);

  // /로 이동 — dashboard가 다크로 렌더되어야 함
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      console.log(`[browser ${msg.type()}]`, msg.text());
    }
  });
  try {
    await page.waitForFunction(
      () => document.querySelectorAll('[data-testid="stat-pm"]').length > 0,
      { timeout: 45000 },
    );
  } catch (err) {
    console.log('[TIMEOUT] stat-pm wait failed, body text:', (await page.evaluate(() => document.body.innerText)).slice(0, 500));
    await page.screenshot({ path: `${SCREENSHOT_DIR}/dark-mode-error.png`, fullPage: true });
    throw err;
  }
  await page.waitForTimeout(1500);

  const dashboardDataTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/dark-mode-dashboard.png`, fullPage: true });

  record(
    'S1a FOUC: domcontentloaded 시점에 data-theme="dark" 적용됨 (첫 방문)',
    dataThemeAfterDOMReady === 'dark',
    `data-theme=${dataThemeAfterDOMReady}`,
  );
  record(
    'S1b Dashboard: dashboard 페이지에서 data-theme="dark" 유지',
    dashboardDataTheme === 'dark',
    `data-theme=${dashboardDataTheme}`,
  );
  record(
    'S1c Dashboard body BG: 다크 배경색(#161A17) 적용',
    bodyBg === DARK_BG,
    `bodyBg=${bodyBg}`,
  );

  await ctx.close();
}

// =========================================================================
// S2: Settings 페이지에서 테마 디폴트가 "다크" (순환 버튼 = "다크" 라벨)
// =========================================================================
{
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    locale: 'ko-KR',
    timezoneId: 'Asia/Seoul',
    colorScheme: 'light',
  });
  const page = await ctx.newPage();
  // /onboarding에서 한 번 localStorage 접근 후 settings 이동
  await page.goto('http://localhost:3000/onboarding', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('onboardingDone', 'true');
    localStorage.setItem(
      'neighborhood',
      JSON.stringify({ name: '강남구', lat: 37.4979, lon: 127.0276 }),
    );
  });
  await page.goto('http://localhost:3000/settings', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(
    () => document.body.innerText.includes('테마'),
    { timeout: 15000 },
  );
  await page.waitForTimeout(800);

  // Theme card 영역의 순환 버튼 라벨 = "다크" (디폴트)
  const themeBtnText = await page.evaluate(() => {
    const h2s = Array.from(document.querySelectorAll('h2'));
    const themeH2 = h2s.find((h) => h.textContent?.trim() === '테마');
    const card = themeH2?.closest('div[class*="rounded-tds"]');
    const btn = card?.querySelector('button');
    return btn?.textContent?.trim() ?? null;
  });
  await page.screenshot({ path: `${SCREENSHOT_DIR}/dark-mode-settings.png`, fullPage: true });

  record(
    'S2 Settings: 테마 디폴트 순환 버튼 라벨 = "다크"',
    themeBtnText === '다크',
    `themeBtnText=${themeBtnText}`,
  );

  await ctx.close();
}

// =========================================================================
// S3: 사용자가 light로 저장한 경우 → data-theme="light", BG = 라이트
// =========================================================================
{
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    locale: 'ko-KR',
    timezoneId: 'Asia/Seoul',
    colorScheme: 'light',
  });
  const page = await ctx.newPage();
  await page.goto('http://localhost:3000/onboarding', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('themePref', JSON.stringify('light'));
    localStorage.setItem('onboardingDone', 'true');
    localStorage.setItem(
      'neighborhood',
      JSON.stringify({ name: '강남구', lat: 37.4979, lon: 127.0276 }),
    );
  });
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(
    () => document.querySelectorAll('[data-testid="stat-pm"]').length > 0,
    { timeout: 45000 },
  );
  await page.waitForTimeout(1000);

  const dataTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/light-mode-override.png`, fullPage: true });

  record(
    'S3 명시 light: data-theme="light"',
    dataTheme === 'light',
    `data-theme=${dataTheme}`,
  );
  record(
    'S3 명시 light body BG: 라이트 배경색(#FAFAF7 = rgb(250, 250, 247))',
    bodyBg === 'rgb(250, 250, 247)',
    `bodyBg=${bodyBg}`,
  );

  await ctx.close();
}

await browser.close();

const failed = results.filter((r) => !r.pass);
console.log('---');
console.log(`TOTAL: ${results.length}, PASS: ${results.length - failed.length}, FAIL: ${failed.length}`);
if (failed.length > 0) {
  console.error('FAILED:', JSON.stringify(failed, null, 2));
  process.exit(1);
}
process.exit(0);
