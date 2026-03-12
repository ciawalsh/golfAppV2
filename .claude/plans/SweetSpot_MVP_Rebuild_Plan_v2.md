**SweetSpot Golf**

MVP Rebuild Project Plan

Technical Specification for Claude Code

March 2026 | Version 1.0

Target: 12 weeks | 6 sprints | Expo SDK 52+ | TypeScript

IAP: expo-iap + Firebase Cloud Functions (no RevenueCat) | Static Content Library Model

1\. Technology Stack

Every technology choice below has been validated against the code audit findings and designed to avoid the mistakes of the original codebase.

  ———————— ——————————————- ————————————————————————————————————————————————————-
  **Layer**                **Technology**                              **Why**

  **Framework**            **Expo SDK 52+ (managed workflow)**         Avoids native config hell that plagued the original. EAS Build handles Xcode/Gradle. Eject to bare workflow only if needed for Apple Vision pose detection.

  **Language**             **TypeScript 5.x (strict mode)**            Original was 84% TS. Go to 100% with strict mode enforced. No any types, no implicit returns.

  **Runtime**              **Hermes (default)**                        Original had Hermes disabled on iOS. Hermes is now default and gives 2-3x startup improvement.

  **Navigation**           **Expo Router v4**                          File-based routing replaces the 700-line Root/index.tsx navigation tree. Deep linking out of the box.

  **State (UI)**           **Zustand**                                 Replaces Redux + Redux Persist + empty Redux Saga. Zustand is ~1KB, no boilerplate, built-in persist middleware.

  **State (Server)**       **TanStack Query v5**                       Handles all Firestore data fetching, caching, and background refresh. Eliminates manual loading/error states.

  **Video**                **expo-av**                                 Replaces react-native-video v5 (broken on Xcode 15+). Native integration with Expo managed workflow.

  **IAP**                  **expo-iap**                                Free, open-source. Direct Apple StoreKit 2 + Google Play Billing. No RevenueCat, no IAPHUB. You keep 100% (minus Apple/Google 15-30%).

  **Receipt Validation**   **Firebase Cloud Functions (Node 20)**      Server-side validation via Apple App Store Server API v2 + Google Play Developer API. Replaces the original's client-only validation.

  **Auth**                 **Firebase Auth**                           Keep from original. Google Sign-In, Apple Sign-In, email/password.

  **Database**             **Firebase Firestore**                      Keep from original. Reuse existing data model and collections.

  **Storage**              **Firebase Storage**                        Keep from original. Video files, user avatars, assets.

  **OTA Updates**          **EAS Update**                              Replaces dead CodePush/AppCenter. Push JS bundle updates without App Store review.

  **Ads**                  **react-native-google-mobile-ads**          Replaces removed @react-native-firebase/admob. Only shown to free-tier users.

  **Crash Reporting**      **@sentry/react-native v6**                Replaces ancient v1.6.3. Source maps, performance monitoring, breadcrumbs.

  **Analytics**            **Firebase Analytics (keep)**               Plus Sentry for performance. No additional analytics SDK needed for MVP.

  **Push Notifications**   **expo-notifications**                      Replaces whatever the original used. Firebase Cloud Messaging under the hood.

  **CI/CD**                **EAS Build + GitHub Actions**              Replaces manual Fastlane + dead AppCenter. Automated builds on PR merge.

  **Linting**              **ESLint + Prettier (strict)**              Biome is faster but ESLint ecosystem is richer. Enforce on CI.

  **Testing**              **Vitest + React Native Testing Library**   Original had 0% coverage. Target 60%+ for core business logic (IAP, auth, entitlements).

  **iOS Target**           **iOS 16.0+**                               Original was iOS 10. iOS 16+ covers 95%+ of active devices.
  ———————— ——————————————- ————————————————————————————————————————————————————-

2\. Content Model: Static Library

This rebuild assumes no new content from PGA pros. The app launches with the existing video library as a fixed catalogue — similar to a MasterClass model rather than a Netflix model. This has several implications:

2.1 What We Have

-   Video courses from Matt Nixon, Simon Dyson, Andrew Murray, Tom Murray, and Gemma Clews

-   Additional free tips added in v1.1.0

-   All videos are stored in Firebase Storage from the original app — these are our assets to reuse

2.2 How to Maximise Static Content

-   Organise into skill paths: Driving, Iron Play, Short Game, Putting, Course Management. Users pick a path and progress through it.

