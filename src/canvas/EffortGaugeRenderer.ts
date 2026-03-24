const COLOR_BG = '#0f172a'
const COLOR_EASY = '#22c55e'       // green — in range (easy phonation)
const COLOR_PRESSED = '#ef4444'    // red — pressed (H1-H2 too low)
const COLOR_BREATHY = '#94a3b8'    // grey — breathy (H1-H2 very high)
const COLOR_TRACK = '#1e293b'
const COLOR_ZONE = 'rgba(34, 197, 94, 0.2)'
const MAX_DPR = 2

export class EffortGaugeRenderer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private width: number
  private height: number
  private dpr: number

  // Effort display range in dB (relative to baseline)
  private displayRange = 15 // +/- 15 dB from baseline
  private baseline = 0
  private threshold = 3
  private currentH1H2: number | null = null
  private valid = false
  private animFrameId: number | null = null

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)

    const rect = canvas.getBoundingClientRect()
    this.width = rect.width
    this.height = rect.height

    canvas.width = this.width * this.dpr
    canvas.height = this.height * this.dpr

    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) throw new Error('Failed to get canvas 2d context')
    this.ctx = ctx
    this.ctx.scale(this.dpr, this.dpr)
  }

  setBaseline(baseline: number, threshold: number) {
    this.baseline = baseline
    this.threshold = threshold
  }

  update(h1h2: number | null, valid: boolean) {
    this.currentH1H2 = h1h2
    this.valid = valid
  }

  start() {
    if (this.animFrameId !== null) return
    this.loop()
  }

  stop() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId)
      this.animFrameId = null
    }
  }

  private loop = () => {
    this.animFrameId = requestAnimationFrame(this.loop)
    this.draw()
  }

  private draw() {
    const { ctx, width, height } = this
    const padding = 4
    const barWidth = width - padding * 2
    const barHeight = height - padding * 2

    // Background
    ctx.fillStyle = COLOR_BG
    ctx.fillRect(0, 0, width, height)

    // Track
    ctx.fillStyle = COLOR_TRACK
    ctx.beginPath()
    ctx.roundRect(padding, padding, barWidth, barHeight, 4)
    ctx.fill()

    // Target zone band (green zone around baseline)
    const zoneTop = this.h1h2ToY(this.baseline + this.threshold, barHeight, padding)
    const zoneBottom = this.h1h2ToY(this.baseline - this.threshold, barHeight, padding)
    ctx.fillStyle = COLOR_ZONE
    ctx.fillRect(padding, zoneTop, barWidth, zoneBottom - zoneTop)

    // Current level indicator
    if (this.currentH1H2 !== null && this.valid) {
      const y = this.h1h2ToY(this.currentH1H2, barHeight, padding)
      const deviation = this.currentH1H2 - this.baseline

      let color: string
      if (Math.abs(deviation) <= this.threshold) {
        color = COLOR_EASY
      } else if (deviation < -this.threshold) {
        color = COLOR_PRESSED
      } else {
        color = COLOR_BREATHY
      }

      // Draw indicator bar
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.roundRect(padding + 2, y - 3, barWidth - 4, 6, 3)
      ctx.fill()

      // Glow effect
      ctx.shadowColor = color
      ctx.shadowBlur = 8
      ctx.fillRect(padding + 2, y - 1, barWidth - 4, 2)
      ctx.shadowBlur = 0
    }

    // Labels
    ctx.fillStyle = '#475569'
    ctx.font = `${9 * this.dpr / this.dpr}px -apple-system, sans-serif`
    ctx.textAlign = 'center'
    ctx.fillText('relaxed', width / 2, padding + 12)
    ctx.fillText('tense', width / 2, height - padding - 4)
  }

  /**
   * Map H1-H2 value to Y coordinate.
   * Higher H1-H2 (more relaxed) = top, lower H1-H2 (more pressed) = bottom.
   */
  private h1h2ToY(h1h2: number, barHeight: number, padding: number): number {
    const deviation = h1h2 - this.baseline
    const normalized = (deviation + this.displayRange) / (2 * this.displayRange)
    const clamped = Math.max(0, Math.min(1, normalized))
    return padding + barHeight * (1 - clamped)
  }
}
