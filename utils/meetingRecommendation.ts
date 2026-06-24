/**
 * 약속 시간 추천 — 모든 친구 동네의 시간별 데이터에서
 * "모두 비 안 옴 + 적당한 기온"인 시간대를 찾아 점수 매김.
 *
 * 점수 공식 (0~100):
 *   - 강수확률 < 30% AND 강수량 == 0 → 보너스 +40
 *   - 강수확률 < 60% → +20
 *   - 18~25°C → +30
 *   - 10~28°C → +15
 *   - 풍속 < 20km/h → +15
 *   - 자외선 < 8 → +10 (낮 시간만)
 */

import type { WeatherData, FriendNeighborhood } from '@/types';

export interface MeetingInput {
  /** 우리 동네 날씨 */
  my: WeatherData;
  /** 우리 동네 */
  myName: string;
  /** 친구 동네 + 날씨 */
  friends: Array<{ friend: FriendNeighborhood; weather: WeatherData }>;
  /** 추천할 시간 범위 (기본 다음 24시간) */
  hours?: number;
  /** 자정 기준 시작 시간 (기본: 현재) */
  fromHour?: Date;
  /** 추천 결과 개수 */
  topN?: number;
}

export interface MeetingRecommendation {
  hour: string;
  hourLabel: string;
  score: number;
  reason: string;
  /** 각 동네의 상세 — 기온/강수확률 */
  details: Array<{ name: string; temp: number; precipProb: number }>;
}

const RAIN_PROB_SAFE = 30;
const RAIN_PROB_OK = 60;
const WIND_SAFE = 20;
const TEMP_IDEAL_MIN = 18;
const TEMP_IDEAL_MAX = 25;
const TEMP_OK_MIN = 10;
const TEMP_OK_MAX = 28;
const UV_SAFE = 8;

function scoreHour(
  weather: WeatherData,
  precipProbs: number[],
  temps: number[],
  winds: number[],
  uvs: number[],
  hourIdx: number,
): number {
  if (hourIdx >= precipProbs.length) return 0;
  let s = 50; // 기본
  const pop = precipProbs[hourIdx] ?? 0;
  const temp = temps[hourIdx] ?? 0;
  const wind = winds[hourIdx] ?? 0;
  const uv = uvs[hourIdx] ?? 0;

  if (pop < RAIN_PROB_SAFE) s += 40;
  else if (pop < RAIN_PROB_OK) s += 20;

  if (temp >= TEMP_IDEAL_MIN && temp <= TEMP_IDEAL_MAX) s += 30;
  else if (temp >= TEMP_OK_MIN && temp <= TEMP_OK_MAX) s += 15;

  if (wind < WIND_SAFE) s += 15;
  if (uv < UV_SAFE) s += 10;

  return Math.min(100, s);
}

function buildDetailRow(
  name: string,
  weather: WeatherData,
  hourIdx: number,
): { name: string; temp: number; precipProb: number } {
  return {
    name,
    temp: Math.round(weather.hourly.temperature_2m[hourIdx] ?? weather.current.temperature_2m),
    precipProb: Math.round(weather.hourly.precipitation_probability[hourIdx] ?? 0),
  };
}

/**
 * 입력 동네들의 시간대별 점수 계산 → 상위 N개 추천.
 * 각 시간대별 점수는 모든 동네 점수의 평균 (어느 한 곳만 비 와도 점수 깎임).
 */
export function recommendMeetingTimes(input: MeetingInput): MeetingRecommendation[] {
  const { my, myName, friends, hours = 24, topN = 3 } = input;
  const start = input.fromHour ?? new Date();

  // 각 동네의 시간 데이터
  const places = [
    { name: myName, weather: my },
    ...friends.map((f) => ({ name: f.friend.name, weather: f.weather })),
  ];

  const results: MeetingRecommendation[] = [];

  for (let h = 0; h < hours; h++) {
    const date = new Date(start);
    date.setHours(start.getHours() + h);
    const hourISO = date.toISOString().slice(0, 13); // "YYYY-MM-DDTHH"
    const hourLabel = `${date.getHours()}시`; // "15시"

    let totalScore = 0;
    const details: MeetingRecommendation['details'] = [];

    for (const place of places) {
      const idx = h; // 단순 가정: hourly는 현재 시각부터 h시간 후
      const score = scoreHour(
        place.weather,
        place.weather.hourly.precipitation_probability,
        place.weather.hourly.temperature_2m,
        place.weather.hourly.wind_speed_10m,
        place.weather.hourly.uv_index,
        idx,
      );
      totalScore += score;
      details.push(buildDetailRow(place.name, place.weather, idx));
    }

    const avgScore = Math.round(totalScore / places.length);

    // 비가 어디든 오는 시간대는 제외 (모든 동네 pop < 30%)
    const allDry = details.every((d) => d.precipProb < RAIN_PROB_SAFE);
    if (!allDry) continue;

    // 이유 생성
    const reasons: string[] = [];
    const avgTemp = Math.round(details.reduce((s, d) => s + d.temp, 0) / details.length);
    reasons.push(`${avgTemp}°C 맑음`);
    if (places.length >= 2) reasons.push(`${places.length}개 동네 모두 비 안 옴`);

    results.push({
      hour: hourISO,
      hourLabel,
      score: avgScore,
      reason: reasons.join(' · '),
      details,
    });
  }

  // 점수 내림차순 정렬 → 상위 N개
  return results.sort((a, b) => b.score - a.score).slice(0, topN);
}

/**
 * 친구들의 중심점 계산 (우리 동네 + 친구 동네들의 평균 좌표).
 * Nominatim reverse로 행정구역명 조회하지 않고 좌표만 반환.
 */
export function midpointCoordinate(
  my: { lat: number; lon: number },
  friends: Array<{ friend: FriendNeighborhood; weather: WeatherData }>,
): { lat: number; lon: number } {
  if (!friends.length) return my;
  let totalLat = my.lat;
  let totalLon = my.lon;
  for (const f of friends) {
    totalLat += f.friend.lat;
    totalLon += f.friend.lon;
  }
  return {
    lat: totalLat / (friends.length + 1),
    lon: totalLon / (friends.length + 1),
  };
}
