# CLAUDE.md - Project Rules & Standards for SweetSpot Golf v2

## Project Overview

SweetSpot Golf is a golf improvement app built around a static library of video lessons from PGA/European Tour professionals. Features: video courses, scorecard, shot tracker (satellite maps), community feed, news, and a 2-tier subscription (Free + Premium) via direct Apple/Google IAP with server-side receipt validation.

**Old codebase (read-only reference):** `/Users/charleswalsh/Code/golfApp`
**New codebase (where you work):** `/Users/charleswalsh/Code/golfAppV2`

Reference the old repo for: Firestore schema (`src/services/firestore.js`), TypeScript types (`src/types/`), subscription logic (`src/containers/SubscriptionHub/`), video structure (`src/containers/Courses/`), Cloud Functions (`functions/`), brand assets (`src/assets/`). **Never copy code directly — rewrite using the new stack.**

---

## Pre-Completion Review (Mandatory)

**This section is a living document.** Every time a bug is found during review, testing, or a fix cycle that SHOULD have been caught before marking done, add a new checklist item here. If a class of bug happens twice, that's a failure of this document.

Before marking ANY task as complete, perform a **Principal/Staff Engineer-level code review** of every file you touched. This is not optional. Do not document issues as "known issues" or "future work" — fix them now.

---

# SweetSpot Golf V2 — Rebuild

## Project Context
This is a ground-up rebuild of the SweetSpot golf instruction app. The original React Native 0.63 codebase was non-functional (5 years stale, 12+ hardcoded secrets, 20+ broken dependencies). This is a fresh start on a modern stack.

## Key Documents
- **Full MVP Rebuild Plan:** `.claude/plans/SweetSpot_MVP_Rebuild_Plan_v2.md` — Contains the complete technical specification: tech stack decisions, IAP architecture (no RevenueCat), Firestore data model, screen inventory, 6-sprint plan, and post-MVP roadmap. **Read this before starting any sprint.**
- **Plan (docx version):** `.claude/plans/SweetSpot_MVP_Rebuild_Plan_v2.docx` — Same content, formatted version for human reading.
- **Legacy Codebase:** `../sweetspot-legacy/` — The old app. Read-only reference. Do not copy code directly. Reference it for Firestore schema (`src/services/firestore.js`), types (`src/types/`), subscription logic (`src/containers/SubscriptionHub/`), video structure (`src/containers/Courses/`), Cloud Functions (`functions/`), and brand assets (`src/assets/`).

## Critical Rules
1. **NEVER hardcode secrets.** All API keys, Firebase config, and tokens come from environment variables via `app.config.ts`. Zero exceptions.
2. **TypeScript strict mode.** No `any` types. No `// @ts-ignore`. Create proper interfaces in `src/types/`.
3. **No `console.log` in production code.** Use Sentry for errors. Use `__DEV__` guards for debug logging.
4. **Server-side receipt validation.** All IAP receipts are validated via Firebase Cloud Functions. Never trust the client.
5. **No file over 300 lines.** Extract hooks and sub-components.
6. **TanStack Query for all Firestore reads.** No raw `onSnapshot` or `getDoc` in components.
7. **expo-iap for subscriptions.** No RevenueCat, no IAPHUB, no third-party revenue sharing.

## Tech Stack
Expo SDK 52+ | TypeScript 5.x strict | Expo Router v4 | Zustand | TanStack Query v5 | expo-av | expo-iap | Firebase (Auth, Firestore, Storage, Functions Node 20) | react-native-maps (satellite) | @sentry/react-native v6 | EAS Build + GitHub Actions

## Content Model
Static video library from PGA/European Tour pros (MasterClass model). No new content expected. Maximise via skill paths, progress tracking, AI drill recommendations, and community discussions per lesson.

## Subscription Tiers
- **Free:** Limited tips, news, community (read-only), scorecard, ads shown
- **Premium Monthly:** £4.99/mo — Full video library, community, shot tracker, no ads
- **Premium Annual:** £39.99/yr — Same as monthly, shown as "£3.33/mo billed annually"

------

### 1. The "Second Time" Test

