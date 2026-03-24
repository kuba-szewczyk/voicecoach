<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { PitchDetector, type AudioFrameData } from '../audio/PitchDetector'
  import { isInRange, isEffortInRange } from '../audio/pitchMath'
  import PitchCanvas from './PitchCanvas.svelte'
  import EffortGauge from './EffortGauge.svelte'
  import CombinedIndicator from './CombinedIndicator.svelte'
  import { wordList } from '../store/settings'

  export let targetRange: { low: number; high: number }
  export let effortBase: { mean: number; std: number }
  export let effortThresh: number
  export let durationMinutes: number
  export let onComplete: () => void
  export let onExit: () => void

  let words = $wordList
  let wordIndex = 0
  let currentWord = words[0] || ''
  let secondsLeft = durationMinutes * 60
  let paused = false
  let pitch: { hz: number } | null = null
  let h1h2: number | null = null
  let effortValid = false
  let pitchInRange = false
  let effortInRange = false
  let detector: PitchDetector | null = null
  let timer: ReturnType<typeof setInterval> | null = null
  let tapDebounceTimeout: ReturnType<typeof setTimeout> | null = null
  let canTap = true

  function formatTime(secs: number): string {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  function nextWord() {
    if (!canTap) return
    canTap = false
    tapDebounceTimeout = setTimeout(() => { canTap = true }, 300)

    wordIndex = (wordIndex + 1) % words.length
    currentWord = words[wordIndex]
  }

  async function startSession() {
    detector = new PitchDetector()
    await detector.start((data: AudioFrameData) => {
      pitch = data.pitch
      h1h2 = data.effort.h1h2
      effortValid = data.effort.valid

      pitchInRange = data.pitch ? isInRange(data.pitch.hz, targetRange.low, targetRange.high) : false
      effortInRange = data.effort.valid ? isEffortInRange(data.effort.h1h2, effortBase.mean, effortThresh) : false
    })

    timer = setInterval(() => {
      if (!paused) {
        secondsLeft--
        if (secondsLeft <= 0) {
          endSession()
        }
      }
    }, 1000)
  }

  function endSession() {
    cleanup()
    onComplete()
  }

  function togglePause() {
    paused = !paused
    if (paused) {
      detector?.stop()
      detector = null
      pitch = null
      h1h2 = null
      effortValid = false
    } else {
      detector = new PitchDetector()
      detector.start((data: AudioFrameData) => {
        pitch = data.pitch
        h1h2 = data.effort.h1h2
        effortValid = data.effort.valid
        pitchInRange = data.pitch ? isInRange(data.pitch.hz, targetRange.low, targetRange.high) : false
        effortInRange = data.effort.valid ? isEffortInRange(data.effort.h1h2, effortBase.mean, effortThresh) : false
      })
    }
  }

  function cleanup() {
    if (timer) clearInterval(timer)
    if (tapDebounceTimeout) clearTimeout(tapDebounceTimeout)
    timer = null
    detector?.stop()
    detector = null
  }

  function handleVisibility() {
    if (document.hidden && !paused) {
      togglePause()
    }
  }

  onMount(() => {
    document.addEventListener('visibilitychange', handleVisibility)
    startSession()
  })

  onDestroy(() => {
    document.removeEventListener('visibilitychange', handleVisibility)
    cleanup()
  })
</script>

<div class="session">
  <div class="header">
    <button class="exit-btn" on:click={() => { cleanup(); onExit() }}>
      &larr;
    </button>
    <CombinedIndicator {pitchInRange} {effortInRange} />
    <div class="timer" class:paused>{formatTime(secondsLeft)}</div>
    <button class="pause-btn" on:click={togglePause}>
      {paused ? '▶' : '⏸'}
    </button>
  </div>

  <div class="visualization">
    <div class="waveform-area">
      <PitchCanvas {targetRange} {pitch} />
    </div>
    <div class="gauge-area">
      <EffortGauge
        baseline={effortBase.mean}
        threshold={effortThresh}
        {h1h2}
        valid={effortValid}
      />
    </div>
  </div>

  {#if paused}
    <div class="paused-overlay">
      <p>Paused</p>
      <button on:click={togglePause}>Resume</button>
    </div>
  {:else}
    <button class="word-area" on:click={nextWord}>
      <span class="current-word">{currentWord}</span>
      <span class="tap-hint">tap for next word</span>
    </button>
  {/if}
</div>

<style>
  .session {
    display: flex;
    flex-direction: column;
    gap: 12px;
    height: 100%;
    padding: 16px;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .timer {
    font-size: 1.25rem;
    font-weight: 700;
    color: #f1f5f9;
    font-variant-numeric: tabular-nums;
  }

  .timer.paused {
    color: #fbbf24;
  }

  .exit-btn, .pause-btn {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: 1px solid #334155;
    background: #1e293b;
    color: #94a3b8;
    font-size: 1.25rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .visualization {
    display: flex;
    gap: 8px;
    align-items: stretch;
  }

  .waveform-area {
    flex: 1;
    min-width: 0;
  }

  .gauge-area {
    flex-shrink: 0;
  }

  .word-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    background: #1e293b;
    border-radius: 12px;
    border: 1px solid #334155;
    cursor: pointer;
    min-height: 180px;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
  }

  .current-word {
    font-size: 2.5rem;
    font-weight: 700;
    color: #f1f5f9;
  }

  .tap-hint {
    font-size: 0.75rem;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .paused-overlay {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
  }

  .paused-overlay p {
    font-size: 1.5rem;
    font-weight: 700;
    color: #fbbf24;
    margin: 0;
  }

  .paused-overlay button {
    padding: 12px 32px;
    border-radius: 8px;
    border: none;
    background: #3b82f6;
    color: white;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
  }
</style>
