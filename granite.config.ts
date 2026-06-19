/**
 * Granite Configuration for "우리 동네 오늘" (dongne-today)
 *
 * Apps-in-Toss 미니앱 설정 — Granite 1.x + appsInToss 1.5.x API 사용.
 * granite.config.ts 변경 시 docs/ARCHITECTURE.md 도 함께 업데이트.
 */

import { defineConfig } from '@granite-js/react-native/config';
import { appsInToss } from '@apps-in-toss/framework/plugins';

export default defineConfig({
  scheme: 'intoss',
  appName: 'dongne-today',

  plugins: [
    appsInToss({
      appType: 'general',
      brand: {
        displayName: '우리 동네 오늘',
        primaryColor: '#3182F6',
        icon: 'https://static.toss.im/appsintoss/placeholder-icon.png',
        bridgeColorMode: 'basic',
      },
      permissions: [
        { name: 'geolocation', access: 'access' },
      ],
      navigationBar: {
        withBackButton: false,
        withHomeButton: false,
      },
    }),
  ],
});