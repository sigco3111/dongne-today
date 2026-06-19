/**
 * 서울 열린데이터 — 따릉이 (서울 공공자전거)
 * http://openapi.seoul.go.kr:8088/sample/json/bikeList/{start}/{end}/
 * sample 키 사용 (개발용, 일일 quota 있음)
 *
 * 응답: { rentBikeStatus: { row: [{ stationName, parkingBikeTotCnt, rackTotCnt, stationLatitude, stationLongitude, ... }] } }
 */

import type { BikeShareData, BikeShareStation, Coordinates } from '../../types';

const BASE_URL = 'http://openapi.seoul.go.kr:8088/sample/json/bikeList';

interface SeoulBikeListRow {
  stationId: string;
  stationName: string;
  parkingBikeTotCnt: string;
  rackTotCnt: string;
  stationLatitude: string;
  stationLongitude: string;
}

interface SeoulBikeListResponse {
  rentBikeStatus?: {
    row?: SeoulBikeListRow[];
  };
}

export const bikeShare = {
  /** 전체 따릉이 목록 (1~1000개, sample 키는 1000개 단위로 끊어야 함) */
  async fetchAll(): Promise<BikeShareStation[]> {
    const collected: BikeShareStation[] = [];
    const pageSize = 1000;
    for (let start = 1; start <= 3000; start += pageSize) {
      const end = start + pageSize - 1;
      const res = await fetch(`${BASE_URL}/${start}/${end}/`);
      if (!res.ok) {
        throw new Error(`BikeShare API failed: ${res.status}`);
      }
      const json: SeoulBikeListResponse = await res.json();
      const rows = json.rentBikeStatus?.row ?? [];
      if (rows.length === 0) break;
      collected.push(
        ...rows.map((r) => ({
          stationId: r.stationId,
          stationName: r.stationName,
          // 따릉이 API는 모든 숫자를 문자열로 반환 — number 변환 필수
          parkingBikeTotCnt: Number(r.parkingBikeTotCnt),
          rackTotCnt: Number(r.rackTotCnt),
          latitude: Number(r.stationLatitude),
          longitude: Number(r.stationLongitude),
        })),
      );
    }
    return collected;
  },

  /** 좌표 기준 통계 + 가장 가까운 정류소 */
  async fetchNearest(coords: Coordinates): Promise<BikeShareData> {
    const stations = await bikeShare.fetchAll();
    const ratios = stations
      .filter((s) => s.rackTotCnt > 0)
      .map((s) => (s.parkingBikeTotCnt / s.rackTotCnt) * 100);
    const averageAvailable =
      ratios.length > 0
        ? ratios.reduce((sum, v) => sum + v, 0) / ratios.length
        : 0;

    const nearest = stations
      .map((s) => ({
        ...s,
        distance: haversine(coords, { lat: s.latitude, lon: s.longitude }),
      }))
      .sort((a, b) => a.distance - b.distance)[0];

    return {
      averageAvailable: Math.round(averageAvailable),
      totalStations: stations.length,
      nearest,
      fetchedAt: new Date().toISOString(),
    };
  },
};

function haversine(a: Coordinates, b: Coordinates): number {
  const R = 6371; // km
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}