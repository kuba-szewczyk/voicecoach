<script lang="ts">
  export let pitchRange: { low: number; high: number }
  export let effortBaseline: { mean: number; std: number }
  export let extremes: {
    low: { pitchMedian: number; effortMean: number }
    high: { pitchMedian: number; effortMean: number }
  }
  export let onConfirm: () => void
  export let onRecalibrate: () => void
</script>

<div class="confirm">
  <h2>Your Voice Profile</h2>

  <!-- Pitch spectrum visualization -->
  <div class="spectrum">
    <span class="spectrum-label">Pitch Spectrum</span>
    <div class="spectrum-bar">
      <div class="zone low-zone">
        <span class="zone-value">{extremes.low.pitchMedian}</span>
        <span class="zone-label">Low</span>
      </div>
      <div class="zone target-zone">
        <span class="zone-value">{pitchRange.low} &ndash; {pitchRange.high}</span>
        <span class="zone-label">Target</span>
      </div>
      <div class="zone high-zone">
        <span class="zone-value">{extremes.high.pitchMedian}</span>
        <span class="zone-label">High</span>
      </div>
    </div>
    <div class="spectrum-unit">Hz</div>
  </div>

  <!-- Effort comparison -->
  <div class="effort-comparison">
    <span class="spectrum-label">Vocal Effort (H1-H2)</span>
    <div class="effort-bars">
      <div class="effort-item">
        <div class="effort-bar-track">
          <div class="effort-bar-fill relaxed" style="width: {Math.min(100, Math.max(10, (effortBaseline.mean + 5) * 5))}%"></div>
        </div>
        <span class="effort-label green">Relaxed: {effortBaseline.mean.toFixed(1)} dB</span>
      </div>
      <div class="effort-item">
        <div class="effort-bar-track">
          <div class="effort-bar-fill low-effort" style="width: {Math.min(100, Math.max(10, (extremes.low.effortMean + 5) * 5))}%"></div>
        </div>
        <span class="effort-label amber">Low voice: {extremes.low.effortMean.toFixed(1)} dB</span>
      </div>
      <div class="effort-item">
        <div class="effort-bar-track">
          <div class="effort-bar-fill high-effort" style="width: {Math.min(100, Math.max(10, (extremes.high.effortMean + 5) * 5))}%"></div>
        </div>
        <span class="effort-label red">Strained: {extremes.high.effortMean.toFixed(1)} dB</span>
      </div>
    </div>
  </div>

  <div class="summary">
    <p>Your <strong class="green">comfortable voice</strong> will be the target for daily practice. The app will alert you if you drift toward the <strong class="amber">low</strong> or <strong class="red">strained</strong> zones.</p>
  </div>

  <button on:click={onConfirm}>Use This Profile</button>
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

  .spectrum, .effort-comparison {
    width: 100%;
    padding: 16px;
    background: #1e293b;
    border-radius: 12px;
    border: 1px solid #334155;
  }

  .spectrum-label {
    display: block;
    font-size: 0.7rem;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 10px;
  }

  .spectrum-bar {
    display: flex;
    gap: 4px;
    height: 56px;
  }

  .zone {
    flex: 1;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
  }

  .low-zone { background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3); }
  .target-zone { background: rgba(34, 197, 94, 0.15); border: 1px solid rgba(34, 197, 94, 0.3); flex: 1.5; }
  .high-zone { background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); }

  .zone-value {
    font-size: 0.85rem;
    font-weight: 700;
  }

  .low-zone .zone-value { color: #f59e0b; }
  .target-zone .zone-value { color: #22c55e; }
  .high-zone .zone-value { color: #ef4444; }

  .zone-label {
    font-size: 0.65rem;
    color: #64748b;
    text-transform: uppercase;
  }

  .spectrum-unit {
    font-size: 0.7rem;
    color: #475569;
    margin-top: 4px;
  }

  .effort-bars {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .effort-item {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .effort-bar-track {
    height: 8px;
    background: #0f172a;
    border-radius: 4px;
    overflow: hidden;
  }

  .effort-bar-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.3s;
  }

  .relaxed { background: #22c55e; }
  .low-effort { background: #f59e0b; }
  .high-effort { background: #ef4444; }

  .effort-label {
    font-size: 0.75rem;
    text-align: left;
  }

  .green { color: #22c55e; }
  .amber { color: #f59e0b; }
  .red { color: #ef4444; }

  .summary p {
    margin: 0;
    font-size: 0.8rem;
    color: #94a3b8;
    line-height: 1.5;
  }

  .summary strong {
    font-weight: 600;
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
