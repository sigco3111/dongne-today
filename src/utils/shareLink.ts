/**
 * 우리 동네 오늘 — 토스 share 링크 헬퍼
 *
 * 대시보드 PNG 캡처 + 토스 share SDK 조합.
 * Phase 3 (6/23-24)에 react-native-view-shot으로 PNG 생성 후 연결.
 */

import { share, getTossShareLink } from '@apps-in-toss/framework';
import type { DashboardData } from '../types';

/**
 * 토스 share SDK로 텍스트 메시지 공유
 * 사용자가 받는 앱을 선택 → 우리 동네 대시보드 메시지 전달
 */
export async function shareDashboardText(data: DashboardData): Promise<void> {
  const message = [
    `🏘️ 우리 동네 오늘 (${data.neighborhood.name})`,
    `${data.character.emoji} ${data.character.line}`,
    `🌡️ ${Math.round(data.weather.current.temperature_2m)}° · 🌫️ PM2.5 ${Math.round(data.airQuality.current.pm2_5)}`,
    `🌧️ 강수확률 ${data.precipitation.todayProbabilityMax}% · 강수량 ${data.precipitation.todaySum.toFixed(1)}mm`,
    data.holiday.isHoliday
      ? `🎉 오늘은 ${data.holiday.holidayName}`
      : `📅 ${data.holiday.daysUntilNext >= 0 ? `다음 공휴일 ${data.holiday.daysUntilNext}일 전` : '평일'}`,
    '',
    '토스 앱에서 보기 →',
  ].join('\n');
  await share({ message });
}

/**
 * 토스 미니앱 share link 생성 (딥링크)
 * 친구가 누르면 토스 앱이 열리면서 우리 미니앱 진입
 */
export async function buildTossShareLink(
  data: DashboardData,
): Promise<string | null> {
  try {
    const message = `${data.neighborhood.name} 동네 컨디션 — ${data.character.emoji} ${data.character.line}`;
    const link = await getTossShareLink(message);
    return link;
  } catch {
    return null;
  }
}