-   Add AI-powered drill recommendations: after watching a lesson, the app suggests a practice plan based on the video topic. This is an LLM prompt layer that extends the value of each video without needing new recordings.

-   Progress tracking: completion percentage per course, per skill path. Gamify with streaks and milestones.

-   Community discussions per video: users can ask questions and share their attempts under each lesson. This creates ongoing engagement around static content.

-   Seasonal refresh: repackage existing content into "challenge" series (e.g. "30 Day Putting Challenge" using existing putting videos) via Firestore config changes — no new video production needed.

2.3 Pricing for Static Library

Lower price point than a continuously-updated service. £4.99/month or £39.99/year (£3.33/month). This is competitive with coaching app subscriptions while reflecting the fixed catalogue. Ad revenue from free-tier users supplements this.

2.4 If Content Pipeline Reopens

The architecture supports adding new content trivially — upload video to Firebase Storage, create a Firestore document, and it appears in the app. If any of the pros want to add content in future, it's a 10-minute task, not a code change. Push notifications alert subscribers to new content.

3\. Maps & Shot Tracking Approach

We have existing paid course data (scorecard: pars, stroke indexes, yardages, tees). For the visual shot tracking and GPS features, the approach is:

3.1 Satellite Imagery (Free)

-   Google Maps or Mapbox satellite view provides aerial photography of every golf course on earth — for free at our usage scale.

-   The shot tracker overlays user shots onto this satellite imagery. Tap where you hit from, tap where it landed, select club — the app plots the shot on the real course photo and calculates distance.

-   This is how Golfshot, Arccos, and most shot trackers work. No licensed vector course maps needed.

-   Google Maps SDK for React Native (react-native-maps) supports satellite view natively. MapView type="satellite" or type="hybrid" (satellite + labels).

3.2 Existing Course Data

-   Reuse the paid course database for scorecard functionality (par, SI, yardages per tee box).

-   If the data includes green/tee coordinates, overlay markers on the satellite map for distance-to-green calculations.

-   If coordinates aren't in the existing data, use the free golfcourseapi.com API (30,000 courses) for basic green centre coordinates.

3.3 Not Needed for V1

-   Licensed vector course maps (fairway outlines, bunker shapes) — satellite imagery covers this visually

-   3D elevation data — nice-to-have for v2+

-   Real-time pin positions — premium feature for future partnership with courses

4\. Repository Strategy

The rebuild uses a fresh repository. The old codebase is read-only reference material.

4.1 Setup

-   Create new repo: sweetspot-v2 (or sweetspot-golf)

-   Clone old repo alongside for reference: sweetspot-legacy

-   CC works exclusively in the new repo. References old repo when needed for business logic, Firestore schema, type definitions.

4.2 Why Fresh Repo

-   Clean git history — no compromised API keys in commit history

-   Zero technical debt carried forward

-   Modern tooling from first commit (Expo, TypeScript strict, proper .gitignore)

-   Old repo remains intact as documentation of what was built before

4.3 What to Reference from Old Repo

-   Firestore collection structure: src/services/firestore.js (843 lines of Firebase operations — documents the entire data model)

-   TypeScript types: src/types/ (port and modernise)

-   Subscription tier logic: src/containers/SubscriptionHub/ (understand the business rules, rewrite the implementation)

-   Video content structure: src/containers/Courses/ (how courses and lessons are organised)

-   Cloud Functions: functions/ (port business logic to Node 20, rewrite the implementation)

-   Brand assets: src/assets/ (fonts, icons, images, animations — copy directly)

5\. Project Structure

Expo Router uses file-based routing. The folder structure below is the target architecture:

sweetspot/

app/ \# Expo Router screens (file = route)

(tabs)/ \# Bottom tab navigator group

learn/ \# Video lessons tab

index.tsx \# Course library

\[courseId\].tsx \# Course detail / lesson list

lesson/\[lessonId\].tsx \# Video player screen

play/ \# On-course tab

index.tsx \# Scorecard / round start

round/\[roundId\].tsx \# Active round

shot-tracker.tsx \# Shot map

community/ \# Social tab

index.tsx \# Feed

\[postId\].tsx \# Post detail + comments

news/ \# News tab

index.tsx \# News feed

\[articleId\].tsx \# Article detail

more/ \# Profile & settings tab

index.tsx \# Profile screen

subscription.tsx \# Subscription management

settings.tsx \# App settings

\_layout.tsx \# Root layout (auth gate, providers)

login.tsx \# Auth screens

onboarding.tsx \# First-run flow

