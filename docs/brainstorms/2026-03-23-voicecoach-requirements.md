---
date: 2026-03-23
topic: voicecoach-pitch-practice
---

# VoiceCoach: Vocal Granuloma Pitch Practice

## Problem Frame

Vocal granuloma recovery requires daily pitch practice to retrain speaking habits. The user needs to spend ~5 minutes per day reading words aloud while staying within a safe pitch range that spares the vocal cords. Currently there is no simple, focused tool that provides instant visual feedback on whether speech pitch is in the therapeutic target zone.

## Requirements

- R1. **Calibration mode**: The app provides a 15-second calibration flow where the user speaks in their comfortable/therapeutic voice. The app analyzes the pitch and derives a target frequency band (min-max Hz). After calibration, the detected range is shown for confirmation with an option to recalibrate.
- R2. **Word-by-word practice**: During a session, words from the user's word list are displayed one at a time in large text. The user reads each word aloud and taps to advance to the next word.
- R3. **Live pitch waveform with target zone**: While the user speaks, a scrolling pitch line is rendered in real time. A highlighted band (green zone) shows the calibrated target range. The user can see their voice moving in and out of the target zone as they speak. Visual feedback only — no audio cues or haptic vibration.
- R4. **Out-of-range feedback**: When pitch is above or below the target band, the waveform or background provides clear visual contrast (e.g. red/orange) so the user knows immediately to adjust.
- R5. **Adjustable timed session**: A session runs for a user-selected duration (e.g. 2, 5, 10 minutes) with a visible countdown. The session ends automatically when time is up.
- R6. **User-provided word list**: The app does not ship with a default list. The user pastes or enters their own word list (e.g. from their therapist). The list is persisted locally.
- R7. **PWA installable**: The app is a mobile-first progressive web app that can be installed to the home screen. Works offline after first load.

## Success Criteria

- User can calibrate their target pitch range by speaking naturally
- Real-time pitch visualization updates fast enough to feel instant (<100ms latency)
- User can complete a full 5-minute practice session on mobile browser with no interruptions
- Visual feedback clearly distinguishes in-range vs out-of-range pitch

## Scope Boundaries

- No session history, analytics, or progress tracking
- No user accounts or cloud sync
- No therapist-facing features
- No speech recognition or word correctness checking
- No gamification or streaks

## Key Decisions

- **PWA over native app**: Fastest to build and iterate, no app store friction, mic access available via Web Audio API
- **Calibration over manual Hz input**: More intuitive for non-technical users; the user speaks naturally and the app learns the range
- **Live waveform over simple color/gauge**: Provides the richest feedback and matches the user's mental model of "wave frequency"
- **Practice tool only**: Intentionally minimal; no tracking or analytics to keep the app focused and simple
- **Tap to advance**: User controls pacing manually rather than auto-advance on silence
- **15-second calibration with confirmation**: Long enough for a reliable sample; user confirms the range before saving
- **Step-by-step onboarding**: First-time users are guided through word list entry, then calibration, before practice
- **Word list loops**: When all words are shown, restart from the beginning silently
- **Pause button**: Users can pause/resume mid-session
- **Session complete screen**: Brief confirmation shown when timer ends
- **User-provided word list**: No default list; user brings their own therapy words
- **Adjustable timer**: Flexible session length rather than fixed 5 minutes
- **Visual-only feedback**: No audio cues or haptic vibration during practice

## Dependencies / Assumptions

- Mobile browser supports Web Audio API and microphone access (all modern mobile browsers do)
- Pitch detection via Web Audio API (e.g. autocorrelation or similar algorithm) is accurate enough for fundamental frequency tracking of speech

## Outstanding Questions

### Resolve Before Planning

(none)

### Deferred to Planning

- [Affects R1][Needs research] Best pitch detection algorithm for speech in the browser (autocorrelation, YIN, FFT-based) — balance accuracy vs performance on mobile
- [Affects R2][Resolved] Tap to advance — user controls pacing manually
- [Affects R3][Technical] Canvas vs WebGL vs SVG for real-time waveform rendering on mobile
- [Affects R6][Technical] Format and storage for the word list (localStorage, bundled JSON, editable text area)

## Next Steps

-> `/ce:plan` for structured implementation planning
