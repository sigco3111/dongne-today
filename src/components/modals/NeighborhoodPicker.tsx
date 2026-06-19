/**
 * 우리 동네 오늘 — 동네 검색/선택 모달
 *
 * Open-Meteo Geocoding API로 주소 → 좌표 검색.
 * SettingsScreen에서 친구 동네 추가 시 사용.
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Txt, colors, SearchField, Button, ListRow } from '@toss/tds-react-native';
import type { Neighborhood } from '../../types';
import { geocoding } from '../../services/api/geocoding';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (neighborhood: Neighborhood) => void;
  title?: string;
}

export function NeighborhoodPicker({
  visible,
  onClose,
  onSelect,
  title = '동네 선택',
}: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Neighborhood[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSearch(next: string) {
    setQuery(next);
    if (next.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const found = await geocoding.forward(next.trim());
      setResults(found);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function handlePick(n: Neighborhood) {
    onSelect(n);
    setQuery('');
    setResults([]);
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Txt typography="t3" fontWeight="bold">
            {title}
          </Txt>
          <Pressable onPress={onClose} hitSlop={12}>
            <Txt typography="st2" color={colors.blue500}>
              취소
            </Txt>
          </Pressable>
        </View>

        <SearchField
          value={query}
          onChange={(e) => void handleSearch(e.nativeEvent.text)}
          placeholder="동네 이름 입력 (예: 강남구, 홍대)"
          autoFocus
        />

        {loading && (
          <View style={styles.center}>
            <ActivityIndicator color={colors.blue500} />
          </View>
        )}

        {!loading && query.length >= 2 && results.length === 0 && (
          <View style={styles.center}>
            <Txt typography="st2" color={colors.grey500}>
              검색 결과가 없어요
            </Txt>
          </View>
        )}

        <View style={styles.list}>
          {results.map((r, i) => (
            <ListRow
              key={`${r.lat}-${r.lon}-${i}`}
              left={
                <Txt typography="st1" fontWeight="medium">
                  {r.name}
                </Txt>
              }
              right={
                r.district ? (
                  <Txt typography="st3" color={colors.grey500}>
                    {r.district}
                  </Txt>
                ) : null
              }
              onPress={() => handlePick(r)}
            />
          ))}
        </View>

        <View style={styles.footer}>
          <Button type="primary" onPress={onClose} style="weak">
            닫기
          </Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  center: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  list: {
    flex: 1,
  },
  footer: {
    paddingVertical: 8,
  },
});