src/

components/ \# Shared UI components

hooks/ \# Custom hooks (useAuth, useSubscription, etc.)

lib/ \# Firebase config, API clients, utils

stores/ \# Zustand stores

services/ \# Business logic (IAP, video, notifications)

types/ \# TypeScript types & enums

constants/ \# Colours, config, feature flags

functions/ \# Firebase Cloud Functions (Node 20)

src/

iap/ \# Receipt validation endpoints

notifications/ \# Push notification triggers

stripe/ \# Web payment fallback (optional)

package.json

assets/ \# Fonts, images, animations

app.config.ts \# Expo config (env vars, plugins)

eas.json \# EAS Build & Update config

tsconfig.json

6\. In-App Purchase Architecture (No RevenueCat)

This is the most critical section. Getting IAP wrong means lost revenue. The architecture below uses expo-iap for the client and Firebase Cloud Functions for server-side receipt validation. You pay nothing beyond Apple/Google's standard commission.

3.1 Subscription Tiers (Simplified from 5 to 2)

  ——————— ———— ————————— —————————————————————————————-
  **Tier**              **Price**    **Apple Product ID**        **What You Get**

  **Free**              £0           N/A                         Limited free tips (3-5 videos), news feed, community (read-only), scorecard, ads shown

  **Premium Monthly**   £4.99/mo     sweetspot_premium_monthly   Full video course library (all pros), community access, shot tracker, no ads

  **Premium Annual**    £39.99/yr    sweetspot_premium_annual    Same as monthly (save 33%). Shown as "£3.33/mo billed annually"
  ——————— ———— ————————— —————————————————————————————-

3.2 Purchase Flow

The purchase flow is: Client (expo-iap) → Apple/Google processes payment → Client receives receipt → Client sends receipt to Firebase Cloud Function → Function validates with Apple/Google servers → Function writes entitlement to Firestore → Client reads entitlement from Firestore → UI unlocks.

Client Side (expo-iap)

-   initConnection() on app launch to establish store connection

-   getSubscriptions(\[productIds\]) to fetch available products with localised prices

-   requestSubscription({sku}) when user taps purchase button

-   onPurchaseSuccess callback sends the receipt/transactionId to your Firebase Cloud Function

-   finishTransaction() only AFTER server confirms validation succeeded

-   getAvailablePurchases() for restore purchases flow

Server Side (Firebase Cloud Functions)

-   POST /validateReceipt endpoint receives receipt data from client

-   For Apple: calls App Store Server API v2 (api.storekit.itunes.apple.com) with the signed JWS transaction. Validates signature, checks expiry, confirms product ID matches.

-   For Google: calls Google Play Developer API (androidpublisher.googleapis.com) with the purchase token. Validates purchase state, checks expiry.

-   On success: writes/updates a subscription document in Firestore at users/{userId}/subscription with fields: tier, expiresAt, productId, originalTransactionId, store, lastValidated

-   On renewal/expiry: Apple/Google Server Notifications (webhooks) hit a separate Cloud Function endpoint to update the Firestore document in real-time without the client being open

-   Entitlement check: client reads users/{userId}/subscription from Firestore. TanStack Query caches this and refreshes on app foreground.

Key Implementation Details

-   NEVER trust the client. Receipt validation must happen server-side. The original app did client-only validation on the react-native-iap path — this is a fraud vector.

-   Store the originalTransactionId (Apple) or orderId (Google) as the canonical subscription identifier. This survives upgrades, downgrades, and family sharing.

-   Handle edge cases: grace period (Apple gives 16 days for billing retry), billing retry state, revocations, refunds. The webhook handler must update Firestore for all of these.

-   Test with StoreKit Configuration in Xcode for iOS and Google Play test tracks for Android. Do NOT skip sandbox testing.

-   Implement a useSubscription() hook that exposes: isPremium, tier, expiresAt, isLoading, restore(). Every gated screen checks isPremium.

7\. Firestore Data Model