**For ANY component with a `visible` prop, modal, sheet, or screen that can be opened more than once:**
- Open → use → close → **reopen**. Is ALL state fresh? (Scroll position, animation shared values, index, text content, form fields)
- If anything is stale on reopen, fix it. The `key={remountKey}` pattern is the safest default for modals.
- Check: Do Reanimated `useSharedValue` values reset? They persist across open/close cycles if the component isn't unmounted.
- Check: Does the FlatList/ScrollView scroll position reset to 0?

**For ANY action the user can trigger (purchase, subscribe, post, score entry):**
- What happens when they do it twice? Twice quickly? Is there a guard against double-execution?
- Does the UI update correctly after the second action, not just the first?

---

### 2. State & Persistence

- Are ALL new persisted fields listed in Zustand `partialize`? Missing one means it silently never saves.
- After adding a field: mentally walk through — fresh install, existing user upgrade, app kill + relaunch. Does each scenario produce correct state?
- `??` does NOT catch `NaN`. Use `Number.isFinite()` for numeric safety guards.
- Could any numeric value become `NaN` or `Infinity` through division, multiplication, or accumulation? Trace the math.
- **Never use `Date.now()` in default state object declarations.** It evaluates at module load time, not at runtime. Use `0` as default and set the timestamp when the state is first used.

---

### 3. Lifecycle & Cleanup

- Every `setInterval`, `setTimeout`, `requestAnimationFrame`, and event subscription created in `useEffect` MUST have a cleanup function.
- Every `Animated.loop()` or `withRepeat()` — does it get cancelled on unmount?
- If an async operation (Firebase write, IAP purchase) completes after the component unmounts, does it try to setState on an unmounted component? Guard with an `isMounted` ref.
- Are there any `useEffect` dependencies that change every render (inline objects, unstable callbacks)? This causes infinite loops.

---

### 4. Layout & Visual

- **No hardcoded pixel values.** Use `SCREEN_WIDTH`, theme tokens (`spacing`, `borderRadius`, `typography`), or percentages. Exception: icon sizes and border widths.
- Does the layout work on iPhone SE (375pt) AND iPhone Pro Max (430pt)? Check text truncation, overflow, spacing.
- Long content: what happens if a course name is 40 characters? If a score is 150? Does text truncate with ellipsis or break layout?
- Empty states: what does the screen look like with zero items? No rounds, no posts, empty feed. Is there a meaningful empty state?
- Does the component respect SafeAreaView for notch/Dynamic Island/home indicator?
- **When using typography presets, always put the spread FIRST in the style object.** Inline overrides must come AFTER, otherwise preset values win.

---

### 5. Animation Safety

- Never conditionally swap wrapper element types: `{cond ? <Pressable> : <View>}` causes remount. Use `<Pressable disabled={!cond}>` instead.
- Reanimated worklets that reference React state must use `useAnimatedReaction` or `runOnJS` — never read React state directly inside a worklet.
- Test animations at 0%, 50%, and 100% completion states. What happens if the user interrupts an animation?

---

### 6. Navigation & Modals

- Can the user get stuck? After navigating to a screen, can they always get back?
- If a modal opens another modal, does dismissing the inner one correctly reveal the outer one?
- Does the feature conflict with other overlays? (Paywall, notification banners, onboarding). What if two try to show simultaneously?

---

### 7. IAP & Subscription Integrity

- **Receipt validation is ALWAYS server-side.** Never trust the client. If the Cloud Function is down, the purchase must not grant access — queue and retry.
- **Test the full lifecycle in sandbox:** purchase → validate → unlock → expire → renew → cancel → refund → restore. Every state transition must be handled.
- **Double-tap guard on all purchase buttons.** Disable the button immediately on tap, re-enable only after the flow completes or fails.
- After a successful purchase, verify the Firestore subscription doc was written BEFORE unlocking UI. Don't race.
- **Webhook handler must be idempotent.** Apple/Google may send the same notification multiple times. Writing the same subscription state twice must be safe.
- `finishTransaction()` only AFTER server confirms validation. Never before.
- Restore purchases flow must work for users who deleted and reinstalled the app.

