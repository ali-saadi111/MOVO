import { useState } from 'react';

import type { Lang } from '@/stores/settings';

/** Arabic uses Latin digits until the owner decides otherwise (open question 6). */
const locale = (lang: Lang) => (lang === 'ar' ? 'ar-LB-u-nu-latn' : 'en-GB');

export function fmtDay(iso: string, lang: Lang) {
  return new Intl.DateTimeFormat(locale(lang), { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(iso));
}
export function fmtWeekday(iso: string, lang: Lang) {
  return new Intl.DateTimeFormat(locale(lang), { weekday: 'short' }).format(new Date(iso));
}
export function fmtTime(iso: string, lang: Lang) {
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-LB-u-nu-latn' : 'en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(iso));
}
export function fmtDayTime(iso: string, lang: Lang) {
  return `${fmtWeekday(iso, lang)} ${fmtTime(iso, lang)}`;
}
export function fmtLongDay(iso: string, lang: Lang) {
  return new Intl.DateTimeFormat(locale(lang), { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(iso));
}
export function fmtMonthYear(iso: string, lang: Lang) {
  return new Intl.DateTimeFormat(locale(lang), { month: 'long', year: 'numeric' }).format(new Date(iso));
}
export function monthsSince(iso: string) {
  const d = new Date(iso);
  const n = new Date();
  return (n.getFullYear() - d.getFullYear()) * 12 + (n.getMonth() - d.getMonth());
}
export function relativeAgo(iso: string, lang: Lang) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  const rtf = new Intl.RelativeTimeFormat(locale(lang), { numeric: 'auto' });
  if (diff < 3600) return rtf.format(-Math.max(1, Math.round(diff / 60)), 'minute');
  if (diff < 86400) return rtf.format(-Math.round(diff / 3600), 'hour');
  return rtf.format(-Math.round(diff / 86400), 'day');
}
export function addDays(base: Date, n: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}

/** The time when the screen first rendered (keeps render pure). */
export function useNow() {
  const [now] = useState(() => Date.now());
  return now;
}
