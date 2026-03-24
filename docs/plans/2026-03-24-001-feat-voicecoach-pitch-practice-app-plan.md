---
title: "feat: VoiceCoach Pitch Practice App"
type: feat
status: active
date: 2026-03-24
origin: docs/brainstorms/2026-03-23-voicecoach-requirements.md
---

# feat: VoiceCoach Pitch Practice App

## Overview

A mobile-first PWA that helps users with vocal granuloma recovery by providing real-time visual pitch feedback during daily speaking practice. Users read words from their own word list while a scrolling waveform shows whether their pitch stays within a calibrated target zone.

## Problem Statement

Vocal granuloma recovery requires consistent daily pitch practice. Users need to retrain their speaking habits to stay within a safe frequency range that spares the vocal cords. There is no simple, focused tool that provides instant visual feedback during this practice. (see origin: docs/brainstorms/2026-03-23-voicecoach-requirements.md)

## Proposed Solution

A client-side PWA built with **Svelte 5 + Vite** that uses the **Web Audio API** with an **AudioWorklet** for real-time pitch detection via the **pitchy** library (McLeod Pitch Method). A **Canvas 2D** scrolling waveform provides live visual feedback with a highlighted target zone band.

## Technical Approach

### Architecture

```
Main Thread (Svelte UI + Canvas rendering)
  └── AudioContext { sampleRate: hardware default, latencyHint: 0 }
        └── MediaStreamSource (getUserMedia)
              └── AudioWorkletNode ("pitch-accumulator")
                    │  Ring buffer: accumulates 128-sample blocks
                    │  postMessage every 2048 samples (~46ms)
                    └── Main thread receives { hz, clarity }
                          └── Gate: clarity > 0.9
                          └── Canvas rAF loop draws pitch point
```

**Key technical decisions:**
- **pitchy v4.x** (MPM algorithm) — actively maintained, returns clarity score for confidence gating, ESM-compatible
- **AudioWorklet** (not deprecated ScriptProcessorNode) — runs on dedicated audio thread
- **Canvas 2D** with `drawImage(canvas, -1, 0)` self-copy scrolling — best mobile performance/battery for this scale
- **2048-sample analysis window** at hardware sample rate (~46ms at 44.1kHz) — well within <100ms latency budget
- **50% overlap** (1024-sample hop) for smoother pitch curve output (~23ms refresh)
- **localStorage** for all persistence (calibration data, word list, settings)

### Screen Map

```
[Onboarding]          [Home/Ready]         [Practice Session]      [Session Complete]
 Step 1: Word List --> Ready to Start  --> Waveform + Word      --> "Session Complete"
 Step 2: Calibrate     - Start button      - Countdown timer        - Done button
 Step 3: Confirm Hz    - Duration picker   - Pause button           --> Home
                       - Edit word list    - Current word (large)
                       - Recalibrate       - Tap to advance
```

Six screens total:
1. **Onboarding / Setup** — guided steps: word list entry -> calibration -> confirm range
2. **Home / Ready** — start button, duration picker, access to word list and recalibration
3. **Calibration** — 15-second recording with live mic indicator
4. **Calibration Confirm** — shows detected Hz range, "Use this" / "Recalibrate" buttons
5. **Practice Session** — waveform canvas, current word, countdown, pause button
6. **Session Complete** — brief confirmation, "Done" button

### Implementation Phases

#### Phase 1: Project Scaffold + Audio Pipeline

Set up the project and get real-time pitch detection working in the browser.

- [ ] `npm create vite@latest . -- --template svelte-ts` in VoiceCoach directory
- [ ] Install dependencies: `pitchy`, `vite-plugin-pwa`
- [ ] Configure `vite.config.ts` with Svelte + PWA plugin (`registerType: 'prompt'`)
- [ ] Create `public/audio-processor.worklet.js` — ring buffer accumulating 128-sample blocks, posts 2048-sample windows to main thread
- [ ] Create `src/audio/MicInput.ts` — `getUserMedia` with `{ echoCancellation: false, noiseSuppression: false, autoGainControl: false, channelCount: 1 }`
- [ ] Create `src/audio/PitchDetector.ts` — connects AudioWorklet, runs pitchy on received buffers, emits `{ hz: number, clarity: number }` events
- [ ] Create `src/audio/pitchMath.ts` — Hz to canvas Y coordinate mapping
- [ ] Verify pitch detection works on iOS Safari and Android Chrome with a simple debug display

**Acceptance criteria:**
- [ ] Mic access works on mobile browsers (iOS Safari, Android Chrome)
- [ ] Pitch values update at ~40-60Hz with <100ms perceived latency
- [ ] Clarity gating at 0.9 suppresses noise/silence

#### Phase 2: Canvas Waveform Visualization

Build the real-time scrolling pitch waveform with target zone overlay.

