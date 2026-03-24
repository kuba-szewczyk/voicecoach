<script lang="ts">
  import { onDestroy } from 'svelte'
  import { PitchDetector, type AudioFrameData } from '../audio/PitchDetector'
  import { median, meanStd } from '../audio/pitchMath'
  import PitchCanvas from './PitchCanvas.svelte'
  import EffortGauge from './EffortGauge.svelte'

  export let onComplete: (result: {
    pitchRange: { low: number; high: number }
    effortBaseline: { mean: number; std: number }
    extremes: {
      low: { pitchMedian: number; effortMean: number }
      high: { pitchMedian: number; effortMean: number }
    }
  }) => void
  export let onCancel: () => void

  interface SectionConfig {
    id: 'comfortable' | 'low' | 'high'
    title: string
    subtitle: string
    coaching: string
    color: string
    words: string[]
    duration: number
  }

  const sections: SectionConfig[] = [
    {
      id: 'comfortable',
      title: 'Section 1 of 3: Your Ideal Voice',
      subtitle: 'Comfortable & relaxed',
      coaching: 'Read these words in your easy, natural voice — the way your voice coach showed you.',
      color: '#22c55e',
      words: ['hello', 'water', 'morning', 'easy', 'gentle', 'open', 'relax', 'smooth', 'natural', 'calm'],
      duration: 15,
    },
    {
      id: 'low',
      title: 'Section 2 of 3: Your Low Voice',
      subtitle: 'As low and rumbly as you can go',
      coaching: 'Now read these words in your lowest, deepest voice — almost like a growl or vocal fry. This helps us find your floor.',
      color: '#f59e0b',
      words: ['thunder', 'ground', 'deep', 'rumble', 'bottom', 'heavy', 'drum', 'low', 'bass', 'dark'],
      duration: 10,
    },
    {
      id: 'high',
      title: 'Section 3 of 3: Your Strained Voice',
      subtitle: 'Pushed and tense — like effort level 8-10',
      coaching: 'Read these words with a higher, more pressed voice — the kind of strain you want to avoid in daily life. This helps us find your ceiling.',
      color: '#ef4444',
      words: ['squeeze', 'tight', 'push', 'sharp', 'force', 'strain', 'press', 'tense', 'grip', 'clench'],
      duration: 10,
    },
  ]

  // Overall state
  let currentSectionIndex = -1 // -1 = intro screen
  let status: 'intro' | 'ready' | 'recording' | 'error' = 'intro'
  let errorMsg = ''

  // Per-section recording state
  let secondsLeft = 0
  let wordIndex = 0
  let detector: PitchDetector | null = null
  let timer: ReturnType<typeof setInterval> | null = null

  // Live visualization
  let livePitch: { hz: number } | null = null
  let liveH1H2: number | null = null
  let liveEffortValid = false

  // Collected data per section
  interface SectionData {
    pitchSamples: number[]
    effortSamples: number[]
  }
  let sectionResults: SectionData[] = []
  let currentPitchSamples: number[] = []
  let currentEffortSamples: number[] = []

  $: section = currentSectionIndex >= 0 ? sections[currentSectionIndex] : null
  $: currentWord = section ? section.words[wordIndex % section.words.length] : ''
  $: progress = currentSectionIndex >= 0 ? `${currentSectionIndex + 1} / ${sections.length}` : ''

  function startCalibration() {
    sectionResults = []
    currentSectionIndex = 0
    status = 'ready'
  }

  async function startRecording() {
    if (!section) return

    status = 'recording'
    currentPitchSamples = []
    currentEffortSamples = []
    secondsLeft = section.duration
    wordIndex = 0
    livePitch = null
    liveH1H2 = null

    detector = new PitchDetector()
    try {
      await detector.start((data: AudioFrameData) => {
        livePitch = data.pitch
        liveH1H2 = data.effort.h1h2
        liveEffortValid = data.effort.valid

        if (data.pitch) {
          currentPitchSamples = [...currentPitchSamples, data.pitch.hz]
        }
        if (data.effort.valid) {
          currentEffortSamples = [...currentEffortSamples, data.effort.h1h2]
        }
      })
    } catch {
      status = 'error'
      errorMsg = 'Microphone access denied. Please enable microphone in your device settings.'
      return
    }

    timer = setInterval(() => {
      secondsLeft--
      // Auto-advance words every 3 seconds
      if (section && secondsLeft > 0 && (section.duration - secondsLeft) % 3 === 0) {
        wordIndex = (wordIndex + 1) % section.words.length
      }
      if (secondsLeft <= 0) {
        finishSection()
      }
    }, 1000)
  }

  function finishSection() {
    if (timer) clearInterval(timer)
    timer = null
    detector?.stop()
    detector = null

    const minSamples = section?.id === 'comfortable' ? 40 : 20

    if (currentPitchSamples.length < minSamples) {
      status = 'error'
      errorMsg = `Not enough voice detected (${currentPitchSamples.length} samples, need ${minSamples}). Please speak continuously.`
      return
    }

    // Save this section's data
    sectionResults = [...sectionResults, {
      pitchSamples: [...currentPitchSamples],
      effortSamples: [...currentEffortSamples],
    }]

    // Move to next section or finish
    if (currentSectionIndex < sections.length - 1) {
      currentSectionIndex++
      status = 'ready'
    } else {
      computeResults()
    }
  }

  function computeResults() {
    const comfortable = sectionResults[0]
    const low = sectionResults[1]
    const high = sectionResults[2]

    // Pitch range from comfortable voice (median +/- 15%)
    const comfortableMedian = median(comfortable.pitchSamples)
    const pitchLow = Math.round(comfortableMedian * 0.85)
    const pitchHigh = Math.round(comfortableMedian * 1.15)

    // Effort baseline from comfortable voice
    const effortStats = meanStd(comfortable.effortSamples)

    // Extremes for reference
    const lowMedianPitch = median(low.pitchSamples)
    const lowEffortMean = low.effortSamples.length > 0
      ? low.effortSamples.reduce((a, b) => a + b, 0) / low.effortSamples.length
      : 0

    const highMedianPitch = median(high.pitchSamples)
    const highEffortMean = high.effortSamples.length > 0
      ? high.effortSamples.reduce((a, b) => a + b, 0) / high.effortSamples.length
      : 0

    onComplete({
      pitchRange: { low: pitchLow, high: pitchHigh },
      effortBaseline: {
        mean: Math.round(effortStats.mean * 10) / 10,
        std: Math.round(effortStats.std * 10) / 10,
      },
      extremes: {
        low: {
          pitchMedian: Math.round(lowMedianPitch),
          effortMean: Math.round(lowEffortMean * 10) / 10,
        },
        high: {
          pitchMedian: Math.round(highMedianPitch),
          effortMean: Math.round(highEffortMean * 10) / 10,
        },
      },
    })
  }

  function retrySection() {
    status = 'ready'
  }

  onDestroy(() => {
    if (timer) clearInterval(timer)
    detector?.stop()
  })
