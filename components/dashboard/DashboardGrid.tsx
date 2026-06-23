'use client';
import { CharacterReport } from './CharacterReport';
import { WeatherCard } from '@/components/cards/WeatherCard';
import { AirQualityCard } from '@/components/cards/AirQualityCard';
import { PrecipitationCard } from '@/components/cards/PrecipitationCard';
import { HolidayCard } from '@/components/cards/HolidayCard';
import { CompareCard, type CompareEntry } from '@/components/cards/CompareCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { decideCharacter } from '@/utils/characterEngine';
import type { DashboardData, HolidayData, Neighborhood, WeatherData, FriendNeighborhood } from '@/types';

export interface DashboardGridProps {
  neighborhood: Neighborhood;
  isLoading: boolean;
  data: {
    weather: WeatherData;
    airQuality: DashboardData['airQuality'];
    precipitation: DashboardData['precipitation'];
  } | null;
  holiday: HolidayData;
  friends: CompareEntry[];
}

export function DashboardGrid({
  neighborhood,
  isLoading,
  data,
  holiday,
  friends,
}: DashboardGridProps) {
  if (isLoading || !data) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-28 w-full" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }
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
    friendsWeather: friends.map((f) => ({
      friend: f.friend,
      weather: f.weather,
    })),
    fetchedAt: new Date().toISOString(),
  };
  return (
    <div className="flex flex-col gap-3">
      <div className="col-span-full">
        <CharacterReport data={dashboardData} neighborhoodName={neighborhood.name} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <WeatherCard data={data.weather} />
        <AirQualityCard data={data.airQuality} />
        <PrecipitationCard data={data.precipitation} />
        <HolidayCard data={holiday} />
      </div>
      <div className="col-span-full">
        <CompareCard my={data.weather} friends={friends} />
      </div>
    </div>
  );
}
