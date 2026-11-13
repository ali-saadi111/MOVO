import { createElement, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { MOVO_HTML } from './movo-animation';

type Props = { onReady?: () => void; onAnimationComplete?: () => void; onError?: (description: string) => void };

// The animation talks to its host through window.ReactNativeWebView. In a browser it runs in an
// iframe, so this small bridge forwards those messages to the page instead.
const BRIDGE = '<script>window.ReactNativeWebView={postMessage:function(m){parent.postMessage(m,"*")}}</script>';
const SRC = MOVO_HTML.replace('<head>', `<head>${BRIDGE}`);

/** Web build: the same offline animation, in an iframe. */
export default function MovoLoadingScreen({ onReady, onAnimationComplete }: Props) {
  useEffect(() => {
    const on = (e: MessageEvent) => {
      if (e.data === 'movo:ready') onReady?.();
      if (e.data === 'movo:complete') onAnimationComplete?.();
    };
    window.addEventListener('message', on);
    return () => window.removeEventListener('message', on);
  }, [onReady, onAnimationComplete]);
  return (
    <View style={styles.container} accessibilityLabel="MOVO. App is loading.">
      {createElement('iframe', { srcDoc: SRC, title: 'MOVO', style: { border: 0, width: '100%', height: '100%', background: '#043345', display: 'block' } })}
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#043345' } });
