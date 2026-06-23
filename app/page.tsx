import { Suspense } from 'react';
import { HomeContent } from './_components/HomeContent';

export default function HomePage() {
  return (
    <main
      id="main"
      className="mx-auto max-w-screen-md px-4 py-5 sm:py-8 min-h-[100dvh]"
    >
      <header className="mb-6">
        <h1 className="text-tds-t1 font-bold text-tds-grey-900 tracking-tight">우리 동네 오늘</h1>
        <p className="text-tds-st2 text-tds-grey-500 mt-1">오늘의 동네 컨디션을 한눈에</p>
      </header>
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center py-16 text-tds-grey-500">
            <div className="animate-pulse-soft w-8 h-8 rounded-full bg-tds-blue/20 mb-3" />
            <span className="text-tds-st2">불러오는 중…</span>
          </div>
        }
      >
        <HomeContent />
      </Suspense>
    </main>
  );
}