Reuse the existing Firestore collections where possible. Below is the target schema:

  ————————————————— ——————- —————————————————————————————————————————————————
  **Collection**                                      **Purpose**          **Key Fields**

  **users/{userId}**                                  User profile         displayName, email, avatarUrl, tier, createdAt, lastLoginAt, fcmToken, preferences

  **users/{userId}/subscription**                     Subscription state   tier (free|premium), productId, store (apple|google), expiresAt, originalTransactionId, lastValidated, status (active|expired|grace|revoked)

  **users/{userId}/rounds/{roundId}**                 Scorecard rounds     courseId, date, holes\[\], totalScore, handicapDiff, shots\[\] (for shot tracker)

  **courses/{courseId}**                              Video courses        title, description, proName, thumbnailUrl, tier (free|premium), lessonCount, order

  **courses/{courseId}/lessons/{lessonId}**           Individual lessons   title, description, videoUrl, duration, order, tier

  **tips/{tipId}**                                    Free tips            title, videoUrl, duration, proName, category, publishedAt

  **news/{articleId}**                                News articles        title, body, imageUrl, author, publishedAt, category

  **community/posts/{postId}**                        Community posts      userId, text, imageUrl, videoUrl, likesCount, commentsCount, createdAt

  **community/posts/{postId}/comments/{commentId}**   Comments             userId, text, createdAt
  ————————————————— ——————- —————————————————————————————————————————————————

**Firestore Security Rules:** Enforce at the database level. Users can only read their own subscription doc. Only Cloud Functions (admin SDK) can write subscription state. Course/lesson content reads are gated by checking the user's subscription tier.

8\. Screen Inventory

  ————— —————— ——————————- ————- ———————————————————————-
  **Tab**         **Screen**         **Route**                       **Tier**      **Notes**

  **Auth**        Login / Register   login.tsx                       **Free**      Email, Google, Apple Sign-In

  **Auth**        Onboarding         onboarding.tsx                  **Free**      Welcome + pick interests + notification opt-in

  **Learn**       Course Library     learn/index.tsx                 **Mixed**     Grid of courses. Free courses unlocked, premium shows lock icon + CTA

  **Learn**       Course Detail      learn/\[courseId\].tsx          **Mixed**     Lesson list, pro bio, progress bar. Premium gate on locked lessons

  **Learn**       Video Player       learn/lesson/\[lessonId\].tsx   **Premium**   Full-screen video, playback controls, next/prev, notes

  **Learn**       Free Tips          learn/tips.tsx                  **Free**      Vertical scroll of short tip videos (TikTok-style)

  **Play**        Start Round        play/index.tsx                  **Free**      Select course, select tees, start scorecard

  **Play**        Active Round       play/round/\[roundId\].tsx      **Free**      Hole-by-hole scoring, running total, par tracking

  **Play**        Shot Tracker       play/shot-tracker.tsx           **Premium**   Map view, tap to log shots, club selection, distance calc

  **Community**   Feed               community/index.tsx             **Mixed**     Free: read-only. Premium: post, comment, like

  **Community**   Post Detail        community/\[postId\].tsx        **Mixed**     Full post + comment thread

  **News**        News Feed          news/index.tsx                  **Free**      Curated articles + Drew's Corner

  **News**        Article Detail     news/\[articleId\].tsx          **Free**      Full article view

  **More**        Profile            more/index.tsx                  **Free**      Avatar, name, stats, subscription status

  **More**        Subscription       more/subscription.tsx           **Free**      Paywall screen. Tier comparison, purchase buttons, restore

  **More**        Settings           more/settings.tsx               **Free**      Notifications, privacy, contact, terms, logout
  ————— —————— ——————————- ————- ———————————————————————-

**Total:** 16 screens for MVP. Original had 54 screens — this is a focused, shippable subset.

9\. Sprint Plan (12 Weeks / 6 Sprints)

Sprint 1: Foundation (Weeks 1-2)

Goal: Project scaffolding, auth, navigation shell, and CI/CD pipeline. App launches, user can register/login, and navigate between empty tab screens.

1.  Initialise Expo project with SDK 52+, TypeScript strict, Expo Router v4

2.  Set up project structure per Section 2. Configure path aliases (@/components, etc.)

3.  Configure ESLint + Prettier with strict rules. Pre-commit hooks via Husky + lint-staged

4.  Set up Firebase project (or reuse existing). Configure Firestore, Auth, Storage, Cloud Messaging

5.  Implement Firebase Auth (email/password, Google Sign-In, Apple Sign-In)

6.  Create auth gate in \_layout.tsx (redirect to login if not authenticated)

7.  Build bottom tab navigator with 5 tabs (Learn, Play, Community, News, More) — placeholder screens

8.  Set up Zustand stores: useAuthStore, useAppStore

9.  Configure EAS Build (dev, preview, production profiles). First build to TestFlight

10. Set up GitHub Actions: lint + type-check on PR, EAS Build on merge to main

11. Configure @sentry/react-native v6 with source maps

