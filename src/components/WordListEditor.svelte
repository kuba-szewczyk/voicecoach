<script lang="ts">
  import { wordList } from '../store/settings'

  export let onDone: (() => void) | null = null

  let text = $wordList.join('\n')

  function save() {
    const entries = text
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
    wordList.set(entries)
    onDone?.()
  }
</script>

<div class="editor">
  <h2>Your Word List</h2>
  <p class="hint">Enter one word or short phrase per line.</p>
  <textarea
    bind:value={text}
    placeholder={"hello\nwater\ngood morning\nthank you"}
    rows="10"
  ></textarea>
  <button on:click={save} disabled={text.trim().length === 0}>
    Save Word List
  </button>
</div>

<style>
  .editor {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
  }

  h2 {
    margin: 0;
    font-size: 1.25rem;
    color: #f1f5f9;
  }

  .hint {
    margin: 0;
    font-size: 0.875rem;
    color: #94a3b8;
  }

  textarea {
    width: 100%;
    padding: 12px;
    border-radius: 8px;
    border: 1px solid #334155;
    background: #1e293b;
    color: #f1f5f9;
    font-size: 1rem;
    font-family: inherit;
    resize: vertical;
    box-sizing: border-box;
  }

  textarea::placeholder {
    color: #475569;
  }

  button {
    padding: 12px 24px;
    border-radius: 8px;
    border: none;
    background: #3b82f6;
    color: white;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
