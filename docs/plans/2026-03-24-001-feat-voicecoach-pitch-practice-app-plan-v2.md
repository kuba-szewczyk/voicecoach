---
title: "feat: VoiceCoach Pitch & Effort Practice App"
type: feat
status: active
date: 2026-03-24
origin: docs/brainstorms/2026-03-23-voicecoach-requirements.md
---

# feat: VoiceCoach Pitch & Effort Practice App

## Overview

A mobile-first PWA that helps users with vocal granuloma recovery by providing real-time visual feedback on **two dimensions** during daily speaking practice: **pitch (F0)** and **vocal effort (H1-H2 spectral balance)**. Users read words from their own word list while a scrolling waveform shows whether their pitch stays within a calibrated target zone, and a separate effort gauge shows whether they are phonating with relaxed, easy voice production versus pressed/strained voice. The combination targets the core therapeutic goal: speaking at a comfortable pitch with minimal laryngeal tension.

## Problem Statement

Vocal granuloma recovery requires consistent daily practice to retrain speaking habits. The therapeutic goal has two dimensions:

1. **Pitch range** - staying within a safe frequency range that avoids vocal fry (too low) and strain (too high)
2. **Vocal effort** - using relaxed, easy phonation rather than pressed/tense voice production

Pitch alone is insufficient because a user can hit the correct frequency while still straining. The perceived phonatory effort scale (1-10) used in voice therapy maps to measurable acoustic properties - specifically the balance between the first and second harmonics (H1-H2). There is no simple, focused tool that provides instant visual feedback on both dimensions during practice. (see origin: docs/brainstorms/2026-03-23-voicecoach-requirements.md)

## Clinical Basis

### Why two metrics matter

Contact granulomas form on the vocal processes of the arytenoid cartilages. Two mechanical factors drive irritation:

- **Pitch extremes** (especially vocal fry) cause the arytenoids to slam together with excessive force
- **Pressed phonation** (high vocal effort) increases medial compression of the vocal folds, raising collision forces even at normal pitch

Voice therapy addresses both by training easy onset, relaxed projection, and comfortable pitch. A biofeedback tool should reflect both dimensions.

### H1-H2 as an effort proxy

**H1-H2** is the amplitude difference (in dB) between the first harmonic (at F0) and the second harmonic (at 2*F0) of the voice signal.

- **Higher H1-H2 (positive, e.g. +5 to +15 dB)** - breathy or easy phonation. The vocal folds are closing gently, with less complete closure per cycle. Most energy stays in the fundamental.
- **Lower H1-H2 (near zero or negative)** - pressed phonation. The vocal folds snap shut forcefully, producing stronger higher harmonics. Energy is distributed more evenly across the spectrum.

This is well-established in voice science literature (Hillenbrand et al., Kreiman & Gerratt, etc.) and is used clinically in tools like Praat for voice quality assessment.

For this app, we don't need clinical-grade precision. We need a **relative indicator** - "more relaxed than your baseline" vs "more pressed than your baseline" - calibrated to the individual user's voice during their easy phonation. This is achievable with an FFT on the same audio buffer already being captured for pitch detection.

### What the app does NOT replace

This app is a practice aid, not a diagnostic tool. It does not replace evaluation by a speech-language pathologist or ENT. Users should validate their calibration baseline and target zones with their voice coach. The effort indicator shows relative trends, not absolute clinical measurements.

## Proposed Solution

A client-side PWA built with **Svelte 5 + Vite** that uses the **Web Audio API** with an **AudioWorklet** for real-time audio capture. The main thread runs:

- **pitchy** (McLeod Pitch Method) for F0 detection
- **FFT-based harmonic analysis** for H1-H2 effort estimation

A **Canvas 2D** scrolling waveform provides live pitch feedback with a target zone band, and a separate **effort gauge** (vertical bar or arc) shows real-time vocal effort level relative to the user's calibrated easy-phonation baseline.

## Technical Approach

### Architecture

```
Main Thread (Svelte UI + Canvas rendering)
  └── AudioContext { sampleRate: hardware default, latencyHint: 0 }
        └── MediaStreamSource (getUserMedia)
              └── AudioWorkletNode ("pitch-accumulator")
                    │  Ring buffer: accumulates 128-sample blocks
                    │  postMessage every 2048 samples (~46ms)
                    └── Main thread receives Float32Array (raw samples)
                          ├── pitchy: F0 + clarity
                          │     └── Gate: clarity > 0.9
                          ├── FFT (built-in AnalyserNode or manual):
                          │     ├── Find H1 amplitude at F0
                          │     ├── Find H2 amplitude at 2*F0
                          │     └── Compute H1-H2 (dB)
                          └── Canvas rAF loop draws:
                                ├── Pitch waveform (scrolling, with target band)
                                └── Effort gauge (H1-H2 relative to baseline)
```

