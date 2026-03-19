# Sprint 4: Design Overhaul — Full Specification

## Vision

**"Apple TV and MasterClass had a baby, and it plays golf."**

The app currently works but looks like a developer prototype. Sprint 4 transforms it into something that justifies £4.99/month. Every screen should feel like it belongs on a premium device. The content — professional golf instruction from PGA/European Tour pros — is genuinely premium. The UI needs to match.

**Design philosophy:** Let the content breathe. Coach photography and course imagery are the visual heroes. The UI layer is a glass shelf that presents them, not a frame that competes with them.

---

## Design System Overhaul

### Fonts

**Drop NunitoSans and Futura entirely. Move to SF Pro (system fonts).**

SF Pro is what every premium iOS app uses. It's free, it renders perfectly at every size, it supports Dynamic Type automatically, and it signals "this app belongs on iOS" rather than "this app was built cross-platform."

```typescript
// New typography.ts
const fontFamilies = {
  regular: undefined,     // System default (SF Pro on iOS)
  medium: undefined,
  semibold: undefined,
  bold: undefined,
};

// Use fontWeight to differentiate, not fontFamily
// SF Pro will be selected automatically on iOS when fontFamily is undefined
```

Typography scale (tighter, more intentional):

| Token | Size | Weight | Use |
|-------|------|--------|-----|
| `display` | 34 | 700 | Hero numbers (score, stats) |
| `title1` | 28 | 700 | Screen titles |
| `title2` | 22 | 600 | Section headers |
| `title3` | 18 | 600 | Card titles, coach names |
| `headline` | 16 | 600 | Emphasised body text |
| `body` | 16 | 400 | Primary reading text |
| `callout` | 14 | 400 | Secondary text, metadata |
| `caption1` | 12 | 400 | Timestamps, badges, labels |
| `caption2` | 11 | 400 | Tiny labels, legal text |

### Colours

**Simplify radically.** The current palette has 50+ colour tokens. A premium app uses fewer colours, more deliberately.

```typescript
// New colors.ts — the full palette
const colors = {
  // Backgrounds
  background: '#000000',            // Pure black — OLED-friendly, cinematic
  backgroundElevated: '#1C1C1E',    // iOS system grey 6 — cards, sheets
  backgroundSecondary: '#2C2C2E',   // iOS system grey 5 — secondary surfaces
  backgroundGrouped: '#F2F2F7',     // iOS grouped background — settings screens

  // Surfaces
  surface: '#1C1C1E',               // Card surfaces on dark bg
  surfaceLight: '#FFFFFF',          // Card surfaces on light bg (settings)

  // Text
  textPrimary: '#FFFFFF',           // Primary text on dark
  textSecondary: '#8E8E93',         // iOS system grey
  textTertiary: '#48484A',          // Very muted
  textOnLight: '#000000',           // Primary text on light backgrounds
  textOnLightSecondary: '#8E8E93',  // Secondary text on light backgrounds

  // Accent — ONE colour, used sparingly
  accent: '#34C759',                // Apple system green — for CTAs, progress, success
  accentMuted: 'rgba(52, 199, 89, 0.15)', // Accent tint for backgrounds

  // Semantic
  error: '#FF453A',                 // iOS system red
  warning: '#FFD60A',               // iOS system yellow

  // Scorecard (kept from current)
  scoreEagle: '#007AFF',
  scoreBirdie: '#34C759',
  scorePar: '#8E8E93',
  scoreBogey: '#FF9500',
  scoreDouble: '#FF453A',

  // Premium
  premiumGold: '#FFD700',

  // Tab bar
  tabActive: '#FFFFFF',
  tabInactive: '#48484A',
  tabBackground: '#000000',

  // Borders
  separator: 'rgba(84, 84, 88, 0.36)',  // iOS separator on dark

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.6)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
};
```

**Key change: dark mode by default.** MasterClass, Apple TV+, Netflix, Spotify — every content-first app uses a dark background because it makes imagery pop. The current light grey `#F9F9F9` background makes everything look washed out. Dark mode also looks more premium on OLED screens.

**Exception: Settings/Profile screens** stay light-mode (iOS grouped style with `#F2F2F7` background). This is the iOS convention — content is dark, settings are light.

**The old `#82d54c` secondary green is replaced with Apple's system green `#34C759`.** One accent colour, used only for: active tab, primary CTAs, progress indicators, success states. Never as a background fill.

### Spacing

Keep the current spacing scale but add one token:

