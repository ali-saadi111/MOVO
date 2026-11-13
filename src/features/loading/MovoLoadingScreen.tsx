import React from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { MOVO_HTML } from './movo-animation';

const source = { html: MOVO_HTML };

type Props = {
  /** Called when the animation has rendered its first frame. */
  onReady?: () => void;
  /** Called once when the logo and tagline have finished drawing. */
  onAnimationComplete?: () => void;
  onError?: (description: string) => void;
};

/** Offline loading animation for Expo on iOS and Android. */
export default function MovoLoadingScreen({ onReady, onAnimationComplete, onError }: Props) {
  return (
    <View style={styles.container} accessibilityLabel="MOVO. App is loading.">
      <WebView
        source={source}
        originWhitelist={['*']}
        javaScriptEnabled
        scrollEnabled={false}
        bounces={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
        automaticallyAdjustContentInsets={false}
        textZoom={100}
        style={styles.webview}
        containerStyle={styles.container}
        onMessage={({ nativeEvent }) => {
          if (nativeEvent.data === 'movo:ready') onReady?.();
          if (nativeEvent.data === 'movo:complete') onAnimationComplete?.();
        }}
        onError={({ nativeEvent }) => onError?.(nativeEvent.description)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#043345' },
  webview: { flex: 1, backgroundColor: '#043345' },
});
