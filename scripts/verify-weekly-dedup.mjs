// scripts/verify-weekly-dedup.mjs
// Surface verification: load dashboard, count "이번 주 동네 리포트" headings
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const SCREENSHOT_DIR = resolve(process.cwd(), 'claudedocs');
const SCREENSHOT_PATH = `${SCREENSHOT_DIR}/weekly-dedup-after.png`;
const ARTIFACT_DIR = '/tmp/ulw-dongne';

mkdirSync(SCREENSHOT_DIR, { recursive: true });

const NEIGHBORHOOD = {
  name: '강남구',
  lat: 37.4979,
  lon: 127.0276,
  district: '강남구',
};

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.CHROMIUM_PATH || '/Users/hjshin/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
});
const context = await browser.newContext({
  viewport: { width: 390, height: 844 }, // iPhone 14 size
  locale: 'ko-KR',
  timezoneId: 'Asia/Seoul',
});
const page = await context.newPage();

// Step 1: visit /onboarding to get an origin context for localStorage
await page.goto('http://localhost:3000/onboarding', { waitUntil: 'domcontentloaded' });

// Step 2: inject localStorage with neighborhood + onboardingDone
await page.evaluate(({ n }) => {
  localStorage.setItem('neighborhood', JSON.stringify(n));
  localStorage.setItem('onboardingDone', 'true');
}, { n: NEIGHBORHOOD });

// Capture console messages + failed requests for debugging
page.on('console', (msg) => {
  if (msg.type() === 'error' || msg.type() === 'warning') {
    console.log(`[browser ${msg.type()}]`, msg.text());
  }
});
page.on('requestfailed', (req) => {
  console.log('[requestfailed]', req.url(), req.failure()?.errorText);
});

// Step 3: navigate to home — this should now show dashboard, not redirect to onboarding
await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });

// Step 4: wait for the dashboard data to load (poll for the weekly report heading OR skeleton gone)
try {
  await page.waitForFunction(
    () => document.querySelectorAll('[data-testid="stat-pm"]').length > 0,
    { timeout: 45000 },
  );
} catch (e) {
  console.log('[timeout] stat-pm did not appear within 45s');
  // dump body text for diagnosis
  const body = await page.evaluate(() => document.body.innerText.slice(0, 2000));
  console.log('[body]', body);
  await page.screenshot({ path: SCREENSHOT_PATH, fullPage: true });
  await browser.close();
  process.exit(1);
}
// give animations + charts a beat
await page.waitForTimeout(2000);

// Step 5: count the heading occurrences
const counts = await page.evaluate(() => {
  const all = Array.from(document.querySelectorAll('h3'));
  const matchText = (t) => (t ?? '').trim();
  const weeklyReport = all.filter((h) => matchText(h.textContent) === '이번 주 동네 리포트').length;
  const weeklyForecast = all.filter((h) => matchText(h.textContent) === '7일 예보').length;
  const statPms = document.querySelectorAll('[data-testid="stat-pm"]').length;
  const statTemps = document.querySelectorAll('[data-testid="stat-temp"]').length;
  const statRains = document.querySelectorAll('[data-testid="stat-rain"]').length;
  const statChars = document.querySelectorAll('[data-testid="stat-character"]').length;
  return { weeklyReport, weeklyForecast, statPms, statTemps, statRains, statChars };
});

console.log('COUNTS', JSON.stringify(counts));

await page.screenshot({ path: SCREENSHOT_PATH, fullPage: true });
console.log('SCREENSHOT', SCREENSHOT_PATH);

// Step 6: assertion — exactly 1 of each
let pass = true;
const errors = [];
if (counts.weeklyReport !== 1) { pass = false; errors.push(`weeklyReport=${counts.weeklyReport} (expected 1)`); }
if (counts.weeklyForecast !== 1) { pass = false; errors.push(`weeklyForecast=${counts.weeklyForecast} (expected 1)`); }
if (counts.statPms !== 1) { pass = false; errors.push(`statPms=${counts.statPms} (expected 1)`); }
if (counts.statTemps !== 1) { pass = false; errors.push(`statTemps=${counts.statTemps} (expected 1)`); }
if (counts.statRains !== 1) { pass = false; errors.push(`statRains=${counts.statRains} (expected 1)`); }
if (counts.statChars !== 1) { pass = false; errors.push(`statChars=${counts.statChars} (expected 1)`); }

console.log('PASS', pass);
if (!pass) {
  console.error('FAIL_REASONS', JSON.stringify(errors));
  process.exitCode = 1;
}

await browser.close();