```typescript
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,     // Changed from 20 → 24 (better rhythm)
  xxl: 32,    // Changed from 24 → 32
  xxxl: 48,
} as const;
```

### Border Radius

Increase to match modern iOS:

```typescript
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999,
} as const;
```

### Navigation Layer

**Tab bar:** Black background, white active icon, grey inactive. No labels on inactive tabs — icon only. Active tab gets a label underneath. This is the Apple TV+ pattern.

**Headers:** No visible header bars on content screens. Title text floats over content or is part of the scroll content. Use large title style (iOS native feel) where appropriate. Back buttons are translucent circles over content (already done on coach/course detail — standardise this everywhere).

### Liquid Glass Effects (iOS only)

The navigation bar and tab bar should use `expo-blur` `BlurView` to create a frosted glass effect on iOS, with a solid colour fallback on Android. This is the iOS 26 / visionOS-inspired aesthetic.

```typescript
// For tab bar and nav bars:
<BlurView intensity={80} tint="dark" style={styles.tabBar}>
  {/* Tab icons */}
</BlurView>
```

**Only apply to navigation chrome** (tab bar, nav bar, modals). Not to content cards or surfaces.

---

## Screen-by-Screen Spec

### Tab: Learn

**Inspiration:** MasterClass home + Apple TV+ browse

#### Learn Home (`learn/index.tsx`)

**Current:** Horizontal scroll rows of coach cards, genre cards, video cards. Light background, rounded corners, decent but generic.

**Redesign:**

- **Background:** Black
- **Top area:** Large "Learn" title in white (title1 weight), search icon right-aligned
- **Hero carousel:** Full-width, ~60% screen height. Auto-rotating cards showing featured coaches. Each card is a full-bleed image of the coach with their name and a tagline overlaid at the bottom with a gradient. Think Apple TV+ top banner. Swipe between coaches. Page indicator dots at the bottom.
- **Below the hero:** Horizontal scroll sections:
  - "Continue Watching" (if user has in-progress lessons) — video thumbnail cards with a green progress bar at the bottom
  - "Your Coaches" — circular portrait avatars (like Instagram stories circles), tap opens coach detail
  - "Skill Paths" — category cards (Driving, Iron Play, Short Game, Putting, Course Management) with atmospheric photography, text overlay, dark gradient from bottom
  - "Free Tips" — small square thumbnail cards, quick-access
  - "The Dormy" — section for Dormy videos
- **Card style:** Full-bleed images, rounded corners (16px), no borders. Text overlaid on gradient, not below the image. Cards should feel like they're windows into the content, not containers around it.
- **Section headers:** title3 weight, white text, "See All" link in accent green

#### Coach Detail (`learn/coach/[coachId].tsx`)

**Current:** Hero image with overlay, profile pic, bio, course list below. Decent.

**Redesign:**

- **Hero:** Full screen height minus safe area. Coach's primary image fills the entire screen. Dark gradient from bottom (60% height). Coach name and one-line credential at the bottom of the hero in large white text.
- **Scroll behaviour:** Content scrolls UP over the hero image (parallax). As you scroll, the hero image stays pinned and dims.
- **Below hero (scrolled up):** Bio text (body, light grey), "Meet {Coach}" video pitch button (accent green, play icon), then course list.
- **Course list:** Cards with course thumbnail on left (square, 80px), title and lesson count on right. Subtle separator between items. Premium badge on locked courses.

#### Course Detail (`learn/course/[courseId].tsx`)

**Current:** Hero image, course info, flat lesson list. Works but plain.

**Redesign:**

- **Hero:** Same parallax pattern as coach detail. Course image fills top portion.
- **Course info card:** Floating card overlapping the bottom of the hero (like Apple Music album cards). Title, coach name, lesson count, estimated duration. "Play All" button in accent green.
- **Lesson list:** Numbered list (like a playlist). Each row: number (large, muted), title, duration on right. Playing/completed lessons get a green checkmark. Locked lessons get a lock icon with premium CTA. Tapping opens the discussion/comments bottom sheet or navigates to player.
- **Comment thread:** "Discussion ({count})" expandable section at the bottom, or a button that opens a bottom sheet with the `VideoCommentThread` from prompt 11.

#### Video Player (`app/player.tsx`)

**Current:** Full screen player with close button and title. Using expo-video.

**Redesign:**

