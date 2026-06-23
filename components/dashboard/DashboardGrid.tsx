'use client';
import { CharacterReport } from './CharacterReport';
import { WeatherCard } from '@/components/cards/WeatherCard';
import { AirQualityCard } from '@/components/cards/AirQualityCard';
import { PrecipitationCard } from '@/components/cards/PrecipitationCard';
import { HolidayCard } from '@/components/cards/HolidayCard';
import { CompareCard, type CompareEntry } from '@/components/cards/CompareCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { decideCharacter } from '@/utils/characterEngine';
import type {
  DashboardData,
  HolidayData,
  Neighborhood,
  WeatherData,
  AirQualityData,
  PrecipitationData,
} from '@/types';

export interface DashboardGridProps {
  neighborhood: Neighborhood;
  isLoading: boolean;
  /** weather/airQuality/precipitation은 한 묶음 (날씨 fetch 결과), holiday는 별도 fetch */
  data: {
    weather: WeatherData;
    airQuality: AirQualityData;
    precipitation: PrecipitationData;
  } | null;
  holiday: HolidayData;
  friends: CompareEntry[];
}

/**
 * 대시보드 2x3 그리드 (모바일 기준)
 * - row 1: CharacterReport (full-width)
 * - row 2: Weather | AirQuality
 * - row 3: Precipitation | Holiday
 * - row 4: CompareCard (full-width)
 *
 * 로딩 중에는 5개의 Skeleton placeholder 표시
 */
export function DashboardGrid({
  neighborhood,
  isLoading,
  data,
  holiday,
  friends,
}: DashboardGridProps) {
  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  // DashboardData.character 필드도 채워야 함 (캐시 저장 시 필요)
  const character = decideCharacter({
    weather: data.weather,
    airQuality: data.airQuality,
    precipitation: data.precipitation,
    holiday,
  });

  const dashboardData: DashboardData = {
    weather: data.weather,
    airQuality: data.airQuality,
    precipitation: data.precipitation,
    holiday,
    neighborhood,
    character,
    friendsWeather: friends.map((f) => ({ friend: f.friend, weather: f.weather })),
    fetchedAt: new Date().toISOString(),
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="col-span-full">
        <CharacterReport data={dashboardData} />
      </div>
      <WeatherCard data={data.weather} />
      <AirQualityCard data={data.airQuality} />
      <PrecipitationCard data={data.precipitation} />
      <HolidayCard data={holiday} />
      <div className="col-span-full">
        <CompareCard my={data.weather} friends={friends} />
      </div>
    </div>
  );
}