# SweetSpot Golf V2 — Sprint 4: Complete Design Overhaul

## Context

Sprints 1-3 are functionally complete. Every feature works. But the UI was built for speed, not beauty — CC leaned on the old app's structure and generic component styling. This sprint is a **ground-up design rethink** of every section.

This is NOT a "swap colours and fonts" sprint. If a screen's layout, structure, or flow needs to change to match the design vision, change it. The logic and data hooks stay — the presentation layer gets rebuilt.

---

## Design Philosophy

**"Apple TV × MasterClass had a baby, and it was raised by the best app in each category."**

Each section of SweetSpot should look like it was designed by the team behind the market leader in that space:

| Section | Design Inspiration | Why |
|---------|-------------------|-----|
| Learn (video courses) | **MasterClass** + **Apple TV+** | Cinematic content browsing, coach-as-celebrity, immersive hero imagery |
| Play (scorecard) | **Arccos Caddie** + **Apple Health** | Clean data presentation, glanceable stats, on-course usability |
| Shot Tracker | **Arccos** + **Apple Maps** | Floating glass controls over satellite map, clean markers |
| Community | **Strava** | The gold standard for sports social — activity cards, kudos, clean feed |
| News | **Apple News** | Magazine-style layout, featured hero, source badges |
| Profile/Settings | **Apple Settings (iOS 26)** + **Strava Profile** | Grouped lists, clean profile header, stat summary |
| Login/Onboarding | **Apple TV+** sign-in + **MasterClass** welcome | Cinematic, aspirational, minimal |

The unifying thread: **Apple's design language is the skeleton.** System fonts, Apple spacing conventions, iOS interaction patterns. The inspiration apps provide the **soul** of each section — the layout patterns, information hierarchy, and emotional design.

---

## Liquid Glass & Frosted Effects

iOS 26 introduced Liquid Glass — a translucent, refractive material for navigation elements. Since we're in React Native (not native SwiftUI), we simulate the feel using `expo-blur` and translucent backgrounds.

### When to Use Glass Effects
- **Tab bar** — frosted glass background over content
- **Floating controls over maps** (shot tracker hole selector, club picker)
- **Bottom sheets** (premium gate, shot confirmation)
- **Navigation bars when scrolled** (content scrolls behind a frosted header)
- **Floating action buttons** (community compose)

### When NOT to Use
- Content cards, list rows, text areas, form inputs
- Any primary content surface — glass is for the **navigation layer only**

### Implementation
```typescript
// Create a reusable GlassBackground component
// iOS: Use BlurView from expo-blur with tint="light" and intensity={80}
// Android: Solid white at 92% opacity fallback (no native blur support)

import { BlurView } from 'expo-blur';
import { Platform } from 'react-native';

// iOS: <BlurView tint="light" intensity={80} />
// Android: <View style={{ backgroundColor: 'rgba(255,255,255,0.92)' }} />
```

**Install:** `npx expo install expo-blur`

---

## Design System — Complete Rewrite

### Colours (`src/constants/colors.ts`)