12. Environment variables via app.config.ts (Firebase keys, API URLs). NO hardcoded secrets.

**Sprint 1 Deliverable:** App launches on device via TestFlight. User can register, login, and see 5 tab screens. CI/CD is green.

Sprint 2: Video Content Platform (Weeks 3-4)

Goal: The core feature — browsing and watching video lessons from PGA pros. This is what makes SweetSpot unique.

1.  Design and build Course Library screen (grid/list of courses with thumbnails, pro name, lesson count)

2.  Build Course Detail screen (lesson list, pro bio, course description, progress indicator)

3.  Build Video Player screen using expo-av (full-screen, playback controls, skip 10s, playback speed)

4.  Implement video progress tracking (resume where you left off, mark lesson complete)

5.  Build Free Tips screen (vertical scroll, short-form videos, swipe through)

6.  Set up TanStack Query for Firestore data fetching (courses, lessons, tips). Implement caching strategy.

7.  Build premium content gate (lock icon on premium courses, tap shows paywall CTA)

8.  Seed Firestore with existing video content from the original app's Firebase. Organise into skill paths (Driving, Iron Play, Short Game, Putting, Course Management)

9.  Implement useSubscription() hook (reads subscription doc from Firestore, exposes isPremium)

**Sprint 2 Deliverable:** User can browse courses, watch free videos, see premium content locked. Video playback works smoothly with progress tracking.

Sprint 3: Subscriptions & Monetisation (Weeks 5-6)

Goal: Users can pay. This is the revenue engine. Get this right before building anything else.

1.  Configure Apple App Store Connect: create subscription group, add premium_monthly and premium_annual products

2.  Configure Google Play Console: create subscription products (if re-launching Android)

3.  Integrate expo-iap: initConnection, getSubscriptions, requestSubscription, finishTransaction

4.  Build Firebase Cloud Function: POST /validateReceipt — Apple App Store Server API v2 validation

5.  Build Firebase Cloud Function: POST /storeNotification — Apple/Google server-to-server webhook for renewal/expiry/refund

6.  Write subscription document to Firestore on successful validation (see Section 4 schema)

7.  Build Subscription/Paywall screen: tier comparison, localised pricing, purchase buttons, restore purchases

8.  Implement restore purchases flow (getAvailablePurchases → re-validate → update Firestore)

9.  Integrate react-native-google-mobile-ads for free-tier users. Banner ads on news/community, interstitial between tips.

10. Sandbox testing: full purchase → validate → unlock → expire → renew cycle in StoreKit sandbox

11. Write tests for IAP flow: validation function, entitlement hook, edge cases (expired, refunded, grace period)

**Sprint 3 Deliverable:** User can subscribe, payment works end-to-end, premium content unlocks, receipt validation is server-side, webhooks handle renewals/expiry. Ads show for free users.

Sprint 4: Scorecard, Community & News (Weeks 7-8)

Goal: Round out the feature set. Scorecard, community posts, and news content.

1.  Build Start Round screen (course selection, tee selection, player count)

2.  Build Active Round screen (hole-by-hole scoring input, running total, par diff, save round to Firestore)

3.  Build round history view on Profile screen (list of past rounds with date, course, score)

4.  Build Shot Tracker screen (MapView via react-native-maps with satellite imagery, tap to log shot location, select club, calc distance. Existing paid course data provides hole/tee/green coords for overlays)

5.  Build Community Feed (post cards with text/image, like count, comment count)

6.  Build Post Detail + comment thread

7.  Build create post flow (text + optional image upload to Firebase Storage)

8.  Build News Feed + Article Detail screens (pull from Firestore, curated content)

9.  Implement push notifications via expo-notifications (new content, community replies)

**Sprint 4 Deliverable:** Full feature set working: video lessons, subscriptions, scorecard, shot tracker, community, and news.

Sprint 5: Polish, Performance & UX (Weeks 9-10)

Goal: Make it feel premium. Performance optimisation, animations, error states, empty states, offline handling.

1.  Design system: finalise colour palette, typography scale, spacing system, component library (buttons, cards, inputs)

2.  Onboarding flow: 3-4 screens (welcome, pick your interests, notification opt-in, get started)

3.  Skeleton loaders for all list/grid screens (courses, news, community)

4.  Empty states for every screen (no rounds yet, no posts yet, etc.) with clear CTAs

5.  Error states and retry buttons for all API failures

6.  Offline handling: cache video metadata, show "offline" banner, queue community posts

