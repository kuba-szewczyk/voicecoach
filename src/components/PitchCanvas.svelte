<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { WaveformRenderer } from '../canvas/WaveformRenderer'

  export let targetRange: { low: number; high: number } | null = null
  export let pitch: { hz: number } | null = null

  let canvasEl: HTMLCanvasElement
  let renderer: WaveformRenderer | null = null

  onMount(() => {
    renderer = new WaveformRenderer(canvasEl)
    if (targetRange) renderer.setTargetRange(targetRange.low, targetRange.high)
    renderer.start()
  })

  onDestroy(() => {
    renderer?.stop()
  })

  $: if (renderer && targetRange) {
    renderer.setTargetRange(targetRange.low, targetRange.high)
  }

  $: if (renderer) {
    renderer.updatePitch(pitch)
  }
</script>

<canvas
  bind:this={canvasEl}
  class="waveform-canvas"
></canvas>

<style>
  .waveform-canvas {
    width: 100%;
    height: 200px;
    display: block;
    border-radius: 8px;
    transform: translateZ(0);
    will-change: transform;
  }
</style>