### Dual-metric feedback model

The app provides a combined "on target" signal from two independent measurements:

| Metric | What it measures | How it's displayed | Target zone |
|---|---|---|---|
| **Pitch (F0)** | Fundamental frequency in Hz | Scrolling waveform with horizontal band | Calibrated range (median +/- 15%) |
| **Effort (H1-H2)** | Harmonic balance as effort proxy | Vertical gauge beside waveform | Calibrated baseline +/- threshold |

Both metrics must be in range for the overall feedback to show "on target." This prevents the failure mode where pitch is correct but effort is high (or vice versa).

### H1-H2 computation approach

Given that pitchy already provides F0, the effort computation piggybacks on the same audio buffer:

1. Run an FFT on the 2048-sample window (using `AnalyserNode.getFloatFrequencyData()` or a manual FFT)
2. Convert F0 to a bin index: `bin = Math.round(f0 / (sampleRate / fftSize))`
3. Find H1 amplitude: peak magnitude in bins around `bin` (+/- 2 bins)
4. Find H2 amplitude: peak magnitude in bins around `2 * bin` (+/- 2 bins)
5. Compute `h1h2 = H1_dB - H2_dB`
6. Compare to calibrated baseline

**FFT size**: 4096 bins at 44.1kHz gives ~10.7 Hz resolution, sufficient to resolve H1 and H2 for any F0 above ~80 Hz. At 48kHz, resolution is ~11.7 Hz. For typical male speech (100-150 Hz), H1 and H2 are well-separated at this resolution. For higher-pitched voices, H1 and H2 are further apart and even easier to resolve.

**Smoothing**: H1-H2 is noisier than F0 frame-to-frame. Apply a simple exponential moving average (EMA) with alpha ~0.15 (roughly 150ms effective window) to smooth the effort gauge without adding perceptible lag.

**Key technical decisions:**
- **pitchy v4.x** (MPM algorithm) - actively maintained, returns clarity score for confidence gating, ESM-compatible
- **AnalyserNode** for FFT - built into Web Audio API, zero dependencies, runs efficiently alongside pitch detection
- **AudioWorklet** (not deprecated ScriptProcessorNode) - runs on dedicated audio thread
- **Canvas 2D** with `drawImage(canvas, -1, 0)` self-copy scrolling - best mobile performance/battery for this scale
- **2048-sample analysis window** at hardware sample rate (~46ms at 44.1kHz) - well within <100ms latency budget
- **50% overlap** (1024-sample hop) for smoother pitch curve output (~23ms refresh)
- **4096-point FFT** for harmonic analysis - sufficient frequency resolution for H1-H2 at speech frequencies
- **localStorage** for all persistence (calibration data, word list, settings)

### Screen Map

```
[Onboarding]           [Home/Ready]         [Practice Session]        [Session Complete]
 Step 1: Word List  --> Ready to Start  --> Waveform + Effort Gauge --> "Session Complete"
 Step 2: Calibrate      - Start button      + Word Display              - Done button
 Step 3: Confirm        - Duration picker   - Countdown timer           --> Home
                        - Edit word list    - Pause button
                        - Recalibrate       - Current word (large)
                                            - Tap to advance
```

Seven screens total:
1. **Onboarding / Setup** - guided steps: word list entry -> calibration -> confirm targets
2. **Home / Ready** - start button, duration picker, access to word list and recalibration
3. **Calibration** - 20-second recording (increased from 15s to capture enough data for both metrics) with live mic indicator and coaching prompt ("Read a few words in your easy, relaxed voice")
4. **Calibration Confirm** - shows detected pitch range AND effort baseline, "Use this" / "Recalibrate" buttons
5. **Practice Session** - waveform canvas + effort gauge, current word, countdown, pause button
6. **Session Complete** - brief confirmation, "Done" button
7. **Help / Reference** - brief explanation of what the pitch and effort indicators mean (accessible from home screen)

### Implementation Phases

#### Phase 1: Project Scaffold + Audio Pipeline

Set up the project and get real-time pitch detection AND harmonic analysis working in the browser.

