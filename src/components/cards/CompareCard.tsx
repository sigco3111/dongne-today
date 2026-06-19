/**
 * 👥 친구 동네 비교 카드 — 가로 막대
 *
 * docs/DESIGN_SYSTEM.md "CompareCard" 스타일 참조.
 * 우리 동네 + 친구 동네별 현재 기온 비교.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Txt, colors } from '@toss/tds-react-native';
import { BarChart } from 'react-native-gifted-charts';
import type { WeatherData, FriendNeighborhood } from '../../types';
import { formatTemp } from '../../utils/format';

interface Props {
  myWeather: WeatherData;
  myNeighborhood: string;
  friendsWeather: Array<{
    friend: FriendNeighborhood;
    weather: WeatherData;
  }>;
}

export function CompareCard({ myWeather, myNeighborhood, friendsWeather }: Props) {
  const data = [
    {
      value: myWeather.current.temperature_2m,
      label: '우리',
      frontColor: colors.blue500,
    },
    ...friendsWeather.map(({ friend, weather }) => ({
      value: weather.current.temperature_2m,
      label: friend.name.length > 6 ? `${friend.name.slice(0, 6)}…` : friend.name,
      frontColor: colors.grey400,
    })),
  ];

  return (
    <View style={styles.card}>
      <Txt typography="st1" fontWeight="medium" color={colors.grey900}>
        👥 친구 동네 비교
      </Txt>
      <Txt typography="st3" color={colors.grey500}>
        우리 {myNeighborhood} vs 친구 동네 현재 기온
      </Txt>

      {data.length === 1 ? (
        <Txt typography="st2" color={colors.grey500} style={styles.empty}>
          비교할 친구 동네를 추가해보세요.
        </Txt>
      ) : (
        <BarChart
          data={data}
          height={120}
          barWidth={28}
          spacing={16}
          roundedTop
          hideRules
          yAxisTextStyle={{ color: colors.grey500, fontSize: 10 }}
          xAxisLabelTextStyle={{ color: colors.grey700, fontSize: 11 }}
          xAxisColor={colors.grey200}
          yAxisColor={colors.grey200}
          noOfSections={4}
          isAnimated
          animationDuration={600}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  empty: {
    paddingVertical: 24,
    textAlign: 'center',
  },
});