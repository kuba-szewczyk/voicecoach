<script lang="ts">
  import Calibration from './Calibration.svelte'
  import CalibrationConfirm from './CalibrationConfirm.svelte'
  import { targetPitchRange, effortBaseline, effortThreshold } from '../store/settings'

  export let onComplete: () => void

  let step: 'welcome' | 'calibrate' | 'confirm' = 'welcome'
  let pendingPitchRange: { low: number; high: number } | null = null
  let pendingEffortBaseline: { mean: number; std: number } | null = null
  let pendingExtremes: {
    low: { pitchMedian: number; effortMean: number }
    high: { pitchMedian: number; effortMean: number }
  } | null = null

  function onCalibrationComplete(result: {
    pitchRange: { low: number; high: number }
    effortBaseline: { mean: number; std: number }
    extremes: {
      low: { pitchMedian: number; effortMean: number }
      high: { pitchMedian: number; effortMean: number }
    }
  }) {
    pendingPitchRange = result.pitchRange
    pendingEffortBaseline = result.effortBaseline
    pendingExtremes = result.extremes
    step = 'confirm'
  }

  function onConfirm() {
    if (pendingPitchRange && pendingEffortBaseline) {
      targetPitchRange.set(pendingPitchRange)
      effortBaseline.set(pendingEffortBaseline)
      effortThreshold.set(Math.round(pendingEffortBaseline.std * 15) / 10)
    }
    onComplete()
  }
</script>

<div class="onboarding">
  {#if step === 'welcome'}
    <div class="welcome">
      <h1>VoiceCoach</h1>
      <p>Daily vocal practice for granuloma recovery. Real-time feedback on pitch and effort to help you speak comfortably.</p>
      <p class="sub">The app comes with built-in word banks at three complexity levels. Let's start by calibrating your voice.</p>
      <button on:click={() => { step = 'calibrate' }}>Get Started</button>
    </div>
  {:else if step === 'calibrate'}
    <Calibration
      onComplete={onCalibrationComplete}
      onCancel={() => { step = 'welcome' }}
    />
  {:else if step === 'confirm' && pendingPitchRange && pendingEffortBaseline && pendingExtremes}
    <CalibrationConfirm
      pitchRange={pendingPitchRange}
      effortBaseline={pendingEffortBaseline}
      extremes={pendingExtremes}
      onConfirm={onConfirm}
      onRecalibrate={() => { step = 'calibrate' }}
    />
  {/if}
</div>

<style>
  .onboarding {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24px 20px;
    flex: 1;
  }

  .welcome {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    text-align: center;
    flex: 1;
    padding: 40px 0;
  }

  h1 {
    margin: 0;
    font-size: 2.5rem;
    font-weight: 800;
    color: #f1f5f9;
  }

  p {
    margin: 0;
    color: #94a3b8;
    max-width: 300px;
    line-height: 1.5;
  }

  .sub {
    font-size: 0.85rem;
    color: #64748b;
  }

  button {
    padding: 14px 48px;
    border-radius: 12px;
    border: none;
    background: #22c55e;
    color: white;
    font-size: 1.1rem;
    font-weight: 700;
    cursor: pointer;
    margin-top: 12px;
  }
</style>
