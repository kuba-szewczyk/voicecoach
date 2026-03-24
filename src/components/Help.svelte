<script lang="ts">
  export let onBack: () => void
</script>

<div class="help">
  <button class="back" on:click={onBack}>&larr; Back</button>

  <h2>How VoiceCoach Works</h2>

  <div class="section">
    <h3>Pitch Waveform</h3>
    <p>The scrolling waveform shows your speaking pitch in real time. A <strong class="green">green band</strong> marks your target range — the comfortable pitch zone calibrated to your voice.</p>
    <ul>
      <li><span class="dot green-dot"></span> <strong>Green line</strong> — your pitch is in the target range</li>
      <li><span class="dot red-dot"></span> <strong>Red line</strong> — your pitch is too high or too low</li>
    </ul>
  </div>

  <div class="section">
    <h3>Effort Gauge</h3>
    <p>The vertical bar beside the waveform shows your vocal effort — how relaxed or tense your voice production is. It measures the balance between your voice's harmonics (H1-H2).</p>
    <ul>
      <li><span class="dot green-dot"></span> <strong>Green zone</strong> — easy, relaxed phonation (good)</li>
      <li><span class="dot red-dot"></span> <strong>Red zone</strong> — pressed, tense voice (reduce effort)</li>
      <li><span class="dot grey-dot"></span> <strong>Grey zone</strong> — very breathy (a little more support)</li>
    </ul>
  </div>

  <div class="section">
    <h3>On Target Indicator</h3>
    <p>The status badge shows <strong class="green">On target</strong> only when <em>both</em> your pitch and effort are in range. This is the goal — comfortable pitch with relaxed voice production.</p>
  </div>

  <div class="section note">
    <h3>Important Note</h3>
    <p>VoiceCoach is a practice aid, not a medical device. It does not replace evaluation by a speech-language pathologist or ENT. Please validate your calibration and target ranges with your voice coach.</p>
  </div>
</div>

<style>
  .help {
    padding: 24px 20px;
    max-width: 480px;
  }

  .back {
    background: none;
    border: none;
    color: #3b82f6;
    font-size: 1rem;
    cursor: pointer;
    padding: 4px 0;
    margin-bottom: 8px;
  }

  h2 {
    margin: 0 0 20px;
    font-size: 1.5rem;
    color: #f1f5f9;
  }

  h3 {
    margin: 0 0 8px;
    font-size: 1rem;
    color: #f1f5f9;
  }

  .section {
    margin-bottom: 20px;
  }

  p {
    margin: 0 0 8px;
    color: #94a3b8;
    font-size: 0.875rem;
    line-height: 1.5;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  li {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.85rem;
    color: #94a3b8;
  }

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .green-dot { background: #22c55e; }
  .red-dot { background: #ef4444; }
  .grey-dot { background: #94a3b8; }

  .green { color: #22c55e; }

  strong {
    color: #f1f5f9;
  }

  .note {
    background: #1e293b;
    padding: 16px;
    border-radius: 8px;
    border: 1px solid #334155;
  }

  .note p {
    margin: 0;
  }
</style>
