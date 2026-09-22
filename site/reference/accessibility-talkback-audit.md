---
title: TalkBack accessibility audit of the learner app
description: Complete accessibility audit of the learner app using Android TalkBack screen reader, including method, per-screen findings, severity ratings, and remediation guidance.
---

# TalkBack accessibility audit of the learner app

Date: 2026-09-15

## Method

- Device: Android Studio emulator `emulator-5554`, Pixel 7 profile, Android 13 (API 33), 1080×2400 px, 420 dpi (2.625 px/dp).
- App under test: `net.glean.edtech.dev`, versionName `1.0.0` (release build, already installed). Talks to a test backend over the internet; no local servers involved.
- Screen reader: TalkBack versionName `14.2.0.618048417`. Touch exploration confirmed throughout. Left enabled at the end of the session.
- TTS: system TTS engine (`com.google.android.tts`) with `tts_default_locale` = `khm-KHM`. Confirmed live via logcat during the audit; see "TTS evidence" below.
- App UI language: Khmer (default), with a language toggle also exercised.
- Test account: a learner account on a corporate-themed school with document-based lessons. No other account was used.
- Driving method: `adb shell input tap` at coordinates read from `uiautomator dump` (explore-by-touch), `adb shell input text` for typing, `adb shell input keycombination KEYCODE_ALT_LEFT KEYCODE_ENTER` for the keyboard "activate" command, and `adb exec-out screencap` for screenshots. Element names/roles/state were read from the live accessibility tree (`uiautomator dump`), which reports the same `text`/`content-desc`/`class`/`clickable`/`checked`/`selected` properties TalkBack composes its announcements from.

### Methodology limitation: linear (swipe) navigation