```typescript
export const colors = {
  // Backgrounds
  background: '#FFFFFF',
  backgroundSecondary: '#F2F2F7',      // iOS system grouped background
  backgroundTertiary: '#E5E5EA',
  
  // Text — Apple's exact system colours
  textPrimary: '#000000',
  textSecondary: '#3C3C43',
  textTertiary: '#8E8E93',
  textQuaternary: '#C7C7CC',
  textInverse: '#FFFFFF',
  
  // Accent — ONE colour, used sparingly for interactive elements only
  accent: '#34C759',                    // Apple system green
  accentLight: 'rgba(52, 199, 89, 0.12)', // Subtle tinted backgrounds
  
  // System semantic
  systemRed: '#FF3B30',
  systemOrange: '#FF9500',
  systemYellow: '#FFCC00',
  systemGreen: '#34C759',
  systemTeal: '#5AC8FA',
  systemBlue: '#007AFF',
  systemIndigo: '#5856D6',
  
  // Scorecard (derived from system colours)
  scoreEagle: '#5856D6',               // Indigo — rare achievement
  scoreBirdie: '#007AFF',              // Blue — great shot
  scorePar: '#8E8E93',                 // Grey — expected
  scoreBogey: '#FF9500',              // Orange — warning
  scoreDoublePlus: '#FF3B30',          // Red — trouble
  scoreUnplayed: '#E5E5EA',
  
  // Surfaces
  cardBackground: '#FFFFFF',
  cardShadow: 'rgba(0, 0, 0, 0.04)',
  
  // Glass / Frost
  glassBackground: Platform.select({
    ios: 'rgba(255, 255, 255, 0.01)',   // Near-transparent for BlurView
    android: 'rgba(255, 255, 255, 0.92)', // Solid-ish fallback
  }),
  glassBorder: 'rgba(255, 255, 255, 0.2)',
  
  // Overlays (over images)
  overlayLight: 'rgba(0, 0, 0, 0.25)',
  overlayMedium: 'rgba(0, 0, 0, 0.45)',
  overlayHeavy: 'rgba(0, 0, 0, 0.65)',
  overlayGradientStart: 'transparent',
  overlayGradientEnd: 'rgba(0, 0, 0, 0.7)',
  
  // Dividers
  separator: '#C6C6C8',                // Apple system separator
  separatorLight: '#E5E5EA',
  separatorOpaque: '#C6C6C8',
  
  // Tab bar
  tabActive: '#000000',
  tabInactive: '#8E8E93',
  
  // Tee colours (keep)
  teeWhite: '#FFFFFF',
  teeYellow: '#FFD700',
  teeRed: '#DC143C',
  teeBlue: '#1E90FF',
  teeBlack: '#1C1C1E',
} as const;
```

### Typography (`src/constants/typography.ts`)

System font everywhere. Follow Apple HIG type scale exactly:

```typescript
export const typography = {
  // Apple HIG type scale
  largeTitle:  { fontSize: 34, fontWeight: '700', letterSpacing: 0.37 },
  title1:      { fontSize: 28, fontWeight: '700', letterSpacing: 0.36 },
  title2:      { fontSize: 22, fontWeight: '700', letterSpacing: 0.35 },
  title3:      { fontSize: 20, fontWeight: '600', letterSpacing: 0.38 },
  headline:    { fontSize: 17, fontWeight: '600', lineHeight: 22 },
  body:        { fontSize: 17, fontWeight: '400', lineHeight: 22 },
  callout:     { fontSize: 16, fontWeight: '400', lineHeight: 21 },
  subhead:     { fontSize: 15, fontWeight: '400', lineHeight: 20 },
  footnote:    { fontSize: 13, fontWeight: '400', lineHeight: 18 },
  caption1:    { fontSize: 12, fontWeight: '400', lineHeight: 16 },
  caption2:    { fontSize: 11, fontWeight: '400', lineHeight: 13 },
  
  // App-specific
  scoreDisplay:  { fontSize: 64, fontWeight: '200' },   // Ultra-light for big score
  statValue:     { fontSize: 28, fontWeight: '700' },
  statLabel:     { fontSize: 11, fontWeight: '400', letterSpacing: 0.5 },
} as const;
```

### Spacing & Layout (`src/constants/spacing.ts`)

```typescript
export const spacing = {
  screenPadding: 20,       // Horizontal screen margins
  xs: 4,  sm: 8,  md: 12,  lg: 16,  xl: 20,  xxl: 24,  xxxl: 32,
  sectionGap: 40,          // Between major sections
  cardGap: 12,             // Between cards in a row
  listItemHeight: 44,      // Apple HIG minimum row height
};

export const borderRadius = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28, full: 9999,
};

export const shadows = {
  sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  md: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },
};
```

---

## Section 1: LEARN TAB — Inspired by MasterClass + Apple TV+

MasterClass makes instructors feel like celebrities. Apple TV+ makes content browsing feel cinematic. Combine both.

### Learn Home (`app/(tabs)/learn/index.tsx`) — FULL REDESIGN

**Layout concept:** A full-screen, edge-to-edge content browser. No white background visible on initial load — the screen IS the content.