- [ ] `npm create vite@latest . -- --template svelte-ts` in VoiceCoach directory
- [ ] Install dependencies: `pitchy`, `vite-plugin-pwa`
- [ ] Configure `vite.config.ts` with Svelte + PWA plugin (`registerType: 'prompt'`)
- [ ] Create `public/audio-processor.worklet.js` - ring buffer accumulating 128-sample blocks, posts 2048-sample windows to main thread
- [ ] Create `src/audio/MicInput.ts` - `getUserMedia` with `{ echoCancellation: false, noiseSuppression: false, autoGainControl: false, channelCount: 1 }`, creates AnalyserNode (fftSize: 4096) in the audio graph
- [ ] Create `src/audio/PitchDetector.ts` - connects AudioWorklet, runs pitchy on received buffers, emits `{ hz: number, clarity: number }` events
- [ ] Create `src/audio/EffortAnalyser.ts` - reads FFT data from AnalyserNode, computes H1-H2 given current F0, applies EMA smoothing (alpha: 0.15), emits `{ h1h2: number, valid: boolean }` events. `valid` is false when F0 is unknown or clarity is below threshold.
- [ ] Create `src/audio/pitchMath.ts` - Hz to canvas Y coordinate mapping, Hz to FFT bin index, dB utilities
- [ ] Verify both pitch detection and H1-H2 output work on iOS Safari and Android Chrome with a simple debug display showing raw values

**Acceptance criteria:**
- [ ] Mic access works on mobile browsers (iOS Safari, Android Chrome)
- [ ] Pitch values update at ~40-60Hz with <100ms perceived latency
- [ ] Clarity gating at 0.9 suppresses noise/silence
- [ ] H1-H2 values are plausible for speech (typically +2 to +15 dB for easy voice, -2 to +5 for pressed)
- [ ] H1-H2 smoothing produces a stable, readable signal without excessive lag

#### Phase 2: Canvas Waveform + Effort Gauge Visualization

Build the real-time scrolling pitch waveform with target zone overlay AND the effort gauge.

- [ ] Create `src/canvas/WaveformRenderer.ts` - Canvas 2D context with `{ alpha: false, desynchronized: true }`
- [ ] Implement scrolling via `drawImage(canvas, -1, 0)` self-copy pattern (paint only new rightmost column each frame)
- [ ] Draw target zone as a semi-transparent green horizontal band
- [ ] Color pitch line green when in target zone, red/orange when out of range
- [ ] Cap `devicePixelRatio` at 2 to prevent over-rendering on 3x/4x mobile screens
- [ ] Use `requestAnimationFrame` with delta-time; cap at 60fps
- [ ] CSS: `transform: translateZ(0); will-change: transform;` on canvas element
- [ ] Create `src/canvas/EffortGaugeRenderer.ts` - vertical bar or arc gauge showing current H1-H2 relative to calibrated baseline:
  - Green zone in the middle (easy phonation, near baseline)
  - Orange/red at bottom (pressed/tense - H1-H2 too low)
  - Light blue/grey at top (too breathy - H1-H2 very high, optional gentle indicator)
  - Smooth animated needle/fill responding to EMA-smoothed H1-H2
- [ ] Create `src/components/PitchCanvas.svelte` - mounts canvas, manages renderer lifecycle
- [ ] Create `src/components/EffortGauge.svelte` - mounts effort gauge canvas/SVG
- [ ] Create `src/components/CombinedIndicator.svelte` - small overall status icon (checkmark/X) that is green only when BOTH pitch and effort are in range

**Acceptance criteria:**
- [ ] Waveform scrolls smoothly at 60fps on mid-range mobile devices
- [ ] Target zone band clearly visible
- [ ] In-range vs out-of-range pitch is immediately distinguishable by color
- [ ] Effort gauge is readable at a glance without distracting from the word display
- [ ] Combined indicator clearly communicates "both good" vs "something off"

#### Phase 3: Core App Screens + Word List

Build the UI screens, word list management, and session flow.

- [ ] Create `src/store/settings.ts` - Svelte persisted stores synced to localStorage:
  - `targetPitchRange: { low: number, high: number }` (Hz)
  - `effortBaseline: { h1h2Mean: number, h1h2Std: number }` (dB) - calibrated easy-phonation H1-H2
  - `effortThreshold: number` (dB, default: 1.5 * std) - how far from baseline before "out of range"
  - `wordList: string[]`
  - `sessionDuration: number` (minutes)