- [ ] Create `src/canvas/WaveformRenderer.ts` — Canvas 2D context with `{ alpha: false, desynchronized: true }`
- [ ] Implement scrolling via `drawImage(canvas, -1, 0)` self-copy pattern (paint only new rightmost column each frame)
- [ ] Draw target zone as a semi-transparent green horizontal band
- [ ] Color pitch line green when in target zone, red/orange when out of range (R3, R4)
- [ ] Cap `devicePixelRatio` at 2 to prevent over-rendering on 3x/4x mobile screens
- [ ] Use `requestAnimationFrame` with delta-time; cap at 60fps
- [ ] CSS: `transform: translateZ(0); will-change: transform;` on canvas element
- [ ] Create `src/components/PitchCanvas.svelte` — mounts canvas, manages renderer lifecycle

**Acceptance criteria:**
- [ ] Waveform scrolls smoothly at 60fps on mid-range mobile devices
- [ ] Target zone band clearly visible
- [ ] In-range vs out-of-range pitch is immediately distinguishable by color

#### Phase 3: Core App Screens + Word List

Build the UI screens, word list management, and session flow.

- [ ] Create `src/store/settings.ts` — Svelte persisted stores synced to localStorage:
  - `targetPitchRange: { low: number, high: number }` (Hz)
  - `wordList: string[]`
  - `sessionDuration: number` (minutes)
- [ ] Create `src/components/WordListEditor.svelte` — textarea input, one entry per line (words or short phrases), auto-saves to localStorage
- [ ] Create `src/components/Onboarding.svelte` — step-by-step: (1) paste word list, (2) calibrate, (3) confirm range
- [ ] Create `src/components/Home.svelte` — start button, duration picker (2/5/10 min), links to edit word list and recalibrate
- [ ] Create `src/components/SessionComplete.svelte` — "Session complete" text + "Done" button
- [ ] Gate "Start" button: require both word list (min 1 entry) and calibration before enabling

**Acceptance criteria:**
- [ ] First-time user guided through setup before first session
- [ ] Word list persists across app restarts
- [ ] Duration selection works (2, 5, 10 minutes)

#### Phase 4: Practice Session Flow

Wire everything together into the complete practice session.

- [ ] Create `src/components/Session.svelte` — orchestrates: word display, waveform, timer, controls
- [ ] Large word display (current word from list, centered, large font)
- [ ] Tap-to-advance: tap anywhere on word area to move to next word; loop to beginning when list exhausted
- [ ] Countdown timer display (mm:ss); pause button pauses timer + mic processing
- [ ] On timer expiry: stop mic, navigate to Session Complete screen
- [ ] On app backgrounding (Page Visibility API): auto-pause session, show resume prompt on return
- [ ] Handle mic permission denial gracefully: show clear error with instructions to enable in device settings

**Acceptance criteria:**
- [ ] Complete 5-minute session works end-to-end on mobile
- [ ] Pause/resume works correctly (timer pauses, mic stops/restarts)
- [ ] Word list loops seamlessly
- [ ] App backgrounding pauses session cleanly

#### Phase 5: Calibration Flow

Build the 15-second calibration with confirmation.

