/**
 * 🚴 따릉이 카드 — 도넛 + 평균 가용률
 *
 * docs/DESIGN_SYSTEM.md "BikeShareCard" 스타일 참조.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Txt, colors } from '@toss/tds-react-native';
import { PieChart } from 'react-native-gifted-charts';
import type { BikeShareData } from '../../types';
import { formatPercent, formatDistance } from '../../utils/format';
import { Card } from '../common/Card';

interface Props {
  data: BikeShareData;
  style?: object;
}

export function BikeShareCard({ data, style }: Props) {
  const ratio = data.averageAvailable / 100;
  const chartData = [
    {
      value: ratio,
      color: colors.blue500,
      gradientCenterColor: colors.blue500,
    },
    {
      value: 1 - ratio,
      color: colors.grey100,
    },
  ];

  return (
    <Card style={style}>
      <Txt typography="st1" fontWeight="medium" color={colors.grey900}>
        🚴 따릉이
      </Txt>

      <View style={styles.row}>
        <PieChart
          data={chartData}
          donut
          radius={36}
          innerRadius={28}
          innerCircleColor={colors.background}
          centerLabelComponent={() => (
            <Txt typography="st1" fontWeight="bold" color={colors.blue500}>
              {formatPercent(data.averageAvailable)}
            </Txt>
          )}
        />
        <View style={styles.textWrap}>
          <Txt typography="st2" color={colors.grey900}>
            평균 가용
          </Txt>
          <Txt typography="st3" color={colors.grey500}>
            총 {data.totalStations}개소
          </Txt>
          {data.nearest && data.nearest.distance !== undefined && (
            <Txt typography="st3" color={colors.grey700}>
              {data.nearest.stationName} · {formatDistance(data.nearest.distance)}
            </Txt>
          )}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  textWrap: {
    flex: 1,
    gap: 4,
  },
});