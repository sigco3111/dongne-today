/**
 * 우리 동네 오늘 — 앱 루트
 *
 * Granite 1.x + appsInToss 1.5.2 진입점.
 * TDSProvider + 온보딩/홈 라우팅.
 *
 * AppsInToss.registerApp이 Granite 런타임 + 토스 SDK 환경을 주입.
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { TDSProvider, colors } from '@toss/tds-react-native';
import { AppsInToss } from '@apps-in-toss/framework';
import type { InitialProps } from '@granite-js/react-native';

import { storage } from './services/storage';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { HomeScreen } from './screens/HomeScreen';
import { SettingsScreen } from './screens/SettingsScreen';

type Route = 'home' | 'settings';

function App(initialProps: InitialProps) {
  const [ready, setReady] = useState(false);
  const [onboarded, setOnboarded] = useState(false);
  const [route, setRoute] = useState<Route>('home');
  const [bumpKey, setBumpKey] = useState(0); // 데이터 갱신 트리거

  useEffect(() => {
    (async () => {
      const done = await storage.isOnboardingDone();
      setOnboarded(done);
      setReady(true);
    })();
  }, []);

  function handleOnboarded() {
    setOnboarded(true);
    setBumpKey((k) => k + 1);
  }

  function handleUpdated() {
    setBumpKey((k) => k + 1);
  }

  if (!ready) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.blue500} />
      </View>
    );
  }

  if (!onboarded) {
    return (
      <OnboardingScreen
        key={`onboard-${bumpKey}`}
        onDone={handleOnboarded}
      />
    );
  }

  return (
    <>
      {route === 'home' && (
        <HomeScreen key={`home-${bumpKey}`} onOpenSettings={() => setRoute('settings')} />
      )}
      {route === 'settings' && (
        <SettingsScreen
          key={`settings-${bumpKey}`}
          onBack={() => setRoute('home')}
          onUpdated={handleUpdated}
        />
      )}
    </>
  );
}

function Root(initialProps: InitialProps) {
  return (
    <TDSProvider colorPreference={initialProps.initialColorPreference}>
      <View style={styles.root}>
        <App {...initialProps} />
      </View>
    </TDSProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});

export default AppsInToss.registerApp(Root, { context: {} as never });