- [ ] Create `src/components/Calibration.svelte` — 15-second recording with progress indicator
- [ ] Collect pitch samples during calibration, filter by clarity > 0.9
- [ ] Derive target band: compute median F0, set range to median +/- 15% (configurable)
- [ ] Reject calibration if fewer than 30 valid samples (user wasn't speaking enough)
- [ ] Create `src/components/CalibrationConfirm.svelte` — shows "Your range: X-Y Hz", "Use this" / "Recalibrate" buttons
- [ ] Save confirmed range to localStorage
- [ ] Accessible from onboarding flow and from home screen (recalibrate)

**Acceptance criteria:**
- [ ] 15-second calibration produces a plausible Hz range for human speech (70-400 Hz)
- [ ] Bad calibrations (noisy room, silence) are rejected with clear feedback
- [ ] User sees and confirms the range before it's saved

#### Phase 6: PWA + Polish

Make it installable, offline-capable, and production-ready.

- [ ] Configure `manifest.json` via vite-plugin-pwa: name, icons (192px + 512px + maskable), display: standalone, orientation: portrait
- [ ] Verify offline functionality (all assets cached by service worker)
- [ ] Add "New version available" prompt (registerType: 'prompt') — never auto-reload mid-session
- [ ] Handle iOS Safari standalone PWA mic quirks: detect `navigator.standalone`, show fallback if getUserMedia fails
- [ ] Test on iOS Safari, Android Chrome, desktop Chrome
- [ ] Add debounce on tap-to-advance (prevent accidental multi-tap skipping)
- [ ] Responsive layout: works on small phones (320px wide) through tablets

**Acceptance criteria:**
- [ ] App installable to home screen on iOS and Android
- [ ] Works fully offline after first load
- [ ] No mid-session disruptions from service worker updates

## System-Wide Impact

Greenfield app — no existing systems affected.

- **Microphone permission**: Single most common failure point on mobile. Must handle denial, revocation, and iOS Safari quirks as first-class concerns.
- **Battery/performance**: AudioWorklet + Canvas animation running simultaneously is the heaviest workload. Keep worklet code minimal (ring buffer only), cap canvas DPR at 2, use rAF with frame skipping.
- **iOS Safari AudioContext**: Must be created/resumed inside a user gesture (tap). Cannot be created on page load.

## Acceptance Criteria

### Functional Requirements
- [ ] User can enter/edit their word list (one entry per line)
- [ ] 15-second calibration derives a target pitch range and shows it for confirmation
- [ ] Practice session displays one word at a time with tap-to-advance (loops when exhausted)
- [ ] Live scrolling waveform with green target zone band updates in real time
- [ ] Out-of-range pitch shown in red/orange, in-range in green
- [ ] Adjustable session duration (2, 5, 10 minutes) with visible countdown
- [ ] Pause/resume mid-session
- [ ] "Session complete" screen shown when timer expires
- [ ] First-time onboarding guides user through word list + calibration before first session

### Non-Functional Requirements
- [ ] Pitch detection latency <100ms end-to-end
- [ ] Canvas rendering at 60fps on mid-range mobile devices
- [ ] Works offline after first load (PWA)
- [ ] Installable to home screen (iOS + Android)
- [ ] All data persisted in localStorage (no backend)

## Dependencies & Risks

| Risk | Mitigation |
|---|---|
| iOS Safari getUserMedia fails in standalone PWA mode | Detect `navigator.standalone`, show fallback with instructions |
| Pitch detection unreliable in noisy environments | Clarity threshold (0.9) gates out bad detections; calibration rejects insufficient samples |
| AudioWorklet not supported on old browsers | AudioWorklet is supported in all modern browsers since 2021; set minimum browser requirement |
| localStorage unavailable in private browsing (iOS) | Detect and warn user; app still works for single session but won't persist |

## Tech Stack Summary

| Component | Choice | Rationale |
|---|---|---|
| Framework | Svelte 5 + Vite | ~2KB runtime, compiles to vanilla JS, reactive stores ideal for audio state |
| Pitch detection | pitchy v4.x (MPM) | Actively maintained, clarity score, ESM, accurate for speech |
| Audio pipeline | AudioWorklet + Web Audio API | Off-main-thread, replaces deprecated ScriptProcessorNode |
| Visualization | Canvas 2D | Best mobile perf/battery for single-line scrolling waveform |
| PWA tooling | vite-plugin-pwa (Workbox) | Industry standard, handles manifest + service worker |
| Persistence | localStorage | Zero dependencies, fully offline |
| Hosting | Static (Vercel/Netlify/CF Pages) | HTTPS required for mic access; any static host works |

## Project Structure

```
VoiceCoach/
  public/
    audio-processor.worklet.js    # AudioWorklet (unbundled, loaded via addModule)
    icons/
      icon-192.png
      icon-512.png
  src/
    main.ts                       # Entry point
    App.svelte                    # Root component, router
    audio/
      MicInput.ts                 # getUserMedia setup
      PitchDetector.ts            # AudioWorklet bridge, pitchy integration
      pitchMath.ts                # Hz utilities
    canvas/
      WaveformRenderer.ts         # Canvas 2D scrolling draw loop
    store/
      settings.ts                 # Persisted Svelte stores (localStorage)
    components/
      Onboarding.svelte           # First-time setup flow
      Home.svelte                 # Ready screen with start button
      Calibration.svelte          # 15s calibration recording
      CalibrationConfirm.svelte   # Show Hz range, confirm/recalibrate
      Session.svelte              # Practice session orchestrator
      PitchCanvas.svelte          # Canvas element + renderer lifecycle
      WordListEditor.svelte       # Textarea word list input
      SessionComplete.svelte      # End-of-session confirmation
  vite.config.ts
  tsconfig.json
  package.json
```

## Sources & References

### Origin

- **Origin document:** [docs/brainstorms/2026-03-23-voicecoach-requirements.md](docs/brainstorms/2026-03-23-voicecoach-requirements.md) — Key decisions carried forward: PWA over native, calibration over manual Hz, live waveform visualization, practice-only (no tracking), tap-to-advance, user-provided word list, visual-only feedback

### External References

- [pitchy (MPM pitch detection)](https://github.com/ianprime0509/pitchy) — primary pitch detection library
- [AudioWorklet Design Pattern — Chrome DevRel](https://developer.chrome.com/blog/audio-worklet-design-pattern/) — ring buffer pattern for AudioWorklet
- [Canvas optimization — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas) — self-copy scrolling technique
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/guide/) — PWA setup with Vite
- [iOS Safari getUserMedia quirks — WebKit Bug #185448](https://bugs.webkit.org/show_bug.cgi?id=185448) — standalone PWA mic issues

### Platform Gotchas (from research)

- **iOS Safari**: AudioContext must be resumed from user gesture; getUserMedia may fail silently in standalone PWA mode; mic permissions are session-scoped; disable noiseSuppression/echoCancellation
- **Android Chrome**: Sample rate always 48000 Hz; pass `latencyHint: 0`; disable echoCancellation/noiseSuppression/autoGainControl; throttles background tabs
- **AudioWorklet**: TextDecoder/TextEncoder not available in AudioWorkletGlobalScope — keep worklet code as pure JS, no wasm-bindgen
