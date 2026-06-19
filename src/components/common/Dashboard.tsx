/**
 * 우리 동네 오늘 — 2x3 카드 그리드 레이아웃
 *
 * 4개 카드 + 1개 풀폭 비교 카드.
 * docs/ARCHITECTURE.md 화면 레이아웃 참조.
 */

import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { colors } from '@toss/tds-react-native';
import type { DashboardData } from '../../types';
import { CharacterReport } from './CharacterReport';
import { WeatherCard } from '../cards/WeatherCard';
import { AirQualityCard } from '../cards/AirQualityCard';
import { BikeShareCard } from '../cards/BikeShareCard';
import { HolidayCard } from '../cards/HolidayCard';
import { CompareCard } from '../cards/CompareCard';

interface Props {
  data: DashboardData;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function Dashboard({ data, onRefresh, refreshing = false }: Props) {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.blue500}
          />
        ) : undefined
      }
    >
      <CharacterReport
        character={data.character}
        neighborhoodName={data.neighborhood.name}
      />

      <View style={styles.row}>
        <WeatherCard data={data.weather} style={styles.cell} />
        <AirQualityCard data={data.airQuality} style={styles.cell} />
      </View>

      <View style={styles.row}>
        <BikeShareCard data={data.bikeShare} style={styles.cell} />
        <HolidayCard data={data.holiday} style={styles.cell} />
      </View>

      <CompareCard
        myWeather={data.weather}
        myNeighborhood={data.neighborhood.name}
        friendsWeather={data.friendsWeather}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.grey50,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  cell: {
    flex: 1,
  },
});