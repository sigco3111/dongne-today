import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <main
      id="main"
      className="mx-auto max-w-screen-md px-4 py-12 min-h-[100dvh] flex items-center justify-center"
    >
      <div className="text-center max-w-md">
        <div className="text-7xl font-bold text-tds-blue tracking-tighter tabular-nums mb-3">
          404
        </div>
        <h1 className="text-tds-t2 font-bold text-tds-grey-900 tracking-tight mb-2">
          페이지를 찾을 수 없어요
        </h1>
        <p className="text-tds-st2 text-tds-grey-500 mb-8 leading-relaxed">
          요청하신 페이지가 사라졌거나, 주소가 잘못 입력된 것 같아요.
          <br />
          동네 컨디션은 메인 화면에서 확인해 보세요.
        </p>
        <div className="flex items-center justify-center gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-tds-md bg-tds-blue text-white text-tds-st2 font-medium hover:bg-tds-blue-dark active:scale-[0.97] transition-all duration-200 shadow-tds-sm hover:shadow-tds-md"
          >
            <Home size={14} strokeWidth={2} />
            홈으로
          </Link>
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-tds-md bg-tds-grey-100 text-tds-grey-900 text-tds-st2 font-medium hover:bg-tds-grey-200 active:scale-[0.97] transition-all duration-200"
          >
            <ArrowLeft size={14} strokeWidth={2} />
            동네 설정
          </Link>
        </div>
      </div>
    </main>
  );
}
