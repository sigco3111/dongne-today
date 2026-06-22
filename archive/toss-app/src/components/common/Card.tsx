/**
 * 우리 동네 오늘 — 공통 Card 래퍼
 *
 * TDS Shadow 토큰 (medium/up) + 16px radius + 16px padding.
 * 모든 카드(WeatherCard, AirQualityCard, PrecipitationCard, HolidayCard, CompareCard)가 사용.
 */

import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { useShadow, colors } from '@toss/tds-react-native';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Card({ children, style }: Props) {
  const shadow = useShadow({
    color: colors.grey900,
    opacity: 0.06,
    radius: 12,
    offset: { x: 0, y: 4 },
  });
  return (
    <View style={[styles.card, shadow, style]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
});