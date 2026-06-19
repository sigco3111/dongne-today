/**
 * 🌫️ 미세먼지 카드 — 게이지 + 등급 라벨
 *
 * docs/DESIGN_SYSTEM.md "AirQualityCard" 스타일 참조.
 * react-native-gifted-charts PieChart를 도넛 게이지로 활용.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Txt, colors } from '@toss/tds-react-native';
import { PieChart } from 'react-native-gifted-charts';
import type { AirQualityData } from '../../types';
import { AIR_QUALITY_LABEL } from '../../services/api/airQuality';
import { formatPm } from '../../utils/format';

interface Props {
  data: AirQualityData;
  style?: object;
}

export function AirQualityCard({ data, style }: Props) {
  const pm25 = data.current.pm2_5;
  const info = AIR_QUALITY_LABEL[data.level];

  const ratio = Math.min(pm25 / 100, 1);
  const chartData = [
    {
      value: ratio,
      color: info.color,
      gradientCenterColor: info.color,
    },
    {
      value: 1 - ratio,
      color: colors.grey100,
    },
  ];

  return (
    <View style={[styles.card, style]}>
      <Txt typography="st1" fontWeight="medium" color={colors.grey900}>
        🌫️ 미세먼지
      </Txt>

      <View style={styles.gaugeRow}>
        <PieChart
          data={chartData}
          donut
          radius={36}
          innerRadius={28}
          innerCircleColor={colors.background}
          centerLabelComponent={() => (
            <Txt typography="st1" fontWeight="bold" color={info.color}>
              {formatPm(pm25)}
            </Txt>
          )}
        />
        <View style={styles.labelWrap}>
          <Txt typography="t3" fontWeight="bold" color={info.color}>
            {info.emoji} {info.label}
          </Txt>
          <Txt typography="st3" color={colors.grey500}>
            PM2.5 μg/m³
          </Txt>
        </View>
      </View>
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
  gaugeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  labelWrap: {
    flex: 1,
    gap: 4,
  },
});