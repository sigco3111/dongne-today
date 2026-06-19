/**
 * 우리 동네 오늘 — 햅틱 피드백 헬퍼
 *
 * 토스 SDK generateHapticFeedback 래퍼.
 * 사용자 인터랙션(공유, 새로고침, 친구 추가, 카드 탭)에 미세한 진동 추가.
 *
 * 모든 호출은 try-catch로 감싸서 진동 미지원 디바이스에서도 안전.
 */

import { generateHapticFeedback } from '@apps-in-toss/native-modules';

type HapticType =
  | 'tickWeak'
  | 'tap'
  | 'tickMedium'
  | 'softMedium'
  | 'basicWeak'
  | 'basicMedium'
  | 'success'
  | 'error'
  | 'wiggle'
  | 'confetti';

async function haptic(type: HapticType): Promise<void> {
  try {
    await generateHapticFeedback({ type });
  } catch {
    // 진동 미지원/권한 거부 시 무시
  }
}

export const haptics = {
  /** 가벼운 탭 — 버튼 누름, 카드 선택 */
  tap: () => haptic('tap'),
  /** 성공 — 데이터 fetch 완료, 공유 완료 */
  success: () => haptic('success'),
  /** 에러 — fetch 실패, 권한 거부 */
  error: () => haptic('error'),
  /** 약한 틱 — 새로고침 시작 */
  tick: () => haptic('tickWeak'),
  /** 강조 — 캐릭터 등장, 다음 단계 */
  wiggle: () => haptic('wiggle'),
};