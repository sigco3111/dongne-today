/**
 * 우리 동네 오늘 — 온보딩 화면
 *
 * Phase 1 (6/19-20) 첫 화면:
 * 1. 위치 권한 요청 (getCurrentLocation)
 * 2. 자동 동네 인식 (Nominatim reverse)
 * 3. 저장 → HomeScreen 이동
 *
 * 권한 거부 시 수동 동네 입력 fallback.
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Txt, Button, colors } from '@toss/tds-react-native';
import {
  GetCurrentLocationPermissionError,
  Accuracy,
} from '@apps-in-toss/framework';
import { detectNeighborhood } from '../services/location';
import { storage } from '../services/storage';
import { NeighborhoodPicker } from '../components/modals/NeighborhoodPicker';
import type { Neighborhood } from '../types';

interface Props {
  onDone: () => void;
}

type Status = 'idle' | 'detecting' | 'error' | 'manual';

export function OnboardingScreen({ onDone }: Props) {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [manualOpen, setManualOpen] = useState(false);

  async function autoDetect() {
    setStatus('detecting');
    setError(null);
    try {
      const neighborhood = await detectNeighborhood();
      await storage.setNeighborhood(neighborhood);
      await storage.setOnboardingDone();
      onDone();
    } catch (e) {
      if (e instanceof GetCurrentLocationPermissionError) {
        setError('위치 권한이 필요해요. 수동으로 동네를 입력해주세요.');
      } else {
        setError('동네를 자동으로 인식하지 못했어요. 수동으로 입력해주세요.');
      }
      setStatus('error');
    }
  }

  async function handleManualPick(n: Neighborhood) {
    await storage.setNeighborhood(n);
    await storage.setOnboardingDone();
    onDone();
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Txt typography="t1" fontWeight="bold" color={colors.grey900}>
        🏘️ 우리 동네 오늘
      </Txt>
      <Txt typography="st2" color={colors.grey700}>
        동네의 오늘을 6가지 데이터로 한눈에.
        {'\n'}
        날씨, 미세먼지, 강수, 공휴일까지.
      </Txt>

      <View style={styles.illustration}>
        <Txt typography="t1">📍</Txt>
        <Txt typography="st3" color={colors.grey500}>
          우리 동네 자동 인식
        </Txt>
      </View>

      {status === 'idle' && (
        <Button type="primary" onPress={autoDetect}>
          자동으로 동네 인식하기
        </Button>
      )}

      {status === 'detecting' && (
        <Button type="primary" disabled>
          위치 확인 중...
        </Button>
      )}

      {status === 'error' && (
        <>
          <Txt typography="st2" color={colors.red500}>
            {error}
          </Txt>
          <Button type="primary" onPress={autoDetect}>
            다시 시도
          </Button>
          <Button type="primary" style="weak" onPress={() => setManualOpen(true)}>
            직접 입력하기
          </Button>
        </>
      )}

      {(status === 'idle' || status === 'detecting') && (
        <Button type="primary" style="weak" onPress={() => setManualOpen(true)}>
          직접 입력하기
        </Button>
      )}

      <NeighborhoodPicker
        visible={manualOpen}
        onClose={() => setManualOpen(false)}
        onSelect={handleManualPick}
        title="우리 동네 선택"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    gap: 16,
    backgroundColor: colors.background,
    justifyContent: 'center',
  },
  illustration: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
});