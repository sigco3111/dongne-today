/**
 * 👥 친구 동네 비교 카드 — 가로 막대
 *
 * docs/DESIGN_SYSTEM.md "CompareCard" 스타일 참조.
 * 우리 동네 + 친구 동네별 현재 기온 비교.
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Txt, colors } from '@toss/tds-react-native';
import { BarChart } from 'react-native-gifted-charts';
import type { WeatherData, FriendNeighborhood } from '../../types';
import { formatTemp } from '../../utils/format';
import { Card } from '../common/Card';

interface Props {
  myWeather: WeatherData;
  myNeighborhood: string;
  friendsWeather: Array<{
    friend: FriendNeighborhood;
    weather: WeatherData;
  }>;
  onAddFriend?: () => void;
}

export function CompareCard({
  myWeather,
  myNeighborhood,
  friendsWeather,
  onAddFriend,
}: Props) {
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
    <Card>
      <Txt typography="st1" fontWeight="medium" color={colors.grey900}>
        👥 친구 동네 비교
      </Txt>
      <Txt typography="st3" color={colors.grey500}>
        우리 {myNeighborhood} vs 친구 동네 현재 기온
      </Txt>

      {data.length === 1 ? (
        <View style={styles.empty}>
          <Txt typography="st2" color={colors.grey500}>
            아직 비교할 친구 동네가 없어요
          </Txt>
          {onAddFriend && (
            <Pressable
              onPress={onAddFriend}
              style={styles.cta}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="친구 동네 추가하기"
            >
              <Txt typography="st1" fontWeight="medium" color={colors.blue500}>
                + 친구 동네 추가
              </Txt>
            </Pressable>
          )}
        </View>
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
    </Card>
  );
}

const styles = StyleSheet.create({
  empty: {
    paddingVertical: 24,
    alignItems: 'center',
    gap: 12,
  },
  cta: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
});