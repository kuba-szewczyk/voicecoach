<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { PitchDetector, type PitchData } from '../audio/PitchDetector'
  import PitchCanvas from './PitchCanvas.svelte'
  import { wordList } from '../store/settings'

  export let targetRange: { low: number; high: number }
  export let durationMinutes: number
  export let onComplete: () => void
  export let onExit: () => void

  let words = $wordList
  let wordIndex = 0
  let currentWord = words[0] || ''
  let secondsLeft = durationMinutes * 60
  let paused = false
  let pitch: { hz: number } | null = null
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
    await detector.start((data: PitchData | null) => {
      pitch = data
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
    } else {
      // Restart mic on resume
      detector = new PitchDetector()
      detector.start((data: PitchData | null) => {
        pitch = data
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

  // Handle app backgrounding
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
    <div class="timer" class:paused>{formatTime(secondsLeft)}</div>
    <button class="pause-btn" on:click={togglePause}>
      {paused ? '▶' : '⏸'}
    </button>
  </div>

  <PitchCanvas {targetRange} {pitch} />

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
    gap: 16px;
    height: 100%;
    padding: 16px;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .timer {
    font-size: 1.5rem;
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
    min-height: 200px;
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