- Keep the current full-screen player. It's functional.
- **Add:** "Up Next" row at the bottom showing the next lesson in the course (if applicable). Auto-advances after 5 seconds.
- **Add:** "Discussion" button in the top-right (comment bubble icon) that opens a bottom sheet with comments for this video.
- **Polish:** The close button and title should fade out after 3 seconds of inactivity, iOS-style.

---

### Tab: Play

**Inspiration:** Arccos Caddie + Apple Health

#### Play Home (`play/index.tsx`)

**Current:** Course selection flow (search clubs → select course → select tees → start round). Plus round history below.

**Redesign:**

- **Background:** Black
- **Top:** "Play" title in white
- **Hero card:** If there's an active round, show a prominent "Resume Round" card with course name, current hole, score so far. Green accent border. This is the primary CTA.
- **Start Round button:** Large, prominent. "Start New Round" with a golf tee icon. Accent green.
- **Recent Rounds section:** Cards showing last 5 completed rounds. Each card: course name, date, total score (large), to-par (colour-coded), holes played. Tap opens round detail. Think Apple Health activity rings cards — compact, data-dense, visually satisfying.
- **Stats summary:** If rounds exist, show simple aggregated stats: average score, best round, rounds this month. Small, muted, informational.

#### Active Round (`play/round/[roundId].tsx`)

**Current:** Top bar with course name and "End Round", large score circle in the centre, hole indicator strip at bottom. Functional.

**Redesign:**

- **Background:** Dark (`#1C1C1E`)
- **Top bar:** Course name, hole number, "End Round" button. Translucent blur bar.
- **Score input:** Keep the large circle + increment/decrement pattern. It works. But:
  - Make the score circle larger (120px diameter)
  - Animate the score change (spring animation on number update)
  - Colour-code the circle border by score-to-par for this hole (green birdie, red bogey, etc.)
- **Hole strip:** Keep at bottom. Highlight current hole. Show completed holes with colour-coded dots.
- **Shot tracker access:** Floating action button (bottom-right, above hole strip) with map icon. Opens shot tracker.
- **Running total:** Subtle bar above the hole strip: "Through 7 · +3 · Total: 75". Always visible.

#### Round Detail (`play/round-detail/[roundId].tsx`)

**Current:** Info card, score summary, scorecard table. Functional.

**Redesign:**

- **Background:** Dark
- **Hero area:** Course name, date, total score (display size, centred), to-par colour-coded below.
- **Stats cards:** Horizontal scroll of small stat cards (like Apple Watch rings): front 9 / back 9 / total, putts (if tracked), fairways (future), GIR (future). Use the accent green for good stats.
- **Scorecard table:** Keep the current hole-by-hole table but restyle for dark mode. Colour-coded score cells.
- **Share button:** Prominent in the header. Uses the branded scorecard sharing from prompt 12.

#### Shot Tracker (`play/shot-tracker.tsx`)

**Current:** Satellite map with shot pins, hole selector, club selector. Functional.

**Redesign:**

- Minimal chrome changes. The satellite map IS the UI. Keep it.
- **Hole selector:** Move from a horizontal scroll to a circular dial or a compact strip with better visual weight.
- **Club selector:** Bottom sheet rather than inline. Less visual noise on the map.
- **Shot lines:** Draw lines between consecutive shots on the same hole (polyline on the map). This makes the shot pattern visible at a glance.

---

### Tab: News

**Inspiration:** Apple News

#### News Home (`news/index.tsx`)

**Current:** List of article cards + RSS feed. Light background.

**Redesign:**

- **Background:** Black
- **Top:** "News" title in white
- **Featured article:** Top card is large (full-width, 60% screen height) with the hero image, gradient overlay, title, source, date. Tap opens article.
- **Below:** Smaller article cards in a vertical list. Each card: thumbnail left (square, 80px), title + source + date on right. Dark surface colour (`#1C1C1E`).
- **Section dividers:** "Latest" / "Drew's Corner" / etc. if content is categorised.
- **Pull to refresh:** Standard iOS pull-to-refresh.

#### Article Detail (`news/[articleId].tsx`)

**Current:** Full article view.

**Redesign:**

- **Hero image:** Full-width at top, content scrolls beneath.
- **Article body:** White or very light text on dark background. Good line height (1.6×). Readable.
- **Source attribution + date at top** below the hero.
- **Share button** in header.

---

### Tab: More (Profile & Settings)

**Inspiration:** iOS Settings + Strava profile

#### Profile (`more/index.tsx`)

**Current:** Profile card with avatar, name, stats. Settings groups below. Light background.

