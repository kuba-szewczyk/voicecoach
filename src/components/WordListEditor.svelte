<script lang="ts">
  import { wordPool } from '../store/settings'
  import { classifyAll, classifyEntry, COMPLEXITY_LABELS, type Complexity } from '../data/wordBanks'

  export let onDone: (() => void) | null = null

  let newText = ''
  let previewTab: Complexity = 'short'

  $: classified = classifyAll($wordPool)
  $: counts = {
    short: classified.short.length,
    medium: classified.medium.length,
    long: classified.long.length,
    total: $wordPool.length,
  }

  function addWords() {
    const entries = newText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
    if (entries.length > 0) {
      wordPool.update((list) => [...list, ...entries])
      newText = ''
    }
  }

  function removeWord(word: string) {
    wordPool.update((list) => {
      const idx = list.indexOf(word)
      return idx >= 0 ? [...list.slice(0, idx), ...list.slice(idx + 1)] : list
    })
  }

  function clearAll() {
    wordPool.set([])
  }
</script>

<div class="editor">
  <div class="header-row">
    <h2>Word Pool ({counts.total})</h2>
    {#if onDone}
      <button class="back-btn" on:click={onDone}>Done</button>
    {/if}
  </div>

  <p class="hint">Words are auto-sorted by length: single words → short, 2–3 words → medium, 4+ words → long.</p>

  <!-- Classified word browser -->
  <div class="section">
    <div class="complexity-tabs">
      {#each (['short', 'medium', 'long'] as Complexity[]) as c}
        <button
          class="tab"
          class:active={previewTab === c}
          on:click={() => { previewTab = c }}
        >
          {COMPLEXITY_LABELS[c].label}
          <span class="count">{classified[c].length}</span>
        </button>
      {/each}
    </div>

    {#if classified[previewTab].length > 0}
      <div class="word-list">
        {#each classified[previewTab] as w}
          <div class="word-item">
            <span>{w}</span>
            <button class="remove-btn" on:click={() => removeWord(w)}>x</button>
          </div>
        {/each}
      </div>
    {:else}
      <p class="empty">No {COMPLEXITY_LABELS[previewTab].label.toLowerCase()} entries yet.</p>
    {/if}
  </div>

  <!-- Add new words -->
  <div class="section">
    <h3>Add Words</h3>
    <textarea
      bind:value={newText}
      placeholder={"hello\ngood morning\nthank you very much\nthe sun is shining today"}
      rows="5"
    ></textarea>
    <div class="add-row">
      <button class="add-btn" on:click={addWords} disabled={newText.trim().length === 0}>
        Add to Pool
      </button>
      {#if counts.total > 0}
        <button class="clear-btn" on:click={clearAll}>Clear All</button>
      {/if}
    </div>
  </div>
</div>

<style>
  .editor {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
    padding: 0 0 20px;
  }

  .header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  h2 {
    margin: 0;
    font-size: 1.25rem;
    color: #f1f5f9;
  }

  h3 {
    margin: 0 0 8px;
    font-size: 0.85rem;
    color: #94a3b8;
    font-weight: 600;
  }

  .hint {
    margin: 0;
    font-size: 0.8rem;
    color: #64748b;
    line-height: 1.4;
  }

  .back-btn {
    background: none;
    border: none;
    color: #3b82f6;
    font-size: 0.9rem;
    cursor: pointer;
    padding: 4px 8px;
  }

  .section {
    display: flex;
    flex-direction: column;
  }

  .complexity-tabs {
    display: flex;
    gap: 6px;
    margin-bottom: 8px;
  }

  .tab {
    flex: 1;
    padding: 6px 8px;
    border-radius: 6px;
    border: 1px solid #334155;
    background: #1e293b;
    color: #94a3b8;
    font-size: 0.8rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
  }

  .tab.active {
    border-color: #3b82f6;
    background: #1e3a5f;
    color: #f1f5f9;
  }

  .count {
    font-size: 0.7rem;
    opacity: 0.6;
  }

  .word-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-height: 200px;
    overflow-y: auto;
  }

  .word-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 12px;
    background: #1e293b;
    border-radius: 6px;
    font-size: 0.85rem;
    color: #f1f5f9;
  }

  .remove-btn {
    background: none;
    border: none;
    color: #ef4444;
    font-size: 0.8rem;
    cursor: pointer;
    padding: 2px 6px;
    opacity: 0.6;
  }

  .remove-btn:hover {
    opacity: 1;
  }

  .empty {
    margin: 0;
    font-size: 0.8rem;
    color: #475569;
    font-style: italic;
    padding: 12px 0;
  }

  textarea {
    width: 100%;
    padding: 10px;
    border-radius: 8px;
    border: 1px solid #334155;
    background: #1e293b;
    color: #f1f5f9;
    font-size: 0.9rem;
    font-family: inherit;
    resize: vertical;
    box-sizing: border-box;
  }

  textarea::placeholder {
    color: #475569;
  }

  .add-row {
    display: flex;
    gap: 8px;
    margin-top: 8px;
  }

  .add-btn {
    flex: 1;
    padding: 10px 20px;
    border-radius: 8px;
    border: none;
    background: #3b82f6;
    color: white;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
  }

  .add-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .clear-btn {
    padding: 10px 16px;
    border-radius: 8px;
    border: 1px solid #475569;
    background: transparent;
    color: #94a3b8;
    font-size: 0.85rem;
    cursor: pointer;
  }
</style>
