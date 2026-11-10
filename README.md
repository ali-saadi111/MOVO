# Movo, iOS front end (first draft, restyled)

The first draft of Movo's iOS app, built from `movo-ios-frontend-draft-prompt.md` (the version with the design pass). It covers every screen in the prompt and runs on mock data, with no backend.

- **Stack:** Expo SDK 58, Expo Router, React Native 0.88, Reanimated 4, react-native-maps, TanStack Query, Zustand, i18next.
- **Languages:** English and Arabic (RTL).
- **Appearance:** light, dark, high contrast, Reduce Motion and Dynamic Type.

## The restyle

The second pass follows ali's inspiration board, adapted to Movo's colours and subject:

- **Colour blocks.** Tab roots sit on a soft canvas with mint, sand, mist and navy cards (`ui/canvas.tsx`). Sand is a derived colour and needs sign-off.
- **Big numbers.** Next session date, stats, unread count and campaign totals are large and count up.
- **Greeting header.** "Hi, Karim" with the date, a big title, and round cart and bell buttons. The bell shakes when there is something unread.
- **Floating pill tab bar.** It replaces the native tab bar on every platform: a navy pill with icons only, and a mint circle that springs to the active tab. Labels stay for VoiceOver.
- **Drawings about Movo.** `art/HeroArt.tsx` draws wheelchairs, a care kit, a calendar, the city map, a basketball court, a heart and a bell, in navy, mint and sand.
- **Booking.** The day pill slides and squishes, times pop in one by one, and a ticket at the top flips to the chosen day and time. The confirmation shows a ticket with big date numbers and a burst of wheels, care crosses and hearts (`ui/celebrate.tsx`).
- **In-app banner.** `showBanner()` from `ui/banner.tsx` drops a card from the top, stays 6 seconds, swipes up to dismiss and is read out by VoiceOver. A booking sets a reminder and shows one.
- **Notifications panel.** A navy summary with the unread count and Mark all as read, filter chips, Today / This week / Earlier groups, a colour per kind and one action on each card.
- **RTL on web.** `edges()` in `lib/rtl.ts` maps absolute start/end to left/right on web, where they don't flip on their own.

## The third pass: tickets, banners and glass

From ali's second set of references (ticket UIs, the Toters home screen, the marathon and donation key visuals):

