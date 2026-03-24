<script lang="ts">
  import { wordList, targetPitchRange, sessionDuration } from '../store/settings'

  export let onStart: () => void
  export let onEditWords: () => void
  export let onCalibrate: () => void

  const durations = [2, 5, 10]
  let selectedDuration = $sessionDuration

  $: sessionDuration.set(selectedDuration)
  $: hasWords = $wordList.length > 0
  $: hasCalibration = $targetPitchRange !== null
  $: canStart = hasWords && hasCalibration
</script>

<div class="home">
  <h1>VoiceCoach</h1>

  <div class="status">
    <div class="status-item" class:ready={hasWords}>
      <span class="indicator">{hasWords ? '&#10003;' : '!'}</span>
      <span>Word list ({$wordList.length} words)</span>
      <button class="link" on:click={onEditWords}>{hasWords ? 'Edit' : 'Add'}</button>
    </div>
    <div class="status-item" class:ready={hasCalibration}>
      <span class="indicator">{hasCalibration ? '&#10003;' : '!'}</span>
      <span>
        {#if hasCalibration && $targetPitchRange}
          Calibrated ({$targetPitchRange.low}&ndash;{$targetPitchRange.high} Hz)
        {:else}
          Not calibrated
        {/if}
      </span>
      <button class="link" on:click={onCalibrate}>{hasCalibration ? 'Redo' : 'Calibrate'}</button>
    </div>
  </div>

  <div class="duration-picker">
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

  <button class="start-btn" on:click={onStart} disabled={!canStart}>
    Start Practice
  </button>

  {#if !canStart}
    <p class="hint">
      {#if !hasWords && !hasCalibration}
        Add a word list and calibrate your voice to begin.
      {:else if !hasWords}
        Add a word list to begin.
      {:else}
        Calibrate your voice to begin.
      {/if}
    </p>
  {/if}
</div>

<style>
  .home {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    padding: 32px 20px;
  }

  h1 {
    margin: 0;
    font-size: 2rem;
    color: #f1f5f9;
    font-weight: 800;
  }

  .status {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .status-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: #1e293b;
    border-radius: 8px;
    color: #94a3b8;
    font-size: 0.9rem;
  }

  .status-item.ready {
    color: #f1f5f9;
  }

  .indicator {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
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
    font-size: 0.875rem;
    padding: 4px 8px;
  }

  .duration-picker {
    width: 100%;
  }

  .duration-picker .label-text {
    display: block;
    color: #94a3b8;
    font-size: 0.875rem;
    margin-bottom: 8px;
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
    font-size: 0.875rem;
    color: #64748b;
    text-align: center;
  }
</style>
