<script lang="ts">
  import { targetPitchRange, effortBaseline, sessionDuration, wordComplexity, customWords } from '../store/settings'
  import { COMPLEXITY_LABELS, WORD_BANKS, type Complexity } from '../data/wordBanks'
  import DailyTracker from './DailyTracker.svelte'

  export let onStart: () => void
  export let onEditWords: () => void
  export let onCalibrate: () => void
  export let onHelp: () => void

  const durations = [2, 5, 10]
  const complexities: Complexity[] = ['short', 'medium', 'long']

  let selectedDuration = $sessionDuration
  let selectedComplexity = $wordComplexity

  $: sessionDuration.set(selectedDuration)
  $: wordComplexity.set(selectedComplexity)
  $: hasCalibration = $targetPitchRange !== null && $effortBaseline !== null
  $: wordCount = WORD_BANKS[selectedComplexity].length + $customWords.length
</script>

<div class="home">
  <div class="title-row">
    <h1>VoiceCoach</h1>
    <button class="help-btn" on:click={onHelp}>?</button>
  </div>

  <DailyTracker />

  <div class="status">
    <div class="status-item" class:ready={hasCalibration}>
      <span class="indicator">{hasCalibration ? '✓' : '!'}</span>
      <span>
        {#if hasCalibration && $targetPitchRange && $effortBaseline}
          Pitch {$targetPitchRange.low}–{$targetPitchRange.high} Hz · Effort {$effortBaseline.mean.toFixed(1)} dB
        {:else}
          Not calibrated
        {/if}
      </span>
      <button class="link" on:click={onCalibrate}>{hasCalibration ? 'Redo' : 'Calibrate'}</button>
    </div>
  </div>

  <!-- Word complexity picker -->
  <div class="picker">
    <div class="picker-header">
      <span class="label-text" id="complexity-label">Word complexity</span>
      <button class="link" on:click={onEditWords}>Manage words ({wordCount})</button>
    </div>
    <div class="picker-options" role="radiogroup" aria-labelledby="complexity-label">
      {#each complexities as c}
        <button
          class="picker-btn"
          class:selected={selectedComplexity === c}
          on:click={() => { selectedComplexity = c }}
        >
          <span class="picker-label">{COMPLEXITY_LABELS[c].label}</span>
          <span class="picker-desc">{COMPLEXITY_LABELS[c].description}</span>
        </button>
      {/each}
    </div>
  </div>

  <!-- Duration picker -->
  <div class="picker">
    <span class="label-text" id="duration-label">Session duration</span>
    <div class="duration-options" role="radiogroup" aria-labelledby="duration-label">
      {#each durations as d}
        <button
          class="duration-btn"
          class:selected={selectedDuration === d}
          on:click={() => { selectedDuration = d }}
        >
          {d} min
        </button>
      {/each}
    </div>
  </div>

  <button class="start-btn" on:click={onStart} disabled={!hasCalibration}>
    Start Practice
  </button>

  {#if !hasCalibration}
    <p class="hint">Calibrate your voice to begin.</p>
  {/if}
</div>

<style>
  .home {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    padding: 28px 20px;
  }

  .title-row {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    justify-content: center;
    position: relative;
  }

  h1 {
    margin: 0;
    font-size: 1.75rem;
    color: #f1f5f9;
    font-weight: 800;
  }

  .help-btn {
    position: absolute;
    right: 0;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 1px solid #334155;
    background: #1e293b;
    color: #94a3b8;
    font-size: 0.875rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .status {
    width: 100%;
  }

  .status-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    background: #1e293b;
    border-radius: 8px;
    font-size: 0.8rem;
    color: #94a3b8;
  }

  .status-item.ready {
    color: #f1f5f9;
  }

  .indicator {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    flex-shrink: 0;
  }

  .status-item.ready .indicator {
    background: #22c55e;
    color: white;
  }

  .status-item:not(.ready) .indicator {
    background: #475569;
    color: #94a3b8;
  }

  .link {
    margin-left: auto;
    background: none;
    border: none;
    color: #3b82f6;
    cursor: pointer;
    font-size: 0.8rem;
    padding: 4px 8px;
    flex-shrink: 0;
    white-space: nowrap;
  }

  .picker {
    width: 100%;
  }

  .picker-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .label-text {
    display: block;
    color: #94a3b8;
    font-size: 0.8rem;
    margin-bottom: 8px;
  }

  .picker-header .label-text {
    margin-bottom: 0;
  }

  .picker-options {
    display: flex;
    gap: 6px;
  }

  .picker-btn {
    flex: 1;
    padding: 10px 8px;
    border-radius: 8px;
    border: 1px solid #334155;
    background: #1e293b;
    color: #94a3b8;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .picker-btn.selected {
    border-color: #3b82f6;
    background: #1e3a5f;
    color: #f1f5f9;
  }

  .picker-label {
    font-size: 0.85rem;
    font-weight: 600;
  }

  .picker-desc {
    font-size: 0.65rem;
    opacity: 0.7;
  }

  .duration-options {
    display: flex;
    gap: 8px;
  }

  .duration-btn {
    flex: 1;
    padding: 10px;
    border-radius: 8px;
    border: 1px solid #334155;
    background: #1e293b;
    color: #94a3b8;
    font-size: 0.9rem;
    cursor: pointer;
  }

  .duration-btn.selected {
    border-color: #3b82f6;
    background: #1e3a5f;
    color: #f1f5f9;
  }

  .start-btn {
    width: 100%;
    padding: 16px;
    border-radius: 12px;
    border: none;
    background: #22c55e;
    color: white;
    font-size: 1.125rem;
    font-weight: 700;
    cursor: pointer;
  }

  .start-btn:disabled {
    background: #334155;
    color: #64748b;
    cursor: not-allowed;
  }

  .hint {
    margin: 0;
    font-size: 0.8rem;
    color: #64748b;
    text-align: center;
  }
</style>