**Hero section (top 55% of screen):**
- Full-bleed featured coach image (the highest-ordered coach's banner photo), edge-to-edge
- Gradient overlay from bottom (transparent → 70% black over bottom 40%)
- Coach name in `title1` (bold white) at bottom-left over gradient
- Coach credential in `subhead` (white 70% opacity) below name
- "Start Learning" pill button: frosted glass background (BlurView) with white text, 44px height, rounded full
- This hero auto-rotates through coaches every 6 seconds with a crossfade, or is the featured/first coach

**Below hero (scrolls up over the hero with a subtle parallax):**
- White background with rounded top corners (28px) overlapping the hero by 20px — like a bottom sheet rising over the content
- **"Your Coaches" section:** Horizontal scroll of portrait cards (MasterClass style)
  - Each card: 3:4 ratio, full-bleed coach photo, NO card background
  - Coach name overlaid at bottom on gradient, credential below
  - Large cards (width: screen width × 0.42) — two and a peek visible
  - Tap → coach detail
- **"Free Tips" section:** Horizontal category cards
  - Wide 16:9 ratio, full-bleed category imagery
  - Category name in bold white at bottom-left over gradient
  - Cards peek to indicate scroll (width: screen width × 0.7)
- **"The Dormy" section:** Same card style as tips
  - Small frosted "Premium" pill overlaid in top-right of each card
  - Frosted pill = BlurView with "Premium" in `caption1` white text

**Key MasterClass details to replicate:**
- Content goes edge-to-edge — no screen padding on hero or cards
- Cards cast no visible shadow — just the image and typography
- Section headers: `title2` with generous top spacing (40px), left-aligned with `screenPadding`
- The scroll feels like you're browsing a cinema, not a settings screen

### Coach Detail (`app/(tabs)/learn/coach/[coachId].tsx`) — FULL REDESIGN

**Inspired by:** MasterClass instructor page + Apple TV+ show detail

- **Hero:** Full-screen-width banner (65% of screen height). Coach photo, edge-to-edge. Heavy gradient from bottom. Coach name in `title1` white, large, at bottom-left. Credential in `subhead` white 70%.
- **Back button:** Floating top-left, circular frosted glass background (32px circle), white chevron icon
- **Content rises up:** White surface with rounded top corners overlapping hero by 24px
- **Bio:** `body` text, max 3 lines with "Read more" in `accent`. Clean, generous line height.
- **"Meet [Coach]" row:** Full-width, 64px height. Coach thumbnail (40px circle) left, "Watch Introduction" in `headline`, play icon right in `accent`. Subtle `backgroundSecondary` background, rounded `md`.
- **Courses:** Section header "Courses" in `title2`. Each course as a full-width card:
  - 16:9 thumbnail, rounded `lg` (16px)
  - Below: course title in `headline`, lesson count in `footnote` (e.g. "4 lessons")
  - 16px gap between course cards
  - Premium courses: small "Premium" text in `textTertiary` next to lesson count. No lock icons.

### Course Detail (`app/(tabs)/learn/course/[courseId].tsx`) — REDESIGN

**Inspired by:** MasterClass course/chapter view

- **Header:** Course thumbnail as wide banner (35% of screen), gradient overlay. Course title in `title2` white at bottom. Coach avatar (28px circle) + coach name in `footnote` white beside it.
- **Lesson list:** Clean vertical list on white. Each row is 72px minimum height:
  - Left: lesson number in `title3` using `textTertiary` colour (light, large "01", "02")
  - Centre: title in `headline`, duration in `footnote` below
  - NO thumbnail per lesson (MasterClass doesn't show them in the chapter list — it's cleaner)
  - Thin separator between rows
  - Entire row is tappable — no play button icon needed
- **Premium lock:** First lesson always accessible. Lessons 2+ dimmed (text at 40% opacity). Inline banner between lesson 1 and 2: "Subscribe to access all lessons" in `subhead`, "View Plans" in `accent`. No overlay, no lock icon, no modal. Subtle and respectful.

### Video Player (`app/player.tsx`) — POLISH

**Inspired by:** Apple TV+ player

- Pure black background, no chrome when playing
- Tap to reveal controls (auto-hide after 4 seconds)
- Controls: large play/pause centre, skip ±15s, thin progress bar at bottom
- Title + coach in `subhead` white at top-left
- Close "✕" at top-left, circular frosted glass background
- Speed selector: "1×" text, tappable, cycles through 1, 1.25, 1.5, 2
- All icons thin, white, SF Symbols weight

### Tips Browser (`app/(tabs)/learn/tips.tsx`) — REDESIGN

**Inspired by:** Apple TV+ categories + YouTube shorts grid

- Filter pills: horizontal scroll. Active: black fill, white text, rounded full. Inactive: `backgroundSecondary`, `textSecondary`. 36px height.
- Grid: 2 columns, 8px gap. Each cell:
  - 16:9 thumbnail, rounded `md`
  - Title in `headline` below (2 lines max)
  - Coach name in `footnote`
  - No play button on thumbnail — whole card tappable
- Clean, dense, browsable. Like scrolling through an Apple TV category.

### Dormy (`app/(tabs)/learn/dormy.tsx`) — REDESIGN

Same grid layout as Tips. Each thumbnail has frosted "Premium" pill top-right. Category toggle at top (same pill style as Tips filter). PremiumGate shown as inline card for free users.

---

## Section 2: PLAY TAB — Inspired by Arccos Caddie + Apple Health

Arccos is the best-designed golf scorecard app. Apple Health is the gold standard for presenting personal stats. Combine both.

### Play Home (`app/(tabs)/play/index.tsx`) — FULL REDESIGN

**Inspired by:** Apple Fitness summary + Strava home

- **Active round card (if in progress):** Top of screen, full-width. Subtle green left border (3px). Course name in `headline`, "Hole 7 · +3" in `subhead`. "Resume" text in `accent` on right. Tapping resumes the round. This card only appears when there's an active round.
- **Start Round:** Clean row, 56px height. "Start New Round" in `headline`, subtle right chevron. On `backgroundSecondary` with rounded `lg`. No green button, no + icon. Just a confident, tappable row.
- **Stats section:** Three stats in a row, no cards, no borders. Just numbers and labels centred:
  - `statValue` for the number (28pt bold)
  - `statLabel` below (11pt, `textTertiary`, ALL CAPS with 0.5 letter-spacing)
  - Thin vertical `separator` lines between stats
  - "Rounds" · "Best" · "Average"
- **Recent Rounds:** `title2` section header. Each round is a clean row:
  - Course name in `headline`
  - Club name · tee colour in `footnote`
  - Date in `footnote` right-aligned top
  - Score in `title3` right-aligned, toPar below in colour-coded `footnote`
  - Thin separator between rows (Apple list style)
  - No cards, no shadows, no chevrons — just clean rows like Apple Health data

### Course Selection (`app/(tabs)/play/select-course.tsx`) — REDESIGN

**Inspired by:** Apple Maps search + Contacts app

- Large search bar at top, rounded `xl`, `backgroundSecondary` fill, search icon left, "Search clubs..." placeholder
- Results as clean list rows: club name in `headline`, city + county in `footnote`, distance in `footnote` right-aligned (if location available)
- Small golf-tee icon in `accent` colour left of each row (16px)
- Section index on right edge for alphabet jumping (if list is long)
- Default view (no search): "Nearby" section if location available, then alphabetical
- Smooth, fast, feels like searching Contacts on iOS

### Tee Selection (`app/(tabs)/play/select-tee.tsx`) — REDESIGN

**Inspired by:** Clean picker, like selecting a workout type in Apple Fitness

- Course name + par at top in `title2`
- Tee options as cards: coloured circle (tee colour) left, tee name in `headline`, total yardage + rating + slope in `footnote`. Rounded `lg` background, subtle border.
- "Start Round" button at bottom: full-width, black background, white text, 50px height, rounded `md`. Confident. NOT green.

### Active Scorecard (`app/(tabs)/play/round/[roundId].tsx`) — REDESIGN

**Inspired by:** Arccos live scoring + Apple Watch workout screen

This screen is used ON THE COURSE. One-handed, between shots, in sunlight. Every pixel must earn its place.

- **Top bar:** Course name in `headline` left. "End Round" in `systemRed` right (text only, no button chrome). Frosted glass background if content scrolls behind.
- **Hole info centre:** "Hole 7" in `title1` centred. "Par 4 · 385 yds" in `subhead` `textTertiary` centred below.
- **Score input:** The number in `scoreDisplay` (64pt, ultra-light weight, `textPrimary`). Surrounded by a thin circular ring whose colour matches score-to-par:
  - Eagle: indigo ring
  - Birdie: blue ring
  - Par: grey ring (barely visible)
  - Bogey: orange ring
  - Double+: red ring
  - The ring is 120px diameter, 2px stroke
- **+/− buttons:** Large circles (56px), positioned either side of the score. Thin 1px border in `separatorLight`. "+" and "−" in `title2`. Generous tap targets (minimum 60px hit area).
- **Hole strip:** Below the score area. Two rows of 9 circles (28px each) for 18-hole, one row for 9-hole.
  - Current: black fill, white number
  - Under par: `systemBlue` fill, white number
  - Par: `textTertiary` fill, white number
  - Over par: `systemOrange` fill, white number
  - Unplayed: `backgroundTertiary` fill, `textTertiary` number
- **Navigation:** "‹" and "›" chevrons flanking "3 / 18" text. All in `textTertiary`. Swipe gesture also works.
- **Running total:** Fixed bottom bar, frosted glass background. "Through 6" left in `subhead`, score + toPar right in `headline` (colour-coded).

### Shot Tracker (`app/(tabs)/play/shot-tracker.tsx`) — REDESIGN

**Inspired by:** Arccos shot view + Apple Maps floating UI

- **Map:** Full-screen satellite, edge-to-edge, extends behind the status bar
- **Hole selector:** Floating at top, horizontal row of number pills in a frosted glass bar (BlurView). Active hole: black fill, white text. Inactive: clear with `textSecondary`. The bar is rounded `xxl`, 44px height, horizontally centred.
- **Club picker:** Floating at bottom above tab bar, frosted glass bar. Horizontal scroll of club pills. Active: black fill, white text. Inactive: frosted glass individual pill.
- **Shot markers:** White circle (24px) with black number, thin white border. Connected by dashed white polylines. Distance label on each line segment in a small frosted pill.
- **Add shot instruction:** "Tap to add shot" in a centred frosted pill when no shots exist on current hole
- **Undo:** Small frosted circular button (32px) floating bottom-left with undo arrow icon
- **Distance to pin:** If we have green coordinates, show "152 yds to green" in a frosted pill floating top-right over the map
- **Everything floats.** The map IS the screen. All UI is glass floating above it.

### Round Review (`app/(tabs)/play/round-detail/[roundId].tsx`) — REDESIGN

**Inspired by:** Arccos round summary + Apple Health workout detail

- Header: course name in `title2`, date + tee in `footnote`, total score in large `statValue` with toPar coloured
- Traditional scorecard table: horizontal scroll, Apple-clean. Hole numbers across top, par row, your score row, +/− row. Front 9 subtotal, back 9 subtotal, total. Clean thin borders, compact typography (`caption1`).
- Stats summary cards below the table: fairways hit, GIR, putts (placeholder data for now — real stats come with shot tracker integration)

---

## Section 3: COMMUNITY TAB — Inspired by Strava

Strava is the undisputed champion of sports social apps. Clean activity cards, kudos (likes), simple comments, athlete-centric.

### Community Feed (`app/(tabs)/community/index.tsx`) — FULL REDESIGN

**Inspired by:** Strava feed

- **Title:** "Community" in `largeTitle` with large-title collapse-on-scroll behaviour
- **Post cards:** Full-width, separated by 8px of `backgroundSecondary` (not borders, not shadows):
  - **Header row:** Avatar (36px circle), name in `headline`, handicap as "HC 14" in `caption1` inside a subtle pill (`backgroundTertiary` bg, rounded full), timestamp in `footnote` `textTertiary` right-aligned
  - **Text:** `body`, full width, up to 5 lines with "more" truncation
  - **Image:** Full-width, rounded `md`, aspect ratio preserved, 8px below text
  - **Actions row:** 12px below image/text. Heart icon (outline or filled) + count in `subhead`, comment icon + count in `subhead`. Both in `textTertiary`. Liked state: filled heart in `systemRed`, count in `systemRed`. 24px between action groups.
  - **No card chrome.** No border, no shadow, no rounded card. Just content flowing vertically with dividing space.
- **FAB:** 52px circle, solid black, white "+" (thin, 24px). Bottom-right, 20px from edges, floating above tab bar. On iOS 26: frosted glass instead of solid black.
- **Empty state:** Subtle illustration or just text: "No posts yet" in `title3`, "Be the first to share" in `subhead` `textTertiary`, "Create Post" text in `accent`.

### Post Detail (`app/(tabs)/community/[postId].tsx`) — REDESIGN

**Inspired by:** Strava activity detail

- Full post at top (same layout as feed card but no truncation)
- "Comments" section header in `title3`
- Comment list: avatar (28px) + name in `headline` + text in `body` + timestamp in `footnote`. Compact rows. No borders.
- Comment input: fixed bottom, frosted glass background bar. Text input with `body` font, rounded `xxl` text field, send arrow icon in `accent` when text present, `textTertiary` when empty.

### Create Post (`app/(tabs)/community/create-post.tsx`) — REDESIGN

**Inspired by:** Strava post creation (simple, focused)

- Nav bar: "Cancel" left in `body`, "Post" right in `headline` `accent` (or `textTertiary` if empty)
- Avatar + name row at top
- Multiline text input, no borders, `body` font, "What's on your mind?" placeholder
- Character count in `caption2` `textTertiary`, bottom-right of text area
- "Add Photo" row at bottom: image icon in `accent`, "Add Photo" in `callout` `accent`. Full-width tappable row.
- Image preview: rounded `md`, with "×" remove button overlaid top-right

---

## Section 4: NEWS TAB — Inspired by Apple News

### News Feed (`app/(tabs)/news/index.tsx`) — FULL REDESIGN

**Inspired by:** Apple News home screen

- **Title:** "News" in `largeTitle`
- **Featured article (first RSS item):** Full-width card, 16:9 image, rounded `lg`. Headline overlaid at bottom on gradient in `title3` white. Source pill: `caption2` white on frosted glass pill, top-left of image. Date in `caption2` white next to source.
- **Remaining articles:** Compact rows (Apple News style):
  - Left: headline in `headline` (2 lines max), source in `footnote` `accent`, time ago in `footnote` `textTertiary`
  - Right: square thumbnail (80px, rounded `sm`)
  - 72px minimum row height
  - Thin separator between rows
- **"From SweetSpot" section:** Section header in `title2`. Same row layout but with a subtle `accent` left bar (3px) on each row to distinguish original content.
- Pull-to-refresh.
- Article tap (RSS): `expo-web-browser` opens the URL. Article tap (Firestore): navigates to article detail screen.

### Article Detail (`app/(tabs)/news/[articleId].tsx`)

- Hero image at top (if exists), full-width, 16:9
- Title in `title1` below
- Date + "SweetSpot" source in `footnote`
- Body text in `body`, generous line height (26px), comfortable reading width
- Back button: standard iOS back chevron

---

## Section 5: MORE TAB — Inspired by Apple Settings (iOS 26)

### Profile & Settings (`app/(tabs)/more/index.tsx`) — REDESIGN

**Inspired by:** iOS 26 Settings + Apple Health profile + Strava athlete page

- **Profile card:** On white background (NOT dark). Full-width, centred:
  - Avatar: 80px circle, subtle shadow
  - Name in `title2` below avatar
  - Email in `footnote` `textTertiary`
  - Handicap pill (if set): `accent` background, white "HCP 11.2" text, rounded full, small
  - Home club in `footnote` below
  - "Edit Profile" button: full-width, 44px, 1px border in `separator`, rounded `md`, "Edit Profile" in `headline` centred. No fill.
- **Stats row:** Three stats, same pattern as Play tab (numbers + labels + thin dividers)
- **Settings groups:** Exactly like iOS 26 Settings:
  - Page background: `backgroundSecondary`
  - Group background: `cardBackground` (white)
  - Groups have rounded `lg` corners, inset from screen edges by `screenPadding`
  - Group title: `footnote` `textTertiary` ALL CAPS above the group
  - Rows: 44px height, left icon (22px, `textTertiary`), label in `body`, value in `footnote` `textTertiary` right, chevron in `textQuaternary` right
  - Thin `separator` between rows, inset 52px from left (after icon)
  - **Account:** Subscription (value: "Free"), Edit Profile
  - **Preferences:** Notifications
  - **About:** Terms of Service, Privacy Policy, Version (value: "1.0.0")
  - **Destructive group (no group title):** Sign Out (label in `textPrimary`, no icon), Delete Account (label in `systemRed`)

### Edit Profile (`app/(tabs)/more/edit-profile.tsx`) — POLISH

- Page background: `backgroundSecondary`
- Avatar: 100px circle, centred. Camera badge: 28px circle, `backgroundSecondary`, dark camera icon, overlaid bottom-right of avatar
- "Change Photo" in `footnote` `accent` below
- Form fields on a white card group (rounded `lg`):
  - Label: `footnote` `textTertiary` ALL CAPS, 0.5 letter-spacing
  - Input: `body` text, full-width, 44px height
  - Thin separator between fields
  - Display Name, Handicap, Home Course
- "Save" in nav bar: `accent` when dirty, `textTertiary` when clean

---

## Section 6: LOGIN & ONBOARDING

### Login (`app/(auth)/login.tsx`) — FULL REDESIGN

**Inspired by:** Apple TV+ sign-in, MasterClass landing

- **Full-screen cinematic background:** Use a bundled hero golf course image (or the first coach's banner). Apply `overlayMedium` darkening. The image sets the aspirational mood.
- **Content centred vertically:**
  - SweetSpot logo in white (small — 100px max width)
  - 32px gap
  - Email input: translucent white fill (`rgba(255,255,255,0.12)`), white text, white placeholder, rounded `md`, 50px height, no border
  - Password input: same style
  - 16px gap
  - "Sign In" button: solid white bg, `textPrimary` text, full-width, 50px height, rounded `md`
  - "Don't have an account? Sign Up" in `footnote` white, 12px below
  - 24px gap
  - Thin white divider with "or" centred
  - 24px gap
  - "Continue with Apple": black bg, white text + Apple icon, full-width, 50px, rounded `md`
  - "Continue with Google": white bg, `textPrimary` text + Google icon, full-width, 50px, rounded `md`, 1px white border
- **No green anywhere.** The login is black, white, and the photograph.

### Onboarding (`app/(auth)/onboarding.tsx`) — BUILD (currently placeholder)

**Inspired by:** MasterClass welcome flow

- 3 full-screen pages (horizontal swipe via `FlatList` with `pagingEnabled`)
- Each page: full-bleed golf photograph as background, `overlayHeavy` gradient from bottom covering lower 40%
- Content in lower third:
  - Page 1: "Learn from the Pros" in `title1` white, "Video lessons from PGA & European Tour professionals" in `subhead` white 70%
  - Page 2: "Track Every Round" in `title1` white, "Digital scorecard with 3,200+ UK courses" in `subhead` white 70%
  - Page 3: "Join the Community" in `title1` white, "Share rounds and connect with golfers" in `subhead` white 70%
- Pagination dots: white filled active, white 30% opacity inactive
- Pages 1-2: "Continue" text in white, bottom-centred
- Page 3: "Get Started" pill button — white bg, black text, rounded full, 50px height, 200px width
- Swipe left/right to navigate. Dot indicators update.

---

## Tab Bar — REDESIGN

**Inspired by:** iOS 26 tab bar with liquid glass

- **Background:** Frosted glass (BlurView on iOS, solid white 95% on Android). 0.33px top border in `separator`.
- **Active state:** Black icon (filled variant if available), `caption2` black label, tiny `accent` dot (4px circle) below the icon
- **Inactive state:** `textTertiary` icon (outline variant), `caption2` `textTertiary` label, no dot
- **Height:** Standard iOS tab bar height (49px + safe area)
- **Icons:** Use outlined/filled pairs from MaterialCommunityIcons:
  - Learn: `play-circle-outline` / `play-circle` (MasterClass feel)
  - Play: `golf-tee` (same both states, weight change only)
  - Community: `account-group-outline` / `account-group`
  - News: `newspaper-variant-outline` / `newspaper-variant`
  - More: `ellipsis-horizontal`

---

## Shared Component Redesign

### GlassBackground (NEW)

Reusable frosted glass container. iOS: `BlurView` with `tint="systemChromeMaterialLight"` and `intensity={80}`. Android: solid `rgba(255,255,255,0.92)` with 1px border `rgba(255,255,255,0.2)`.

### PremiumGate (REDESIGN)

No longer a heavy overlay. Options:
1. **Inline card** between content: subtle `backgroundSecondary` card, "This content requires Premium" in `subhead`, "View Plans" in `accent`. No icons.
2. **Bottom sheet** (for dormy video taps): clean sheet rising from bottom, frosted glass background, "Unlock with Premium" in `title3`, feature list, "View Plans" button in solid black.

### SkeletonLoader (REDESIGN)

`backgroundSecondary` base with animated shimmer in `backgroundTertiary`. Match the exact shape and size of the content it replaces (not generic rectangles). Rounded corners match content corners.

### ErrorState (REDESIGN)

Centred. System icon at 48px in `textTertiary`. "Something went wrong" in `title3`. "Tap to retry" in `subhead` `textTertiary`. No red, no exclamation marks, no drama.

### EmptyState (REDESIGN)

Centred. System icon at 48px in `textQuaternary`. Title in `title3`. Subtitle in `subhead` `textTertiary`. Optional action in `accent`.

---

## Implementation Notes

1. **Start with the design system files** — rewrite colors.ts, typography.ts, spacing.ts first. Everything else references these.
2. **Tab bar next** — it's visible on every screen and sets the tone.
3. **Then shared components** — GlassBackground, PremiumGate, SkeletonLoader, ErrorState, EmptyState, etc.
4. **Then screens, tab by tab:** Login/Onboarding → Learn → Play → Community → News → More
5. **Test as you go.** After each screen, verify nothing broke functionally.
6. **Bundle at least one hero golf course image** for the login background. Use a landscape course photo at golden hour — either from the legacy assets or a royalty-free image. Store in `assets/images/hero-golf.jpg`.

---

## Dependencies

```bash
npx expo install expo-blur
```

---

## Sprint 4 Definition of Done

- [ ] Design system completely rewritten (colors, typography, spacing)
- [ ] Tab bar: frosted glass background, black/grey icons, green dot indicator
- [ ] Login: cinematic full-bleed photo background, frosted inputs, black/white buttons
- [ ] Onboarding: 3 swipeable full-bleed photo screens (functional, not placeholder)
- [ ] Learn home: MasterClass-style hero + horizontal content rows
- [ ] Coach detail: immersive hero image, content rising as sheet
- [ ] Course detail: clean chapter list, subtle premium lock
- [ ] Video player: Apple TV+ style, auto-hiding controls
- [ ] Tips/Dormy: clean grid, frosted premium badges
- [ ] Play home: Apple Health-style stats, clean round list
- [ ] Active scorecard: ultra-light score display, coloured ring, compact hole strip
- [ ] Shot tracker: all UI floating as frosted glass over satellite map
- [ ] Community: Strava-style feed, no card chrome, clean actions
- [ ] News: Apple News layout, featured hero article, clean rows
- [ ] Profile: iOS Settings-style groups, clean profile header
- [ ] ALL green removed except accent text links and active filter pills
- [ ] NO NunitoSans or Futura — system font only
- [ ] All glass/frost effects have Android solid-colour fallbacks
- [ ] Every hardcoded colour/font/spacing replaced with design system constant
- [ ] TypeScript: zero errors
- [ ] All functionality still works (videos play, scores save, posts create, etc.)
