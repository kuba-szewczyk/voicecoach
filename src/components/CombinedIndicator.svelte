<script lang="ts">
  export let pitchInRange: boolean = false
  export let effortInRange: boolean = false

  $: allGood = pitchInRange && effortInRange
</script>

<div class="indicator" class:good={allGood} class:off={!allGood}>
  <span class="icon">{allGood ? '✓' : '!'}</span>
  <span class="label">{allGood ? 'On target' : pitchInRange ? 'Effort' : effortInRange ? 'Pitch' : 'Adjust'}</span>
</div>

<style>
  .indicator {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    transition: background 0.15s, color 0.15s;
  }

  .good {
    background: rgba(34, 197, 94, 0.2);
    color: #22c55e;
  }

  .off {
    background: rgba(239, 68, 68, 0.2);
    color: #ef4444;
  }

  .icon {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
  }

  .good .icon {
    background: #22c55e;
    color: white;
  }

  .off .icon {
    background: #ef4444;
    color: white;
  }
</style>
