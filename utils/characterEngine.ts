/**
 * 우리 동네 오늘 — MBTI 캐릭터 결정 엔진
 *
 * 6종 캐릭터:
 * - MASK_DONGNE (🌫️): PM2.5 매우 나쁨
 * - COMMUTER_DONGNE (🚇): 평일 출근시간
 * - WALK_LOVER (☁️): 미세먼지 좋음 + 날씨 좋음
 * - CULTURALIST (🎨): 공휴일
 * - E_ACTIVE (☀️): 강수확률 낮음 + 비 안 옴 + 좋은 날씨 → 활동적
 * - I_QUIET (🌙): 기본값 (차분)
 *
 * 결정 우선순위는 docs/DESIGN_SYSTEM.md 참조.
 */

import type {
  CharacterKind,
  CharacterReport,
  WeatherData,
  AirQualityData,
  PrecipitationData,
  HolidayData,
} from '../types';

interface CharacterInput {
  weather: WeatherData;
  airQuality: AirQualityData;
  precipitation: PrecipitationData;
  holiday: HolidayData;
}

export const CHARACTERS: Record<
  CharacterKind,
  Omit<CharacterReport, 'matchedRule'>
> = {
  MASK_DONGNE: {
    kind: 'MASK_DONGNE',
    emoji: '🌫️',
    line: '미세먼지 부우 — 마스크 동네',
    subline: '마스크 챙기세요 😷',
  },
  COMMUTER_DONGNE: {
    kind: 'COMMUTER_DONGNE',
    emoji: '🚇',
    line: '월요일 아침, 우리 동네는 출근러',
    subline: '화이팅! 💼',
  },
  WALK_LOVER: {
    kind: 'WALK_LOVER',
    emoji: '☁️',
    line: '공기도 깨끗, 날씨도 좋아',
    subline: '산책러버 동네 🚶‍♀️',
  },
  CULTURALIST: {
    kind: 'CULTURALIST',
    emoji: '🎨',
    line: '공휴일! 우리 동네는 문화인',
    subline: '한강에서 만나요 🎭',
  },
  E_ACTIVE: {
    kind: 'E_ACTIVE',
    emoji: '☀️',
    line: '우리 동네는 활동적인 E형',
    subline: '바깥에서 만나요! 🏃',
  },
  I_QUIET: {
    kind: 'I_QUIET',
    emoji: '🌙',
    line: '우리 동네는 차분한 I형',
    subline: '오늘은 집이 최고 📚',
  },
};

/**
 * 우선순위대로 룰 체크 → 매칭된 캐릭터 반환
 * 시간 의존 룰(COMMUTER_DONGNE)은 클라이언트 로컬 시간 기준.
 */
export function decideCharacter(input: CharacterInput): CharacterReport {
  const { weather, airQuality, precipitation, holiday } = input;
  const pm25 = airQuality.current.pm2_5;
  const weatherCode = weather.current.weather_code;
  const hour = new Date().getHours();

  // 1순위: 마스크 동네 (미세먼지 매우 나쁨)
  if (pm25 >= 75) {
    return { ...CHARACTERS.MASK_DONGNE, matchedRule: 'pm2.5 >= 75' };
  }

  // 2순위: 출근러 동네 (평일 7-9시)
  if (holiday.isWeekday && hour >= 7 && hour <= 9) {
    return { ...CHARACTERS.COMMUTER_DONGNE, matchedRule: 'weekday 7-9am' };
  }

  // 3순위: 산책러버 (미세먼지 좋음 + 날씨 좋음)
  // weather_code 0~3 = 맑음/구름조금/흐림
  if (pm25 <= 15 && weatherCode <= 2) {
    return { ...CHARACTERS.WALK_LOVER, matchedRule: 'pm2.5 <=15 AND weather_code <=2' };
  }

  // 4순위: 문화인 (공휴일)
  if (holiday.isHoliday) {
    return { ...CHARACTERS.CULTURALIST, matchedRule: 'isHoliday' };
  }

  // 5순위: E형 활동가 (강수 거의 없음 + 좋은 날씨)
  if (
    precipitation.todayProbabilityMax < 30 &&
    precipitation.todaySum < 1 &&
    weatherCode <= 3
  ) {
    return {
      ...CHARACTERS.E_ACTIVE,
      matchedRule: 'precipitation.todayProbabilityMax <30 AND todaySum <1 AND weatherCode <=3',
    };
  }

  // 6순위: I형 (기본)
  return { ...CHARACTERS.I_QUIET, matchedRule: 'default' };
}

/** 캐릭터 일괄 목록 (UI에서 순회용) */
export const CHARACTER_LIST: CharacterKind[] = [
  'MASK_DONGNE',
  'COMMUTER_DONGNE',
  'WALK_LOVER',
  'CULTURALIST',
  'E_ACTIVE',
  'I_QUIET',
];