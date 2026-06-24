'use client';
import { lazy, Suspense, useState } from 'react';
import { CharacterReport } from './CharacterReport';
import { WeatherCard } from '@/components/cards/WeatherCard';
import { AirQualityCard } from '@/components/cards/AirQualityCard';
import { PrecipitationCard } from '@/components/cards/PrecipitationCard';
import { HolidayCard } from '@/components/cards/HolidayCard';
import { WeeklyCard } from '@/components/cards/WeeklyCard';
import { CharacterHistoryCard } from '@/components/cards/CharacterHistoryCard';
import { MeetingCard } from '@/components/cards/MeetingCard';
import { CompareCard, type CompareEntry } from '@/components/cards/CompareCard';
import { UVCard } from '@/components/cards/UVCard';
import { SunCard } from '@/components/cards/SunCard';
import { WeeklyReportCard } from '@/components/cards/WeeklyReportCard';
const HourlyDetailSheet = lazy(() =>
  import('@/components/cards/HourlyDetailSheet').then((m) => ({ default: m.HourlyDetailSheet })),
);
import type { HourlyMetric } from '@/components/cards/HourlyDetailSheet';
import { Skeleton } from '@/components/ui/Skeleton';
import { decideCharacter } from '@/utils/characterEngine';
import type { DashboardData, HolidayData, Neighborhood, WeatherData, AirQualityData, PrecipitationData, FriendNeighborhood, CharacterHistoryEntry } from '@/types';

export interface DashboardGridProps {
  neighborhood: Neighborhood;
  isLoading: boolean;
  data: {
    weather: WeatherData;
    airQuality: AirQualityData;
    precipitation: PrecipitationData;
  } | null;
  holiday: HolidayData;
  friends: CompareEntry[];
  historyItems: Array<{ date: string; entry: CharacterHistoryEntry | null }>;
}

export function DashboardGrid({
  neighborhood,
  isLoading,
  data,
  holiday,
  friends,
  historyItems,
}: DashboardGridProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMetric, setSheetMetric] = useState<HourlyMetric>('temperature');
  if (isLoading || !data) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-28 w-full" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-44 w-full" />
        <Skeleton className="h-44 w-full" />
        <Skeleton className="h-44 w-full" />
        <Skeleton className="h-44 w-full" />
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

  const openSheet = (metric: HourlyMetric) => {
    setSheetMetric(metric);
    setSheetOpen(true);
  };

  const history = historyItems
    .map((i) => i.entry)
    .filter((e): e is CharacterHistoryEntry => e !== null);

  return (
    <div className="flex flex-col gap-3">
      <div className="col-span-full">
        <CharacterReport data={dashboardData} neighborhoodName={neighborhood.name} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div onClick={() => openSheet('temperature')} className="cursor-pointer">
          <WeatherCard data={data.weather} />
        </div>
        <div onClick={() => openSheet('pm25')} className="cursor-pointer">
          <AirQualityCard data={data.airQuality} />
        </div>
        <div onClick={() => openSheet('uv')} className="cursor-pointer">
          <UVCard data={data.weather} />
        </div>
        <div onClick={() => openSheet('precip')} className="cursor-pointer">
          <PrecipitationCard data={data.precipitation} />
        </div>
      </div>

      <SunCard data={data.weather} />

      <HolidayCard data={holiday} />

      <WeeklyReportCard weather={data.weather} airQuality={data.airQuality} history={history} />
      <MeetingCard myName={neighborhood.name} my={data.weather} friends={friends} />

      <WeeklyCard data={data.weather} />

      <CharacterHistoryCard items={historyItems} />

      <div className="col-span-full">
        <CompareCard my={data.weather} friends={friends} />
      </div>
      <div className="col-span-full">

      <Suspense fallback={null}>
        {sheetOpen && (
          <HourlyDetailSheet
            open={sheetOpen}
            onClose={() => setSheetOpen(false)}
            weather={data.weather}
            airQuality={data.airQuality}
            defaultMetric={sheetMetric}
          />
        )}
      </Suspense>
      </div>

    </div>
  );
}