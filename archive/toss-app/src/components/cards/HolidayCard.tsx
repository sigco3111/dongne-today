/**
 * 🎭 공휴일 카드 — 배지 + 다음 공휴일 D-N
 *
 * docs/DESIGN_SYSTEM.md "HolidayCard" 스타일 참조.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Txt, colors, Badge } from '@toss/tds-react-native';
import type { HolidayData } from '../../types';
import { formatDaysUntil } from '../../utils/format';
import { Card } from '../common/Card';

interface Props {
  data: HolidayData;
  style?: object;
}

export function HolidayCard({ data, style }: Props) {
  const isToday = data.isHoliday;
  return (
    <Card style={style}>
      <Txt typography="st1" fontWeight="medium" color={colors.grey900}>
        🎭 공휴일
      </Txt>

      {isToday ? (
        <View style={styles.row}>
          <Badge type="red" badgeStyle="fill">
            🎉 오늘
          </Badge>
          <Txt typography="st2" fontWeight="bold" color={colors.red500}>
            {data.holidayName}
          </Txt>
        </View>
      ) : (
        <View style={styles.row}>
          <Badge type="elephant" badgeStyle="weak">
            평일
          </Badge>
          {data.daysUntilNext >= 0 && (
            <Txt typography="st2" color={colors.grey700}>
              다음 공휴일 {formatDaysUntil(data.daysUntilNext)}
            </Txt>
          )}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});