import '@testing-library/jest-dom/vitest';

// recharts ResponsiveContainer가 의존하는 jsdom에 없는 API polyfill
// jsdom에는 ResizeObserver가 없어서 recharts가 렌더 실패함
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}

// vitest jsdom 환경에서 localStorage가 global에 노출되지 않음 — localStorage stub 주입
const memory: Record<string, string> = {};
const stub: Storage = {
  getItem: (k: string) => (k in memory ? memory[k] : null),
  setItem: (k: string, v: string) => { memory[k] = String(v); },
  removeItem: (k: string) => { delete memory[k]; },
  clear: () => { for (const k of Object.keys(memory)) delete memory[k]; },
  key: (i: number) => Object.keys(memory)[i] ?? null,
  get length() { return Object.keys(memory).length; },
};
(globalThis as { localStorage?: Storage }).localStorage = stub;
if (typeof window !== 'undefined') {
  (window as { localStorage?: Storage }).localStorage = stub;
}