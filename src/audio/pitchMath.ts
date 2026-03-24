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
  // Invert: high pitch at top, low pitch at bottom
  return canvasHeight * (1 - normalized)
}

/**
 * Check if a frequency is within the target pitch range.
 */
export function isInRange(hz: number, low: number, high: number): boolean {
  return hz >= low && hz <= high
}
