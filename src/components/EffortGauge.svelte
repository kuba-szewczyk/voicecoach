<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { EffortGaugeRenderer } from '../canvas/EffortGaugeRenderer'

  export let baseline: number = 0
  export let threshold: number = 3
  export let h1h2: number | null = null
  export let valid: boolean = false

  let canvasEl: HTMLCanvasElement
  let renderer: EffortGaugeRenderer | null = null

  onMount(() => {
    renderer = new EffortGaugeRenderer(canvasEl)
    renderer.setBaseline(baseline, threshold)
    renderer.start()
  })

  onDestroy(() => {
    renderer?.stop()
  })

  $: if (renderer) {
    renderer.setBaseline(baseline, threshold)
  }

  $: if (renderer) {
    renderer.update(h1h2, valid)
  }
</script>

<canvas
  bind:this={canvasEl}
  class="effort-canvas"
></canvas>

<style>
  .effort-canvas {
    width: 40px;
    height: 200px;
    display: block;
    border-radius: 8px;
    flex-shrink: 0;
  }
</style>
