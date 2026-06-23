/**
 * 우리 동네 오늘 — 에러 바운더리
 *
 * React 클래스 컴포넌트로 구현 (함수형 에러 바운더리는 아직 React 정식 API 아님).
 * 자식 컴포넌트에서 throw 시 catch → fallback UI 표시.
 * 토스 검수 시 "화면이 빈 화면으로 멈춤" 회귀 방지.
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Txt, Button, colors } from '@toss/tds-react-native';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (__DEV__) {
      console.error('[ErrorBoundary]', error, info.componentStack);
    }
  }

  reset = () => {
    this.setState({ hasError: false, message: '' });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Txt typography="t1">😵‍💫</Txt>
        <Txt typography="t3" fontWeight="bold">
          문제가 발생했어요
        </Txt>
        <Txt typography="st2" color={colors.grey700} style={styles.message}>
          {this.state.message || '알 수 없는 오류'}
        </Txt>
        <Button type="primary" onPress={this.reset}>
          다시 시도
        </Button>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
    backgroundColor: colors.background,
  },
  message: {
    textAlign: 'center',
    marginVertical: 8,
  },
});