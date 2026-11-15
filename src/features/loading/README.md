# Launch animation

`LaunchOverlay` (mounted in `src/app/_layout.tsx`) shows the MOVO drawing over the app at launch:
stroke-by-stroke lettering, and the green happy-face icon as its head. It stays until the
app is ready and the drawing is finished (at most 6.5 s), then fades out. Once per launch.

- `movo-animation.ts`: the self-contained animation page (offline, no network).
- `MovoLoadingScreen.tsx`: iOS and Android, through `react-native-webview`.
- `MovoLoadingScreen.web.tsx`: web build, same page in an iframe with a small message bridge.

The native splash (`expo-splash-screen` in `app.json`) uses the same `#043345` so the hand-off is seamless.
Needs a new dev build on iOS, since `react-native-webview` is a native module.
