/**
 * Mapbox settings. The token is a public (pk.) token; restrict it to Movo's
 * bundle id and web domains in the Mapbox dashboard before release.
 */
export const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? '';
export const MAPBOX_STYLE = process.env.EXPO_PUBLIC_MAPBOX_STYLE ?? 'mapbox://styles/mapbox/standard';