**Redesign — split into two zones:**

**Zone 1: Profile header (dark)**
- **Background:** Black or dark gradient
- **Avatar:** Large (96px), centred. `AvatarWithBadge` with premium gold ring if applicable. Tap to edit.
- **Name:** title2, white, centred below avatar.
- **Handicap + home course:** callout size, secondary text.
- **Stats row:** Rounds played, average score, best round. In a horizontal layout. Green accent for best/positive stats.

**Zone 2: Settings (light, iOS grouped)**
- **Background:** `#F2F2F7` (iOS system grouped background)
- **Groups:** Account (Subscription, Edit Profile), Preferences (Notifications), About (Terms, Privacy, Version), Actions (Sign Out, Delete Account).
- **Already have `SettingsGroup` + `SettingsRow` components** — these match the iOS pattern. Keep them, just ensure the background is the iOS grouped colour.
- **Transition:** The scroll transitions from dark profile header to light settings section. This is the Strava pattern — dark hero, light content.

#### Edit Profile (`more/edit-profile.tsx`)

- Keep current light-mode form layout. It works for data entry.
- Add `AvatarWithBadge` to the avatar picker area.

---

### Auth Screens

#### Login (`(auth)/login.tsx`)

**Current:** Logo, email/password form, social buttons. Light background.

**Redesign:**

- **Background:** Black with a subtle atmospheric golf course image (blurred, dimmed)
- **Logo:** SweetSpot logo, centred, prominent
- **Tagline:** "Your personal golf coach" or similar, in secondary text
- **Form fields:** Dark surface inputs (`#1C1C1E` background, white text, rounded corners)
- **Primary button:** Accent green, rounded, full width
- **Social buttons:** Dark surface, white text/icon, rounded
- **Toggle text:** "Don't have an account? Sign Up" in secondary text with accent highlight on the action word

#### Onboarding (`(auth)/onboarding.tsx`)

- Keep current flow but restyle for dark mode
- Each page: full-screen atmospheric image + short text overlay
- "Get Started" button in accent green

---

## What This Sprint Does NOT Include

To keep scope manageable, Sprint 4 is purely visual. No new features, no new data flows, no new screens. The same hooks, stores, and queries power the same screens — they just look dramatically different.

**Explicitly out of scope:**
- Animations beyond basic transitions (no Reanimated gesture-driven interactions)
- Skeleton loaders (Sprint 5)
- Empty states redesign (Sprint 5)
- Offline handling (Sprint 5)
- Accessibility audit (Sprint 5)
- New features (IAP, notifications, etc.)

---

## Implementation Strategy

### Phasing

The design overhaul should be implemented **bottom-up: design system first, then screens.**

**Phase 1: Design system foundation**
- New `colors.ts` (dark mode palette)
- New `typography.ts` (SF Pro, new scale)
- Updated `spacing.ts` and `borderRadius.ts`
- Tab bar redesign (dark, blur, icon-only inactive)
- This will break every screen visually. That's expected.

**Phase 2: Learn tab** (the flagship — this is what sells the app)
- Learn home with hero carousel
- Coach detail with parallax
- Course detail with playlist-style lessons
- Player polish (up-next, discussion button)

**Phase 3: Play tab**
- Play home with round history cards
- Active round dark mode + animations
- Round detail restyle
- Shot tracker polish

**Phase 4: News + Auth**
- News home with featured article hero
- Article detail dark mode
- Login/onboarding dark mode

**Phase 5: More/Profile**
- Split profile (dark header / light settings)
- Edit profile polish

### CC Prompt Strategy

Each phase should be a separate CC prompt. Phase 1 is foundational — everything else depends on it. Phases 2-5 can theoretically run in parallel but are best done sequentially so each one builds on the visual language established by the previous.

**Before each CC prompt:** Generate or find reference screenshots of the inspiration apps (MasterClass, Apple TV+, Arccos, Apple News) showing the specific patterns being replicated. Include these in the prompt or describe them precisely enough that CC can implement without guessing.

---

## Success Criteria

When Sprint 4 is complete, a user opening the app for the first time should think:

1. "This looks expensive" — the dark mode, the typography, the content imagery
2. "These are real professionals" — the coach photography is the hero, not buried in small cards
3. "I want to explore" — the carousel and sections invite browsing
4. "I'd pay for this" — the premium gate feels like a velvet rope, not a paywall wall

The bar is: **would you be embarrassed to show this to a friend?** If yes, it's not done.