---

### 8. Video Playback

- Does the video player handle network interruption gracefully? (Buffering indicator, retry, error state)
- Does the player release resources on unmount? (expo-av `unloadAsync()`)
- Does background/foreground transition pause/resume correctly?
- Progress tracking: is the "resume where you left off" position saved to Firestore, not just local state?
- What happens if the video URL is expired or 404? Error state, not crash.

---

### 9. Firestore Security

- **Every collection must have security rules. No open collections.**
- Users can only read their own `users/{userId}` doc and subcollections.
- Only Cloud Functions (admin SDK) can write subscription state. Client CANNOT write to `users/{userId}/subscription`.
- Course/lesson reads must check the user's subscription tier. Free-tier users cannot read premium lesson `videoUrl` fields.
- Community posts: users can only edit/delete their own posts.

---

### 10. Tests

- Do the tests actually test behaviour, not just that code runs without crashing?
- Are edge cases covered? Zero values, negative values, empty arrays, undefined optional fields.
- If a function has branching logic, is each branch tested?
- Run `npx tsc --noEmit` and tests before marking done. Both must pass.

---

## Workflow Orchestration

### Plan Before Building
- **Enter plan mode for ANY non-trivial task** (3+ steps, architectural decisions, or changes touching multiple files).
- **When given a multi-step plan, enter plan mode BEFORE implementation.** Confirm understanding, write implementation plan, get approval. Prevents wasted effort from misinterpretation.
- **If something goes sideways, STOP and re-plan immediately.** Don't keep patching. If a fix doesn't work on the first attempt, state the root cause and form a new plan.

### Autonomous Bug Fixing
- When given a bug report: **just fix it.** Don't ask for hand-holding.
- Read the code, trace the issue, fix it, verify it. Zero context switching from the user.
- If you can answer a question yourself by reading the codebase, do that instead of asking.

### Self-Improvement Loop
- After ANY correction from the user, capture the lesson in this file.
- Write rules that prevent the same mistake — specific checks, not vague guidelines.

---

## Tech Stack (Non-negotiable)

| Layer | Technology |
|-------|-----------|
| Framework | Expo SDK 52+ (managed workflow) |
| Language | TypeScript 5.x (strict mode) |
| Runtime | Hermes (default) |
| Navigation | Expo Router v4 (file-based routing) |
| State (UI) | Zustand |
| State (Server) | TanStack Query v5 |
| Video | expo-av |
| IAP | expo-iap (NO RevenueCat, NO third-party revenue sharing) |
| Receipt Validation | Firebase Cloud Functions (Node 20) |
| Auth | Firebase Auth (email, Google, Apple Sign-In) |
| Database | Firebase Firestore |
| Storage | Firebase Storage |
| OTA Updates | EAS Update |
| Ads | react-native-google-mobile-ads |
| Crash Reporting | @sentry/react-native v6 |
| Push Notifications | expo-notifications |
| Maps | react-native-maps (satellite view) |
| CI/CD | EAS Build + GitHub Actions |
| Linting | ESLint + Prettier (strict) |
| Testing | Vitest + React Native Testing Library |
| iOS Target | iOS 16.0+ |

---

## Core Principles

### NEVER Hardcode Secrets
- ALL API keys, Firebase config, Sentry DSN, and tokens come from environment variables via `app.config.ts`.
- If you find yourself typing a key that looks like `AIzaSy...` or `sk_live_...` or any token/key, STOP. Use env vars.
- **The old codebase had 12+ secrets committed to git in plaintext. This is the #1 lesson from the audit. Zero tolerance.**
- Run this grep before every commit:
  ```bash
  grep -rn "AIza\|sk_live\|sk_test\|Bearer \|apiKey.*=.*['\"]" src/ functions/ --include="*.ts" --include="*.tsx" --include="*.js"
  ```

### DRY (Don't Repeat Yourself)
- Before creating any new component, check if a similar one already exists.
- Shared UI patterns (pills, badges, cards, buttons, modals) MUST be extracted into reusable components in `src/components/`.
- **One source of truth for utilities.** Format money with a central `formatMoney()`. Never define local formatting functions.

