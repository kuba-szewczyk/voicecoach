<script lang="ts">
  import { wordPools } from '../store/settings'
  import { COMPLEXITY_LABELS, type Complexity } from '../data/wordBanks'

  export let onDone: (() => void) | null = null
  export let initialTab: Complexity = 'short'

  let activeTab: Complexity = initialTab
  let newText = ''

  $: currentWords = $wordPools[activeTab]

  function addWords() {
    const entries = newText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
    if (entries.length > 0) {
      wordPools.update((pools) => ({
        ...pools,
        [activeTab]: [...pools[activeTab], ...entries],
      }))
      newText = ''
    }
  }

  function removeWord(index: number) {
    wordPools.update((pools) => ({
      ...pools,
      [activeTab]: pools[activeTab].filter((_, i) => i !== index),
    }))
  }

  function clearPool() {
    wordPools.update((pools) => ({
      ...pools,
      [activeTab]: [],
    }))
  }
</script>

<div class="editor">
  <div class="header-row">
    <h2>Word Pools</h2>
    {#if onDone}
      <button class="back-btn" on:click={onDone}>Done</button>
    {/if}
  </div>

  <!-- Pool tabs -->
  <div class="tabs">
    {#each (['short', 'medium', 'long'] as Complexity[]) as c}
      <button
        class="tab"
        class:active={activeTab === c}
        on:click={() => { activeTab = c }}
      >
        {COMPLEXITY_LABELS[c].label}
        <span class="count">{$wordPools[c].length}</span>
      </button>
    {/each}
  </div>

  <p class="tab-desc">{COMPLEXITY_LABELS[activeTab].description}</p>

  <!-- Current pool contents -->
  {#if currentWords.length > 0}
    <div class="word-list">
      {#each currentWords as w, i}
        <div class="word-item">
          <span>{w}</span>
          <button class="remove-btn" on:click={() => removeWord(i)}>x</button>
        </div>
      {/each}
    </div>
  {:else}
    <p class="empty">No {COMPLEXITY_LABELS[activeTab].label.toLowerCase()} entries yet.</p>
  {/if}

  <!-- Add words -->
  <div class="add-section">
    <textarea
      bind:value={newText}
      placeholder={"Paste words here, one per line..."}
      rows="5"
    ></textarea>
    <div class="add-row">
      <button class="add-btn" on:click={addWords} disabled={newText.trim().length === 0}>
        Add to {COMPLEXITY_LABELS[activeTab].label}
      </button>
      {#if currentWords.length > 0}
        <button class="clear-btn" on:click={clearPool}>Clear</button>
      {/if}
    </div>
  </div>
</div>

<style>
  .editor {
    display: flex;
    flex-direction: column;
    gap: 12px;
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

  .back-btn {
    background: none;
    border: none;
    color: #3b82f6;
    font-size: 0.9rem;
    cursor: pointer;
    padding: 4px 8px;
  }

  .tabs {
    display: flex;
    gap: 6px;
  }

  .tab {
    flex: 1;
    padding: 8px;
    border-radius: 8px;
    border: 1px solid #334155;
    background: #1e293b;
    color: #94a3b8;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }

  .tab.active {
    border-color: #3b82f6;
    background: #1e3a5f;
    color: #f1f5f9;
  }

  .count {
    font-size: 0.7rem;
    background: #334155;
    padding: 1px 6px;
    border-radius: 10px;
  }

  .tab.active .count {
    background: #3b82f6;
    color: white;
  }

  .tab-desc {
    margin: 0;
    font-size: 0.8rem;
    color: #64748b;
  }

  .word-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-height: 220px;
    overflow-y: auto;
  }

  .word-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
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
    opacity: 0.5;
  }

  .remove-btn:hover {
    opacity: 1;
  }

  .empty {
    margin: 0;
    font-size: 0.8rem;
    color: #475569;
    font-style: italic;
    padding: 16px 0;
  }

  .add-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
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
