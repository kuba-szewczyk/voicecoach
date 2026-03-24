<script lang="ts">
  export let pitchRange: { low: number; high: number }
  export let effortBaseline: { mean: number; std: number }
  export let onConfirm: () => void
  export let onRecalibrate: () => void
</script>

<div class="confirm">
  <h2>Your Voice Profile</h2>

  <div class="metric">
    <span class="metric-label">Pitch Range</span>
    <div class="metric-value">
      <span class="hz">{pitchRange.low}</span>
      <span class="sep">&ndash;</span>
      <span class="hz">{pitchRange.high}</span>
      <span class="unit">Hz</span>
    </div>
    <p class="metric-desc">Your comfortable speaking frequency range</p>
  </div>

  <div class="metric">
    <span class="metric-label">Effort Baseline</span>
    <div class="metric-value">
      <span class="hz">{effortBaseline.mean.toFixed(1)}</span>
      <span class="unit">dB</span>
      <span class="std">&plusmn; {effortBaseline.std.toFixed(1)}</span>
    </div>
    <p class="metric-desc">This is what your relaxed voice sounds like</p>
  </div>

  <p class="note">During practice, you'll see green when your pitch and effort stay near these values.</p>

  <button on:click={onConfirm}>Use These Settings</button>
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

  .metric {
    width: 100%;
    padding: 16px;
    background: #1e293b;
    border-radius: 12px;
    border: 1px solid #334155;
  }

  .metric-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .metric-value {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 6px;
    margin-top: 4px;
  }

  .hz {
    font-size: 1.75rem;
    font-weight: 700;
    color: #22c55e;
  }

  .sep {
    font-size: 1.25rem;
    color: #64748b;
  }

  .unit {
    font-size: 0.875rem;
    color: #64748b;
  }

  .std {
    font-size: 0.875rem;
    color: #64748b;
  }

  .metric-desc {
    margin: 6px 0 0;
    font-size: 0.8rem;
    color: #94a3b8;
  }

  .note {
    margin: 0;
    font-size: 0.8rem;
    color: #64748b;
    max-width: 280px;
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
