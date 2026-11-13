import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeOut } from 'react-native-reanimated';

import MovoLoadingScreen from './MovoLoadingScreen';

/** Longest we hold the app back for the animation, even if its "complete" message never arrives. */
const MAX_MS = 6500;

/**
 * The MOVO drawing over everything at launch. It stays until the app is ready and the drawing
 * has finished (so people see the whole logo once), then fades out. Shown once per launch.
 */
export function LaunchOverlay({ appReady }: { appReady: boolean }) {
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setDrawn(true), MAX_MS);
    return () => clearTimeout(id);
  }, []);
  if (appReady && drawn) return null;
  return (
    <Animated.View exiting={FadeOut.duration(350)} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 }}>
      <StatusBar style="light" />
      <MovoLoadingScreen onAnimationComplete={() => setDrawn(true)} onError={() => setDrawn(true)} />
    </Animated.View>
  );
}