### Component Architecture
- **Target: ~300 lines per component.** Up to ~500 acceptable for complex screens. Beyond 500, extract further.
- **The main screen file should be a coordinator** — manages state, delegates rendering to sub-components.
- **Extract in this order** (highest value first):
  1. Business logic / utils → `*.utils.ts`
  2. Modals → separate component files
  3. Distinct UI panels → separate components
  4. Styles → `*.styles.ts` only if styles exceed ~150 lines
- **Don't over-extract.** A sub-component with 10+ props used once is worse than inline JSX.

### Theme System
- **ALL colours** from `src/constants/colors.ts` — including hex and rgba values. Never hardcode.
- ALL typography from `src/constants/typography.ts`
- ALL spacing from `src/constants/spacing.ts`
- If a new colour/style is needed, add to theme files first, then reference.
- **Verification grep (run before committing):**
  ```bash
  grep -rn "#[0-9a-fA-F]\{3,8\}" src/ --include="*.tsx" | grep -v "colors\." | grep -v "constants/"
  grep -rn "rgba\s*(" src/ --include="*.tsx" | grep -v "colors\." | grep -v "constants/"
  ```

### Responsive Sizing
- **Never hardcode point values for sizes that should adapt.** Use `SCREEN_WIDTH`/`SCREEN_HEIGHT` or percentages.
  ```typescript
  // Wrong
  <Image style={{ width: 200 }} />
  // Right
  <Image style={{ width: SCREEN_WIDTH * 0.5 }} />
  ```
- **Fixed sizes are acceptable for:** icon sizes, touch target minimums (44pt), text sizes (from typography), border widths, small UI elements (badges, dots, dividers).
- Ask: **"Will this look right on both iPhone SE and iPhone Pro Max?"**

### Numeric Safety
- **`??` (nullish coalescing) does NOT catch `NaN`.** `NaN ?? 0` returns `NaN`. Use `Number.isFinite()`.
- **Guard arithmetic before display.** If a calculation combines multiple fields, ensure every input is valid.
- **Division by zero:** Always guard where denominator comes from state. Use `divisor > 0 ? result : 0`.
- Score values: integers. Money/currency: 2 decimal places. Distances: 1 decimal (yards).

### Type Safety
- TypeScript strict mode — no `any` types unless absolutely unavoidable.
- **Update types immediately when adding state.** Never let `as any` casts accumulate.
- **Acceptable `as any`:** Reanimated compatibility (`Animated.Text as any`). Must be commented.
- **Unacceptable `as any`:** Covering up type errors, accessing state fields that should be typed.

---

## State Management

### Store Architecture
- `authStore.ts` — user auth state, profile
- `subscriptionStore.ts` or hook — subscription tier, entitlements, expiry
- `appStore.ts` — app-level state (onboarding, theme, preferences)
- `roundStore.ts` — active round, scorecard state (if complex enough to warrant a store)
- UI-only ephemeral state: local component state or a `uiStore.ts`

### Zustand Rules
- Components import from stores and don't need to know about internal structure.
- **TanStack Query for all Firestore reads.** No raw `onSnapshot` or `getDoc` calls in components. All data fetching goes through query hooks in `src/hooks/`.
- Ephemeral state (timers, animations) can use local component state.

### Persistence
- Any new persisted field MUST be added to `partialize` in the same commit.
- Fresh install, existing user upgrade, app kill + relaunch — mentally walk through all three.

---

## File Naming & Structure

```
app/                            # Expo Router screens (file = route)
  (tabs)/
    learn/                      # Video lessons tab
    play/                       # Scorecard / on-course tab
    community/                  # Social tab
    news/                       # News tab
    more/                       # Profile & settings tab
  _layout.tsx                   # Root layout (auth gate, providers)
  login.tsx
  onboarding.tsx
src/
  components/                   # Shared UI components
  hooks/                        # Custom hooks (useAuth, useSubscription, etc.)
  lib/                          # Firebase config, query client, utils
  stores/                       # Zustand stores
  services/                     # Business logic (IAP, video, notifications)
  types/                        # TypeScript types & enums
  constants/                    # Colours, spacing, typography, feature flags
functions/                      # Firebase Cloud Functions (Node 20)
assets/                         # Fonts, images, animations
```

