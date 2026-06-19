/**
 * 우리 동네 오늘 — MBTI 캐릭터 헤더
 *
 * TDS Top + Txt로 캐릭터 한 줄 리포트 표시.
 * docs/DESIGN_SYSTEM.md "MBTI 캐릭터 6종" 참조.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Txt, colors, useShadow } from '@toss/tds-react-native';
import type { CharacterReport as CharacterReportType } from '../../types';

interface Props {
  character: CharacterReportType;
  neighborhoodName: string;
}

export function CharacterReport({ character, neighborhoodName }: Props) {
  const shadow = useShadow({
    color: colors.blue500,
    opacity: 0.1,
    radius: 16,
    offset: { x: 0, y: 6 },
  });
  return (
    <View style={[styles.container, shadow]}>
      <Txt typography="st3" color={colors.grey700}>
        📍 {neighborhoodName}
      </Txt>
      <View style={styles.row}>
        <Txt typography="t1" style={styles.emoji}>
          {character.emoji}
        </Txt>
        <View style={styles.text}>
          <Txt
            typography="t2"
            fontWeight="bold"
            color={colors.grey900}
          >
            {character.line}
          </Txt>
          <Txt typography="st2" color={colors.grey700}>
            {character.subline}
          </Txt>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: colors.background,
    borderRadius: 16,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  emoji: {
    fontSize: 48,
  },
  text: {
    flex: 1,
    gap: 4,
  },
});