<script lang="ts">
  import WordListEditor from './WordListEditor.svelte'
  import Calibration from './Calibration.svelte'
  import CalibrationConfirm from './CalibrationConfirm.svelte'
  import { wordList, targetPitchRange, effortBaseline, effortThreshold } from '../store/settings'

  export let onComplete: () => void

  let step: 'words' | 'calibrate' | 'confirm' = 'words'
  let pendingPitchRange: { low: number; high: number } | null = null
  let pendingEffortBaseline: { mean: number; std: number } | null = null

  function onWordsDone() {
    if ($wordList.length > 0) {
      step = 'calibrate'
    }
  }

  function onCalibrationComplete(result: {
    pitchRange: { low: number; high: number }
    effortBaseline: { mean: number; std: number }
  }) {
    pendingPitchRange = result.pitchRange
    pendingEffortBaseline = result.effortBaseline
    step = 'confirm'
  }

  function onConfirm() {
    if (pendingPitchRange && pendingEffortBaseline) {
      targetPitchRange.set(pendingPitchRange)
      effortBaseline.set(pendingEffortBaseline)
      effortThreshold.set(Math.round(pendingEffortBaseline.std * 15) / 10) // 1.5 * std
    }
    onComplete()
  }

  function onRecalibrate() {
    step = 'calibrate'
  }
</script>

<div class="onboarding">
  <div class="step-indicator">
    <span class="step" class:active={step === 'words'} class:done={step !== 'words'}>1</span>
    <span class="line"></span>
    <span class="step" class:active={step === 'calibrate'} class:done={step === 'confirm'}>2</span>
    <span class="line"></span>
    <span class="step" class:active={step === 'confirm'}>3</span>
  </div>

  {#if step === 'words'}
    <WordListEditor onDone={onWordsDone} />
  {:else if step === 'calibrate'}
    <Calibration
      onComplete={onCalibrationComplete}
      onCancel={() => { step = 'words' }}
    />
  {:else if step === 'confirm' && pendingPitchRange && pendingEffortBaseline}
    <CalibrationConfirm
      pitchRange={pendingPitchRange}
      effortBaseline={pendingEffortBaseline}
      onConfirm={onConfirm}
      onRecalibrate={onRecalibrate}
    />
  {/if}
</div>

<style>
  .onboarding {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    padding: 24px 20px;
  }

  .step-indicator {
    display: flex;
    align-items: center;
    gap: 0;
  }

  .step {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.875rem;
    font-weight: 600;
    background: #334155;
    color: #64748b;
  }

  .step.active {
    background: #3b82f6;
    color: white;
  }

  .step.done {
    background: #22c55e;
    color: white;
  }

  .line {
    width: 40px;
    height: 2px;
    background: #334155;
  }
</style>