</script>

<div class="calibration">
  {#if status === 'intro'}
    <h2>Voice Calibration</h2>
    <p>We'll record your voice in three modes to build a complete profile:</p>
    <div class="section-list">
      {#each sections as s, i}
        <div class="section-preview">
          <span class="section-num" style="background: {s.color}">{i + 1}</span>
          <div>
            <strong style="color: {s.color}">{s.subtitle}</strong>
            <span class="section-dur">{s.duration}s</span>
          </div>
        </div>
      {/each}
    </div>
    <p class="note">Your comfortable voice (section 1) becomes the target for daily practice. The extremes help the app understand your boundaries.</p>
    <button on:click={startCalibration}>Begin Calibration</button>
    <button class="secondary" on:click={onCancel}>Cancel</button>

  {:else if status === 'ready' && section}
    <div class="section-header">
      <span class="progress">{progress}</span>
      <h2 style="color: {section.color}">{section.subtitle}</h2>
    </div>
    <p>{section.coaching}</p>
    <div class="preview-words">
      {#each section.words.slice(0, 5) as w}
        <span class="preview-word">{w}</span>
      {/each}
      <span class="preview-word dim">...</span>
    </div>
    <button on:click={startRecording} style="background: {section.color}">
      Start Recording ({section.duration}s)
    </button>
    <button class="secondary" on:click={onCancel}>Cancel</button>

  {:else if status === 'recording' && section}
    <div class="section-header">
      <span class="progress">{progress}</span>
      <p class="coaching" style="color: {section.color}">{section.subtitle}</p>
    </div>

    <div class="word-display" style="border-color: {section.color}">
      <span class="current-word">{currentWord}</span>
    </div>

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
      <div class="timer-ring" style="border-color: {section.color}">
        <span class="timer-number">{secondsLeft}</span>
      </div>
      <div class="stats">
        <span>{currentPitchSamples.length} pitch samples</span>
        <span>{currentEffortSamples.length} effort samples</span>
      </div>
    </div>
    <div class="recording-indicator" style="color: {section.color}">Recording...</div>

  {:else if status === 'error'}
    <h2>Recording Issue</h2>
    <p class="error">{errorMsg}</p>
    <button on:click={retrySection}>Try Again</button>
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
    font-size: 1.3rem;
    color: #f1f5f9;
  }

  p {
    margin: 0;
    color: #94a3b8;
    max-width: 320px;
    font-size: 0.9rem;
    line-height: 1.5;
  }

  .section-list {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .section-preview {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 16px;
    background: #1e293b;
    border-radius: 8px;
    text-align: left;
  }

  .section-num {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-weight: 700;
    color: white;
    flex-shrink: 0;
  }

  .section-preview strong {
    font-size: 0.875rem;
  }

  .section-dur {
    font-size: 0.75rem;
    color: #64748b;
    margin-left: 8px;
  }

  .note {
    font-size: 0.8rem;
    color: #64748b;
  }

  .section-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .progress {
    font-size: 0.75rem;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .preview-words {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
  }

  .preview-word {
    padding: 4px 12px;
    background: #1e293b;
    border-radius: 6px;
    font-size: 0.85rem;
    color: #f1f5f9;
  }

  .preview-word.dim {
    color: #475569;
  }

  .word-display {
    padding: 16px 24px;
    background: #1e293b;
    border-radius: 12px;
    border: 2px solid #334155;
    width: 100%;
  }

  .current-word {
    font-size: 2rem;
    font-weight: 700;
    color: #f1f5f9;
  }

  .coaching {
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
    width: 56px;
    height: 56px;
    border-radius: 50%;
    border: 3px solid #ef4444;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: pulse 1s ease-in-out infinite;
    flex-shrink: 0;
  }

  .timer-number {
    font-size: 1.3rem;
    font-weight: 700;
    color: #f1f5f9;
  }

  .stats {
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-size: 0.7rem;
    color: #64748b;
    text-align: left;
  }

  .recording-indicator {
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