The swipe-based "next/previous item" gesture (`adb shell input swipe 300 1200 800 1200 100`, and variants with longer duration, higher velocity, and the explicit `input touchscreen swipe` form) did **not** reliably drive TalkBack's linear navigation in this environment. Repeated attempts on the login screen left accessibility focus unchanged; the same gesture on the launcher home screen was instead delivered to the underlying view as a page swipe. This looks like a known limitation of synthetic ADB touch injection (no realistic multi-point velocity profile) rather than an app defect, but it means **reading order below was not proven by walking it with a swipe gesture**. Instead, order was reconstructed from the accessibility tree's document order (which is what TalkBack's default linear traversal follows for an app with no custom traversal order set) and cross-checked against the visual layout and spot taps on individual elements. Where this matters for a finding, it is called out explicitly.

Tapping an element (explore-by-touch) consistently both **moved focus to and activated** the tapped control in this environment (login submitted, cards navigated, radio options selected, back/close buttons fired) rather than only moving focus as TalkBack's default explore-by-touch would. This is consistent with TalkBack's "single-tap activation" preference being on for this profile. The `Alt+Left` `Enter` keyboard "activate" command was also confirmed to work independently. Because taps already activate, some per-element "does Alt+Enter activate this" checks below rely on the equivalent tap-activation evidence rather than a separate keyboard event, and that is noted per screen.

A second reviewer retried on 15 Sep with fast and slow horizontal swipes, vertical swipes, Tab, and TalkBack's `Alt+Right` keyboard shortcut, and none of them moved accessibility focus from adb-injected input. The reading order given in this document is therefore the accessibility tree's document order (which is what TalkBack uses for linear navigation) plus explore-by-touch spot checks, not a walked swipe sequence. A listening pass on a physical phone remains owed.

### What could not be assessed

- **Audio quality / pronunciation**: no listening device was available; TTS activity was confirmed only via logcat (synthesis requests observed), not by ear.
- **Real budget-phone performance**: this was an emulator, not a low-end physical device; TalkBack/app responsiveness under real hardware constraints is unknown.
- **iOS**: out of scope; this audit covers the Android/TalkBack build only.
- **Exact spoken utterances**: the accessibility tree tells us what TalkBack *should* compose an announcement from, but a few findings below (duplicate nested text nodes, `RadioButton` state) are flagged as "likely" effects on the spoken output rather than confirmed by listening.

## Severity definitions

- **Blocker**: a screen-reader user cannot complete the learner path (login > lesson > practice > quiz > result) because of it.
- **Major**: the path can be completed, but the user is misled or is missing information a sighted user gets.
- **Minor**: polish: consistency, duplication, orientation aids.

## Summary table

| Screen | Reachable / total interactive | Unlabelled | Order OK | Activation OK | Blocking issues |
|---|---|---|---|---|---|
| 1. Login | 6 / 6 | 2 (see F-16) | Yes (inferred) | Yes | 0 |
| 2. Home | 4 / 4 | 0 | Yes (inferred) | Yes | 0 |
| 3. Grade list | 4 / 4 | 0 | Yes (inferred) | Yes | 0 |
| 4. Module list | 4 / 4 | 0 | Yes (inferred) | Yes | 0 |
| 5. Level detail | 7 / 7 | 0 | Yes (inferred) | Yes | 0 (but see F-05) |
| 6. Lesson activity list | 6 / 6 | 0 | Yes (inferred) | Yes | 0 |
| 7. Lesson video | 3 / ~8 | 1 (close button) | No | Partial (close only) | **1 (Blocker)** |
| 8. Practice (MCQ) | 8 / 8 | 1 (back button) | Yes (inferred) | Yes | 0 (but see F-03, F-07) |
| 9. Wrong-answer popup | 1 / 1 | 0 | Yes | Yes | 0 |
| 10. Quiz | 8 / 8 | 1 (back button) | Yes (inferred) | Yes | 0 (but see F-03, F-07) |
| 11. Correct-answer popup | 1 / 1 | 0 | Yes | Yes | 0 |
| 12. Result | 4 / 4 | 0 | Yes (inferred) | Yes | 0 |
| 13. Profile | 3 / 3 | 0 | Yes (inferred) | Yes | 0 |
| 14. Logout | n/a (transition) | n/a | Unclear (see F-13) | Yes | 0 |
| 15. Bottom tab bar | 2 / 2 (every screen) | 0 | Yes | Yes | 0 |

"Reachable/total" counts elements present in the accessibility tree versus elements a sighted user can see and operate on screen (the video screen is the one place these diverge sharply). "Blocking issues" counts Blocker-severity findings scoped to that screen from the table below.

## Per-screen notes

### 1. Login (`សូមស្វាគមន៍`)

a. Order (tree/visual, Khmer unless noted): heading "សូមស្វាគមន៍" (none/heading) > subtitle "ចូលគណនីដើម្បីបន្តការសិក្សា" (none) > Email field (edit text, Khmer hint as name) > Password field (edit text, Khmer hint) > show/hide-password button, **name "Show text", English** > Login button "ចូលគណនី" (button) > "English" toggle (button, English) > "ភាសាខ្មែរ" toggle (button, Khmer) > "POWERED BY EDTECH FOR GOOD" footer (none, English, decorative).

b. All 6 interactive elements reachable by tap; none visible-but-unreachable.

c. No element was completely unlabelled during touch exploration; both fields fall back to their Khmer hint text as a name while empty; but neither field has an explicit `accessibilityLabel`, so the hint stops working as a name once the field is filled; the static scan counts this as 2 unlabelled fields (see F-16).

d. Order matches visual top-to-bottom layout.

e. Activation confirmed: typing into both fields worked with TalkBack on; Login button submitted and signed in; English/Khmer toggles switched the whole screen's language live.

f. n/a (no popup).

g. Logo image is not exposed as a separate focusable node; correctly hidden from the screen reader.

h. No traps.

Cross-cutting (F-15): the "សូមស្វាគមន៍" heading, like every screen title and section heading in the app, is not exposed to TalkBack as `accessibilityRole="header"`; not repeated per screen below; see the consolidated table.

### 2. Home

a. Header title "មុខវិជ្ជា" (none) > greeting "អរុណសួស្តី" (none) > learner name (none, English) > search field, Khmer hint "ស្វែងរកកម្មវិធីសិក្សា" > curriculum card, single button with combined name containing curriculum information (English content strings) > tab bar: Home "ទំព័រដើម" (selected), Profile "ប្រវត្តិរូប".

b. All 4 reachable.

c. None unlabelled.

d. Matches visual order; after login, focus landed on the header title first, which is a reasonable "screen changed" anchor.

e. Search field opened the keyboard on tap; the curriculum card navigated to the Grade list on tap; confirmed.

f. n/a.

g. Card thumbnail illustration is not a separate focusable node; correctly hidden.

h. None.

### 3. Grade list (`ថ្នាក់`)

a. Back button, **name "Navigate up", English** (button/ImageButton) > title "ថ្នាក់" (none) > grade card with curriculum information (button) > tab bar.

b/c/d as above; all reachable, none unlabelled, order matches visual.

e. Back button activation confirmed (returns to Home); card activation confirmed (opens Module list).

f/g/h: n/a / none / none.

### 4. Module list (`មេរៀន`)

Structurally identical to Grade list: back button "Navigate up" (English) > title "មេរៀន" > module card with curriculum information (button) > tab bar. All reachable, activation confirmed.

### 5. Level detail (`ចំណងជើងរង`)

a. Back "Navigate up" (English) > header title, which reads **"ចំណងជើងរង" ("Subtitle")** rather than the level's actual name; this is a mistranslation in `km.json` (`screen.level.header`), not a wrong-field binding bug; see finding F-04 > hero image (not focusable, correctly hidden) > curriculum information chips (each duplicated once as a container `content-desc` and once as a child `TextView` `text`, see F-09) > module title (none, English) > curriculum information (none) > progress text "មេរៀន 0 ក្នុងចំណោម 4" / "40%" (Khmer + digits) > 3 lesson-row buttons, each named with lesson structure information > sticky Continue button "បន្តការសិក្សា" (Khmer) > tab bar.

b. All 7 interactive elements reachable.

c. None fully unlabelled.

d. Order matches visual layout.

e. Back button and lesson-row tap-activation both confirmed (rows navigate to the Lesson activity list); Continue button not exercised directly (the same destination was reached via a row tap).

f. n/a.

g. Hero illustration correctly hidden from the tree.

h. None.

Major gap (F-05): the three small step-dots per lesson row (done / current / locked, shown only by colour; green filled, blue outline, grey) carry **no accessibility information at all**. The row's accessible name lists the three step names ("សិក្សា, អនុវត្ត, តេស្ត") but never says which are complete, which is next, or which are locked.

### 6. Lesson activity list (`លំហាត់`)

a. Back "Navigate up" (English) > title "លំហាត់" > section label "សិក្សា" (none) > row button with lesson title (English) > section label "អនុវត្ត" > row button with lesson title > section label "តេស្ត" > row button with lesson title > tab bar.

b. All 6 reachable.

c. None unlabelled.

d. Matches visual order (section header, then its row).

e. All three row activations confirmed (video, practice, quiz all opened).

f. n/a.

g. Thumbnail illustrations correctly hidden.

h. None.

### 7. Lesson video, BLOCKER

a. Only 3 accessibility nodes exist on this entire screen: the close ("X") control and the two tab-bar items. The close control's accessible name is `\U000f0156`, a raw private-use-area icon-font code point; not real text.

b. Everything else visible and operable; play/pause, rewind, fast-forward, the seek bar/scrubber, elapsed/remaining time, and the fullscreen toggle; is **absent from the accessibility tree**. Tapping the on-screen play-icon coordinates did silently start playback (confirming the control is live and reachable by sighted touch), but TalkBack never drew a focus rectangle there and never announced anything: there is no way for a screen-reader user to discover that these controls exist, let alone operate them.

c. The close button is effectively unlabelled (a code point, not a word); TalkBack would announce it as "button" with no name or attempt to speak the code point.

d. Reading order cannot "match visual order" because almost nothing but the close button and the tab bar is in the order at all.

e. Close-button activation confirmed (tap closed the video and returned to the Lesson activity list, landing focus back on that screen's back button).

f. n/a (no popup here).

g. n/a.

h. Nothing traps focus, but a screen-reader user has no accessible way to play, pause, seek, or resume the video; only to close it; which for a video-based Learning step blocks that step of the learner path outright.

### 8. Practice (MCQ)

a. Back button, **name is the raw code point `\U000f030d`, i.e. completely unlabelled (not even "Navigate up")**; a *different*, more broken back-button implementation than screens 3–6 and 12 use > title (full lesson-practice title; visually truncated on screen but the accessible name is the full untruncated string, so this is a visual-only issue) > question text (English) > 3 `RadioButton` options (English) > Submit "បញ្ជូន" > Retry "ព្យាយាមម្តងទៀត" > "1 / 1" attempt counter (digits only) > tab bar.

b. All 8 interactive elements reachable.

c. **Back button is unlabelled** (F-03; the two competing back-button components are F-06).

d. Order matches visual layout.

e. Radio selection, Submit, and Retry all activate on tap; confirmed across three attempts (wrong, wrong, then correct).

f. See screen 9 below (popup opens from here).

g. None.

h. None.

Cross-cutting (F-15): the question text doubles as this screen's heading and is likewise never exposed as `accessibilityRole="header"`; see the consolidated table; same gap on Quiz (screen 10).

Major gap (F-07): selecting an option visibly moves the green selection ring and fill, but the `RadioButton` node's `checked` attribute stays `false` for every option, before and after selection; only its `selected` attribute flips to `true`. Because TalkBack's spoken "checked"/"not checked" state for a `RadioButton` role is driven by the checkable/checked pair (not `selected`), a screen-reader user most likely gets no spoken confirmation of which answer, if any, is currently chosen before they submit. (Flagged Major rather than Blocker because the task is still completable, Submit still works; but the user is submitting blind to their own selection; not independently confirmed by listening.)

Content note (not an accessibility defect): the three options are re-shuffled on every attempt, which is fine visually but means a screen-reader user re-reading the list after a wrong answer cannot rely on remembered positions.

### 9. Wrong-answer popup

f. Focus moved **into** the dialog on open, landing on the message text. The background screen is completely excluded from the tree while the dialog is open (17 nodes total, all dialog-only); the question, options, and tab bar are correctly unreachable, which is the right modal behaviour. All dialog text and its button ("សូមព្យាយាមម្តងទៀត") are Khmer.

Minor gap (F-10): after tapping the dialog's button to dismiss it, no accessibility focus rectangle was visible anywhere on the next screenshot; focus appears to be dropped rather than landed on a sensible next target (e.g. the first answer option or the Retry button). Not fully confirmed (could be a screenshot-timing artifact rather than TalkBack truly losing focus), but worth a developer check.

### 10. Quiz

Structurally identical to Practice (same unlabelled back button, same `checked`-state gap on the radio options; see F-06/F-07), with one added finding: the header title is the bare English word **"Quiz"** with no Khmer at all, whereas the same concept is labelled "តេស្ត" everywhere else in the app (section header on screen 6, chip label on screen 5). This is a language-consistency gap (F-11).

### 11. Correct-answer popup

Same modal pattern as the wrong-answer popup: focus moves into the dialog, lands on the message text, all text is Khmer, background is excluded from the tree. Button "បន្ទាប់" (Next) activation confirmed.

### 12. Result (`លទ្ធផល`)

a. Back "Navigate up" (English) > title "លទ្ធផល" > repeated section label "លទ្ធផល" (duplicate, see F-09) > status message "សូមព្យាយាមម្តងទៀត!!" (Khmer) > percentage ring, exposed as real text **"0%"** (not just a graphical ring; good) > "ពិន្ទុ" (Score) label > "0/1" > breadcrumb with curriculum information (English) > Finish button "រួចរាល់" > tab bar.

e. Finish button activation confirmed (returns to the Lesson activity list).

Positive: the score percentage is available as real text, unlike the lesson-row step dots (F-05); a screen reader user can hear their score here, just not their per-step progress on screen 5.

### 13. Profile (`ប្រវត្តិរូប`)

a. Title "ប្រវត្តិរូប" > logout button, **name "ចាកចេញ"; correct, Khmer, positive contrast with the unlabelled/English icon buttons elsewhere** > repeated section label "ប្រវត្តិរូប" > learner name (none, English) > avatar initials (exposed as literal text, harmless) > username chip (duplicated node) > membership information (incomplete; no date follows; content bug, not an a11y-specific one) > "ពត៌មានផ្ទាល់ខ្លួន" (Personal information) header > label/value pairs with learner information > "ពត៌មានទំនាក់ទំនង" (Contact) header > phone information / placeholder > tab bar.

e. Logout button activation confirmed; logs out immediately, with **no confirmation dialog**.

Minor: the Date of birth field shows no placeholder while the Phone field correctly does, so a screen-reader user hears the label and then silence/nothing, rather than an explicit placeholder (inconsistent across fields).

### 14. Logout

Tapping the header logout icon immediately signs out and returns to the Login screen; no confirmation step exists at all (screen reader or not). On the screenshot taken right after logout, no accessibility focus rectangle was visible on the resulting Login screen; i.e., arriving back at Login may not be announced. Not independently confirmed by listening; flagged as a "could not fully verify, worth a developer check" item (F-13) rather than a hard finding.

### 15. Bottom tab bar (checked on Home, Grade list, Module list, Level detail, Lesson list, Result, and Profile)

a. Two items, Home "ទំព័រដើម" and Profile "ប្រវត្តិរូប", both `android.view.View` with `clickable=true` and Khmer names.

Positive finding: the currently active tab correctly exposes `selected="true"` in the accessibility tree (confirmed on both tabs, on both Home and Profile screens), TalkBack has the information it needs to announce which tab is currently selected. This is a real contrast with the practice/quiz radio buttons (F-07) and the language toggle on Login, which do **not** expose an equivalent selected/checked state.

The decorative icon glyph inside each tab item is `focusable="false"` and correctly does not get its own stop when traversing the tab bar.

No traps; always reachable at the bottom of every main screen.

## TTS evidence

Captured via `adb logcat` (cleared immediately beforehand) while interacting with the video screen's close button:

```
09-15 09:19:31.020   I MediaFocusControl: requestAudioFocus() ... AA=USAGE_ASSISTANCE_ACCESSIBILITY/CONTENT_TYPE_SPEECH ... callingPack=com.google.android.marvin.talkback
09-15 09:19:31.070   I GoogleTTSServiceImpl: Synthesis request for locale khm-KHM and name km-KH-language
09-15 09:19:31.072   I GoogleTTSServiceImpl: TTS dispatch: km-kh-x-khm-lstm-embedded
```

This confirms TalkBack is actively requesting accessibility-scoped audio focus and dispatching synthesis to the Khmer (`khm-KHM`) voice model for every announcement, including (in this instance) the unlabelled video close button. i.e. TalkBack did attempt to say *something* for it, consistent with it announcing a bare "button" or attempting to vocalize the raw glyph. Audio was not available to confirm the exact spoken result.

## Consolidated findings

| ID | Screen(s) | Issue | Severity | Evidence | Suggested fix | Effort |
|---|---|---|---|---|---|---|
| F-01 | 7. Lesson video | Native video player exposes only the close button to accessibility; play/pause, rewind, fast-forward, seek bar, and fullscreen are completely absent from the tree; unreachable and unusable via TalkBack. | **Blocker** | `src/screens/Lesson/components/VideoControl.tsx`, `renderController()`, `Platform.OS === 'web'` at line 331 | Replace the bare native player controls with accessible custom controls (or configure the player's built-in a11y delegate) exposing `accessibilityRole="button"` + Khmer `accessibilityLabel` for play/pause, seek back/forward, and fullscreen, plus an accessible value/label for the scrubber (e.g. `accessibilityValue` with elapsed/duration). Note: the web build already renders a custom control bar for this same player; the native fix is to render an accessible version of that existing bar on Android rather than build a player from scratch. | 2d |
| F-02 | 7. Lesson video | The close ("X") button's accessible name is a raw private-use-area icon-font code point, not text. | Blocker (compounds F-01; it's the only reachable control and it's unlabelled) | `content-desc="\U000f0156"` in accessibility tree | Add `accessibilityLabel="បិទ"` (Close) to the icon button component. | 0.1d |
| F-03 | 8. Practice, 10. Quiz | Back button's accessible name is a raw private-use-area icon-font code point (different, more broken back-button component than the one used on screens 3–6 and 12, which at least says "Navigate up"). | Major | `content-desc="\U000f030d"` in accessibility tree | Align this back-button component with the one used elsewhere (Android's default "Navigate up" `ImageButton`, then also fix F-12), or give it an explicit `accessibilityLabel="ត្រឡប់ក្រោយ"` (Back). | 0.25d (shared with F-06/F-12: one back-button component, 0.5d total for the three) |
| F-04 | 5. Level detail | The Level detail screen title is a mistranslation in `km.json` (`screen.level.header` = "ចំណងជើងរង", i.e. "subtitle", for "Levels"), for sighted and screen-reader users alike. | Major | `edtech-expo/src/locales/km.json:59`, `en.json:60` | Replace the `km.json` string; the right Khmer word needs a native speaker. | 0.1d + native speaker review |
| F-05 | 5. Level detail | Per-lesson step-status (done / current / locked) is shown only by dot colour; the row's accessible name lists step names but never their state. | Major | accessibility tree shows step names without state | Append per-step state to the row's `accessibilityLabel`, e.g. "សិក្សា (បានបញ្ចប់), អនុវត្ត (បន្ទាប់), តេស្ត (ជាប់សោ)" (done/next/locked), or expose each step dot as its own labelled element. | 0.5d |
| F-06 | 7 (indirectly), 8, 10 | Two structurally different, both-imperfect back-button implementations exist in the app (English "Navigate up" `ImageButton` vs. unlabelled icon-glyph `ViewGroup`). | Major | Two different back-button implementations: `ImageButton` with "Navigate up" vs icon-glyph `ViewGroup` | Consolidate on one back-button component app-wide with a Khmer `accessibilityLabel` (e.g. "ត្រឡប់ក្រោយ"), covering both the "Navigate up" and the raw-glyph variants (also closes F-12). | see F-03 |
| F-07 | 8. Practice, 10. Quiz | Selecting an MCQ option visibly moves the selection indicator, but the `RadioButton`'s `checked` attribute never becomes `true` (only its unrelated `selected` attribute does); TalkBack's checked/unchecked announcement for a `RadioButton` role relies on `checked`, so a screen-reader user likely gets no spoken confirmation of their selection. | Major | `RadioButton` checked attribute stays false, only selected attribute flips | Set `accessibilityState` with `checked: true/false` (and `accessibilityRole="radio"`/`checkable`) on the option component instead of (or in addition to) `selected`, so TalkBack announces "checked"/"not checked" per the platform's radio semantics. | 0.25d |
| F-08 | Login, Level detail, Profile, Result | Toggle-like controls with no exposed selected/checked state: the Login screen's English/Khmer language buttons never indicate which is active. (The bottom tab bar does this correctly via `selected`; see positive note in screen 15; so this is inconsistent within the app, not a universal gap.) | Minor | Language buttons lack selected/checked state in accessibility tree | Mirror the tab bar's pattern: set `selected`/`accessibilityState.selected` (or `checked`, matching whichever role is used) on the active language button. | 0.1d |
| F-09 | Level detail, Result, Profile | Several labels are duplicated in the accessibility tree; once via a container's `content-desc`, once via a child `TextView`'s own `text` (e.g. curriculum information chips, section labels). Both nodes are individually non-focusable, so the practical risk is a repeated word within one TalkBack utterance rather than two separate stops, but this was not confirmed by listening. | Minor | Duplicate content-desc and text in accessibility tree nodes | Set `importantForAccessibility="no"` on the inner duplicate `TextView` wherever a parent already carries the equivalent `content-desc`. | 0.25d |
| F-10 | 9. Wrong-answer popup | After dismissing the "try again" popup, no accessibility focus rectangle was visible on the next screenshot; focus may not land anywhere sensible (e.g. the first answer option) rather than being clearly re-anchored. Not confirmed by listening; could be a screenshot-timing artifact. | Minor | Focus not visible after popup dismissal | When the dialog closes, explicitly request accessibility focus onto a sensible element (e.g. the question card or first option). | 0.25d |
| F-11 | 10. Quiz | Screen header title is the bare English word "Quiz" with no Khmer, while the same concept is "តេស្ត" everywhere else in the app (section header, level-detail chip). | Minor | Header text = "Quiz" instead of "តេស្ត" | Localize the Quiz screen's header title to "តេស្ត" to match the rest of the app. | 0.05d |
| F-12 | Grade list, Module list, Level detail, Lesson list, Result | Back button's accessible name is the English word "Navigate up" in an otherwise fully-Khmer UI. | Minor | `content-desc="Navigate up"` in accessibility tree across multiple screens | Override the default back-button content description with a Khmer `accessibilityLabel` (e.g. "ត្រឡប់ក្រោយ"). | see F-03 |
| F-13 | 14. Logout | Logging out has no confirmation step, and the screenshot taken immediately after showed no accessibility focus on the resulting Login screen. Not confirmed by listening. | Minor | No focus rectangle visible on post-logout screenshot | Confirm with a real TalkBack listening pass whether the post-logout screen is announced; if not, request focus onto the Login screen's heading after logout completes. | 0.1d |
| F-14 | Profile | The Date of birth field shows no value and no "no answer" placeholder, unlike Phone which shows "មិនមានចម្លើយ" (No answer). A screen-reader user hears the label and then nothing. | Minor | Date of birth field shows no placeholder; Phone field shows "No answer" | Apply the same "no answer" placeholder pattern used for Phone to Date of birth (and any other optional profile field). | 0.1d |
| F-15 | All screens | Heading text (screen titles, section titles, the practice/quiz question card) never sets `accessibilityRole="header"` (static scan: the H1–H6 components in `src/components/texts/`, 25+ call sites); TalkBack's heading-navigation and "read from top" landmarks are absent. | Minor | H1/H2 components lack `accessibilityRole="header"` | Set `accessibilityRole="header"` in the H1/H2 text components (one change covers every screen) and on the practice question heading. | 0.5d |
| F-16 | 1. Login | The two Login text fields have no `accessibilityLabel` and rely on placeholder text; the default layout hardcodes English placeholders instead of a translated string; TalkBack reads a placeholder as the field's hint only while the field is empty. | Minor | `LoginScreen.tsx:229,235`, `AppTextField.tsx:238-255` | Add `accessibilityLabel` via `t('screen.login.emailPlaceholder')` / `t('screen.login.passwordPlaceholder')` (the existing km.json keys) on the AppTextField / CustomInput components. | 0.1d |
| F-17 | Code hygiene, not observed on device | 15+ `Image`/`ResourceImage` uses lack the `accessible` prop set to `false` (decorative logos, hero image, VideoControl button images, NavRail logo/avatar). React Native images are not focusable on Android unless made accessible, which is why the device audit found decorative images correctly hidden from the tree; the gap matters on iOS and for any future change to these components. **Not observable on Android with this audit's method**; flagged from the static scan only. | Minor | `LoginScreen.tsx`, `LevelSelectionScreen.tsx`, `VideoControl.tsx`, `NavRail.tsx` | Add `accessible={false}` to each decorative `Image`. | 0.5d |

Effort is an estimate in developer-days for remediation only (excludes the physical-device listening pass owed by F-10/F-13/the Method section).

Total ≈ 5.4 developer-days for all 17 items; ≈ 3.5 developer-days for the Blocker + Major set (F-01–F-07).

## What a remediation plan should prioritise

1. **F-01 / F-02 (Blocker), Lesson video player.** This is the only true Blocker found: a screen-reader user cannot play, pause, seek, or use fullscreen on the Learning step of every lesson, and cannot even tell what the one reachable control (close) does. Fixing this unblocks the single most content-heavy step of the learner path.

2. **F-07, MCQ selection state not exposed as checked.** Practice and Quiz are the two graded/interactive steps in every lesson; a user who cannot hear which answer they've picked before submitting is effectively guessing blind.

3. **F-03 / F-06, Unlabelled and inconsistent back buttons on Practice and Quiz.** These are two of three screens per lesson (with the video) and currently have the worst-labelled navigation control in the app.

4. **F-05, Missing step-status on Level detail.** Without this, a screen-reader user cannot tell what's already done versus what's next, which is central to navigating the curriculum independently.

5. **F-04, Level detail header is a mistranslated string.** Affects orientation for all users, worse for screen-reader users who lean more heavily on titles.

6. **F-15, Headings not exposed to TalkBack's navigation.** Screen titles, section titles, and the question card never set `accessibilityRole="header"`; fixing the shared H1/H2 components helps orientation across every screen for one small, app-wide change.

7. Everything else (F-08 through F-14, F-16, F-17) is Minor polish: language consistency (back button and Quiz-title English leakage), duplicate announcements, missing "no answer" placeholder, unlabelled Login fields (F-16), decorative images with missing `accessible` props (F-17, not observable on Android with this audit's method), and the two "could not fully verify by listening" items (F-10 popup-dismiss focus, F-13 post-logout focus) that are worth a quick real-device TalkBack listening pass to confirm one way or the other.