- Components: PascalCase (`CourseCard.tsx`, `PaywallModal.tsx`)
- Utilities/helpers: camelCase (`formatMoney.ts`, `calculateDistance.ts`)
- **Import paths:** Use `@/` alias for any import crossing feature boundaries or 2+ directory levels.
  ```typescript
  // Wrong
  import { colors } from '../../../constants/colors';
  // Right
  import { colors } from '@/constants/colors';
  // Fine (same feature folder)
  import { CourseCard } from './CourseCard';
  ```

---

## Performance

- Use `useMemo`/`useCallback` for expensive computations.
- Wrap stateless components in `React.memo()`.
- Animations: `react-native-reanimated` (UI thread), not the basic Animated API.
- Large lists: `FlatList` with `keyExtractor` and `getItemLayout` where possible. Never `ScrollView` with `.map()`.
- **Never change wrapper element types based on state.** Causes remount, resets animations.
- **No `console.log` in production code.** Use Sentry for error reporting. `__DEV__` guards for debug logging only.

---

## React Native / UI Gotchas

### Modal Touch Handling
- React Native `<Modal>` creates a new native window. Touchable components from `react-native-gesture-handler` need a `GestureHandlerRootView` ancestor. **Always wrap Modal content in `<GestureHandlerRootView style={{flex: 1}}>`.**
- Use `visible` prop to control — don't conditionally render the Modal component.

### Safe Area & Device Variants
- Test Dynamic Island / notch insets. Verify visually.
- Test on both iPhone SE and iPhone Pro Max.

### Component Tree Consistency
- Every code path must produce the same component tree depth.
- Conditional rendering that adds/removes wrappers causes reconciliation bugs.

---

## Debugging Process

### Evidence Before Fixes
- **Never suggest "try X" for a UI bug without diagnostic evidence first.** Add logging or visual debugging → read output → fix based on evidence.
- **After 2 failed fix attempts, STOP.** Re-examine the root cause before trying again.
- **When a fix doesn't work, check whether you accidentally reverted a PREVIOUS fix.**

### Large Change Self-Review
- **Any change touching 3+ files must include a self-review pass.** Check: state mutation order, timestamp initialisation, integration points, edge cases.

---

## Testing & Verification

### Never Mark a Task Complete Without Proving It Works
- **"It builds" is not "it works".** Run the app, navigate to the screen, confirm the change works.
- Run `npx tsc --noEmit` after every change.
- Check for console errors/warnings.
- **Test on multiple screen sizes** — iPhone SE and iPhone Pro Max minimum.
- If a fix doesn't work first attempt, **stop and re-plan**.

### Fresh Install vs Existing Install
- Test on fresh install (nuke data) AND existing install. Fresh installs surface default-state bugs; existing installs surface migration bugs.

### Spec Compliance Check (Mandatory)
Before reporting any task complete, re-read the ORIGINAL prompt. For every requirement, verify it was implemented EXACTLY as described. If any requirement was skipped, explicitly flag it as "NOT IMPLEMENTED: [reason]".

---

## Regression Prevention

1. **Never modify shared utilities without tracing all consumers.** Search every import before changing.
2. **If you move where state lives, update every reader.** No partial migrations.
3. **Verify what you changed, not just what you built.** Walk through the full flow end-to-end.
4. **One responsibility per change.** Don't bundle unrelated fixes.
5. **When fixing a bug, state the root cause first.** If you can't articulate the cause, you're guessing.

---

## Self-Review Standards

### Before implementing, ask:
- "Would a staff engineer approve this approach?"
- "Is this the most elegant and performant way?"
- "Will this look right on both smallest and largest device?"

### Post-Implementation Checklist

**Correctness:**
- All edge cases handled (null, undefined, empty arrays, zero values)
- No logic bugs in conditional paths
- All callers of changed functions updated (grep the codebase)

