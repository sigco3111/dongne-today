import { ImageResponse } from 'next/og';

export const alt = '우리 동네 오늘 — 동네 컨디션 인포그래픽';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * OG/Twitter 카드 이미지 — Next.js ImageResponse로 빌드 시 자동 생성.
 * 외부 API 호출 없이 정적 디자인으로 렌더링.
 * 동네 이름/캐릭터 정보는 Query string으로 선택적 주입 가능 (?name=강남구&emoji=☀️&line=...)
 */
export default async function Image({ params }: { params: Promise<{ name?: string }> }) {
  // Next.js 15의 og 라우트는 params를 Promise로 받음
  void params;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #3182F6 0%, #1B64DA 100%)',
          padding: '80px',
          color: 'white',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: 28,
            opacity: 0.85,
            marginBottom: 12,
          }}
        >
          <span style={{ marginRight: 12 }}>📍</span>
          우리 동네 오늘
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: 96,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            marginBottom: 24,
          }}
        >
          동네의 오늘을
          <br />
          한눈에
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 32,
            fontWeight: 500,
            opacity: 0.92,
            marginTop: 'auto',
          }}
        >
          날씨 · 미세먼지 · 강수 · 공휴일 · 친구 동네 비교
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginTop: 32,
            fontSize: 24,
            opacity: 0.7,
          }}
        >
          <span>☀️ 🌙 🎨 🚇 😷 🌤️</span>
          <span>· 7종 MBTI 캐릭터형 리포트</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
