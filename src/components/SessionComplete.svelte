<script lang="ts">
  export let onDone: () => void
</script>

<div class="complete">
  <div class="check">&#10003;</div>
  <h2>Session Complete</h2>
  <p>Great work on your practice!</p>
  <button on:click={onDone}>Done</button>
</div>

<style>
  .complete {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    text-align: center;
    padding: 40px 20px;
    flex: 1;
  }

  .check {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: #22c55e;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    color: white;
  }

  h2 {
    margin: 0;
    font-size: 1.5rem;
    color: #f1f5f9;
  }

  p {
    margin: 0;
    color: #94a3b8;
  }

  button {
    padding: 12px 48px;
    border-radius: 8px;
    border: none;
    background: #3b82f6;
    color: white;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    margin-top: 12px;
  }
</style>