**State & Persistence:**
- New state fields in `partialize`
- Correct defaults in initial state
- Fresh install + existing install both work

**Async Safety:**
- Async functions awaited
- No double-tap vulnerabilities on purchase/action buttons
- Graceful degradation on failure

**Memory & Cleanup:**
- Event listeners cleaned up on unmount
- Intervals/timeouts cleared

**UI:**
- No hardcoded colors (theme system)
- Loading states for async operations
- Error states shown to user
- Disabled states for unavailable actions
- Empty states for zero-item lists

**Security:**
- Zero hardcoded secrets (run the grep)
- Firestore rules enforce access control
- Receipt validation is server-side

---

## Git Hygiene
- Commit after each logical unit of work
- Commit messages: concise, descriptive (e.g., "Add video player screen with progress tracking")
- **Run secret grep before every commit**

---

## What NOT to Do
- Don't create components that duplicate existing ones — check first
- Don't use inline styles for anything used more than once — extract to `StyleSheet`
- Don't hardcode colours, spacing, or typography values
- Don't hardcode point sizes for elements that should scale
- Don't add dependencies without checking if an existing one covers the need
- Don't leave TODO comments without flagging them in your response
- Don't claim a fix is done without verifying actual behaviour changed
- Don't apply a second patch without understanding why the first didn't work
- Don't copy code from the old repo — understand it, then rewrite for the new stack
- Don't use `console.log` — use Sentry or `__DEV__` guards
- Don't call `finishTransaction()` before server-side receipt validation confirms

---

## Common Pitfalls (Quick Reference)

| Pitfall | Wrong | Right |
|---------|-------|-------|
| NaN display | `value ?? 0` | `Number.isFinite(value) ? value : 0` |
| Null check | `!('key' in obj)` | `obj.key == null` |
| Type gap | `(state as any).newField` | Update type definition in `types/` |
| Hardcoded color | `color: '#ef4444'` | `color: colors.danger` |
| Hardcoded size | `width: 200` | `width: SCREEN_WIDTH * 0.5` |
| Hardcoded secret | `apiKey: 'AIzaSy...'` | `apiKey: process.env.FIREBASE_API_KEY` |
| Duplicate util | Local `formatMoney()` | Import from central utils |
| Fix doesn't work | Apply another patch | Stop, state root cause, re-plan |
| Conditional wrapper | `{cond ? <Pressable> : <View>}` | Same element, disable interaction |
| Modal touchables | `<Modal><Pressable>` | `<Modal><GestureHandlerRootView><Pressable>` |
| Modal visibility | `{show && <Modal>}` | `<Modal visible={show}>` |
| IAP finish early | `finishTransaction()` then validate | Validate server-side THEN `finishTransaction()` |
| Default timestamp | `lastSeen: Date.now()` in default state | `lastSeen: 0`, set on first use |
| Firestore in component | `getDoc()` in useEffect | TanStack Query hook in `src/hooks/` |
| Console logging | `console.log(data)` | Sentry breadcrumb or `__DEV__ && console.log()` |
| Secret in code | `const API_KEY = 'sk_...'` | `app.config.ts` + EAS secrets |

---

## Updating This Document

**This checklist must evolve.** After every fix cycle where a bug should have been caught:
1. Identify which category it falls into (or create a new one).
2. Add a specific checklist item that would have caught it.
3. Word it as a direct question or instruction, not a vague guideline.

The goal is that no class of bug bites twice.

<!-- rtk-instructions v2 -->
# RTK (Rust Token Killer) - Token-Optimized Commands

## Golden Rule

**Always prefix commands with `rtk`**. If RTK has a dedicated filter, it uses it. If not, it passes through unchanged. This means RTK is always safe to use.

**Important**: Even in command chains with `&&`, use `rtk`:
```bash
# ❌ Wrong
git add . && git commit -m "msg" && git push

# ✅ Correct
rtk git add . && rtk git commit -m "msg" && rtk git push
```

## RTK Commands by Workflow