- [ ] Create `src/components/WordListEditor.svelte` - textarea input, one entry per line (words or short phrases), auto-saves to localStorage
- [ ] Create `src/components/Onboarding.svelte` - step-by-step: (1) paste word list, (2) calibrate with easy voice, (3) confirm pitch range + effort baseline
- [ ] Create `src/components/Home.svelte` - start button, duration picker (2/5/10 min), links to edit word list, recalibrate, and help screen
- [ ] Create `src/components/SessionComplete.svelte` - "Session complete" text + "Done" button
- [ ] Create `src/components/Help.svelte` - brief plain-language explanation: what the pitch waveform shows, what the effort gauge shows, what "on target" means, and a reminder that this is a practice aid (not medical diagnosis)
- [ ] Gate "Start" button: require both word list (min 1 entry) and calibration before enabling

**Acceptance criteria:**
- [ ] First-time user guided through setup before first session
- [ ] Word list persists across app restarts
- [ ] Duration selection works (2, 5, 10 minutes)
- [ ] Effort baseline stored alongside pitch range in localStorage

#### Phase 4: Practice Session Flow

Wire everything together into the complete practice session.

- [ ] Create `src/components/Session.svelte` - orchestrates: word display, waveform, effort gauge, timer, controls
- [ ] Layout: word display (top, large font) -> waveform canvas (middle, ~50% height) with effort gauge (right side strip) -> timer + pause (bottom)
- [ ] Large word display (current word from list, centered, large font)
- [ ] Tap-to-advance: tap anywhere on word area to move to next word; loop to beginning when list exhausted
- [ ] Countdown timer display (mm:ss); pause button pauses timer + mic processing
- [ ] On timer expiry: stop mic, navigate to Session Complete screen
- [ ] On app backgrounding (Page Visibility API): auto-pause session, show resume prompt on return
- [ ] Handle mic permission denial gracefully: show clear error with instructions to enable in device settings

**Acceptance criteria:**
- [ ] Complete 5-minute session works end-to-end on mobile
- [ ] Both pitch waveform and effort gauge update in real time during session
- [ ] Pause/resume works correctly (timer pauses, mic stops/restarts, both visualizations freeze/resume)
- [ ] Word list loops seamlessly
- [ ] App backgrounding pauses session cleanly

#### Phase 5: Calibration Flow

Build the 20-second calibration that captures both pitch range and effort baseline.

- [ ] Create `src/components/Calibration.svelte` - 20-second recording with progress indicator and coaching text: "Read a few of your words in your comfortable, relaxed voice - the way your voice coach showed you"
- [ ] Collect pitch samples during calibration, filter by clarity > 0.9
- [ ] Simultaneously collect H1-H2 samples for each valid pitch frame
- [ ] Derive pitch target band: compute median F0, set range to median +/- 15% (configurable)
- [ ] Derive effort baseline: compute mean and standard deviation of H1-H2 during calibration
- [ ] Set effort threshold: mean +/- (1.5 * std) as default "in range" zone (configurable)
- [ ] Reject calibration if fewer than 50 valid samples (increased from 30 - need enough for reliable H1-H2 stats)
- [ ] Create `src/components/CalibrationConfirm.svelte` - shows:
  - "Your pitch range: X - Y Hz"
  - "Your effort baseline: Z dB" (with plain-language label: "This is what your relaxed voice sounds like")
  - "Use this" / "Recalibrate" buttons
- [ ] Save confirmed range and effort baseline to localStorage
- [ ] Accessible from onboarding flow and from home screen (recalibrate)

**Acceptance criteria:**
- [ ] 20-second calibration produces a plausible Hz range for human speech (70-400 Hz)
- [ ] H1-H2 baseline is plausible (typically +3 to +12 dB for easy phonation)
- [ ] Bad calibrations (noisy room, silence) are rejected with clear feedback
- [ ] User sees and confirms both pitch range and effort baseline before they're saved

#### Phase 6: PWA + Polish

Make it installable, offline-capable, and production-ready.

