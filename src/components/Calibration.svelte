<script lang="ts">
  import { onDestroy } from 'svelte'
  import { PitchDetector } from '../audio/PitchDetector'

  export let onComplete: (range: { low: number; high: number }) => void
  export let onCancel: () => void

  const DURATION = 15
  const MIN_SAMPLES = 30

  let secondsLeft = DURATION
  let samples: number[] = []
  let status: 'ready' | 'recording' | 'error' = 'ready'
  let errorMsg = ''
  let detector: PitchDetector | null = null
  let timer: ReturnType<typeof setInterval> | null = null

  async function startRecording() {
    status = 'recording'
    samples = []
    secondsLeft = DURATION

    detector = new PitchDetector()
    try {
      await detector.start((data) => {
        if (data) samples = [...samples, data.hz]
      })
    } catch (e) {
      status = 'error'
      errorMsg = 'Microphone access denied. Please enable microphone in your device settings.'
      return
    }

    timer = setInterval(() => {
      secondsLeft--
      if (secondsLeft <= 0) {
        finishRecording()
      }
    }, 1000)
  }

  function finishRecording() {
    if (timer) clearInterval(timer)
    timer = null
    detector?.stop()
    detector = null

    if (samples.length < MIN_SAMPLES) {
      status = 'error'
      errorMsg = `Not enough voice detected. Please speak continuously during calibration. (${samples.length} samples captured, need at least ${MIN_SAMPLES})`
      return
    }

    // Compute median and derive range
    const sorted = [...samples].sort((a, b) => a - b)
    const median = sorted[Math.floor(sorted.length / 2)]
    const low = Math.round(median * 0.85)
    const high = Math.round(median * 1.15)

    onComplete({ low, high })
  }

  onDestroy(() => {
    if (timer) clearInterval(timer)
    detector?.stop()
  })
</script>

<div class="calibration">
  {#if status === 'ready'}
    <h2>Calibrate Your Voice</h2>
    <p>Speak naturally in your comfortable, therapeutic voice for 15 seconds.</p>
    <button on:click={startRecording}>Start Calibration</button>
    <button class="secondary" on:click={onCancel}>Cancel</button>
  {:else if status === 'recording'}
    <h2>Speak Now</h2>
    <div class="timer-ring">
      <span class="timer-number">{secondsLeft}</span>
    </div>
    <p class="sample-count">{samples.length} pitch samples captured</p>
    <div class="recording-indicator">Recording...</div>
  {:else if status === 'error'}
    <h2>Calibration Issue</h2>
    <p class="error">{errorMsg}</p>
    <button on:click={() => { status = 'ready' }}>Try Again</button>
    <button class="secondary" on:click={onCancel}>Cancel</button>
  {/if}
</div>

<style>
  .calibration {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    text-align: center;
    padding: 20px;
  }

  h2 {
    margin: 0;
    font-size: 1.5rem;
    color: #f1f5f9;
  }

  p {
    margin: 0;
    color: #94a3b8;
    max-width: 300px;
  }

  .timer-ring {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    border: 4px solid #ef4444;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: pulse 1s ease-in-out infinite;
  }

  .timer-number {
    font-size: 2.5rem;
    font-weight: 700;
    color: #f1f5f9;
  }

  .sample-count {
    font-size: 0.875rem;
    color: #64748b;
  }

  .recording-indicator {
    color: #ef4444;
    font-weight: 600;
    animation: blink 1s ease-in-out infinite;
  }

  .error {
    color: #fca5a5;
  }

  button {
    padding: 12px 32px;
    border-radius: 8px;
    border: none;
    background: #3b82f6;
    color: white;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    min-width: 200px;
  }

  .secondary {
    background: transparent;
    border: 1px solid #475569;
    color: #94a3b8;
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
</style>
