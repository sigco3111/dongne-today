/**
 * 우리 동네 오늘 — 설정 화면
 *
 * 친구 동네 추가/수정/삭제 + 우리 동네 변경.
 * docs/CHECKLIST.md "SettingsScreen" 참조.
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Txt,
  colors,
  Button,
  ListRow,
} from '@toss/tds-react-native';
import { storage } from '../services/storage';
import { NeighborhoodPicker } from '../components/modals/NeighborhoodPicker';
import type {
  FriendNeighborhood,
  Neighborhood,
} from '../types';

interface Props {
  onBack: () => void;
  onUpdated: () => void;
}

export function SettingsScreen({ onBack, onUpdated }: Props) {
  const [myNeighborhood, setMyNeighborhood] = useState<Neighborhood | null>(null);
  const [friends, setFriends] = useState<FriendNeighborhood[]>([]);
  const [pickerOpen, setPickerOpen] = useState<null | 'me' | 'friend'>(null);

  async function load() {
    const [mine, list] = await Promise.all([
      storage.getNeighborhood(),
      storage.getFriendNeighborhoods(),
    ]);
    setMyNeighborhood(mine);
    setFriends(list);
  }

  useEffect(() => {
    load();
  }, []);

  async function handlePick(kind: 'me' | 'friend', n: Neighborhood) {
    if (kind === 'me') {
      await storage.setNeighborhood(n);
      onUpdated();
    } else {
      if (friends.length >= 5) {
        Alert.alert('친구 동네는 최대 5개까지 추가할 수 있어요.');
        return;
      }
      const friend: FriendNeighborhood = {
        ...n,
        addedAt: new Date().toISOString(),
      };
      await storage.addFriendNeighborhood(friend);
    }
    await load();
  }

  async function handleRemove(index: number) {
    await storage.removeFriendNeighborhood(index);
    await load();
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button type="primary" style="weak" onPress={onBack}>
          ← 뒤로
        </Button>
        <Txt typography="t3" fontWeight="bold">
          설정
        </Txt>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Txt typography="t3" fontWeight="bold">
          우리 동네
        </Txt>
        {myNeighborhood && (
          <ListRow
            left={
              <Txt typography="st1" fontWeight="medium">
                📍 {myNeighborhood.name}
              </Txt>
            }
            right={
              <Txt typography="st3" color={colors.grey500}>
                변경
              </Txt>
            }
            onPress={() => setPickerOpen('me')}
          />
        )}

        <View style={styles.section}>
          <Txt typography="t3" fontWeight="bold">
            친구 동네 ({friends.length}/5)
          </Txt>
          {friends.map((f, i) => (
            <ListRow
              key={`${f.lat}-${f.lon}-${i}`}
              left={
                <Txt typography="st1" fontWeight="medium">
                  👥 {f.name}
                </Txt>
              }
              right={
                <Txt typography="st3" color={colors.red500}>
                  삭제
                </Txt>
              }
              onPress={() => handleRemove(i)}
            />
          ))}
          {friends.length < 5 && (
            <Button
              type="primary"
              style="weak"
              onPress={() => setPickerOpen('friend')}
            >
              + 친구 동네 추가
            </Button>
          )}
        </View>
      </ScrollView>

      <NeighborhoodPicker
        visible={pickerOpen !== null}
        onClose={() => setPickerOpen(null)}
        onSelect={(n) => {
          if (pickerOpen) handlePick(pickerOpen, n);
        }}
        title={
          pickerOpen === 'me' ? '우리 동네 변경' : '친구 동네 추가'
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey200,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  section: {
    gap: 8,
    marginTop: 24,
  },
});