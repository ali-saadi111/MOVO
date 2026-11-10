import { useEffect, type ReactNode } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

import { Icon, Text } from '@/ui';
import { useLang } from '@/i18n';
import { useTheme } from '@/theme';

// Face ID iPhones (X and later) vs. home-button iPhones (SE): a short screen means no island and no home bar.
const INSETS_ISLAND = { top: 54, bottom: 34, left: 0, right: 0 };
const INSETS_SE = { top: 20, bottom: 0, left: 0, right: 0 };
// Shared web app build: the browser draws its own status bar, so no fake one and only a little air.
const WEBAPP = process.env.EXPO_PUBLIC_WEBAPP === '1';
const INSETS_WEB = { top: 10, bottom: 6, left: 0, right: 0 };

/**
 * Web preview only: iPhone safe areas, and a 9:41 status bar,
 * so screenshots read like the device. Never shipped in the iOS app.
 */
export function PreviewChrome({ children }: { children: ReactNode }) {
  const t = useTheme();
  const lang = useLang();
  const { height } = useWindowDimensions();
  const se = height < 700;
  const insets = WEBAPP ? INSETS_WEB : se ? INSETS_SE : INSETS_ISLAND;
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    document.body.style.backgroundColor = t.colors.bgPrimary;
    // A phone shows no scroll bars; desktop browsers would draw one on every scrolling screen.
    if (!document.getElementById('movo-no-scrollbars')) {
      const el = document.createElement('style');
      el.id = 'movo-no-scrollbars';
      el.textContent = '*{scrollbar-width:none;-ms-overflow-style:none}*::-webkit-scrollbar{display:none;width:0;height:0}';
      document.head.appendChild(el);
    }
  }, [lang, t.colors.bgPrimary]);
  const fg = t.scheme === 'dark' ? '#FFFFFF' : '#000000';
  return (
    <SafeAreaInsetsContext.Provider value={insets}>
      <View style={{ flex: 1 }}>
        {children}
        {WEBAPP ? null : (
        <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: insets.top, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: se ? 8 : 34, paddingTop: se ? 0 : 6, direction: 'ltr' }}>
          <Text variant="headline" style={{ color: fg, fontSize: se ? 12 : 17, width: 60 }}>9:41</Text>
          {se ? null : <View style={{ width: 124, height: 36, borderRadius: 20, backgroundColor: '#000' }} />}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, width: 60, justifyContent: 'flex-end' }}>
            <Icon name="chart.line.uptrend.xyaxis" size={0} />
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2 }}>
              {[5, 7, 9, 11].map((h) => <View key={h} style={{ width: 3, height: h, borderRadius: 1, backgroundColor: fg }} />)}
            </View>
            <View style={{ width: 25, height: 12, borderRadius: 4, borderWidth: 1.2, borderColor: fg, padding: 1.5, opacity: 0.9 }}>
              <View style={{ flex: 1, borderRadius: 2, backgroundColor: fg }} />
            </View>
          </View>
        </View>
        )}
      </View>
    </SafeAreaInsetsContext.Provider>
  );
}
