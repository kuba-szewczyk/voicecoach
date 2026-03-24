<script lang="ts">
  import { onDestroy } from 'svelte'
  import { PitchDetector, type AudioFrameData } from '../audio/PitchDetector'
  import PitchCanvas from './PitchCanvas.svelte'
  import EffortGauge from './EffortGauge.svelte'

  export let onComplete: (result: {
    pitchRange: { low: number; high: number }
    effortBaseline: { mean: number; std: number }
  }) => void
  export let onCancel: () => void

  const DURATION = 20
  const MIN_SAMPLES = 50

  let secondsLeft = DURATION
  let pitchSamples: number[] = []
  let effortSamples: number[] = []
  let status: 'ready' | 'recording' | 'error' = 'ready'
  let errorMsg = ''
  let detector: PitchDetector | null = null
  let timer: ReturnType<typeof setInterval> | null = null

  // Live visualization state
  let livePitch: { hz: number } | null = null
  let liveH1H2: number | null = null
  let liveEffortValid = false

  async function startRecording() {
    status = 'recording'
    pitchSamples = []
    effortSamples = []
    secondsLeft = DURATION
    livePitch = null
    liveH1H2 = null

    detector = new PitchDetector()
    try {
      await detector.start((data: AudioFrameData) => {
        // Update live visualization
        livePitch = data.pitch
        liveH1H2 = data.effort.h1h2
        liveEffortValid = data.effort.valid

        // Collect samples
        if (data.pitch) {
          pitchSamples = [...pitchSamples, data.pitch.hz]
        }
        if (data.effort.valid) {
          effortSamples = [...effortSamples, data.effort.h1h2]
        }
      })
    } catch {
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

    if (pitchSamples.length < MIN_SAMPLES) {
      status = 'error'
      errorMsg = `Not enough voice detected (${pitchSamples.length} samples, need ${MIN_SAMPLES}). Please speak continuously in a quiet environment.`
      return
    }

    if (effortSamples.length < MIN_SAMPLES) {
      status = 'error'
      errorMsg = `Not enough effort data captured (${effortSamples.length} samples, need ${MIN_SAMPLES}). Please speak continuously.`
      return
    }

    // Compute pitch range (median +/- 15%)
    const sorted = [...pitchSamples].sort((a, b) => a - b)
    const medianHz = sorted[Math.floor(sorted.length / 2)]
    const low = Math.round(medianHz * 0.85)
    const high = Math.round(medianHz * 1.15)

    // Compute effort baseline (mean + std)
    const mean = effortSamples.reduce((a, b) => a + b, 0) / effortSamples.length
    const variance = effortSamples.reduce((sum, v) => sum + (v - mean) ** 2, 0) / effortSamples.length
    const std = Math.sqrt(variance)

    onComplete({
      pitchRange: { low, high },
      effortBaseline: {
        mean: Math.round(mean * 10) / 10,
        std: Math.round(std * 10) / 10,
      },
    })
  }

  onDestroy(() => {
    if (timer) clearInterval(timer)
    detector?.stop()
  })
</script>

<div class="calibration">
  {#if status === 'ready'}
    <h2>Calibrate Your Voice</h2>
    <p>Read a few of your words in your comfortable, relaxed voice — the way your voice coach showed you. This takes 20 seconds.</p>
    <button on:click={startRecording}>Start Calibration</button>
    <button class="secondary" on:click={onCancel}>Cancel</button>
  {:else if status === 'recording'}
    <h2>Speak Now</h2>
    <p class="coaching">Use your easy, relaxed voice</p>

    <div class="live-display">
      <div class="waveform-area">
        <PitchCanvas targetRange={null} pitch={livePitch} />
      </div>
      <div class="gauge-area">
        <EffortGauge
          baseline={0}
          threshold={5}
          h1h2={liveH1H2}
          valid={liveEffortValid}
        />
      </div>
    </div>

    <div class="timer-row">
      <div class="timer-ring">
        <span class="timer-number">{secondsLeft}</span>
      </div>
      <div class="stats">
        <span>{pitchSamples.length} pitch samples</span>
        <span>{effortSamples.length} effort samples</span>
      </div>
    </div>
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

  .coaching {
    color: #22c55e;
    font-weight: 600;
    font-size: 0.9rem;
  }

  .live-display {
    display: flex;
    gap: 8px;
    width: 100%;
    align-items: stretch;
  }

  .waveform-area {
    flex: 1;
    min-width: 0;
  }

  .gauge-area {
    flex-shrink: 0;
  }

  .timer-row {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .timer-ring {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    border: 3px solid #ef4444;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: pulse 1s ease-in-out infinite;
    flex-shrink: 0;
  }

  .timer-number {
    font-size: 1.5rem;
    font-weight: 700;
    color: #f1f5f9;
  }

  .stats {
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-size: 0.75rem;
    color: #64748b;
    text-align: left;
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
