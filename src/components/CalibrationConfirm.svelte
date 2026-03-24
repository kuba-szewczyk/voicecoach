<script lang="ts">
  export let range: { low: number; high: number }
  export let onConfirm: () => void
  export let onRecalibrate: () => void
</script>

<div class="confirm">
  <h2>Your Target Range</h2>
  <div class="range-display">
    <span class="hz">{range.low}</span>
    <span class="sep">&ndash;</span>
    <span class="hz">{range.high}</span>
    <span class="unit">Hz</span>
  </div>
  <p>This is the pitch range your voice was detected at. During practice, the waveform will show green when you stay within this range.</p>
  <button on:click={onConfirm}>Use This Range</button>
  <button class="secondary" on:click={onRecalibrate}>Recalibrate</button>
</div>

<style>
  .confirm {
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

  .range-display {
    display: flex;
    align-items: baseline;
    gap: 8px;
    padding: 20px 32px;
    background: #1e293b;
    border-radius: 12px;
    border: 1px solid #334155;
  }

  .hz {
    font-size: 2rem;
    font-weight: 700;
    color: #22c55e;
  }

  .sep {
    font-size: 1.5rem;
    color: #64748b;
  }

  .unit {
    font-size: 1rem;
    color: #64748b;
  }

  p {
    margin: 0;
    color: #94a3b8;
    max-width: 300px;
    font-size: 0.875rem;
  }

  button {
    padding: 12px 32px;
    border-radius: 8px;
    border: none;
    background: #22c55e;
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
</style>
