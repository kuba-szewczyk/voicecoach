import { hzToCanvasY, isInRange } from '../audio/pitchMath'

const COLOR_IN_RANGE = '#22c55e'
const COLOR_OUT_RANGE = '#ef4444'
const COLOR_SILENCE = '#334155'
const COLOR_TARGET_ZONE = 'rgba(34, 197, 94, 0.15)'
const COLOR_BG = '#0f172a'
const LINE_WIDTH = 2
const MAX_DPR = 2

export class WaveformRenderer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private width: number
  private height: number
  private dpr: number
  private animFrameId: number | null = null
  private targetRange: { low: number; high: number } | null = null
  private latestPitch: { hz: number } | null = null
  private lastDrawTime = 0
  private minScrollInterval = 16 // ~60fps

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)

    const rect = canvas.getBoundingClientRect()
    this.width = rect.width
    this.height = rect.height

    canvas.width = this.width * this.dpr
    canvas.height = this.height * this.dpr

    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true })
    if (!ctx) throw new Error('Failed to get canvas 2d context')
    this.ctx = ctx
    this.ctx.scale(this.dpr, this.dpr)

    // Fill with background
    this.ctx.fillStyle = COLOR_BG
    this.ctx.fillRect(0, 0, this.width, this.height)
  }

  setTargetRange(low: number, high: number) {
    this.targetRange = { low, high }
  }

  updatePitch(pitch: { hz: number } | null) {
    this.latestPitch = pitch
  }

  start() {
    if (this.animFrameId !== null) return
    this.lastDrawTime = 0
    this.loop(0)
  }

  stop() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId)
      this.animFrameId = null
    }
  }

  private loop = (timestamp: number) => {
    this.animFrameId = requestAnimationFrame(this.loop)

    const dt = timestamp - this.lastDrawTime
    if (dt < this.minScrollInterval) return
    this.lastDrawTime = timestamp

    this.draw()
  }

  private draw() {
    const { ctx, width, height } = this

    // Scroll left by 1 CSS pixel
    ctx.drawImage(
      this.canvas,
      this.dpr, 0, (width - 1) * this.dpr, height * this.dpr,
      0, 0, width - 1, height,
    )

    // Clear the new rightmost column
    ctx.fillStyle = COLOR_BG
    ctx.fillRect(width - 1, 0, 1, height)

    // Draw target zone band in the new column
    if (this.targetRange) {
      const yHigh = hzToCanvasY(this.targetRange.high, height)
      const yLow = hzToCanvasY(this.targetRange.low, height)
      ctx.fillStyle = COLOR_TARGET_ZONE
      ctx.fillRect(width - 1, yHigh, 1, yLow - yHigh)
    }

    // Draw pitch point
    if (this.latestPitch) {
      const y = hzToCanvasY(this.latestPitch.hz, height)
      const inRange = this.targetRange
        ? isInRange(this.latestPitch.hz, this.targetRange.low, this.targetRange.high)
        : true

      ctx.fillStyle = inRange ? COLOR_IN_RANGE : COLOR_OUT_RANGE
      ctx.fillRect(width - 1, y - LINE_WIDTH / 2, 1, LINE_WIDTH)
    } else {
      // Draw a dim dot at center to indicate silence/no detection
      ctx.fillStyle = COLOR_SILENCE
      ctx.fillRect(width - 1, height / 2 - 0.5, 1, 1)
    }
  }

  clear() {
    this.ctx.fillStyle = COLOR_BG
    this.ctx.fillRect(0, 0, this.width, this.height)
  }
}
