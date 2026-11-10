import { Linking } from 'react-native';

export const MOVO_WHATSAPP = '96170000000';

export function openWhatsApp(text: string) {
  return Linking.openURL(`https://wa.me/${MOVO_WHATSAPP}?text=${encodeURIComponent(text)}`).catch(() => {});
}
export function call(phone: string) {
  return Linking.openURL(`tel:${phone}`).catch(() => {});
}
export function directions(lat: number, lng: number, label: string) {
  return Linking.openURL(`http://maps.apple.com/?daddr=${lat},${lng}&q=${encodeURIComponent(label)}`).catch(() => {});
}