7.  Performance audit: bundle size check, remove unused deps, optimise images, lazy load screens

8.  Accessibility: VoiceOver labels, Dynamic Type support, sufficient colour contrast (Apple now surfaces this)

9.  App icon, splash screen, App Store screenshots

10. Settings screen: notification prefs, privacy policy, terms, contact us, logout, delete account (GDPR)

**Sprint 5 Deliverable:** App feels polished and production-ready. Every screen has loading, empty, and error states. Accessibility is declared.

Sprint 6: Testing, Privacy & Submission (Weeks 11-12)

Goal: Ship it. Testing, App Store compliance, privacy manifests, and submission.

1.  Write unit tests for all business logic (IAP validation, entitlement checks, scorecard calculations)

2.  Write integration tests for critical flows (register → login → browse → subscribe → watch video)

3.  Generate Apple Privacy Manifest (PrivacyInfo.xcprivacy): declare all API usage reasons, tracking domains

4.  Implement App Tracking Transparency prompt (required for ads)

5.  Firestore security rules: lock down all collections, test with Firebase emulator

6.  Update privacy policy and terms of use on walshenterprises.co.uk (or new domain)

7.  Full regression test on physical device (iPhone 14+ or equivalent)

8.  Prepare App Store listing: description, keywords, screenshots, app preview video

9.  EAS Build production profile → TestFlight → internal testing → submit to App Store Review

10. Configure EAS Update for post-launch OTA JS bundle updates

**Sprint 6 Deliverable:** App submitted to App Store. Privacy manifests included. Security rules locked down. OTA updates configured for fast post-launch fixes.

10\. Post-MVP Roadmap (Tier 2 & 3)

These features are built after launch once the MVP is validated and generating revenue:

  ———— —————————— —————- ———————- ——————————————————————————————————————
  **Tier**     **Feature**                    **Timing**       **Effort**             **Notes**

  **Tier 2**   **Basic AI Swing Analysis**    Month 2-3       3-4 weeks             Apple Vision body pose detection, phase breakdown, basic angle measurement. Record → analyse → overlay feedback.

  **Tier 2**   **GPS Rangefinder MVP**        Month 3-4       2-3 weeks             golfcourseapi.com free data. Distance to green, hazards. MapView overlay.

  **Tier 2**   **AI Drill Recommendations**   Month 4          1-2 weeks             LLM-powered tips based on swing analysis results + the pro video library. Claude API or similar.

  **Tier 3**   **Licensed Course Data**       Month 6+         1 week (integration)   Upgrade to iGolf or GolfLogix API for comprehensive course coverage. Business decision, not technical.

  **Tier 3**   **Apple Watch Companion**      Month 6+         3-4 weeks             On-course GPS, score entry, shot logger from wrist.

  **Tier 3**   **Android Relaunch**           Month 6+         2-3 weeks             Expo makes this mostly free. Same codebase, configure Play Store, test IAP flow.

  **Tier 3**   **Advanced 3D Swing Model**    Month 9+         Specialist hire        Custom ML model or Sportsbox AI SDK integration. Requires training data + sports science input.
  ———— —————————— —————- ———————- ——————————————————————————————————————

11\. Pre-Launch Checklist

Complete all items before submitting to App Store:

1.  **Rotate ALL old API keys** from the original codebase (Stripe live key is highest priority)

2.  Verify NO secrets are hardcoded anywhere in the new codebase (grep for API keys, tokens, passwords)

3.  Full IAP flow tested in sandbox (purchase, restore, expire, renew, cancel, refund)

4.  Server-to-server notifications configured for Apple and Google (subscription lifecycle webhooks)

5.  Firestore security rules deployed and tested (no open collections)

6.  Privacy manifest (PrivacyInfo.xcprivacy) included in build

7.  ATT prompt implemented and tested (required for ad SDK)

8.  Privacy policy and terms of use URLs live and accessible

9.  Delete account functionality works (Apple requires this)

10. App Store listing complete (screenshots, description, keywords, categories, age rating)

11. Sentry configured with source maps uploading on EAS Build

12. EAS Update configured for post-launch hotfixes

13. Video content loaded and verified (all courses, lessons, free tips playing correctly)

14. Push notification permissions and FCM token flow tested

*This project plan is designed to be used directly by Claude Code as a working specification. Each sprint is scoped to be independently testable. The IAP architecture avoids all third-party revenue-sharing services — you pay only Apple/Google's standard 15-30% commission.*