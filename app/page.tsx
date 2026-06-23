import { Suspense } from 'react';
import { HomeContent } from './_components/HomeContent';

/**
 * 홈 페이지 — 대시보드 2x3 그리드 + 공유/새로고침 + 설정 진입.
 * - 서버 컴포넌트 (RSC): 헤더 마크업 + Suspense fallback만 담당
 * - 클라이언트 로직은 HomeContent 에 위임
 */
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