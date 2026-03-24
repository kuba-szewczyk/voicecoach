<script lang="ts">
  import { customWords } from '../store/settings'
  import { WORD_BANKS, COMPLEXITY_LABELS, type Complexity } from '../data/wordBanks'

  export let onDone: (() => void) | null = null

  let newText = ''
  let previewComplexity: Complexity = 'short'

  function addWords() {
    const entries = newText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
    if (entries.length > 0) {
      customWords.update((list) => [...list, ...entries])
      newText = ''
    }
  }

  function removeCustomWord(index: number) {
    customWords.update((list) => list.filter((_, i) => i !== index))
  }
</script>

<div class="editor">
  <div class="header-row">
    <h2>Word Pool</h2>
    {#if onDone}
      <button class="back-btn" on:click={onDone}>Done</button>
    {/if}
  </div>

  <!-- Pre-populated bank preview -->
  <div class="section">
    <h3>Built-in Words</h3>
    <div class="complexity-tabs">
      {#each (['short', 'medium', 'long'] as Complexity[]) as c}
        <button
          class="tab"
          class:active={previewComplexity === c}
          on:click={() => { previewComplexity = c }}
        >
          {COMPLEXITY_LABELS[c].label}
          <span class="count">{WORD_BANKS[c].length}</span>
        </button>
      {/each}
    </div>
    <div class="word-cloud">
      {#each WORD_BANKS[previewComplexity].slice(0, 12) as w}
        <span class="word-chip">{w}</span>
      {/each}
      {#if WORD_BANKS[previewComplexity].length > 12}
        <span class="word-chip dim">+{WORD_BANKS[previewComplexity].length - 12} more</span>
      {/if}
    </div>
  </div>

  <!-- Custom words -->
  <div class="section">
    <h3>Your Custom Words</h3>
    {#if $customWords.length > 0}
      <div class="custom-list">
        {#each $customWords as w, i}
          <div class="custom-item">
            <span>{w}</span>
            <button class="remove-btn" on:click={() => removeCustomWord(i)}>x</button>
          </div>
        {/each}
      </div>
    {:else}
      <p class="empty">No custom words added yet. Your custom words will be mixed into every session.</p>
    {/if}
  </div>

  <!-- Add new words -->
  <div class="section">
    <h3>Add Words</h3>
    <textarea
      bind:value={newText}
      placeholder={"Enter one word or phrase per line"}
      rows="4"
    ></textarea>
    <button class="add-btn" on:click={addWords} disabled={newText.trim().length === 0}>
      Add to Pool
    </button>
  </div>
</div>

<style>
  .editor {
    display: flex;
    flex-direction: column;
    gap: 20px;
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

  .word-cloud {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .word-chip {
    padding: 4px 10px;
    background: #1e293b;
    border-radius: 6px;
    font-size: 0.8rem;
    color: #f1f5f9;
  }

  .word-chip.dim {
    color: #475569;
  }

  .custom-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .custom-item {
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

  .add-btn {
    margin-top: 8px;
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
</style>
