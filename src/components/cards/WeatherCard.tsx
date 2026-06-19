/**
 * 🌤️ 날씨 카드 — 라인 차트 + 현재 기온
 *
 * docs/DESIGN_SYSTEM.md "WeatherCard" 스타일 참조.
 * react-native-gifted-charts LineChart 사용.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Txt, colors } from '@toss/tds-react-native';
import { LineChart } from 'react-native-gifted-charts';
import type { WeatherData } from '../../types';
import { getWeatherLabel } from '../../services/api/weather';
import { formatHourShort, formatTemp } from '../../utils/format';

interface Props {
  data: WeatherData;
  style?: object;
}

export function WeatherCard({ data, style }: Props) {
  const chartData = data.hourly.time.slice(0, 24).map((time, i) => ({
    value: data.hourly.temperature_2m[i],
    label: formatHourShort(time),
    dataPointText: formatTemp(data.hourly.temperature_2m[i]),
  }));

  const currentLabel = getWeatherLabel(data.current.weather_code);
  const currentTemp = data.current.temperature_2m;

  return (
    <View style={[styles.card, style]}>
      <View style={styles.header}>
        <Txt typography="st1" fontWeight="medium" color={colors.grey900}>
          🌤️ 오늘 날씨
        </Txt>
      </View>

      <View style={styles.row}>
        <Txt typography="t1" fontWeight="bold" color={colors.blue500}>
          {formatTemp(currentTemp)}
        </Txt>
        <Txt typography="st2" color={colors.grey700}>
          {currentLabel.emoji} {currentLabel.label}
        </Txt>
      </View>

      <LineChart
        data={chartData}
        height={80}
        thickness={2}
        color={colors.blue500}
        startFillColor={colors.blue500}
        endFillColor={colors.blue500}
        startOpacity={0.15}
        endOpacity={0.02}
        areaChart
        hideDataPoints
        hideRules
        hideYAxisText
        xAxisColor={colors.grey200}
        yAxisColor={colors.grey200}
        xAxisLabelTextStyle={{ color: colors.grey500, fontSize: 9 }}
        spacing={14}
        initialSpacing={4}
        adjustToWidth
        isAnimated
        animationDuration={600}
      />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
});