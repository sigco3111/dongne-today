/**
 * Granite Configuration for "우리 동네 오늘" (dongne-today)
 *
 * Apps-in-Toss 미니앱 설정.
 * 다른 PC에서 작업하는 AI 에이전트는 이 파일을 참고해서 빌드 환경 세팅.
 */

import { defineConfig } from '@granite-js/react-native';

export default defineConfig({
  // 앱 이름 (콘솔 등록 시 사용할 appName과 일치해야 함)
  appName: 'dongne-today',

  // 한국어 앱 이름 (사용자 눈에 보이는 이름)
  displayName: '우리 동네 오늘',

  // 권한 설정 — granite.config.ts에 등록 후 콘솔에서도 다시 확인 필요
  permissions: [
    'LOCATION',       // 위치 (1회) — OnboardingScreen에서 getCurrentLocation 호출
    'NOTIFICATION',   // 알림 (선택적) — 출근길 알림 등
  ],

  // 사용할 토스 services/SDK
  services: [
    'storage',              // KV 저장소 (캐시, 친구 동네 목록)
    'appLogin',             // 토스 로그인 (선택적 — 사용자 식별)
    'share',                // 공유 링크
    'getTossShareLink',     // 토스 공유 링크 생성
    'getCurrentLocation',   // 위치 1회
    'requestNotificationAgreement', // 알림 동의
    'getClipboardText',     // 클립보드 (동네명 복사용 옵션)
    'setClipboardText',     // 클립보드
  ],

  // 빌드 설정
  build: {
    output: 'dist',
    bundleSplit: true,
    minify: true,
  },

  // 외부 API (CORS 허용된 무키 API)
  // granite.config.ts에 직접 등록은 안 하지만, services/api/ 폴더에서 fetch로 직접 호출
  // - https://api.open-meteo.com/v1/forecast
  // - https://air-quality-api.open-meteo.com/v1/air-quality
  // - http://openapi.seoul.go.kr:8088/sample/json/bikeList/
  // - https://date.nager.at/api/v3/PublicHolidays/
  // - https://geocoding-api.open-meteo.com/v1/search
  // - https://nominatim.openstreetmap.org/reverse
});