### Build & Compile (80-90% savings)
```bash
rtk cargo build         # Cargo build output
rtk cargo check         # Cargo check output
rtk cargo clippy        # Clippy warnings grouped by file (80%)
rtk tsc                 # TypeScript errors grouped by file/code (83%)
rtk lint                # ESLint/Biome violations grouped (84%)
rtk prettier --check    # Files needing format only (70%)
rtk next build          # Next.js build with route metrics (87%)
```

### Test (90-99% savings)
```bash
rtk cargo test          # Cargo test failures only (90%)
rtk vitest run          # Vitest failures only (99.5%)
rtk playwright test     # Playwright failures only (94%)
rtk test <cmd>          # Generic test wrapper - failures only
```

### Git (59-80% savings)
```bash
rtk git status          # Compact status
rtk git log             # Compact log (works with all git flags)
rtk git diff            # Compact diff (80%)
rtk git show            # Compact show (80%)
rtk git add             # Ultra-compact confirmations (59%)
rtk git commit          # Ultra-compact confirmations (59%)
rtk git push            # Ultra-compact confirmations
rtk git pull            # Ultra-compact confirmations
rtk git branch          # Compact branch list
rtk git fetch           # Compact fetch
rtk git stash           # Compact stash
rtk git worktree        # Compact worktree
```

Note: Git passthrough works for ALL subcommands, even those not explicitly listed.

### GitHub (26-87% savings)
```bash
rtk gh pr view <num>    # Compact PR view (87%)
rtk gh pr checks        # Compact PR checks (79%)
rtk gh run list         # Compact workflow runs (82%)
rtk gh issue list       # Compact issue list (80%)
rtk gh api              # Compact API responses (26%)
```

### JavaScript/TypeScript Tooling (70-90% savings)
```bash
rtk pnpm list           # Compact dependency tree (70%)
rtk pnpm outdated       # Compact outdated packages (80%)
rtk pnpm install        # Compact install output (90%)
rtk npm run <script>    # Compact npm script output
rtk npx <cmd>           # Compact npx command output
rtk prisma              # Prisma without ASCII art (88%)
```

### Files & Search (60-75% savings)
```bash
rtk ls <path>           # Tree format, compact (65%)
rtk read <file>         # Code reading with filtering (60%)
rtk grep <pattern>      # Search grouped by file (75%)
rtk find <pattern>      # Find grouped by directory (70%)
```

### Analysis & Debug (70-90% savings)
```bash
rtk err <cmd>           # Filter errors only from any command
rtk log <file>          # Deduplicated logs with counts
rtk json <file>         # JSON structure without values
rtk deps                # Dependency overview
rtk env                 # Environment variables compact
rtk summary <cmd>       # Smart summary of command output
rtk diff                # Ultra-compact diffs
```

### Infrastructure (85% savings)
```bash
rtk docker ps           # Compact container list
rtk docker images       # Compact image list
rtk docker logs <c>     # Deduplicated logs
rtk kubectl get         # Compact resource list
rtk kubectl logs        # Deduplicated pod logs
```

### Network (65-70% savings)
```bash
rtk curl <url>          # Compact HTTP responses (70%)
rtk wget <url>          # Compact download output (65%)
```

### Meta Commands
```bash
rtk gain                # View token savings statistics
rtk gain --history      # View command history with savings
rtk discover            # Analyze Claude Code sessions for missed RTK usage
rtk proxy <cmd>         # Run command without filtering (for debugging)
rtk init                # Add RTK instructions to CLAUDE.md
rtk init --global       # Add RTK to ~/.claude/CLAUDE.md
```

## Token Savings Overview

| Category | Commands | Typical Savings |
|----------|----------|-----------------|
| Tests | vitest, playwright, cargo test | 90-99% |
| Build | next, tsc, lint, prettier | 70-87% |
| Git | status, log, diff, add, commit | 59-80% |
| GitHub | gh pr, gh run, gh issue | 26-87% |
| Package Managers | pnpm, npm, npx | 70-90% |
| Files | ls, read, grep, find | 60-75% |
| Infrastructure | docker, kubectl | 85% |
| Network | curl, wget | 65-70% |

Overall average: **60-90% token reduction** on common development operations.
<!-- /rtk-instructions -->