- **Tickets.** Booking confirmation, booking detail, order placed and event pass are ticket cards with a perforation, label-over-value fields, a QR pass (booking, event) or a barcode (order) and an Add to Apple Wallet button (`ui/ticket.tsx`, `app/covers/success.tsx`).
- **Campaign look.** `ui/brandBanner.tsx` draws the marathon style: navy night with a mint swoosh or cream day with a mint track, a heavy slanted Lexend headline with the second line in mint. Used on the therapist header carousel, promo banners and getting started.
- **Key visuals.** The two Beirut Wheelchair Marathon banners are the sport activity art (`event-sports`), the two donation banners are the campaign art. Event and campaign pages show the banner whole below the status bar (`BannerHero`), and Community features the marathon (`PromoBanner`).
- **Getting started.** Language and welcome are full navy campaign screens with photo slides; How you move, Who and the caregiver step use a cream banner header and bordered tiles (`features/onboarding/kit.tsx`).
- **Toters-style layout.** White screens, hairline-bordered tiles with a coloured icon circle, outline chips that fill navy when chosen, section headers ending in an arrow circle, a swipeable promo banner carousel and round "Shop by type" photos (`ui/promo.tsx`).
- **Liquid Glass tab bar.** Labelled tabs with Movo's own icons (`ui/TabIcon.tsx`: outline at rest, mint fill with a navy outline when selected). On iPhone the glass is Apple's own Liquid Glass through `expo-glass-effect` (UIGlassEffect, iOS 26), with a material blur before that. The web preview uses [rdev/liquid-glass-react](https://github.com/rdev/liquid-glass-react) (MIT, the most-starred React Liquid Glass library) for the rim light, shine and depth over a frosted base; its refraction layer is switched off because it drew the content behind the bar sharp and made the labels hard to read (`ui/LiquidGlass.web.tsx`). For React Native without Expo, [callstack/liquid-glass](https://github.com/callstack/liquid-glass) wraps the same native API.

## Run it

```bash
npm install
cp .env.example .env    # then paste your Mapbox token and style URL
npx expo start          # press i for the iOS simulator, or scan the QR code with Expo Go
npx expo run:ios        # a native dev build (needed for Liquid Glass and native tabs on iOS 26)
npx expo start --web    # the browser preview used for the screenshots in qa/shots
```

All dependencies are on Expo Go's bundled list. Settings are kept with AsyncStorage instead of MMKV so the app runs in Expo Go.

### Developer menu

Open it from **Profile › Developer menu**. Its switches drive every state the prompt asks to be reviewable:

- **Data:** latency, failing requests, empty lists, offline, and a chosen time getting taken.
- **Payment outcome:** success, failed or slow.
- **Home tab:** shows the App Experience tab set instead of the Build Brief tabs.
- **People and data:** language, sign in or out, acting for Sara, fill the cart, replay onboarding, and reset activity.
- **Component gallery:** every primitive on one page.

## Where things are

| Path | What |
|---|---|
| `src/app` | Routes. Tab stacks share screens through the array group `(tabs)/(map,shop,care,community,profile,home)`. |
| `src/app/sheets`, `src/app/covers` | Form sheets (filters, confirm, join, donate…) and full-screen covers (payment, success, session complete). |
| `src/ui` | The design system: Text, Button (capsule), GlassSurface, lists, controls, domain components and flows. |
| `src/theme` | Colour tokens (light, dark and high contrast), type scale, spacing, radii and spring presets. |
| `src/art` | Drawn SVG art for products, places, events and campaigns. |
| `src/data` | Zod models, fixtures (60 places, 140 products, 12 specialists, events and campaigns) and mock repositories with injected latency, errors and empty or offline states. |
| `src/i18n/locales` | `en.json` (606 strings, extracted by `tools/extract-strings.mjs`) and `ar.json`. |
| `qa/shots` | 48 screenshots from the web preview at iPhone 16 Pro size. |
| `tools` | Screenshot scripts (`shoot.mjs`, `shoot-all.sh` with `qa/shotlist.txt`), string extraction, icon rendering and the product seeder. |

## Photos, Mapbox, Lexend and the phone mockup

- **Font.** Lexend (Movo's brand font) for Latin text and IBM Plex Sans Arabic for Arabic, bundled through `@expo-google-fonts`. `theme/fonts.ts` maps each weight to its font file, because iOS treats every weight as its own family.
- **Mapbox.** iOS uses `@rnmapbox/maps` and web uses `mapbox-gl`, both with Movo's style (`EXPO_PUBLIC_MAPBOX_STYLE` in `.env`). POI and transit labels are off so Movo's pins stand out, and dark mode switches the style to its night preset. **iOS now needs a development build** (`npx expo run:ios` or EAS), not Expo Go. The token in `.env` is a public `pk.` token: restrict it to Movo's bundle id and domains in the Mapbox dashboard before release.
- **Photos.** Products use drawn art until studio product photos are ready (ali rejected the free-library product photos). Place types use 19 free-licence Wikimedia photos in `assets/photos/`, mapped in `art/photos.ts`. Credits are in `assets/photos/CREDITS.md` and on the in-app **Settings › Photo credits** screen, which CC BY/BY-SA licences require. The place photos are generic stand-ins, not the real Beirut places. Before release, swap in Movo's own product shots and photos the team takes on site.
- **Phone mockup.** `EXPO_PUBLIC_MAP_STATIC=1 npx expo export -p web` builds the web app with a static Mapbox snapshot of Hamra, because the hosted mockup page can't load live map tiles. The mockup page wraps that build in an iPhone frame. `.npmrc` sets `legacy-peer-deps` because `@rnmapbox/maps` still declares an old `mapbox-gl` peer.

## Motion

- Every press uses a spring.
- The map pins grow from 30 to 44 pt when selected.
- The map sheet snaps between three detents.
- Add to cart confirms in place on the button, and the cart icon bounces.
- Totals count up, the campaign bar fills from the old amount to the new one, and the success screens draw a tick.
- A booking ends with a burst of Movo shapes and a reminder banner that drops in.
- The tab bar's mint circle springs between tabs, and the badge bounces when it changes.
- Lists fade in, staggered.

All of this respects Reduce Motion, whether it is set on the phone or in Settings.

## Where the draft differs from the prompt

1. **Imagery is part photo, part drawing.** Products and place types with a good free-licence photo show it; events, campaigns and everything else keep the drawn scenes.
2. **The map is Mapbox** on iOS and web. Only the hosted phone mockup uses a static snapshot.
3. **The map sheet is hand-built** with Gesture Handler and Reanimated rather than `@gorhom/bottom-sheet`, which keeps the dependency list Expo Go-friendly.
4. **Specialist filters are chips** on the list rather than a separate sheet. There are only four filters, so a sheet added a step.
5. **Lexend is bundled** and used throughout.
6. **The Arabic is machine-drafted.** `ar.json` carries a note saying so, and a native speaker should review it before release. Digits stay Latin for now.
7. **Tab roots redirect to their own tab.** Because tabs share one array group, a deep link like `/shop` could open inside the Map tab. Each tab root sends it to its own tab.

## Open questions (from the prompt, still open)

1. **Tabs:** Build Brief tabs by default, with Home behind the developer flag.
2. **Typeface:** SF Pro and SF Arabic in the UI, with Lexend for the wordmark only.
3. **Primary button:** Navy in light mode, Mint in dark mode.
4. **Derived colours** need sign-off: `accent.text #0E7A58`, dark-mode amber and red, the greys, `fill` and `bg.elevated2`.
5. **Dark mode** uses iOS neutrals with a Navy hero surface.
6. **Arabic review** and the choice between Arabic-Indic and Latin digits.
7. **Switching language** reloads the app on iOS, because React Native needs a reload to flip RTL.
8. **Product photos** must be licensed or replaced before release.
9. **Maps:** Apple Maps in the draft, and Mapbox in production (needs a token).
10. **Minimum iOS version:** Liquid Glass is used on iOS 26 and later, with a blur fallback before that.

## Checks

```bash
npx tsc --noEmit      # clean
npx eslint src        # 0 errors (22 style warnings)
```
