/**
 * 🌧️ 강수 카드 — 라인 차트 + 오늘 강수 요약
 *
 * docs/DESIGN_SYSTEM.md "PrecipitationCard" 스타일 참조.
 * 24시간 강수확률(%) LineChart + 오늘 합계(mm) 헤더.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Txt, colors } from '@toss/tds-react-native';
import { LineChart } from 'react-native-gifted-charts';
import type { PrecipitationData } from '../../types';
import { formatPercent, formatHourShort } from '../../utils/format';
import { Card } from '../common/Card';

interface Props {
  data: PrecipitationData;
  style?: object;
}

export function PrecipitationCard({ data, style }: Props) {
  const chartData = data.hourly.time.slice(0, 24).map((time, i) => ({
    value: data.hourly.precipitation_probability[i],
    label: formatHourShort(time),
    dataPointText: `${data.hourly.precipitation_probability[i]}`,
  }));

  return (
    <Card style={style}>
      <View style={styles.header}>
        <Txt typography="st1" fontWeight="medium" color={colors.grey900}>
          🌧️ 강수
        </Txt>
      </View>

      <View style={styles.row}>
        <Txt typography="t1" fontWeight="bold" color={colors.blue500}>
          {formatPercent(data.todayProbabilityMax)}
        </Txt>
        <Txt typography="st2" color={colors.grey700}>
          강수 {data.todaySum.toFixed(1)}mm
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
    </Card>
  );
}

const styles = StyleSheet.create({
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