- [ ] Configure `manifest.json` via vite-plugin-pwa: name, icons (192px + 512px + maskable), display: standalone, orientation: portrait
- [ ] Verify offline functionality (all assets cached by service worker)
- [ ] Add "New version available" prompt (registerType: 'prompt') - never auto-reload mid-session
- [ ] Handle iOS Safari standalone PWA mic quirks: detect `navigator.standalone`, show fallback if getUserMedia fails
- [ ] Test on iOS Safari, Android Chrome, desktop Chrome
- [ ] Add debounce on tap-to-advance (prevent accidental multi-tap skipping)
- [ ] Responsive layout: works on small phones (320px wide) through tablets
- [ ] Ensure effort gauge is sized appropriately on small screens (compact but readable)
- [ ] Verify AnalyserNode + AudioWorklet coexist without issues on all target browsers

**Acceptance criteria:**
- [ ] App installable to home screen on iOS and Android
- [ ] Works fully offline after first load
- [ ] No mid-session disruptions from service worker updates

## System-Wide Impact

Greenfield app - no existing systems affected.

- **Microphone permission**: Single most common failure point on mobile. Must handle denial, revocation, and iOS Safari quirks as first-class concerns.
- **Battery/performance**: AudioWorklet + AnalyserNode + Canvas animation running simultaneously is the heaviest workload. Keep worklet code minimal (ring buffer only), cap canvas DPR at 2, use rAF with frame skipping. The AnalyserNode FFT adds negligible overhead since it runs natively in the browser's audio engine.
- **iOS Safari AudioContext**: Must be created/resumed inside a user gesture (tap). Cannot be created on page load.
- **H1-H2 accuracy**: This is a relative measure calibrated to the user's own baseline, not an absolute clinical measurement. Environmental noise and microphone quality will affect readings. The clarity gate and EMA smoothing mitigate this, but users should calibrate in a quiet environment.

## Acceptance Criteria

### Functional Requirements
- [ ] User can enter/edit their word list (one entry per line)
- [ ] 20-second calibration derives both a target pitch range and an effort baseline, and shows them for confirmation
- [ ] Practice session displays one word at a time with tap-to-advance (loops when exhausted)
- [ ] Live scrolling waveform with green target zone band updates in real time
- [ ] Out-of-range pitch shown in red/orange, in-range in green
- [ ] Live effort gauge shows vocal effort relative to calibrated baseline
- [ ] Effort gauge shows green when near baseline (easy phonation), orange/red when pressed
- [ ] Combined "on target" indicator requires both pitch and effort to be in range
- [ ] Adjustable session duration (2, 5, 10 minutes) with visible countdown
- [ ] Pause/resume mid-session
- [ ] "Session complete" screen shown when timer expires
- [ ] First-time onboarding guides user through word list + calibration before first session
- [ ] Help screen explains what the pitch and effort indicators mean in plain language

### Non-Functional Requirements
- [ ] Pitch detection latency <100ms end-to-end
- [ ] H1-H2 effort indicator updates within ~150ms (smoothed)
- [ ] Canvas rendering at 60fps on mid-range mobile devices
- [ ] Works offline after first load (PWA)
- [ ] Installable to home screen (iOS + Android)
- [ ] All data persisted in localStorage (no backend)

## Dependencies & Risks

| Risk | Mitigation |
|---|---|
| iOS Safari getUserMedia fails in standalone PWA mode | Detect `navigator.standalone`, show fallback with instructions |
| Pitch detection unreliable in noisy environments | Clarity threshold (0.9) gates out bad detections; calibration rejects insufficient samples |
| H1-H2 noisy or unreliable on low-quality phone mics | EMA smoothing, relative-to-baseline comparison (not absolute), wider threshold for low-SNR environments |
| H1-H2 inaccurate for very high-pitched voices (F0 > 300 Hz) | At high F0, harmonics are widely spaced and well-resolved by 4096-point FFT; less of a concern than low F0 |
| User calibrates in noisy environment, gets bad effort baseline | Reject calibration with insufficient valid samples; coaching text prompts quiet environment |
| AudioWorklet not supported on old browsers | AudioWorklet is supported in all modern browsers since 2021; set minimum browser requirement |
| localStorage unavailable in private browsing (iOS) | Detect and warn user; app still works for single session but won't persist |
| AnalyserNode + AudioWorklet coexistence | Both connect to the same MediaStreamSource; this is a standard Web Audio graph pattern, well-supported |

## Tech Stack Summary

