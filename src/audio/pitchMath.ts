/**
 * Map a frequency in Hz to a Y coordinate on the canvas.
 * Uses logarithmic scale since pitch perception is logarithmic.
 * Y=0 is top of canvas (high pitch), Y=canvasHeight is bottom (low pitch).
 */
export function hzToCanvasY(hz: number, canvasHeight: number, minHz = 50, maxHz = 500): number {
  const logMin = Math.log2(minHz)
  const logMax = Math.log2(maxHz)
  const logHz = Math.log2(Math.max(minHz, Math.min(maxHz, hz)))
  const normalized = (logHz - logMin) / (logMax - logMin)
  return canvasHeight * (1 - normalized)
}

/**
 * Check if a frequency is within the target pitch range.
 */
export function isInRange(hz: number, low: number, high: number): boolean {
  return hz >= low && hz <= high
}

/**
 * Check if H1-H2 effort value is within the calibrated baseline range.
 */
export function isEffortInRange(h1h2: number, baseline: number, threshold: number): boolean {
  return h1h2 >= baseline - threshold && h1h2 <= baseline + threshold
}

/**
 * Compute mean and standard deviation of an array.
 */
export function meanStd(values: number[]): { mean: number; std: number } {
  if (values.length === 0) return { mean: 0, std: 0 }
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length
  return { mean, std: Math.sqrt(variance) }
}

/**
 * Compute median of an array.
 */
export function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}
