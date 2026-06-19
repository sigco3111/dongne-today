/**
 * 우리 동네 오늘 — 메인 대시보드
 *
 * Dashboard 컴포넌트 + 공유 버튼 + 새로고침.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Txt, Button, Top, colors } from '@toss/tds-react-native';
import { storage } from '../services/storage';
import { getDashboard } from '../services/api';
import { Dashboard } from '../components/common/Dashboard';
import { shareDashboardText, buildTossShareLink } from '../utils/shareLink';
import { haptics } from '../utils/haptics';
import type { DashboardData, FriendNeighborhood, Neighborhood } from '../types';

interface Props {
  onOpenSettings: () => void;
}

export function HomeScreen({ onOpenSettings }: Props) {
  const [neighborhood, setNeighborhood] = useState<Neighborhood | null>(null);
  const [friends, setFriends] = useState<FriendNeighborhood[]>([]);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!neighborhood) return;
    try {
      const result = await getDashboard(neighborhood, friends);
      setData(result);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '데이터를 불러올 수 없어요.';
      Alert.alert('오류', msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [neighborhood, friends]);

  useEffect(() => {
    (async () => {
      const [n, f] = await Promise.all([
        storage.getNeighborhood(),
        storage.getFriendNeighborhoods(),
      ]);
      setNeighborhood(n);
      setFriends(f);
    })();
  }, []);

  useEffect(() => {
    if (neighborhood) {
      setLoading(true);
      load();
    }
  }, [neighborhood, load]);

  async function handleRefresh() {
    setRefreshing(true);
    void haptics.tick();
    await storage.clearCache();
    await load();
    void haptics.success();
  }

  async function handleShare() {
    if (!data) return;
    try {
      void haptics.tap();
      await shareDashboardText(data);
      void haptics.success();
    } catch (e) {
      void haptics.error();
      Alert.alert('공유 실패', '공유 기능을 사용할 수 없어요.');
    }
  }

  // 링크 미리 생성 (백그라운드)
  useEffect(() => {
    if (data) {
      buildTossShareLink(data).catch(() => undefined);
    }
  }, [data]);

  if (loading || !data) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator />
        <Txt typography="st2" color={colors.grey500}>
          동네 정보 가져오는 중...
        </Txt>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Top
        title="우리 동네 오늘"
        right={
          <View style={styles.topRight}>
            <Button type="primary" style="weak" onPress={handleShare}>
              공유
            </Button>
            <Button type="primary" style="weak" onPress={handleRefresh} disabled={refreshing}>
              {refreshing ? '...' : '새로고침'}
            </Button>
            <Button type="primary" style="weak" onPress={onOpenSettings}>
              설정
            </Button>
          </View>
        }
      />
      <Dashboard data={data} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  topRight: {
    flexDirection: 'row',
    gap: 4,
  },
});