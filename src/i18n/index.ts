import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { useCallback } from 'react';
import { initReactI18next, useTranslation } from 'react-i18next';

import { useSettings, type Lang } from '@/stores/settings';
import ar from './locales/ar.json';
import en from './locales/en.json';

export function deviceLang(): Lang {
  const code = getLocales()[0]?.languageCode ?? 'en';
  return code === 'ar' ? 'ar' : 'en';
}

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, ar: { translation: ar } },
  lng: useSettings.getState().lang ?? deviceLang(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnNull: false,
});

// Keep i18next in step with the persisted language.
useSettings.subscribe((s) => {
  const next = s.lang ?? deviceLang();
  if (i18n.language !== next) i18n.changeLanguage(next);
});

export type Vars = Record<string, string | number>;
export type Tr = (key: string, en: string, vars?: Vars) => string;

/**
 * Translate. The English string doubles as the default so locales/en.json can be
 * generated from source (tools/extract-strings.mjs). Arabic lives in ar.json.
 */
export function useT(): Tr {
  const { t } = useTranslation();
  return useCallback((key: string, enText: string, vars?: Vars) => t(key, { defaultValue: enText, ...vars }) as string, [t]);
}

export function useLang(): Lang {
  const lang = useSettings((s) => s.lang);
  return lang ?? deviceLang();
}

export function useLocaleDirection(): 'ltr' | 'rtl' {
  return useLang() === 'ar' ? 'rtl' : 'ltr';
}

/** Pick the localized side of a {en, ar} field; Arabic falls back to English. */
export function useLocalized() {
  const lang = useLang();
  return useCallback(<T extends { en: string; ar: string | null }>(v: T) => (lang === 'ar' && v.ar ? v.ar : v.en), [lang]);
}

export default i18n;