| Component | Choice | Rationale |
|---|---|---|
| Framework | Svelte 5 + Vite | ~2KB runtime, compiles to vanilla JS, reactive stores ideal for audio state |
| Pitch detection | pitchy v4.x (MPM) | Actively maintained, clarity score, ESM, accurate for speech |
| Effort analysis | AnalyserNode (Web Audio API) + manual H1-H2 extraction | Zero dependencies, native FFT, runs in browser audio engine |
| Audio pipeline | AudioWorklet + Web Audio API | Off-main-thread, replaces deprecated ScriptProcessorNode |
| Visualization | Canvas 2D | Best mobile perf/battery for scrolling waveform + gauge |
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
      MicInput.ts                 # getUserMedia setup + AnalyserNode creation
      PitchDetector.ts            # AudioWorklet bridge, pitchy integration
      EffortAnalyser.ts           # FFT-based H1-H2 extraction + EMA smoothing
      pitchMath.ts                # Hz utilities, FFT bin mapping, dB conversion
    canvas/
      WaveformRenderer.ts         # Canvas 2D scrolling pitch draw loop
      EffortGaugeRenderer.ts      # Effort gauge (vertical bar or arc)
    store/
      settings.ts                 # Persisted Svelte stores (localStorage)
    components/
      Onboarding.svelte           # First-time setup flow
      Home.svelte                 # Ready screen with start button
      Calibration.svelte          # 20s calibration recording (pitch + effort)
      CalibrationConfirm.svelte   # Show Hz range + effort baseline, confirm/recalibrate
      Session.svelte              # Practice session orchestrator
      PitchCanvas.svelte          # Canvas element + waveform renderer lifecycle
      EffortGauge.svelte          # Effort gauge component
      CombinedIndicator.svelte    # Overall "on target" status icon
      WordListEditor.svelte       # Textarea word list input
      SessionComplete.svelte      # End-of-session confirmation
      Help.svelte                 # Plain-language explanation of metrics
  vite.config.ts
  tsconfig.json
  package.json
```

## Sources & References

### Origin

- **Origin document:** [docs/brainstorms/2026-03-23-voicecoach-requirements.md](docs/brainstorms/2026-03-23-voicecoach-requirements.md) - Key decisions carried forward: PWA over native, calibration over manual Hz, live waveform visualization, practice-only (no tracking), tap-to-advance, user-provided word list, visual-only feedback

### Clinical & Voice Science References

- Hillenbrand, J., Cleveland, R. A., & Erickson, R. L. (1994). Acoustic correlates of breathy vocal quality. Journal of Speech and Hearing Research, 37(4), 769-778. - Establishes H1-H2 as a correlate of breathiness/effort
- Kreiman, J., & Gerratt, B. R. (2005). Perception of aperiodicity in pathological voice. JASA, 117(4), 2201-2211. - Voice quality perception and acoustic measures
- Holmberg, E. B., Hillman, R. E., & Perkell, J. S. (1988). Glottal airflow and transglottal air pressure measurements for male and female speakers in soft, normal, and loud voice. JASA, 84(2), 511-529. - Relationship between vocal effort and acoustic output
- Titze, I. R. (2000). Principles of Voice Production (2nd ed.). National Center for Voice and Speech. - Foundational text on voice production mechanics

### Technical References

- [pitchy (MPM pitch detection)](https://github.com/ianprime0509/pitchy) - primary pitch detection library
- [AudioWorklet Design Pattern - Chrome DevRel](https://developer.chrome.com/blog/audio-worklet-design-pattern/) - ring buffer pattern for AudioWorklet
- [AnalyserNode - MDN](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode) - built-in FFT for harmonic analysis
- [Canvas optimization - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas) - self-copy scrolling technique
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/guide/) - PWA setup with Vite
- [iOS Safari getUserMedia quirks - WebKit Bug #185448](https://bugs.webkit.org/show_bug.cgi?id=185448) - standalone PWA mic issues

### Platform Gotchas (from research)

- **iOS Safari**: AudioContext must be resumed from user gesture; getUserMedia may fail silently in standalone PWA mode; mic permissions are session-scoped; disable noiseSuppression/echoCancellation
- **Android Chrome**: Sample rate always 48000 Hz; pass `latencyHint: 0`; disable echoCancellation/noiseSuppression/autoGainControl; throttles background tabs
- **AudioWorklet**: TextDecoder/TextEncoder not available in AudioWorkletGlobalScope - keep worklet code as pure JS, no wasm-bindgen
- **AnalyserNode**: `getFloatFrequencyData()` returns values in dB (relative to full scale). This is ideal for H1-H2 since we need the dB difference directly. `fftSize` must be set before connecting the node. The AnalyserNode can be inserted in the audio graph alongside the AudioWorklet without conflict.
