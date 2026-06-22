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